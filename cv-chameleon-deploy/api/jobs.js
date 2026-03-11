export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const apiKey = process.env.SERPAPI_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: "SERPAPI_KEY not configured in Vercel environment variables." });
  }

  const { titles = [], locations = [] } = req.body;

  // Build smart search queries
  const queries = [];
  const titleSlice = titles.slice(0, 5);
  const geoLocations = locations.filter(l => !["Contract","Government","BuiltIn","Remote"].includes(l));
  const isRemote = locations.includes("Remote");
  const isContract = locations.includes("Contract");
  const isGov = locations.includes("Government");

  // Geo-based queries
  for (const title of titleSlice.slice(0, 3)) {
    for (const loc of geoLocations.slice(0, 2)) {
      queries.push({ q: `${title} ${loc} TX`, location: `${loc}, Texas` });
    }
  }

  // Remote queries
  if (isRemote) {
    for (const title of titleSlice.slice(0, 2)) {
      queries.push({ q: `${title} remote`, location: "United States" });
    }
  }

  // Contract queries
  if (isContract) {
    queries.push({ q: `${titleSlice[0]} contract`, location: "Texas, United States" });
  }

  // Government/contractor queries
  if (isGov) {
    queries.push({ q: `${titleSlice[0]} government contractor clearance`, location: "Texas, United States" });
    queries.push({ q: `${titleSlice[0]} federal`, location: "United States" });
  }

  // If no geo selected, default to Texas
  if (!geoLocations.length && !isRemote) {
    queries.push({ q: `${titleSlice[0]} Texas`, location: "Texas, United States" });
  }

  const allJobs = [];
  const seen = new Set();

  await Promise.all(queries.slice(0, 8).map(async ({ q, location }) => {
    try {
      const params = new URLSearchParams({
        engine: "google_jobs",
        q,
        location,
        chips: "date_posted:week",
        api_key: apiKey,
        hl: "en",
        gl: "us"
      });

      const response = await fetch(`https://serpapi.com/search?${params}`);
      const data = await response.json();

      if (data?.jobs_results?.length) {
        for (const job of data.jobs_results) {
          const key = `${job.title}-${job.company_name}`;
          if (seen.has(key)) continue;
          seen.add(key);

          let salary = null;
          if (job.detected_extensions?.salary) salary = job.detected_extensions.salary;

          let posted = null;
          if (job.detected_extensions?.posted_at) posted = job.detected_extensions.posted_at;

          const applyLink = job.apply_options?.[0]?.link || job.share_link || "#";
          const source = job.apply_options?.[0]?.title || "Google Jobs";

          allJobs.push({
            id: `${job.title}-${job.company_name}-${allJobs.length}`.replace(/\s+/g, "_"),
            title: job.title,
            company: job.company_name,
            location: job.location,
            url: applyLink,
            companyUrl: `https://www.google.com/search?q=${encodeURIComponent(job.company_name + " careers")}`,
            source,
            description: job.description
              ? job.description.slice(0, 600).replace(/\n+/g, " ").trim() + "…"
              : "No description available.",
            salary,
            posted,
            applyOptions: (job.apply_options || []).slice(0, 3).map(o => ({ label: o.title, url: o.link }))
          });
        }
      }
    } catch (e) {
      // skip failed queries silently
    }
  }));

  if (!allJobs.length) {
    return res.status(200).json({ jobs: [], count: 0, message: "No results found — try different titles or locations" });
  }

  return res.status(200).json({ jobs: allJobs.slice(0, 25), count: allJobs.length });
}
