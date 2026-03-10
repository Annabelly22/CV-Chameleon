import { useState, useEffect, useRef } from "react";

const MASTER_RESUME = {
  name: "Annabel Otutu",
  contact: "Dallas, TX  ·  linkedin.com/in/annabel-otutu  ·  [your email]",
  summary: "Technical Writer and Content Strategist with 3+ years translating complex cybersecurity, federal compliance, and healthcare systems into clear, audience-ready documentation. Background spans Microsoft, Indeed, EPA federal contracting, and Parkland Health. Skilled in Confluence, Jira, NIST SP 800-37, and process automation.",
  skills: ["Technical Writing","Confluence & Jira","NIST SP 800-37","API Documentation","CMS & SEO","Cybersecurity Compliance","SORN & PIA Development","Process Improvement","HTML Scripting","Content Strategy","Knowledge Management","Python Automation","Lucidchart","DevOps Documentation","Microsoft Teams"],
  experience: [
    { title: "Contract/Proposal Analyst", company: "Parkland Health", dates: "2024 – Present",
      bullets: ["Built automated Python/VBScript tools for board document processing, consent agenda generation, and diversity data extraction","Manage contract documentation lifecycle ensuring regulatory alignment across board-level governance reporting","Develop and maintain documentation frameworks supporting proposal workflows and compliance operations"] },
    { title: "Technical Writer", company: "Karthik Consulting LLC (EPA — OISP/OMS)", dates: "Apr 2024 – Present",
      bullets: ["Authored System of Records Notices (SORN) and Privacy Impact Assessments (PIA) per federal privacy regulations","Created Risk Management Reports quarterly in compliance with NIST SP 800-37 standards","Produced system configuration diagrams and process workflow documentation for EPA federal programs","Interviewed technical and functional stakeholders to validate and maintain documentation accuracy"] },
    { title: "IT Technical Writer", company: "Indeed.com", dates: "Jun 2022 – Dec 2022",
      bullets: ["Created wiki pages and onboarding documentation for engineers using Jira and Confluence","Built master documentation outline to streamline engineer training using Lucidchart and Agile sprints","Authored DevOps infrastructure documentation coordinating with software and IT operations teams"] },
    { title: "Contract Technical Writer", company: "Cox Automotive Inc.", dates: "Nov 2022 – May 2023",
      bullets: ["Authored and maintained customer-facing content on Cox.com and internal agent knowledge bases","Managed content lifecycle across multiple knowledge management platforms","Coordinated with SMEs via Microsoft Teams to ensure workflow and product documentation accuracy"] },
    { title: "Cybersecurity Technical Writer", company: "Microsoft", dates: "Aug 2021 – Jan 2022",
      bullets: ["Supported the Halo Infinite security team with cybersecurity documentation quality control","Executed large-scale Confluence database cleanup and content audit","Collaborated with team of Technical Writers to ensure consistent documentation standards"] },
    { title: "IT Intern & Analyst", company: "The Leahy Center (LCDI)", dates: "Jan 2023 – Aug 2023",
      bullets: ["Parsed server and endpoint logs to identify improper configurations","Troubleshot client networking issues ensuring optimal functionality","Conducted research on emerging technologies relevant to digital forensics and cybersecurity"] }
  ],
  education: [{ degree: "Bachelor of Science — Computer Networking and Cybersecurity", school: "Champlain College" }]
};

const DEFAULT_TITLES = [
  "Senior Technical Writer","Technical Writer","Documentation Specialist",
  "Content Strategist","Knowledge Management Specialist","UX Writer",
  "API Documentation Writer","Cybersecurity Documentation Specialist",
  "Compliance Documentation Specialist","Technical Communications Specialist"
];

const DEFAULT_LOCATIONS = ["Dallas TX","Austin TX","Houston TX","Remote"];

export default function JobPipeline() {
  const [apiKey, setApiKey] = useState("");
  const [apiKeyInput, setApiKeyInput] = useState("");
  const [phase, setPhase] = useState("idle");
  const [jobs, setJobs] = useState([]);
  const [tailoring, setTailoring] = useState({});
  const [log, setLog] = useState([]);
  const [jsPDFReady, setJsPDFReady] = useState(false);
  const [titles, setTitles] = useState(DEFAULT_TITLES);
  const [locations, setLocations] = useState(DEFAULT_LOCATIONS);
  const [showSettings, setShowSettings] = useState(false);
  const [titlesInput, setTitlesInput] = useState(DEFAULT_TITLES.join("\n"));
  const logRef = useRef(null);

  useEffect(() => {
    const s = document.createElement("script");
    s.src = "https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js";
    s.onload = () => setJsPDFReady(true);
    document.head.appendChild(s);
  }, []);

  useEffect(() => {
    if (logRef.current) logRef.current.scrollTop = logRef.current.scrollHeight;
  }, [log]);

  const addLog = (msg, type = "info") => {
    const icons = { info: "›", success: "✓", error: "✗", loading: "⟳" };
    setLog(prev => [...prev, { msg, type, icon: icons[type], time: new Date().toLocaleTimeString("en-US", { hour12: false }) }]);
  };

  // Core API call — no tools, clean JSON response
  const callClaude = async (system, userMsg, maxTokens = 2000) => {
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
        "anthropic-dangerous-direct-browser-access": "true"
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: maxTokens,
        system,
        messages: [{ role: "user", content: userMsg }]
      })
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err?.error?.message || `API error ${res.status}`);
    }
    const data = await res.json();
    const text = (data.content || []).find(b => b.type === "text")?.text || "";
    if (!text) throw new Error("Empty response from Claude");
    return text;
  };

  const extractJSON = (text) => {
    // Try to find array first
    const arrMatch = text.match(/\[[\s\S]*\]/);
    if (arrMatch) {
      try { return JSON.parse(arrMatch[0]); } catch {}
    }
    // Try stripping markdown fences
    const fenced = text.replace(/```json\s*/g, "").replace(/```\s*/g, "").trim();
    const arrMatch2 = fenced.match(/\[[\s\S]*\]/);
    if (arrMatch2) {
      try { return JSON.parse(arrMatch2[0]); } catch {}
    }
    // Try full text as JSON
    try { return JSON.parse(fenced); } catch {}
    throw new Error("Could not parse JSON from response");
  };

  const findJobs = async () => {
    if (!apiKey) { addLog("Enter your Anthropic API key first", "error"); return; }
    setPhase("searching");
    setJobs([]);
    setTailoring({});
    addLog("Generating job listings from Claude's knowledge…", "loading");

    const titlesStr = titles.slice(0, 8).join(", ");
    const locsStr = locations.join(", ");

    const system = `You are a job search assistant. You generate realistic, representative job postings based on current market data. Always respond with ONLY a valid JSON array — no markdown, no explanation, no text before or after the array. Start your response with [ and end with ].`;

    const userMsg = `Generate 10 realistic current job postings for these roles: ${titlesStr}
Locations: ${locsStr}

Return ONLY a JSON array. Each object must have exactly these fields:
- id: short unique string like "tw_deloitte_dal"
- title: job title
- company: real company name that hires for these roles
- location: one of the target locations
- url: a plausible URL like https://careers.company.com/jobs/12345
- source: one of "LinkedIn", "Indeed", "Builtin", "Company Site"
- description: 3-4 sentences describing real requirements and responsibilities for this type of role

Make companies varied: mix large enterprises, healthcare orgs, defense contractors, tech companies, consulting firms, and government contractors. Make descriptions specific and realistic.

IMPORTANT: Return ONLY the JSON array starting with [ — no other text.`;

    try {
      addLog("Calling Claude API…", "loading");
      const text = await callClaude(system, userMsg, 3000);
      addLog(`Raw response received (${text.length} chars)`, "info");

      const parsed = extractJSON(text);
      if (!Array.isArray(parsed)) throw new Error("Response was not an array");
      if (parsed.length === 0) throw new Error("No jobs in response");

      const withIds = parsed.map((j, i) => ({
        ...j,
        id: j.id || `job_${i}_${Date.now()}`
      }));

      setJobs(withIds);
      addLog(`Found ${withIds.length} jobs across ${locsStr}`, "success");
      setPhase("results");
    } catch (e) {
      addLog(`Error: ${e.message}`, "error");
      addLog("Try clicking FIND JOBS again", "info");
      setPhase("idle");
    }
  };

  const tailorResume = async (job) => {
    if (!apiKey) { addLog("Enter your Anthropic API key first", "error"); return; }
    setTailoring(prev => ({ ...prev, [job.id]: "loading" }));
    addLog(`Tailoring resume for ${job.title} @ ${job.company}…`, "loading");

    const system = `You are an expert resume tailor. Rules:
1. NEVER invent experience, skills, or credentials
2. Reorder and reword existing bullets to emphasize what matches the JD
3. Mirror the JD's language and keywords naturally
4. Write a tight 2-3 sentence summary targeting this specific role
5. Reorder skills array to lead with what the JD emphasizes
6. Never change company names, dates, or degrees
7. Return ONLY valid JSON matching the exact schema provided — no markdown, no backticks, no explanation
8. Add a "filename" field like "Annabel_Otutu_CompanyName_RoleTitle.pdf"`;

    const userMsg = `MASTER RESUME:
${JSON.stringify(MASTER_RESUME, null, 2)}

JOB TITLE: ${job.title}
COMPANY: ${job.company}
SOURCE: ${job.source}
LOCATION: ${job.location}

JOB DESCRIPTION:
${job.description}

Return ONLY the tailored resume as a JSON object matching the master resume schema exactly. No markdown. No explanation. Start with {`;

    try {
      const text = await callClaude(system, userMsg, 2500);
      const clean = text.replace(/```json\s*/g, "").replace(/```\s*/g, "").trim();
      const parsed = JSON.parse(clean.startsWith("{") ? clean : clean.slice(clean.indexOf("{")));
      const co = (job.company || "Co").replace(/[^a-z0-9]/gi, "_").slice(0, 20);
      const role = (job.title || "Role").replace(/[^a-z0-9]/gi, "_").slice(0, 25);
      parsed.filename = `Annabel_Otutu_${co}_${role}.pdf`;
      setTailoring(prev => ({ ...prev, [job.id]: parsed }));
      addLog(`Resume ready — ${job.company}`, "success");
    } catch (e) {
      setTailoring(prev => ({ ...prev, [job.id]: "error" }));
      addLog(`Failed for ${job.company}: ${e.message}`, "error");
    }
  };

  const generatePDF = (resumeData) => {
    if (!jsPDFReady || !window.jspdf) { alert("PDF library still loading — wait a moment and try again."); return; }
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF({ unit: "mm", format: "letter" });
    const pW = 215.9, m = 16, cW = pW - m * 2;
    let y = 20;
    const navy = [27, 42, 74], slate = [74, 85, 104], rule = [203, 213, 224];

    const sec = (title) => {
      if (y > 252) { doc.addPage(); y = 20; }
      doc.setFont("helvetica", "bold").setFontSize(10).setTextColor(...navy);
      doc.text(title.toUpperCase(), m, y); y += 3;
      doc.setDrawColor(...rule).setLineWidth(0.4).line(m, y, pW - m, y); y += 5;
    };

    doc.setFont("helvetica", "bold").setFontSize(20).setTextColor(...navy);
    doc.text(resumeData.name || "Annabel Otutu", m, y); y += 6;
    doc.setDrawColor(...navy).setLineWidth(0.8).line(m, y, pW - m, y); y += 5;
    doc.setFont("helvetica", "normal").setFontSize(9).setTextColor(...slate);
    doc.text(resumeData.contact || "Dallas, TX", m, y); y += 10;

    if (resumeData.summary) {
      sec("Professional Summary");
      doc.setFont("helvetica", "normal").setFontSize(9.5).setTextColor(...slate);
      const lines = doc.splitTextToSize(resumeData.summary, cW);
      doc.text(lines, m, y); y += lines.length * 5.2 + 5;
    }

    if (resumeData.skills?.length) {
      sec("Core Competencies");
      doc.setFont("helvetica", "normal").setFontSize(9).setTextColor(...slate);
      for (let i = 0; i < resumeData.skills.length; i += 3) {
        doc.text(resumeData.skills.slice(i, i + 3).join("   ·   "), m, y); y += 5;
      }
      y += 3;
    }

    if (resumeData.experience?.length) {
      sec("Professional Experience");
      resumeData.experience.forEach(job => {
        if (y > 248) { doc.addPage(); y = 20; }
        doc.setFont("helvetica", "bold").setFontSize(10).setTextColor(...navy);
        doc.text(job.title || "", m, y); y += 4.5;
        doc.setFont("helvetica", "italic").setFontSize(9).setTextColor(...slate);
        doc.text(`${job.company || ""}  |  ${job.dates || ""}`, m, y); y += 5;
        doc.setFont("helvetica", "normal").setFontSize(9).setTextColor(...slate);
        (job.bullets || []).forEach(b => {
          const lines = doc.splitTextToSize(`• ${b}`, cW - 6);
          if (y + lines.length * 4.5 > 262) { doc.addPage(); y = 20; }
          doc.text(lines, m + 3, y); y += lines.length * 4.5 + 1.5;
        });
        y += 4;
      });
    }

    if (resumeData.education?.length) {
      sec("Education");
      resumeData.education.forEach(e => {
        doc.setFont("helvetica", "bold").setFontSize(9.5).setTextColor(...navy);
        doc.text(e.degree || "", m, y); y += 4;
        doc.setFont("helvetica", "normal").setFontSize(9).setTextColor(...slate);
        doc.text(e.school || "", m, y); y += 6;
      });
    }

    doc.save(resumeData.filename || "Annabel_Otutu_Resume.pdf");
    addLog(`Downloaded: ${resumeData.filename}`, "success");
  };

  const srcColor = { "LinkedIn": "#0A66C2", "Indeed": "#2164F3", "Builtin": "#6C47FF", "Company Site": "#059669" };

  if (!apiKey) {
    return (
      <div style={{ minHeight: "100vh", background: "#0D1117", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'DM Mono','Courier New',monospace" }}>
        <style>{`@import url('https://fonts.googleapis.com/css2?family=DM+Mono:wght@400;500&family=Syne:wght@700;800&display=swap');*{box-sizing:border-box;margin:0;padding:0}`}</style>
        <div style={{ background: "#161B22", border: "1px solid #21262D", borderRadius: 12, padding: "40px 48px", maxWidth: 460, width: "100%", textAlign: "center" }}>
          <div style={{ fontFamily: "'Syne',sans-serif", fontSize: 24, fontWeight: 800, color: "#E6EDF3", marginBottom: 6, letterSpacing: "-0.02em" }}>JOB PIPELINE</div>
          <div style={{ fontSize: 10, color: "#7D8590", letterSpacing: ".08em", marginBottom: 32 }}>ANNABEL OTUTU · FIND · TAILOR · DOWNLOAD</div>
          <div style={{ fontSize: 11, color: "#7D8590", marginBottom: 8, textAlign: "left", letterSpacing: ".06em" }}>ANTHROPIC API KEY</div>
          <input type="password" placeholder="sk-ant-api03-..."
            value={apiKeyInput} onChange={e => setApiKeyInput(e.target.value)}
            onKeyDown={e => e.key === "Enter" && setApiKey(apiKeyInput)}
            style={{ width: "100%", padding: "12px 14px", background: "#0D1117", border: "1px solid #21262D", borderRadius: 6, color: "#E6EDF3", fontFamily: "inherit", fontSize: 13, marginBottom: 12, outline: "none" }} />
          <button onClick={() => setApiKey(apiKeyInput)}
            style={{ width: "100%", padding: 12, background: "linear-gradient(135deg,#1B2A4A,#2D4A7A)", color: "#7EB5F7", border: "1px solid #3D5A80", borderRadius: 6, fontFamily: "inherit", fontSize: 12, fontWeight: 500, letterSpacing: ".08em", cursor: "pointer", textTransform: "uppercase" }}>
            ENTER →
          </button>
          <div style={{ marginTop: 20, fontSize: 10, color: "#3D4A5A", lineHeight: 1.8 }}>
            Get your key: console.anthropic.com → API Keys<br />
            Key is never stored — session memory only
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: "#0D1117", color: "#E6EDF3", fontFamily: "'DM Mono','Courier New',monospace" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Mono:wght@300;400;500&family=Syne:wght@600;700;800&display=swap');
        *{box-sizing:border-box;margin:0;padding:0}
        ::-webkit-scrollbar{width:4px}::-webkit-scrollbar-track{background:#161B22}::-webkit-scrollbar-thumb{background:#2D3A4A;border-radius:2px}
        .jc{background:#161B22;border:1px solid #21262D;border-radius:8px;padding:18px 20px;transition:border-color .2s,transform .15s}
        .jc:hover{border-color:#3D5A80;transform:translateY(-1px)}
        .bp{background:linear-gradient(135deg,#1B2A4A,#2D4A7A);color:#7EB5F7;border:1px solid #3D5A80;border-radius:6px;padding:10px 22px;font-family:inherit;font-size:12px;font-weight:500;letter-spacing:.08em;cursor:pointer;transition:all .2s;text-transform:uppercase}
        .bp:hover:not(:disabled){background:linear-gradient(135deg,#2D4A7A,#3D5A9A);color:#A8CFFF}.bp:disabled{opacity:.4;cursor:not-allowed}
        .bg{background:linear-gradient(135deg,#0D2B1F,#1A4A35);color:#4ADE80;border:1px solid #2D6B4A;border-radius:6px;padding:8px 16px;font-family:inherit;font-size:11px;font-weight:500;letter-spacing:.06em;cursor:pointer;transition:all .2s;text-transform:uppercase}
        .bg:hover:not(:disabled){background:linear-gradient(135deg,#1A4A35,#2A6B4F);color:#86EFAC}.bg:disabled{opacity:.4;cursor:not-allowed}
        .bgh{background:transparent;color:#7D8590;border:1px solid #2D3440;border-radius:6px;padding:8px 16px;font-family:inherit;font-size:11px;cursor:pointer;transition:all .2s;letter-spacing:.06em;text-transform:uppercase}
        .bgh:hover{color:#E6EDF3;border-color:#5A6470}
        .pulse{animation:pulse 1.5s ease-in-out infinite}@keyframes pulse{0%,100%{opacity:1}50%{opacity:.4}}
        .si{animation:si .3s ease-out forwards}@keyframes si{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}
        .tag{display:inline-block;padding:2px 8px;border-radius:4px;font-size:10px;letter-spacing:.05em;font-weight:500}
      `}</style>

      <div style={{ borderBottom: "1px solid #21262D", padding: "16px 28px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div>
          <div style={{ fontFamily: "'Syne',sans-serif", fontSize: 20, fontWeight: 800, color: "#E6EDF3", letterSpacing: "-0.02em" }}>
            JOB PIPELINE <span style={{ color: "#3D6B9A", fontSize: 13, fontWeight: 600 }}>/ ANNABEL OTUTU</span>
          </div>
          <div style={{ fontSize: 10, color: "#7D8590", marginTop: 2, letterSpacing: ".05em" }}>FIND · TAILOR · DOWNLOAD</div>
        </div>
        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <span style={{ fontSize: 10, color: jsPDFReady ? "#4ADE80" : "#F59E0B", letterSpacing: ".08em" }}>{jsPDFReady ? "● PDF READY" : "⟳ PDF LOADING"}</span>
          <button className="bgh" onClick={() => setShowSettings(!showSettings)}>{showSettings ? "CLOSE" : "SETTINGS"}</button>
          <button className="bgh" style={{ fontSize: 10 }} onClick={() => setApiKey("")}>LOGOUT</button>
        </div>
      </div>

      <div style={{ padding: "20px 28px", maxWidth: 1100, margin: "0 auto" }}>

        {showSettings && (
          <div className="si" style={{ background: "#161B22", border: "1px solid #21262D", borderRadius: 8, padding: 20, marginBottom: 20 }}>
            <div style={{ fontFamily: "'Syne',sans-serif", fontSize: 13, fontWeight: 700, color: "#7EB5F7", marginBottom: 14 }}>SEARCH SETTINGS</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
              <div>
                <div style={{ fontSize: 11, color: "#7D8590", marginBottom: 6, letterSpacing: ".08em" }}>JOB TITLES (one per line)</div>
                <textarea value={titlesInput} onChange={e => setTitlesInput(e.target.value)}
                  style={{ width: "100%", height: 150, background: "#0D1117", border: "1px solid #21262D", borderRadius: 6, padding: 10, color: "#E6EDF3", fontFamily: "inherit", fontSize: 12, resize: "vertical" }} />
              </div>
              <div>
                <div style={{ fontSize: 11, color: "#7D8590", marginBottom: 6, letterSpacing: ".08em" }}>LOCATIONS</div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 8 }}>
                  {locations.map(loc => (
                    <span key={loc} className="tag" style={{ background: "#1B2A4A", color: "#7EB5F7", border: "1px solid #2D4A7A", cursor: "pointer" }}
                      onClick={() => setLocations(p => p.filter(l => l !== loc))}>{loc} ✕</span>
                  ))}
                </div>
                <div style={{ fontSize: 10, color: "#3D4A5A" }}>Click to remove</div>
              </div>
            </div>
            <button className="bp" style={{ marginTop: 14 }} onClick={() => {
              setTitles(titlesInput.split("\n").map(t => t.trim()).filter(Boolean));
              setShowSettings(false);
              addLog("Settings saved", "success");
            }}>SAVE</button>
          </div>
        )}

        <div style={{ display: "flex", gap: 12, alignItems: "center", marginBottom: 20 }}>
          <button className="bp" onClick={findJobs} disabled={phase === "searching"} style={{ padding: "12px 32px", fontSize: 13 }}>
            {phase === "searching" ? <span className="pulse">SEARCHING…</span> : "▶  FIND JOBS"}
          </button>
          {jobs.length > 0 && (
            <button className="bg"
              onClick={() => jobs.forEach(j => { if (!tailoring[j.id]) tailorResume(j); })}
              disabled={jobs.every(j => tailoring[j.id] && tailoring[j.id] !== "error")}>
              TAILOR ALL
            </button>
          )}
          {jobs.length > 0 && <span style={{ fontSize: 11, color: "#3D4A5A" }}>{jobs.length} JOBS</span>}
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: 18 }}>
          <div>
            {phase === "idle" && jobs.length === 0 && (
              <div style={{ textAlign: "center", padding: "60px 0", color: "#2D3A4A" }}>
                <div style={{ fontFamily: "'Syne',sans-serif", fontSize: 36, fontWeight: 800, letterSpacing: "-0.03em", marginBottom: 8 }}>READY</div>
                <div style={{ fontSize: 11, letterSpacing: ".08em", lineHeight: 1.9 }}>
                  Generates matching job listings via Claude<br />
                  Tailors your resume to each JD<br />
                  Downloads a formatted PDF per application
                </div>
              </div>
            )}
            {phase === "searching" && (
              <div style={{ textAlign: "center", padding: "60px 0" }}>
                <div className="pulse" style={{ fontFamily: "'Syne',sans-serif", fontSize: 30, fontWeight: 800, color: "#3D6B9A", marginBottom: 8 }}>SCANNING</div>
                <div style={{ fontSize: 10, color: "#3D4A5A", letterSpacing: ".12em" }}>GENERATING MATCHES…</div>
              </div>
            )}

            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {jobs.map((job, i) => {
                const state = tailoring[job.id];
                const done = state && state !== "loading" && state !== "error";
                return (
                  <div key={job.id} className="jc si" style={{ animationDelay: `${i * 0.04}s` }}>
                    <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "flex-start" }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                          <span className="tag" style={{ background: srcColor[job.source] ? `${srcColor[job.source]}22` : "#21262D", color: srcColor[job.source] || "#7D8590", border: `1px solid ${srcColor[job.source] ? `${srcColor[job.source]}44` : "#2D3440"}` }}>{job.source || "SOURCE"}</span>
                          <span style={{ fontSize: 10, color: "#7D8590" }}>{job.location}</span>
                        </div>
                        <div style={{ fontFamily: "'Syne',sans-serif", fontSize: 14, fontWeight: 700, color: "#E6EDF3", marginBottom: 2 }}>{job.title}</div>
                        <div style={{ fontSize: 12, color: "#7EB5F7", marginBottom: 6 }}>{job.company}</div>
                        <div style={{ fontSize: 11, color: "#7D8590", lineHeight: 1.6 }}>{job.description}</div>
                      </div>
                      <div style={{ display: "flex", flexDirection: "column", gap: 8, minWidth: 120, alignItems: "flex-end" }}>
                        {!state && <button className="bg" onClick={() => tailorResume(job)}>TAILOR</button>}
                        {state === "loading" && <span className="pulse" style={{ fontSize: 11, color: "#F59E0B" }}>TAILORING…</span>}
                        {state === "error" && <button className="bgh" onClick={() => tailorResume(job)} style={{ color: "#F87171", borderColor: "#4A2020" }}>RETRY</button>}
                        {done && <button className="bg" onClick={() => generatePDF(state)} disabled={!jsPDFReady}>↓ PDF</button>}
                        <a href={job.url} target="_blank" rel="noopener noreferrer"
                          style={{ fontSize: 10, color: "#3D6B9A", textDecoration: "none", textTransform: "uppercase", letterSpacing: ".05em" }}>VIEW →</a>
                      </div>
                    </div>
                    {done && (
                      <div style={{ marginTop: 10, paddingTop: 10, borderTop: "1px solid #21262D" }}>
                        <div style={{ fontSize: 10, color: "#4ADE80", letterSpacing: ".07em", marginBottom: 4 }}>✓ {state.filename}</div>
                        <div style={{ fontSize: 11, color: "#7D8590", fontStyle: "italic", lineHeight: 1.5 }}>"{state.summary?.slice(0, 130)}…"</div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          <div>
            <div style={{ background: "#161B22", border: "1px solid #21262D", borderRadius: 8, overflow: "hidden", position: "sticky", top: 16 }}>
              <div style={{ padding: "10px 14px", borderBottom: "1px solid #21262D", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontFamily: "'Syne',sans-serif", fontSize: 10, fontWeight: 700, color: "#7D8590", letterSpacing: ".1em" }}>ACTIVITY LOG</span>
                <button onClick={() => setLog([])} style={{ fontSize: 10, color: "#2D3440", background: "none", border: "none", cursor: "pointer" }}>CLEAR</button>
              </div>
              <div ref={logRef} style={{ height: 340, overflowY: "auto", padding: 12 }}>
                {log.length === 0 && <div style={{ fontSize: 11, color: "#1E2A38", textAlign: "center", marginTop: 30 }}>awaiting activity…</div>}
                {log.map((e, i) => (
                  <div key={i} style={{ fontSize: 11, lineHeight: 1.7, paddingBottom: 3, color: e.type === "success" ? "#4ADE80" : e.type === "error" ? "#F87171" : e.type === "loading" ? "#F59E0B" : "#7D8590" }}>
                    <span style={{ color: "#1E2A38", marginRight: 8 }}>{e.time}</span>{e.icon} {e.msg}
                  </div>
                ))}
              </div>
            </div>

            {Object.values(tailoring).filter(v => v !== "loading" && v !== "error").length > 0 && (
              <div style={{ marginTop: 14, background: "#161B22", border: "1px solid #2D6B4A", borderRadius: 8, padding: 14 }}>
                <div style={{ fontFamily: "'Syne',sans-serif", fontSize: 10, fontWeight: 700, color: "#4ADE80", letterSpacing: ".1em", marginBottom: 10 }}>
                  GENERATED ({Object.values(tailoring).filter(v => v !== "loading" && v !== "error").length})
                </div>
                {Object.values(tailoring).filter(v => v !== "loading" && v !== "error").map((r, i) => (
                  <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingBottom: 7, marginBottom: 7, borderBottom: "1px solid #1A3A2A", fontSize: 11 }}>
                    <span style={{ color: "#7D8590", maxWidth: 170, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{r.filename?.replace("Annabel_Otutu_","").replace(".pdf","")}</span>
                    <button className="bg" style={{ padding: "3px 10px", fontSize: 10 }} onClick={() => generatePDF(r)} disabled={!jsPDFReady}>↓</button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
