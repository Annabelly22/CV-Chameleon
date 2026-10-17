// Multi-source free job API aggregator
// Sources: Google Custom Search, Remotive, Arbeitnow, RemoteOK, Himalayas, Jobicy, WWR RSS

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

  // Fetch from all sources in parallel (Google first as primary)
  const [google, remotive, arbeitnow, remoteok, himalayas, jobicy, wwr] = await Promise.all([
    fetchGoogleSearch(titles, isRemote),
    fetchRemotive(searchTerms),
    fetchArbeitnow(searchTerms),
    fetchRemoteOK(searchTerms),
    fetchHimalayas(searchTerms),
    fetchJobicy(searchTerms),
    fetchWeWorkRemotely(searchTerms)
  ]);

  // Combine and dedupe - Google results first (highest quality)
  const allJobs = [...google, ...remotive, ...arbeitnow, ...remoteok, ...himalayas, ...jobicy, ...wwr];
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
    jobs: scored.slice(0, 40),
    count: scored.length,
    sources: {
      google: google.length,
      remotive: remotive.length,
      arbeitnow: arbeitnow.length,
      remoteok: remoteok.length,
      himalayas: himalayas.length,
      jobicy: jobicy.length,
      wwr: wwr.length
    }
  });
}

// ═══════════════════════════════════════════════════════════════════════════
// GOOGLE CUSTOM SEARCH - 100 free queries/day, searches job sites via Google
// ═══════════════════════════════════════════════════════════════════════════
async function fetchGoogleSearch(titles, isRemote) {
  const apiKey = process.env.GOOGLE_API_KEY;
  const cx = process.env.GOOGLE_SEARCH_ENGINE_ID;

  if (!apiKey || !cx) {
    console.log("Google Custom Search not configured");
    return [];
  }

  try {
    const jobs = [];
    const jobSites = "site:linkedin.com/jobs OR site:indeed.com/viewjob OR site:glassdoor.com/job OR site:wellfound.com/jobs";
    const locationStr = isRemote ? "remote" : "";

    // Search for first 2 titles to conserve quota (100/day)
    for (const title of titles.slice(0, 2)) {
      const query = `${title} ${locationStr} job ${jobSites}`;
      const params = new URLSearchParams({
        key: apiKey,
        cx: cx,
        q: query,
        num: 10,
        dateRestrict: "m1"
      });

      const r = await fetch(`https://www.googleapis.com/customsearch/v1?${params}`);
      if (!r.ok) {
        console.log(`Google search failed: ${r.status}`);
        continue;
      }

      const data = await r.json();
      if (data.error) {
        console.log(`Google error: ${data.error.message}`);
        continue;
      }

      for (const item of (data.items || [])) {
        const parsed = parseGoogleResult(item, jobs.length);
        if (parsed) jobs.push(parsed);
      }
    }

    return jobs.slice(0, 20);
  } catch (e) {
    console.error("Google search error:", e.message);
    return [];
  }
}

function parseGoogleResult(item, index) {
  const url = item.link || "";
  const title = item.title || "";
  const snippet = item.snippet || "";

  let jobTitle = title;
  let company = "Company";
  let location = "Remote";

  // Parse LinkedIn format: "Job Title - Company | LinkedIn"
  if (url.includes("linkedin.com")) {
    const match = title.match(/^(.+?)\s*[-–]\s*(.+?)\s*[|\-]/);
    if (match) {
      jobTitle = match[1].trim();
      company = match[2].trim();
    }
  }
  // Parse Indeed format: "Job Title - Company - Location | Indeed.com"
  else if (url.includes("indeed.com")) {
    const match = title.match(/^(.+?)\s*[-–]\s*(.+?)\s*[-–]/);
    if (match) {
      jobTitle = match[1].trim();
      company = match[2].trim();
    }
  }
  // Parse Glassdoor: "Job Title at Company | Glassdoor"
  else if (url.includes("glassdoor.com")) {
    const match = title.match(/^(.+?)\s+at\s+(.+?)\s*[|\-]/i);
    if (match) {
      jobTitle = match[1].trim();
      company = match[2].trim();
    }
  }
  // Parse Wellfound: "Job Title at Company"
  else if (url.includes("wellfound.com")) {
    const match = title.match(/^(.+?)\s+at\s+(.+)/i);
    if (match) {
      jobTitle = match[1].trim();
      company = match[2].replace(/[|\-].*$/, "").trim();
    }
  }

  // Extract location from snippet
  if (snippet.toLowerCase().includes("remote")) {
    location = "Remote";
  } else {
    const locMatch = snippet.match(/(?:in|at|location:?)\s*([A-Z][a-z]+(?:[,\s]+[A-Z]{2})?)/);
    if (locMatch) location = locMatch[1];
  }

  const source = url.includes("linkedin") ? "LinkedIn (Google)" :
                 url.includes("indeed") ? "Indeed (Google)" :
                 url.includes("glassdoor") ? "Glassdoor (Google)" :
                 url.includes("wellfound") ? "Wellfound (Google)" : "Google";

  return {
    id: `google-${index}-${Date.now()}`,
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
    applyOptions: [{ label: `Apply on ${source.split(" ")[0]}`, url }]
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
