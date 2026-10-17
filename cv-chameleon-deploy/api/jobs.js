export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const googleApiKey = process.env.GOOGLE_API_KEY;
  const searchEngineId = process.env.GOOGLE_SEARCH_ENGINE_ID;

  if (!googleApiKey || !searchEngineId) {
    return res.status(500).json({ error: "Google Search API not configured" });
  }

  const { titles = [], locations = [] } = req.body;
  if (!titles.length) {
    return res.status(400).json({ error: "No job titles provided" });
  }

  const allJobs = [];
  const seen = new Set();
  const errors = [];

  // Build search queries
  const isRemote = locations.includes("Remote");
  const locationStr = isRemote ? "remote" : locations.filter(l => !["Contract"].includes(l)).join(" OR ") || "remote";

  // Search job boards directly
  const jobSites = "site:linkedin.com/jobs OR site:indeed.com OR site:glassdoor.com OR site:wellfound.com OR site:remotive.com";

  for (const title of titles.slice(0, 3)) {
    try {
      const query = `${title} ${locationStr} ${jobSites}`;
      const params = new URLSearchParams({
        key: googleApiKey,
        cx: searchEngineId,
        q: query,
        num: 10,
        dateRestrict: "m1" // Last month
      });

      const r = await fetch(`https://www.googleapis.com/customsearch/v1?${params}`);
      const data = await r.json();

      if (data.error) {
        errors.push(`Google API: ${data.error.message}`);
        continue;
      }

      if (data.items?.length) {
        for (const item of data.items) {
          const key = `${item.title}-${item.link}`;
          if (seen.has(key)) continue;
          seen.add(key);

          // Parse job from search result
          const job = parseSearchResult(item, title, allJobs.length);
          if (job) allJobs.push(job);
        }
      }
    } catch (e) {
      errors.push(e.message);
    }
  }

  // If Google Custom Search fails or returns nothing, use fallback static job boards
  if (!allJobs.length) {
    const fallbackJobs = generateFallbackJobs(titles, isRemote);
    allJobs.push(...fallbackJobs);
  }

  return res.status(200).json({
    jobs: allJobs.slice(0, 25),
    count: allJobs.length,
    errors: errors.length ? errors : undefined
  });
}

function parseSearchResult(item, searchTitle, index) {
  const url = item.link || "";
  const title = item.title || "";

  // Extract company from title or snippet
  let company = "Unknown Company";
  let jobTitle = searchTitle;

  // LinkedIn format: "Job Title - Company | LinkedIn"
  if (url.includes("linkedin.com")) {
    const match = title.match(/^(.+?)\s*[-–]\s*(.+?)\s*\|/);
    if (match) {
      jobTitle = match[1].trim();
      company = match[2].trim();
    }
  }
  // Indeed format: "Job Title - Company - Location | Indeed.com"
  else if (url.includes("indeed.com")) {
    const match = title.match(/^(.+?)\s*[-–]\s*(.+?)\s*[-–]/);
    if (match) {
      jobTitle = match[1].trim();
      company = match[2].trim();
    }
  }
  // Glassdoor format
  else if (url.includes("glassdoor.com")) {
    const match = title.match(/^(.+?)\s+at\s+(.+?)\s*[-–|]/i);
    if (match) {
      jobTitle = match[1].trim();
      company = match[2].trim();
    }
  }
  // Generic fallback
  else {
    const match = title.match(/^(.+?)\s*[-–|at]\s*(.+)/i);
    if (match) {
      jobTitle = match[1].trim();
      company = match[2].replace(/\|.*$/, "").trim();
    }
  }

  // Extract location from snippet
  let location = "Remote";
  const snippet = item.snippet || "";
  const locMatch = snippet.match(/(?:in|at|location:?)\s*([A-Z][a-z]+(?:\s*,?\s*[A-Z]{2})?)/i);
  if (locMatch) location = locMatch[1];
  if (snippet.toLowerCase().includes("remote")) location = "Remote";

  return {
    id: `search-${index}-${Date.now()}`,
    title: jobTitle.slice(0, 100),
    company: company.slice(0, 50),
    location,
    url,
    companyUrl: `https://www.google.com/search?q=${encodeURIComponent(company + " careers")}`,
    source: url.includes("linkedin") ? "LinkedIn" :
            url.includes("indeed") ? "Indeed" :
            url.includes("glassdoor") ? "Glassdoor" :
            url.includes("wellfound") ? "Wellfound" :
            url.includes("remotive") ? "Remotive" : "Web",
    description: snippet.slice(0, 500),
    salary: null,
    posted: "Recent",
    applyOptions: [{ label: "Apply", url }]
  };
}

function generateFallbackJobs(titles, isRemote) {
  // Generate direct links to job board searches
  const jobs = [];
  const title = titles[0] || "Technical Writer";
  const encodedTitle = encodeURIComponent(title);
  const location = isRemote ? "remote" : "";

  const boards = [
    {
      name: "LinkedIn",
      url: `https://www.linkedin.com/jobs/search/?keywords=${encodedTitle}&f_WT=2`, // f_WT=2 is remote
      company: "LinkedIn Jobs"
    },
    {
      name: "Indeed",
      url: `https://www.indeed.com/jobs?q=${encodedTitle}&l=${isRemote ? "remote" : ""}&fromage=14`,
      company: "Indeed"
    },
    {
      name: "Wellfound",
      url: `https://wellfound.com/jobs?query=${encodedTitle}`,
      company: "Wellfound (AngelList)"
    },
    {
      name: "Remotive",
      url: `https://remotive.com/remote-jobs/writing?query=${encodedTitle}`,
      company: "Remotive"
    },
    {
      name: "We Work Remotely",
      url: `https://weworkremotely.com/remote-jobs/search?term=${encodedTitle}`,
      company: "We Work Remotely"
    },
    {
      name: "FlexJobs",
      url: `https://www.flexjobs.com/search?search=${encodedTitle}&location=Remote`,
      company: "FlexJobs"
    }
  ];

  for (let i = 0; i < boards.length; i++) {
    const board = boards[i];
    jobs.push({
      id: `fallback-${i}`,
      title: `${title} positions on ${board.name}`,
      company: board.company,
      location: isRemote ? "Remote" : "Various",
      url: board.url,
      companyUrl: board.url,
      source: board.name,
      description: `Search for ${title} positions on ${board.name}. Click to view current openings.`,
      salary: null,
      posted: "Live search",
      applyOptions: [{ label: `Search ${board.name}`, url: board.url }]
    });
  }

  return jobs;
}
