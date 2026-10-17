// Multi-source job API aggregator
// Google Jobs cascade: SerpAPI (100 lifetime) → SearchAPI (100/month) → Serper (2500 free, web search)
// Free APIs: Remotive, Arbeitnow, RemoteOK, Himalayas, Jobicy, WWR RSS

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { titles = [], locations = [] } = req.body;
  if (!titles.length) {
    return res.status(400).json({ error: "No job titles provided" });
  }

  const isRemote = locations.includes("Remote") || locations.length === 0;
  const searchTerms = titles.slice(0, 5).map(t => t.toLowerCase());

  // Google Jobs cascade - try each until one works
  const googleJobs = await fetchGoogleJobsCascade(titles, isRemote);

  // Fetch from free sources in parallel
  const [remotive, arbeitnow, remoteok, himalayas, jobicy, wwr] = await Promise.all([
    fetchRemotive(searchTerms),
    fetchArbeitnow(searchTerms),
    fetchRemoteOK(searchTerms),
    fetchHimalayas(searchTerms),
    fetchJobicy(searchTerms),
    fetchWeWorkRemotely(searchTerms)
  ]);

  // Combine and dedupe - Google Jobs results first
  const allJobs = [...googleJobs.jobs, ...remotive, ...arbeitnow, ...remoteok, ...himalayas, ...jobicy, ...wwr];
  const seen = new Set();
  const uniqueJobs = [];

  for (const job of allJobs) {
    const key = `${job.title.toLowerCase().slice(0, 30)}-${job.company.toLowerCase()}`;
    if (!seen.has(key)) {
      seen.add(key);
      uniqueJobs.push(job);
    }
  }

  // Sort by relevance (title match score)
  const scored = uniqueJobs.map(job => ({
    ...job,
    score: calculateRelevance(job.title, searchTerms)
  }));
  scored.sort((a, b) => b.score - a.score);

  return res.status(200).json({
    jobs: scored.slice(0, 50),
    count: scored.length,
    sources: {
      googleJobs: googleJobs.jobs.length,
      googleSource: googleJobs.source,
      remotive: remotive.length,
      arbeitnow: arbeitnow.length,
      remoteok: remoteok.length,
      himalayas: himalayas.length,
      jobicy: jobicy.length,
      wwr: wwr.length
    },
    cascade: googleJobs.cascade
  });
}

// ═══════════════════════════════════════════════════════════════════════════
// GOOGLE JOBS CASCADE - tries each API until one works
// Order: SerpAPI → Serper → SearchAPI → ValueSERP → ScaleSerp → Zenserp
// ═══════════════════════════════════════════════════════════════════════════

async function fetchGoogleJobsCascade(titles, isRemote) {
  const cascade = [];
  const locationStr = isRemote ? "remote" : "";
  const query = `${titles[0]} ${locationStr}`.trim();

  // 1. Try SerpAPI
  if (process.env.SERPAPI_KEY) {
    const result = await trySerpAPI(titles, isRemote);
    cascade.push({ service: "SerpAPI", status: result.error || "success", count: result.jobs.length });
    if (result.jobs.length > 0) return { jobs: result.jobs, source: "SerpAPI", cascade };
  }

  // 2. Try SearchAPI.io (100 free/month)
  if (process.env.SEARCHAPI_KEY) {
    const result = await trySearchAPI(query);
    cascade.push({ service: "SearchAPI", status: result.error || "success", count: result.jobs.length });
    if (result.jobs.length > 0) return { jobs: result.jobs, source: "SearchAPI", cascade };
  }

  // 3. Try Serper.dev (2500 free - web search on job sites)
  if (process.env.SERPER_API_KEY) {
    const result = await trySerper(titles, isRemote);
    cascade.push({ service: "Serper", status: result.error || "success", count: result.jobs.length });
    if (result.jobs.length > 0) return { jobs: result.jobs, source: "Serper", cascade };
  }

  return { jobs: [], source: "none", cascade };
}

// ═══════════════════════════════════════════════════════════════════════════
// SERPAPI - 100 free lifetime, then $50/month
// ═══════════════════════════════════════════════════════════════════════════
async function trySerpAPI(titles, isRemote) {
  try {
    const jobs = [];
    const seen = new Set();
    const locationStr = isRemote ? "remote" : "";

    for (const title of titles.slice(0, 2)) {
      const params = new URLSearchParams({
        engine: "google_jobs",
        q: `${title} ${locationStr}`.trim(),
        hl: "en", gl: "us",
        chips: "date_posted:month",
        api_key: process.env.SERPAPI_KEY
      });

      const r = await fetch(`https://serpapi.com/search?${params}`);
      const data = await r.json();
      if (data.error) return { jobs: [], error: data.error };

      for (const job of (data.jobs_results || [])) {
        const key = `${job.title}-${job.company_name}`;
        if (seen.has(key)) continue;
        seen.add(key);
        jobs.push(parseGoogleJob(job, "SerpAPI", jobs.length));
      }
    }
    return { jobs: jobs.slice(0, 25), error: null };
  } catch (e) {
    return { jobs: [], error: e.message };
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// SEARCHAPI.IO - 100 free/month
// ═══════════════════════════════════════════════════════════════════════════
async function trySearchAPI(query) {
  try {
    const params = new URLSearchParams({
      engine: "google_jobs",
      q: query,
      api_key: process.env.SEARCHAPI_KEY
    });
    const r = await fetch(`https://www.searchapi.io/api/v1/search?${params}`);
    const data = await r.json();
    if (data.error) return { jobs: [], error: data.error };

    const jobs = (data.jobs || []).slice(0, 25).map((job, i) => parseGoogleJob(job, "SearchAPI", i));
    return { jobs, error: null };
  } catch (e) {
    return { jobs: [], error: e.message };
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// SERPER.DEV - 2500 free (web search targeting job sites)
// ═══════════════════════════════════════════════════════════════════════════
async function trySerper(titles, isRemote) {
  try {
    const jobs = [];
    const seen = new Set();
    const locationStr = isRemote ? "remote" : "";

    // Job sites to search
    const jobSites = [
      "linkedin.com/jobs",
      "indeed.com",
      "glassdoor.com/job",
      "wellfound.com/jobs"
    ];

    // Search first 2 titles across job sites
    for (const title of titles.slice(0, 2)) {
      const siteQuery = jobSites.map(s => `site:${s}`).join(" OR ");
      const query = `(${siteQuery}) "${title}" ${locationStr}`;

      const r = await fetch("https://google.serper.dev/search", {
        method: "POST",
        headers: {
          "X-API-KEY": process.env.SERPER_API_KEY,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ q: query, gl: "us", num: 15 })
      });

      const data = await r.json();
      if (data.error || data.statusCode) {
        return { jobs: [], error: data.message || data.error || "Serper error" };
      }

      for (const result of (data.organic || [])) {
        const parsed = parseSerperResult(result, jobs.length);
        if (!parsed) continue;

        const key = `${parsed.title.toLowerCase().slice(0, 30)}-${parsed.company.toLowerCase()}`;
        if (seen.has(key)) continue;
        seen.add(key);
        jobs.push(parsed);
      }
    }

    return { jobs: jobs.slice(0, 25), error: null };
  } catch (e) {
    return { jobs: [], error: e.message };
  }
}

function parseSerperResult(result, index) {
  const url = result.link || "";
  const title = result.title || "";
  const snippet = result.snippet || "";

  // Skip non-job pages
  if (!url.includes("/jobs") && !url.includes("/job") && !url.includes("viewjob")) {
    return null;
  }

  let jobTitle = title;
  let company = "Unknown";
  let location = "Remote";

  // Parse LinkedIn: "Job Title - Company | LinkedIn"
  if (url.includes("linkedin.com")) {
    const match = title.match(/^(.+?)\s*[-–]\s*(.+?)\s*[|]/);
    if (match) {
      jobTitle = match[1].trim();
      company = match[2].trim();
    }
  }
  // Parse Indeed: "Job Title - Company - Location | Indeed.com"
  else if (url.includes("indeed.com")) {
    const match = title.match(/^(.+?)\s*[-–]\s*(.+?)\s*[-–]/);
    if (match) {
      jobTitle = match[1].trim();
      company = match[2].trim();
    }
  }
  // Parse Glassdoor: "Job Title at Company | Glassdoor"
  else if (url.includes("glassdoor.com")) {
    const match = title.match(/^(.+?)\s+at\s+(.+?)\s*[|]/i);
    if (match) {
      jobTitle = match[1].trim();
      company = match[2].trim();
    }
  }
  // Parse Wellfound: "Job Title at Company - Wellfound"
  else if (url.includes("wellfound.com")) {
    const match = title.match(/^(.+?)\s+at\s+(.+?)\s*[-–]/i);
    if (match) {
      jobTitle = match[1].trim();
      company = match[2].trim();
    }
  }

  // Extract location from snippet
  const locMatch = snippet.match(/(?:Location|in|at)[:\s]+([A-Z][a-zA-Z\s,]+(?:Remote)?)/i);
  if (locMatch) {
    location = locMatch[1].trim();
  } else if (snippet.toLowerCase().includes("remote")) {
    location = "Remote";
  }

  // Determine source from URL
  const source = url.includes("linkedin") ? "LinkedIn" :
                 url.includes("indeed") ? "Indeed" :
                 url.includes("glassdoor") ? "Glassdoor" :
                 url.includes("wellfound") ? "Wellfound" : "Job Board";

  return {
    id: `serper-${index}`,
    title: jobTitle.slice(0, 100),
    company: company.slice(0, 60),
    location,
    url,
    companyUrl: `https://www.google.com/search?q=${encodeURIComponent(company + " careers")}`,
    source,
    description: snippet.slice(0, 500),
    salary: null,
    posted: "Recent",
    tags: [],
    applyOptions: [{ label: `Apply on ${source}`, url }]
  };
}

// ═══════════════════════════════════════════════════════════════════════════
// Parse Google Jobs result (common format across APIs)
// ═══════════════════════════════════════════════════════════════════════════
function parseGoogleJob(job, source, index) {
  return {
    id: `${source.toLowerCase()}-${job.job_id || index}`,
    title: job.title,
    company: job.company_name || job.companyName || job.company || "Unknown",
    location: job.location || "Remote",
    url: job.apply_options?.[0]?.link || job.link || job.share_link || "#",
    companyUrl: `https://www.google.com/search?q=${encodeURIComponent((job.company_name || job.company || "") + " careers")}`,
    source: "Google Jobs",
    description: (job.description || job.snippet || "").slice(0, 500),
    salary: job.detected_extensions?.salary || job.salary || null,
    posted: job.detected_extensions?.posted_at || job.date || "Recent",
    tags: job.job_highlights?.Qualifications?.slice(0, 3) || [],
    applyOptions: (job.apply_options || []).slice(0, 3).map(o => ({
      label: o.title || "Apply",
      url: o.link
    }))
  };
}

function calculateRelevance(title, searchTerms) {
  const t = title.toLowerCase();
  let score = 0;
  for (const term of searchTerms) {
    if (t.includes(term)) score += 10;
    // Partial matches
    const words = term.split(/\s+/);
    for (const word of words) {
      if (word.length > 3 && t.includes(word)) score += 3;
    }
  }
  // Boost compliance/technical writer roles
  if (t.includes("compliance")) score += 5;
  if (t.includes("technical writer")) score += 5;
  if (t.includes("documentation")) score += 3;
  if (t.includes("proposal")) score += 3;
  if (t.includes("grc") || t.includes("security")) score += 3;
  return score;
}

// ═══════════════════════════════════════════════════════════════════════════
// REMOTIVE API - Free, no key, remote jobs
// Limit: 4 fetches/day, 2 req/min - we cache aggressively
// ═══════════════════════════════════════════════════════════════════════════
async function fetchRemotive(searchTerms) {
  try {
    const categories = ["writing", "qa", "all-others", "marketing"];
    const jobs = [];

    for (const cat of categories) {
      const r = await fetch(`https://remotive.com/api/remote-jobs?category=${cat}&limit=50`, {
        headers: { "User-Agent": "CV-Chameleon/1.0" }
      });
      if (!r.ok) continue;
      const data = await r.json();

      for (const job of (data.jobs || [])) {
        if (matchesSearch(job.title, searchTerms)) {
          jobs.push({
            id: `remotive-${job.id}`,
            title: job.title,
            company: job.company_name,
            location: job.candidate_required_location || "Remote",
            url: job.url,
            companyUrl: job.company_logo_url ? `https://${new URL(job.company_logo_url).hostname.replace('logo.clearbit.com/', '')}` : null,
            source: "Remotive",
            description: stripHtml(job.description).slice(0, 500),
            salary: job.salary || null,
            posted: job.publication_date,
            tags: job.tags || [],
            applyOptions: [{ label: "Apply on Remotive", url: job.url }]
          });
        }
      }
    }
    return jobs.slice(0, 15);
  } catch (e) {
    console.error("Remotive error:", e.message);
    return [];
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// ARBEITNOW API - Free, no key, European/global jobs
// ═══════════════════════════════════════════════════════════════════════════
async function fetchArbeitnow(searchTerms) {
  try {
    const jobs = [];
    const r = await fetch("https://www.arbeitnow.com/api/job-board-api", {
      headers: { "User-Agent": "CV-Chameleon/1.0" }
    });
    if (!r.ok) return [];
    const data = await r.json();

    for (const job of (data.data || [])) {
      if (matchesSearch(job.title, searchTerms) || matchesSearch(job.description || "", searchTerms)) {
        const isRemote = job.remote === true || (job.location || "").toLowerCase().includes("remote");
        jobs.push({
          id: `arbeitnow-${job.slug}`,
          title: job.title,
          company: job.company_name,
          location: isRemote ? "Remote" : (job.location || "Unknown"),
          url: job.url,
          companyUrl: null,
          source: "Arbeitnow",
          description: stripHtml(job.description || "").slice(0, 500),
          salary: null,
          posted: job.created_at,
          tags: job.tags || [],
          applyOptions: [{ label: "Apply on Arbeitnow", url: job.url }]
        });
      }
    }
    return jobs.slice(0, 15);
  } catch (e) {
    console.error("Arbeitnow error:", e.message);
    return [];
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// REMOTEOK API - Free, no key, remote tech jobs
// ═══════════════════════════════════════════════════════════════════════════
async function fetchRemoteOK(searchTerms) {
  try {
    const jobs = [];
    const r = await fetch("https://remoteok.com/api", {
      headers: { "User-Agent": "CV-Chameleon/1.0" }
    });
    if (!r.ok) return [];
    const data = await r.json();

    // First item is metadata, skip it
    for (const job of data.slice(1)) {
      if (!job.position) continue;
      if (matchesSearch(job.position, searchTerms) || matchesSearch(job.description || "", searchTerms)) {
        jobs.push({
          id: `remoteok-${job.id}`,
          title: job.position,
          company: job.company,
          location: job.location || "Remote",
          url: job.url || `https://remoteok.com/l/${job.id}`,
          companyUrl: job.company_logo ? null : null,
          source: "RemoteOK",
          description: stripHtml(job.description || "").slice(0, 500),
          salary: job.salary_min && job.salary_max ? `$${job.salary_min}-${job.salary_max}` : null,
          posted: job.date,
          tags: job.tags || [],
          applyOptions: [{ label: "Apply on RemoteOK", url: job.url || `https://remoteok.com/l/${job.id}` }]
        });
      }
    }
    return jobs.slice(0, 15);
  } catch (e) {
    console.error("RemoteOK error:", e.message);
    return [];
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// HIMALAYAS API - Free, remote jobs
// ═══════════════════════════════════════════════════════════════════════════
async function fetchHimalayas(searchTerms) {
  try {
    const jobs = [];
    const r = await fetch("https://himalayas.app/jobs/api?limit=100", {
      headers: { "User-Agent": "CV-Chameleon/1.0" }
    });
    if (!r.ok) return [];
    const data = await r.json();

    for (const job of (data.jobs || [])) {
      if (matchesSearch(job.title, searchTerms) || matchesSearch(job.description || "", searchTerms)) {
        jobs.push({
          id: `himalayas-${job.id}`,
          title: job.title,
          company: job.companyName,
          location: job.locationRestrictions?.join(", ") || "Remote / Worldwide",
          url: `https://himalayas.app/jobs/${job.id}`,
          companyUrl: job.companyUrl,
          source: "Himalayas",
          description: stripHtml(job.description || "").slice(0, 500),
          salary: job.minSalary && job.maxSalary ? `$${job.minSalary}-${job.maxSalary}` : null,
          posted: job.pubDate,
          tags: job.categories || [],
          applyOptions: [{ label: "Apply on Himalayas", url: `https://himalayas.app/jobs/${job.id}` }]
        });
      }
    }
    return jobs.slice(0, 15);
  } catch (e) {
    console.error("Himalayas error:", e.message);
    return [];
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// JOBICY API - Free, remote jobs
// ═══════════════════════════════════════════════════════════════════════════
async function fetchJobicy(searchTerms) {
  try {
    const jobs = [];
    const r = await fetch("https://jobicy.com/api/v2/remote-jobs?count=50", {
      headers: { "User-Agent": "CV-Chameleon/1.0" }
    });
    if (!r.ok) return [];
    const data = await r.json();

    for (const job of (data.jobs || [])) {
      if (matchesSearch(job.jobTitle, searchTerms) || matchesSearch(job.jobDescription || "", searchTerms)) {
        jobs.push({
          id: `jobicy-${job.id}`,
          title: job.jobTitle,
          company: job.companyName,
          location: job.jobGeo || "Remote",
          url: job.url,
          companyUrl: null,
          source: "Jobicy",
          description: stripHtml(job.jobDescription || "").slice(0, 500),
          salary: job.annualSalaryMin && job.annualSalaryMax ? `$${job.annualSalaryMin}-${job.annualSalaryMax}` : null,
          posted: job.pubDate,
          tags: job.jobIndustry ? [job.jobIndustry] : [],
          applyOptions: [{ label: "Apply on Jobicy", url: job.url }]
        });
      }
    }
    return jobs.slice(0, 15);
  } catch (e) {
    console.error("Jobicy error:", e.message);
    return [];
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// WE WORK REMOTELY RSS - Free RSS feed
// ═══════════════════════════════════════════════════════════════════════════
async function fetchWeWorkRemotely(searchTerms) {
  try {
    const jobs = [];
    // WWR has category-specific feeds
    const categories = [
      "copywriting",
      "customer-support",
      "marketing",
      "all-other-remote"
    ];

    for (const cat of categories) {
      try {
        const r = await fetch(`https://weworkremotely.com/categories/${cat}.rss`, {
          headers: { "User-Agent": "CV-Chameleon/1.0" }
        });
        if (!r.ok) continue;
        const xml = await r.text();

        // Parse RSS XML (simple regex extraction)
        const items = xml.match(/<item>[\s\S]*?<\/item>/g) || [];
        for (const item of items.slice(0, 20)) {
          const title = extractTag(item, "title");
          const link = extractTag(item, "link");
          const description = extractTag(item, "description");
          const pubDate = extractTag(item, "pubDate");
          const company = extractTag(item, "company") || title.split(" at ")[1]?.trim() || "Unknown";

          if (matchesSearch(title, searchTerms) || matchesSearch(description, searchTerms)) {
            jobs.push({
              id: `wwr-${Buffer.from(link).toString("base64").slice(0, 20)}`,
              title: title.split(" at ")[0]?.trim() || title,
              company: company.replace(/<!\[CDATA\[|\]\]>/g, "").trim(),
              location: "Remote",
              url: link,
              companyUrl: null,
              source: "We Work Remotely",
              description: stripHtml(description).slice(0, 500),
              salary: null,
              posted: pubDate,
              tags: [cat],
              applyOptions: [{ label: "Apply on WWR", url: link }]
            });
          }
        }
      } catch (_) {}
    }
    return jobs.slice(0, 15);
  } catch (e) {
    console.error("WWR error:", e.message);
    return [];
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════════════════════════════════════
function matchesSearch(text, searchTerms) {
  if (!text) return false;
  const lower = text.toLowerCase();

  for (const term of searchTerms) {
    // Full term match
    if (lower.includes(term)) return true;

    // Word-by-word match (for multi-word searches like "technical writer")
    const words = term.split(/\s+/);
    let wordMatches = 0;
    for (const word of words) {
      if (word.length > 2 && lower.includes(word)) wordMatches++;
    }
    if (words.length > 1 && wordMatches >= Math.ceil(words.length * 0.6)) return true;
  }

  // Also match common related terms
  const related = {
    "compliance": ["grc", "audit", "risk", "soc 2", "iso 27001", "security"],
    "technical writer": ["documentation", "docs", "content", "writer"],
    "proposal": ["rfp", "bid", "contract"],
    "documentation": ["docs", "knowledge", "content"]
  };

  for (const term of searchTerms) {
    const relatedTerms = related[term] || [];
    for (const rel of relatedTerms) {
      if (lower.includes(rel)) return true;
    }
  }

  return false;
}

function stripHtml(html) {
  return (html || "")
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/<!\[CDATA\[|\]\]>/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function extractTag(xml, tag) {
  const match = xml.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`));
  return match ? match[1].replace(/<!\[CDATA\[|\]\]>/g, "").trim() : "";
}
