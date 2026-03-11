export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const apiKey = process.env.SERPAPI_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: "SERPAPI_KEY not configured in Vercel environment variables." });
  }

  const { titles = [], locations = [] } = req.body;

  const queries = [];
  const titleSlice = titles.slice(0, 5);
  const geoLocations = locations.filter(l => !["Contract","Government","BuiltIn","Remote"].includes(l));
  const isRemote = locations.includes("Remote");
  const isContract = locations.includes("Contract");
  const isGov = locations.includes("Government");

  for (const title of titleSlice.slice(0, 3))
    for (const loc of geoLocations.slice(0, 2))
      queries.push({ q: `${title} ${loc} TX`, location: `${loc}, Texas` });

  if (isRemote)
    for (const title of titleSlice.slice(0, 2))
      queries.push({ q: `${title} remote`, location: "United States" });

  if (isContract)
    queries.push({ q: `${titleSlice[0]} contract`, location: "Texas, United States" });

  if (isGov) {
    queries.push({ q: `${titleSlice[0]} government contractor`, location: "Texas, United States" });
    queries.push({ q: `${titleSlice[0]} federal`, location: "United States" });
  }

  if (!geoLocations.length && !isRemote)
    queries.push({ q: `${titleSlice[0]} Texas`, location: "Texas, United States" });

  const allJobs = [];
  const seen = new Set();

  // First pass: with month filter
  await Promise.all(queries.slice(0, 8).map(async ({ q, location }) => {
    try {
      const params = new URLSearchParams({ engine: "google_jobs", q, location, chips: "date_posted:month", api_key: apiKey, hl: "en", gl: "us" });
      const r = await fetch(`https://serpapi.com/search?${params}`);
      const data = await r.json();
      if (data?.jobs_results?.length) {
        for (const job of data.jobs_results) {
          const key = `${job.title}-${job.company_name}`;
          if (seen.has(key)) continue;
          seen.add(key);
          allJobs.push(parseJob(job, allJobs.length));
        }
      }
    } catch (_) {}
  }));

  // Fallback: no date filter if nothing came back
  if (!allJobs.length) {
    await Promise.all(queries.slice(0, 4).map(async ({ q, location }) => {
      try {
        const params = new URLSearchParams({ engine: "google_jobs", q, location, api_key: apiKey, hl: "en", gl: "us" });
        const r = await fetch(`https://serpapi.com/search?${params}`);
        const data = await r.json();
        if (data?.jobs_results?.length) {
          for (const job of data.jobs_results) {
            const key = `${job.title}-${job.company_name}`;
            if (seen.has(key)) continue;
            seen.add(key);
            allJobs.push(parseJob(job, allJobs.length));
          }
        }
      } catch (_) {}
    }));
  }

  return res.status(200).json({ jobs: allJobs.slice(0, 25), count: allJobs.length });
}

function parseJob(job, index) {
  return {
    id: `${job.title}-${job.company_name}-${index}`.replace(/\s+/g, "_"),
    title: job.title,
    company: job.company_name,
    location: job.location,
    url: job.apply_options?.[0]?.link || job.share_link || "#",
    companyUrl: `https://www.google.com/search?q=${encodeURIComponent((job.company_name || "") + " careers")}`,
    source: job.apply_options?.[0]?.title || "Google Jobs",
    description: job.description ? job.description.slice(0, 1500).replace(/\n+/g, " ").trim() : "No description available.",
    salary: job.detected_extensions?.salary || null,
    posted: job.detected_extensions?.posted_at || null,
    applyOptions: (job.apply_options || []).slice(0, 3).map(o => ({ label: o.title, url: o.link }))
  };
}
