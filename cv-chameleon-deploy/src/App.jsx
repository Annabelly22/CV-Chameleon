import { useState, useEffect, useRef } from "react";

const MASTER_RESUME = {
  name: "Annabel Otutu",
  contact: "Dallas, TX  ·  linkedin.com/in/annabel-otutu  ·  annabellotutu@gmail.com",
  summary: "",
  skills: ["Technical Writing","Confluence & Jira","NIST SP 800-37","API Documentation","CMS & SEO","Cybersecurity Compliance","SORN & PIA Development","Process Improvement","HTML Scripting","Content Strategy","Knowledge Management","Python Automation","Lucidchart","DevOps Documentation","Microsoft Teams","SharePoint","Section 508 Compliance","Adobe Acrobat Pro","Federal Documentation Standards","Version Control","SOPs & Policy Writing","Stakeholder Interviews","Agile / Sprint Methodology","Style Guide Adherence"],
  experience: [
    { title: "Contract/Proposal Analyst", company: "Parkland Health", dates: "2024 – Present",
      bullets: [
        "Built automated Python/VBScript tools for board document processing, consent agenda generation, and diversity data extraction",
        "Manage contract documentation lifecycle ensuring regulatory alignment across board-level governance reporting",
        "Develop and maintain documentation frameworks supporting proposal workflows and compliance operations",
        "Coordinate with subject matter experts and stakeholders to validate accuracy and currency of all documentation",
        "Maintain version control and manage content updates across shared platforms including SharePoint and Teams"
      ]},
    { title: "Technical Writer", company: "Karthik Consulting LLC (EPA — OISP/OMS)", dates: "Apr 2024 – Present",
      bullets: [
        "Authored System of Records Notices (SORN) and Privacy Impact Assessments (PIA) per federal privacy regulations",
        "Created Risk Management Reports quarterly in compliance with NIST SP 800-37 standards",
        "Produced system configuration diagrams and process workflow documentation for EPA federal programs",
        "Interviewed technical and functional stakeholders to validate and maintain documentation accuracy",
        "Ensured all deliverables met federal writing standards and Section 508 accessibility requirements",
        "Developed SOPs, policy papers, and needs assessments aligned with agency mission and compliance mandates"
      ]},
    { title: "IT Technical Writer", company: "Indeed.com", dates: "Jun 2022 – Dec 2022",
      bullets: [
        "Created wiki pages and onboarding documentation for engineers using Jira and Confluence",
        "Built master documentation outline to streamline engineer training using Lucidchart and Agile sprints",
        "Authored DevOps infrastructure documentation coordinating with software and IT operations teams",
        "Managed content lifecycle and version control across shared knowledge management environments"
      ]},
    { title: "Contract Technical Writer", company: "Cox Automotive Inc.", dates: "Nov 2022 – May 2023",
      bullets: [
        "Authored and maintained customer-facing content on Cox.com and internal agent knowledge bases",
        "Managed content lifecycle across multiple knowledge management platforms",
        "Coordinated with SMEs via Microsoft Teams to ensure workflow and product documentation accuracy",
        "Revised and edited technical content for grammar, clarity, consistency, tone, and formatting standards"
      ]},
    { title: "Cybersecurity Technical Writer", company: "Microsoft", dates: "Aug 2021 – Jan 2022",
      bullets: [
        "Supported the Halo Infinite security team with cybersecurity documentation quality control",
        "Executed large-scale Confluence database cleanup and content audit ensuring accuracy and consistency",
        "Collaborated with team of Technical Writers to ensure consistent documentation standards across initiatives",
        "Reviewed documents for clarity, grammar, and alignment with internal style and formatting guidelines"
      ]},
    { title: "IT Intern & Analyst", company: "The Leahy Center (LCDI)", dates: "Jan 2023 – Aug 2023",
      bullets: [
        "Parsed server and endpoint logs to identify improper configurations",
        "Troubleshot client networking issues ensuring optimal functionality",
        "Conducted research on emerging technologies relevant to digital forensics and cybersecurity"
      ]}
  ],
  education: [{ degree: "Bachelor of Science — Computer Networking and Cybersecurity", school: "Champlain College" }]
};

const TAILOR_SYSTEM = `You are an elite federal resume strategist and ATS optimization expert. Your sole objective is to produce a tailored resume JSON that will get Annabel Otutu an interview by maximally matching the job description.

RULES — follow every one without exception:

1. SUMMARY: Write a 2-3 sentence summary that opens with the EXACT job title from the JD, mirrors the employer's own language, and references 2-3 specific technical requirements from the JD (tools, standards, methodologies, clearance levels, etc). Make the hiring manager feel like this resume was written for this job specifically.

2. SKILLS: Reorder and rewrite the skills array so that the top 8-10 skills are VERBATIM keywords pulled from the JD. Only after those come general skills. Add any JD-specific skill not already in the master list (e.g. "Section 508 Compliance", "National Response Framework", "GPO Style Manual", "FEMA Doctrine", "Adobe Acrobat Pro", "SharePoint", "Federal Writing Standards" — whatever the JD explicitly names).

3. BULLETS: For each experience entry, rewrite bullets to directly answer the JD's required responsibilities. Use the JD's exact action verbs and technical terms. If the JD says "edit and refine operational plans" — a bullet must say something like "Edited and refined operational plans, SOPs, and policy papers ensuring clarity, consistency, and federal writing standards compliance." Never invent experience — but always reframe real experience using JD language. Every bullet should feel like evidence for a requirement in the JD.

4. EXPERIENCE ORDER: If a role is more relevant to the JD, surface its most relevant bullets first. Cut weak/irrelevant bullets if needed to fit stronger ones.

5. NEVER: Invent companies, dates, degrees, or job titles. Never use vague marketing language. Never use soft words like "helped", "assisted", "supported" when stronger verbs apply.

6. OUTPUT: Return ONLY valid JSON starting with { — no markdown, no preamble, no explanation. Match the exact schema of the master resume. Add a "filename" field.`;

const TAILOR_USER = (job, master) =>
  `MASTER RESUME:\n${JSON.stringify(master)}\n\nTARGET ROLE: ${job.title} at ${job.company}\nLOCATION: ${job.location}\n\nFULL JOB DESCRIPTION:\n${job.description}\n\nReturn the tailored resume JSON only, starting with {`;

const TITLE_GROUPS = [
  { label: "Highest Probability (80–95%)", color: "#4ADE80", titles: ["Technical Writer","Technical Writer II","Documentation Specialist","Content Developer","Content Strategist","Knowledge Management Specialist","Technical Communications Specialist","User Experience Writer","API Documentation Writer","Software Documentation Writer"]},
  { label: "IT Support & Analysis", color: "#7EB5F7", titles: ["IT Support Specialist","Help Desk Analyst II","Help Desk Analyst III","System Documentation Analyst","IT Business Analyst","Technical Support Specialist","Desktop Support Technician","Network Support Technician"]},
  { label: "Federal & Government Contractor", color: "#C084FC", titles: ["Technical Writer (Cleared)","Documentation Specialist (Federal)","IT Support Analyst (Government)","Cybersecurity Documentation Specialist","Compliance Documentation Specialist"]},
  { label: "Cybersecurity — Entry Level (60–80%)", color: "#F59E0B", titles: ["Cybersecurity Analyst I","SOC Analyst I","Information Security Analyst","Vulnerability Assessment Analyst","Compliance Analyst","Risk Assessment Analyst","Security Documentation Specialist"]},
  { label: "Business Analysis", color: "#F59E0B", titles: ["Junior Business Analyst","Process Documentation Analyst","Business Process Analyst","Requirements Analyst","Quality Assurance Analyst","Training Developer"]},
  { label: "Project Coordination", color: "#F59E0B", titles: ["Technical Project Coordinator","Documentation Project Manager","IT Project Coordinator","Training Coordinator"]},
  { label: "Software & Tech (40–60%)", color: "#FB923C", titles: ["Product Documentation Manager","Developer Relations Specialist","Training Content Developer","Customer Success Specialist (Technical)","Technical Proposal Manager","Technical Account Manager","Solutions Specialist"]},
  { label: "Healthcare & Finance", color: "#FB923C", titles: ["Compliance Documentation Specialist","Policy and Procedure Writer","Training Material Developer","Process Improvement Analyst"]},
  { label: "Consulting", color: "#FB923C", titles: ["Technology Consultant","Implementation Specialist","Training Consultant","Contracts Manager","Commercial Project Manager","Procurement Project Manager"]},
  { label: "Hybrid Sweet Spot Roles", color: "#F472B6", titles: ["RFP Manager","Proposal Manager","Implementation Project Manager","Contracts Project Manager","Strategic Sourcing Project Manager","Technical Program Manager (TPM)","Documentation Manager","Knowledge Management Lead","Legal Operations Manager"]}
];

const ALL_TITLES = [...new Set(TITLE_GROUPS.flatMap(g => g.titles))];
const LOCATION_OPTIONS = [
  { label: "Austin", emoji: "🔥" },{ label: "Houston", emoji: "💕" },{ label: "Dallas", emoji: "❤️" },
  { label: "Remote", emoji: "😌" },{ label: "Contract", emoji: "🤑" },{ label: "Government", emoji: "💫" },{ label: "BuiltIn", emoji: "🤌🏽" },
];
const DEFAULT_TITLES = ["Technical Writer","Documentation Specialist","Content Strategist","Knowledge Management Specialist","Technical Communications Specialist","API Documentation Writer","Compliance Documentation Specialist","RFP Manager","Technical Program Manager (TPM)","Implementation Project Manager"];
const DEFAULT_LOCATIONS = ["Austin","Dallas","Remote"];

async function fetchJobsViaSerpAPI(serpKey, titles, locations) {
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
  if (isContract) queries.push({ q: `${titleSlice[0]} contract`, location: "Texas, United States" });
  if (isGov) {
    queries.push({ q: `${titleSlice[0]} government contractor clearance`, location: "Texas, United States" });
    queries.push({ q: `${titleSlice[0]} federal`, location: "United States" });
  }
  if (!geoLocations.length && !isRemote) queries.push({ q: `${titleSlice[0]} Texas`, location: "Texas, United States" });
  const allJobs = []; const seen = new Set();
  await Promise.all(queries.slice(0, 8).map(async ({ q, location }) => {
    try {
      const params = new URLSearchParams({ engine: "google_jobs", q, location, chips: "date_posted:week", api_key: serpKey, hl: "en", gl: "us" });
      const response = await fetch(`https://serpapi.com/search?${params}`);
      const data = await response.json();
      if (data?.jobs_results?.length) {
        for (const job of data.jobs_results) {
          const key = `${job.title}-${job.company_name}`;
          if (seen.has(key)) continue;
          seen.add(key);
          allJobs.push({
            id: `${job.title}-${job.company_name}-${allJobs.length}`.replace(/\s+/g,"_"),
            title: job.title, company: job.company_name, location: job.location,
            url: job.apply_options?.[0]?.link || job.share_link || "#",
            companyUrl: `https://www.google.com/search?q=${encodeURIComponent((job.company_name||"")+" careers")}`,
            source: job.apply_options?.[0]?.title || "Google Jobs",
            description: job.description ? job.description.slice(0,1500).replace(/\n+/g," ").trim() : "No description available.",
            salary: job.detected_extensions?.salary || null,
            posted: job.detected_extensions?.posted_at || null,
            applyOptions: (job.apply_options||[]).slice(0,3).map(o=>({ label: o.title, url: o.link }))
          });
        }
      }
    } catch(_) {}
  }));
  return allJobs.slice(0, 25);
}

const callClaude = async (system, userMsg, maxTokens = 3000) => {
  const res = await fetch("/api/claude", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ model: "claude-sonnet-4-20250514", max_tokens: maxTokens, system, messages: [{ role: "user", content: userMsg }] })
  });
  if (!res.ok) throw new Error(`API error ${res.status}`);
  const data = await res.json();
  return (data.content||[]).find(b=>b.type==="text")?.text || "";
};

const STYLES = `
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
  .bp2{background:linear-gradient(135deg,#2D1B4A,#4A2D7A);color:#C084FC;border:1px solid #6A3DAA;border-radius:6px;padding:10px 22px;font-family:inherit;font-size:12px;font-weight:500;letter-spacing:.08em;cursor:pointer;transition:all .2s;text-transform:uppercase}
  .bp2:hover:not(:disabled){background:linear-gradient(135deg,#4A2D7A,#5A3D9A);color:#D8A8FF}.bp2:disabled{opacity:.4;cursor:not-allowed}
  .pulse{animation:pulse 1.5s ease-in-out infinite}@keyframes pulse{0%,100%{opacity:1}50%{opacity:.4}}
  .si{animation:si .3s ease-out forwards}@keyframes si{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}
  .tag{display:inline-block;padding:2px 8px;border-radius:4px;font-size:10px;letter-spacing:.05em;font-weight:500}
  .key-input{width:100%;background:#0D1117;border:1px solid #3D5A80;border-radius:6px;padding:13px 48px 13px 16px;color:#E6EDF3;font-family:'DM Mono','Courier New',monospace;font-size:13px;outline:none;letter-spacing:.04em;transition:border-color .2s}
  .key-input:focus{border-color:#7EB5F7}
  .key-input::placeholder{color:#2D3A4A}
  .jd-input{width:100%;background:#0D1117;border:1px solid #2D3A4A;border-radius:6px;padding:12px 14px;color:#E6EDF3;font-family:'DM Mono','Courier New',monospace;font-size:11px;outline:none;resize:vertical;line-height:1.6;transition:border-color .2s}
  .jd-input:focus{border-color:#6A3DAA}
  .jd-input::placeholder{color:#2D3A4A}
  .fi{background:#0D1117;border:1px solid #2D3A4A;border-radius:5px;padding:8px 10px;color:#E6EDF3;font-family:'DM Mono','Courier New',monospace;font-size:11px;outline:none;width:100%;transition:border-color .2s}
  .fi:focus{border-color:#6A3DAA}
  .fi::placeholder{color:#2D3A4A}
`;

export default function App() {
  const [screen, setScreen] = useState("key");
  const [serpKey, setSerpKey] = useState("");
  const [serpKeyInput, setSerpKeyInput] = useState("");
  const [showKey, setShowKey] = useState(false);
  const [phase, setPhase] = useState("idle");
  const [jobs, setJobs] = useState([]);
  const [tailoring, setTailoring] = useState({});
  const [log, setLog] = useState([]);
  const [jsPDFReady, setJsPDFReady] = useState(false);
  const [titles, setTitles] = useState(DEFAULT_TITLES);
  const [locations, setLocations] = useState(DEFAULT_LOCATIONS);
  const [showTitleDropdown, setShowTitleDropdown] = useState(false);
  const [showPastePanel, setShowPastePanel] = useState(false);
  const [pasteTitle, setPasteTitle] = useState("");
  const [pasteCompany, setPasteCompany] = useState("");
  const [pasteLocation, setPasteLocation] = useState("");
  const [pasteJD, setPasteJD] = useState("");
  const [pasting, setPasting] = useState(false);
  const logRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    const s = document.createElement("script");
    s.src = "https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js";
    s.onload = () => setJsPDFReady(true);
    document.head.appendChild(s);
  }, []);

  useEffect(() => { if (logRef.current) logRef.current.scrollTop = logRef.current.scrollHeight; }, [log]);
  useEffect(() => { if (screen === "key") setTimeout(() => inputRef.current?.focus(), 100); }, [screen]);

  const addLog = (msg, type="info") => {
    const icons = { info:"›", success:"✓", error:"✗", loading:"⟳" };
    setLog(prev => [...prev, { msg, type, icon: icons[type], time: new Date().toLocaleTimeString("en-US",{hour12:false}) }]);
  };

  const lockKey = () => {
    if (!serpKeyInput.trim()) return;
    setSerpKey(serpKeyInput.trim());
    setScreen("main");
    addLog("SerpAPI connected — live job board search ready", "success");
  };

  const findJobs = async () => {
    setPhase("searching"); setJobs([]); setTailoring({});
    addLog("Querying Google Jobs via SerpAPI…", "loading");
    try {
      const results = await fetchJobsViaSerpAPI(serpKey, titles, locations);
      if (!results.length) { addLog("No results — try different titles or locations", "error"); setPhase("idle"); return; }
      setJobs(results);
      addLog(`${results.length} real jobs found`, "success");
      setPhase("results");
    } catch(e) { addLog(`SerpAPI error: ${e.message}`, "error"); setPhase("idle"); }
  };

  const tailorResume = async (job) => {
    setTailoring(prev => ({ ...prev, [job.id]: "loading" }));
    addLog(`Tailoring for ${job.company}…`, "loading");
    try {
      const text = await callClaude(TAILOR_SYSTEM, TAILOR_USER(job, MASTER_RESUME), 3000);
      const clean = text.replace(/```json\s*/g,"").replace(/```\s*/g,"").trim();
      const parsed = JSON.parse(clean.startsWith("{") ? clean : clean.slice(clean.indexOf("{")));
      const co = (job.company||"Co").replace(/[^a-z0-9]/gi,"_").slice(0,20);
      const role = (job.title||"Role").replace(/[^a-z0-9]/gi,"_").slice(0,25);
      parsed.filename = `Annabel_Otutu_${co}_${role}.pdf`;
      setTailoring(prev => ({ ...prev, [job.id]: parsed }));
      addLog(`Resume ready — ${job.company}`, "success");
    } catch(e) {
      setTailoring(prev => ({ ...prev, [job.id]: "error" }));
      addLog(`Failed: ${job.company} — ${e.message}`, "error");
    }
  };

  const tailorFromPaste = async () => {
    if (!pasteJD.trim() || !pasteTitle.trim() || !pasteCompany.trim()) return;
    setPasting(true);
    const job = {
      id: `paste_${Date.now()}`,
      title: pasteTitle.trim(),
      company: pasteCompany.trim(),
      location: pasteLocation.trim() || "Remote",
      url: "#", companyUrl: "#",
      source: "Pasted",
      description: pasteJD.trim(),
      salary: null, posted: "Now", applyOptions: []
    };
    addLog(`Tailoring pasted JD — ${job.company}…`, "loading");
    try {
      const text = await callClaude(TAILOR_SYSTEM, TAILOR_USER(job, MASTER_RESUME), 3000);
      const clean = text.replace(/```json\s*/g,"").replace(/```\s*/g,"").trim();
      const parsed = JSON.parse(clean.startsWith("{") ? clean : clean.slice(clean.indexOf("{")));
      const co = job.company.replace(/[^a-z0-9]/gi,"_").slice(0,20);
      const role = job.title.replace(/[^a-z0-9]/gi,"_").slice(0,25);
      parsed.filename = `Annabel_Otutu_${co}_${role}.pdf`;
      setJobs(prev => [job, ...prev.filter(j => j.id !== job.id)]);
      setTailoring(prev => ({ ...prev, [job.id]: parsed }));
      setPhase("results");
      addLog(`Resume ready — ${job.company}`, "success");
      setPasteTitle(""); setPasteCompany(""); setPasteLocation(""); setPasteJD("");
      setShowPastePanel(false);
    } catch(e) {
      addLog(`Failed — ${e.message}`, "error");
    }
    setPasting(false);
  };

  const generatePDF = (r) => {
    if (!jsPDFReady || !window.jspdf) { alert("PDF loading, try again."); return; }
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF({ unit:"mm", format:"letter" });
    const pW=215.9, m=16, cW=pW-m*2; let y=20;
    const navy=[27,42,74], slate=[74,85,104], rule=[203,213,224];
    const sec=(t)=>{
      if(y>252){doc.addPage();y=20;}
      doc.setFont("helvetica","bold").setFontSize(10).setTextColor(...navy);
      doc.text(t.toUpperCase(),m,y); y+=3;
      doc.setDrawColor(...rule).setLineWidth(0.4).line(m,y,pW-m,y); y+=5;
    };
    // Name
    doc.setFont("helvetica","bold").setFontSize(20).setTextColor(...navy);
    doc.text(r.name||"Annabel Otutu",m,y); y+=6;
    doc.setDrawColor(...navy).setLineWidth(0.8).line(m,y,pW-m,y); y+=5;
    // Contact
    doc.setFont("helvetica","normal").setFontSize(9).setTextColor(...slate);
    doc.text(r.contact||"Dallas, TX",m,y); y+=10;
    // Summary
    if(r.summary){
      sec("Professional Summary");
      const l=doc.splitTextToSize(r.summary,cW);
      doc.setFont("helvetica","normal").setFontSize(9.5).setTextColor(...slate);
      doc.text(l,m,y); y+=l.length*5.2+5;
    }
    // Skills
    if(r.skills?.length){
      sec("Core Competencies");
      doc.setFont("helvetica","normal").setFontSize(9).setTextColor(...slate);
      for(let i=0;i<r.skills.length;i+=3){
        doc.text(r.skills.slice(i,i+3).join("   ·   "),m,y); y+=5;
      }
      y+=3;
    }
    // Experience
    if(r.experience?.length){
      sec("Professional Experience");
      r.experience.forEach(j=>{
        if(y>248){doc.addPage();y=20;}
        doc.setFont("helvetica","bold").setFontSize(10).setTextColor(...navy);
        doc.text(j.title||"",m,y); y+=4.5;
        doc.setFont("helvetica","italic").setFontSize(9).setTextColor(...slate);
        doc.text(`${j.company||""}  |  ${j.dates||""}`,m,y); y+=5;
        doc.setFont("helvetica","normal").setFontSize(9).setTextColor(...slate);
        (j.bullets||[]).forEach(b=>{
          const l=doc.splitTextToSize(`• ${b}`,cW-6);
          if(y+l.length*4.5>262){doc.addPage();y=20;}
          doc.text(l,m+3,y); y+=l.length*4.5+1.5;
        });
        y+=4;
      });
    }
    // Education
    if(r.education?.length){
      sec("Education");
      r.education.forEach(e=>{
        doc.setFont("helvetica","bold").setFontSize(9.5).setTextColor(...navy);
        doc.text(e.degree||"",m,y); y+=4;
        doc.setFont("helvetica","normal").setFontSize(9).setTextColor(...slate);
        doc.text(e.school||"",m,y); y+=6;
      });
    }
    doc.save(r.filename||"Annabel_Otutu_Resume.pdf");
    addLog(`Downloaded: ${r.filename}`, "success");
  };

  const srcColor = { "LinkedIn":"#0A66C2","Indeed":"#2164F3","Builtin":"#6C47FF","Company Site":"#059669","Google Jobs":"#4285F4","Pasted":"#9333EA" };

  // ── KEY GATE ──────────────────────────────────────────────────────────────
  if (screen === "key") return (
    <div style={{minHeight:"100vh",background:"#0D1117",display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"'DM Mono','Courier New',monospace",padding:20}}>
      <style>{STYLES}</style>
      <div style={{width:"100%",maxWidth:480}}>
        <div style={{background:"#161B22",border:"1px solid #21262D",borderRadius:12,padding:40,boxShadow:"0 32px 80px #000000CC"}}>
          <div style={{marginBottom:32}}>
            <div style={{fontFamily:"'Syne',sans-serif",fontSize:24,fontWeight:800,color:"#E6EDF3",letterSpacing:"-0.02em",marginBottom:4}}>CV CHAMELEON</div>
            <div style={{fontSize:10,color:"#3D6B9A",letterSpacing:".12em"}}>ANNABEL OTUTU  ·  LIVE JOB SEARCH</div>
          </div>
          <div style={{fontSize:11,color:"#4A5A6A",lineHeight:1.9,marginBottom:28}}>
            Connect your <span style={{color:"#7EB5F7"}}>SerpAPI key</span> to pull real listings from LinkedIn, Indeed, and Google Jobs. Key lives in memory only — gone when you close this tab.
          </div>
          <div style={{marginBottom:20}}>
            <div style={{fontSize:10,color:"#4ADE80",letterSpacing:".12em",marginBottom:10}}>SERPAPI KEY</div>
            <div style={{position:"relative"}}>
              <input ref={inputRef} className="key-input" type={showKey?"text":"password"} placeholder="Paste your key here…" value={serpKeyInput} onChange={e=>setSerpKeyInput(e.target.value)} onKeyDown={e=>e.key==="Enter"&&lockKey()} autoComplete="off" />
              <button onClick={()=>setShowKey(p=>!p)} style={{position:"absolute",right:14,top:"50%",transform:"translateY(-50%)",background:"none",border:"none",color:"#3D4A5A",cursor:"pointer",fontSize:16,lineHeight:1,padding:0}}>{showKey?"●":"○"}</button>
            </div>
          </div>
          <button className="bp" onClick={lockKey} disabled={!serpKeyInput.trim()} style={{width:"100%",padding:"13px 0",fontSize:12,marginBottom:24}}>UNLOCK  →</button>
          <div style={{borderTop:"1px solid #1A2030",paddingTop:20,fontSize:10,color:"#1E2A38",lineHeight:1.8}}>
            No key yet? → <a href="https://serpapi.com/users/sign_up" target="_blank" rel="noopener noreferrer" style={{color:"#2D4A6A",textDecoration:"none"}}>serpapi.com/users/sign_up</a> — 100 free searches/month
          </div>
        </div>
      </div>
    </div>
  );

  // ── MAIN APP ──────────────────────────────────────────────────────────────
  return (
    <div style={{minHeight:"100vh",background:"#0D1117",color:"#E6EDF3",fontFamily:"'DM Mono','Courier New',monospace"}}>
      <style>{STYLES}</style>

      <div style={{borderBottom:"1px solid #21262D",padding:"16px 28px",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
        <div>
          <div style={{fontFamily:"'Syne',sans-serif",fontSize:20,fontWeight:800,color:"#E6EDF3",letterSpacing:"-0.02em"}}>CV CHAMELEON <span style={{color:"#3D6B9A",fontSize:13,fontWeight:600}}>/ ANNABEL OTUTU</span></div>
          <div style={{fontSize:10,color:"#7D8590",marginTop:2,letterSpacing:".05em"}}>FIND · TAILOR · DOWNLOAD  ·  <span style={{color:"#4ADE80"}}>● SERPAPI LIVE</span></div>
        </div>
        <div style={{display:"flex",gap:10,alignItems:"center"}}>
          <span style={{fontSize:10,color:jsPDFReady?"#4ADE80":"#F59E0B",letterSpacing:".08em"}}>{jsPDFReady?"● PDF READY":"⟳ PDF LOADING"}</span>
          <button className="bgh" onClick={()=>{setScreen("key");setSerpKey("");setSerpKeyInput("");setJobs([]);setTailoring({});setPhase("idle");}}>CHANGE KEY</button>
        </div>
      </div>

      <div style={{padding:"20px 28px",maxWidth:1100,margin:"0 auto"}}>

        {/* Paste JD Panel */}
        {showPastePanel && (
          <div className="si" style={{background:"#161B22",border:"1px solid #6A3DAA",borderRadius:8,padding:20,marginBottom:20}}>
            <div style={{fontFamily:"'Syne',sans-serif",fontSize:12,fontWeight:700,color:"#C084FC",letterSpacing:".1em",marginBottom:14}}>PASTE JOB DESCRIPTION</div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:10,marginBottom:12}}>
              {[["Job Title",pasteTitle,setPasteTitle,"e.g. Technical Writer"],["Company",pasteCompany,setPasteCompany,"e.g. Goldbelt Glacier"],["Location",pasteLocation,setPasteLocation,"e.g. Remote / Dallas TX"]].map(([label,val,setter,ph])=>(
                <div key={label}>
                  <div style={{fontSize:9,color:"#7D8590",letterSpacing:".1em",marginBottom:5}}>{label.toUpperCase()}</div>
                  <input className="fi" value={val} onChange={e=>setter(e.target.value)} placeholder={ph} />
                </div>
              ))}
            </div>
            <div style={{marginBottom:12}}>
              <div style={{fontSize:9,color:"#7D8590",letterSpacing:".1em",marginBottom:5}}>JOB DESCRIPTION — paste the full text for best results</div>
              <textarea className="jd-input" rows={12} placeholder="Paste the full job description here. The more complete it is, the more precisely the resume will be tailored — responsibilities, qualifications, preferred skills, tools mentioned…" value={pasteJD} onChange={e=>setPasteJD(e.target.value)} />
            </div>
            <div style={{display:"flex",gap:10,alignItems:"center"}}>
              <button className="bp2" onClick={tailorFromPaste} disabled={pasting||!pasteJD.trim()||!pasteTitle.trim()||!pasteCompany.trim()}>
                {pasting?<span className="pulse">TAILORING…</span>:"⚡ TAILOR FROM JD"}
              </button>
              <button className="bgh" onClick={()=>{setShowPastePanel(false);setPasteTitle("");setPasteCompany("");setPasteLocation("");setPasteJD("");}}>CANCEL</button>
              {(!pasteTitle.trim()||!pasteCompany.trim()||!pasteJD.trim())&&<span style={{fontSize:10,color:"#3D4A5A"}}>Title, company, and JD required</span>}
            </div>
          </div>
        )}

        {/* Controls */}
        <div style={{display:"flex",gap:12,alignItems:"center",marginBottom:20,flexWrap:"wrap"}}>
          <div style={{position:"relative"}}>
            <button className="bgh" onClick={()=>setShowTitleDropdown(p=>!p)} style={{display:"flex",alignItems:"center",gap:8,padding:"10px 16px"}}>
              <span>SEARCH FILTERS</span>
              <span style={{background:"#1B2A4A",color:"#7EB5F7",borderRadius:10,padding:"1px 7px",fontSize:10}}>{titles.length}/10</span>
              <span style={{fontSize:9,opacity:.6}}>{showTitleDropdown?"▲":"▼"}</span>
            </button>
            {showTitleDropdown && (
              <div style={{position:"absolute",top:"calc(100% + 6px)",left:0,zIndex:100,background:"#161B22",border:"1px solid #3D5A80",borderRadius:8,width:420,maxHeight:520,overflowY:"auto",boxShadow:"0 8px 40px #00000080"}}>
                <div style={{padding:"12px 14px 8px",borderBottom:"1px solid #21262D",position:"sticky",top:0,background:"#161B22",zIndex:2}}>
                  <div style={{fontSize:10,color:"#7D8590",letterSpacing:".1em",marginBottom:8}}>LOCATIONS</div>
                  <div style={{display:"flex",flexWrap:"wrap",gap:6}}>
                    {LOCATION_OPTIONS.map(({label,emoji})=>{const active=locations.includes(label);return <button key={label} onClick={()=>setLocations(p=>active?p.filter(l=>l!==label):[...p,label])} style={{background:active?"#1B2A4A":"transparent",border:`1px solid ${active?"#3D6B9A":"#2D3440"}`,borderRadius:20,padding:"4px 10px",fontSize:11,color:active?"#7EB5F7":"#7D8590",cursor:"pointer",fontFamily:"inherit",transition:"all .15s"}}>{emoji} {label}</button>;})}
                  </div>
                </div>
                <div style={{padding:"6px 14px",borderBottom:"1px solid #21262D",display:"flex",justifyContent:"space-between",alignItems:"center",background:"#161B22",position:"sticky",top:72,zIndex:2}}>
                  <span style={{fontSize:10,color:titles.length>=10?"#F59E0B":"#3D4A5A",letterSpacing:".06em"}}>{titles.length>=10?"⚠ MAX 10 SELECTED":"JOB TITLES  ·  SELECT UP TO 10"}</span>
                  <div style={{display:"flex",gap:10}}>
                    <button onClick={()=>setTitles(ALL_TITLES.slice(0,10))} style={{fontSize:10,color:"#7EB5F7",background:"none",border:"none",cursor:"pointer",fontFamily:"inherit"}}>RESET</button>
                    <button onClick={()=>setTitles([])} style={{fontSize:10,color:"#7D8590",background:"none",border:"none",cursor:"pointer",fontFamily:"inherit"}}>CLEAR</button>
                  </div>
                </div>
                {TITLE_GROUPS.map(group=>(
                  <div key={group.label}>
                    <div style={{padding:"10px 14px 4px",fontSize:9,color:group.color,letterSpacing:".1em",fontWeight:600,opacity:.8}}>{group.label.toUpperCase()}</div>
                    {group.titles.map(t=>{const checked=titles.includes(t);const atMax=titles.length>=10&&!checked;return(<div key={t} onClick={()=>{if(atMax)return;setTitles(p=>checked?p.filter(x=>x!==t):[...p,t]);}} style={{display:"flex",alignItems:"center",gap:10,padding:"6px 14px",cursor:atMax?"not-allowed":"pointer",opacity:atMax?.35:1}} onMouseEnter={e=>{if(!atMax)e.currentTarget.style.background="#1B2A4A33"}} onMouseLeave={e=>e.currentTarget.style.background="transparent"}><div style={{width:13,height:13,borderRadius:3,border:`1.5px solid ${checked?group.color:"#3D4A5A"}`,background:checked?group.color:"transparent",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,transition:"all .15s"}}>{checked&&<span style={{color:"#0D1117",fontSize:9,fontWeight:700,lineHeight:1}}>✓</span>}</div><span style={{fontSize:11,color:checked?"#E6EDF3":"#7D8590"}}>{t}</span></div>);})}
                  </div>
                ))}
                <div style={{height:10}}/>
              </div>
            )}
          </div>

          <button className="bp" onClick={()=>{setShowTitleDropdown(false);findJobs();}} disabled={phase==="searching"||!titles.length} style={{padding:"12px 32px",fontSize:13}}>
            {phase==="searching"?<span className="pulse">SEARCHING…</span>:"▶  FIND JOBS"}
          </button>

          <button className="bp2" onClick={()=>{setShowTitleDropdown(false);setShowPastePanel(p=>!p);}} style={{padding:"12px 22px",fontSize:12}}>
            {showPastePanel?"✕ CLOSE":"⊕ PASTE JD"}
          </button>

          {jobs.length>0&&<button className="bg" onClick={()=>jobs.forEach(j=>{if(!tailoring[j.id])tailorResume(j);})} disabled={jobs.every(j=>tailoring[j.id]&&tailoring[j.id]!=="error")}>TAILOR ALL</button>}
          {jobs.length>0&&<span style={{fontSize:11,color:"#3D4A5A"}}>{jobs.length} JOBS</span>}
        </div>

        <div style={{display:"grid",gridTemplateColumns:"1fr 340px",gap:18}}>
          <div>
            {phase==="idle"&&!jobs.length&&(
              <div style={{textAlign:"center",padding:"60px 0",color:"#2D3A4A"}}>
                <div style={{fontFamily:"'Syne',sans-serif",fontSize:36,fontWeight:800,letterSpacing:"-0.03em",marginBottom:8}}>READY</div>
                <div style={{fontSize:11,letterSpacing:".08em",lineHeight:1.9}}>Search live job boards  ·  or paste any JD directly<br/>Resume surgically tailored to each role via Claude<br/>Download formatted PDF per application</div>
              </div>
            )}
            {phase==="searching"&&(
              <div style={{textAlign:"center",padding:"60px 0"}}>
                <div className="pulse" style={{fontFamily:"'Syne',sans-serif",fontSize:30,fontWeight:800,color:"#3D6B9A",marginBottom:8}}>SCANNING</div>
                <div style={{fontSize:10,color:"#3D4A5A",letterSpacing:".12em"}}>QUERYING LIVE JOB BOARDS…</div>
              </div>
            )}
            <div style={{display:"flex",flexDirection:"column",gap:10}}>
              {jobs.map((job,i)=>{
                const state=tailoring[job.id]; const done=state&&state!=="loading"&&state!=="error";
                return (
                  <div key={job.id} className="jc si" style={{animationDelay:`${i*.04}s`,borderColor:job.source==="Pasted"?"#4A2D6A":""}}>
                    <div style={{display:"flex",justifyContent:"space-between",gap:12,alignItems:"flex-start"}}>
                      <div style={{flex:1}}>
                        <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:6,flexWrap:"wrap"}}>
                          <span className="tag" style={{background:srcColor[job.source]?`${srcColor[job.source]}22`:"#21262D",color:srcColor[job.source]||"#7D8590",border:`1px solid ${srcColor[job.source]?`${srcColor[job.source]}44`:"#2D3440"}`}}>{job.source||"SOURCE"}</span>
                          <span style={{fontSize:10,color:"#7D8590"}}>{job.location}</span>
                          {job.salary&&<span style={{fontSize:10,color:"#4ADE80"}}>💰 {job.salary}</span>}
                          {job.posted&&<span style={{fontSize:10,color:"#3D4A5A"}}>📅 {job.posted}</span>}
                        </div>
                        <div style={{fontFamily:"'Syne',sans-serif",fontSize:14,fontWeight:700,color:"#E6EDF3",marginBottom:2}}>{job.title}</div>
                        <div style={{fontSize:12,color:"#7EB5F7",marginBottom:8}}>{job.company}</div>
                        <div style={{fontSize:11,color:"#7D8590",lineHeight:1.6}}>{job.description?.slice(0,300)}{job.description?.length>300?"…":""}</div>
                      </div>
                      <div style={{display:"flex",flexDirection:"column",gap:8,minWidth:120,alignItems:"flex-end"}}>
                        {!state&&<button className="bg" onClick={()=>tailorResume(job)}>TAILOR</button>}
                        {state==="loading"&&<span className="pulse" style={{fontSize:11,color:"#F59E0B"}}>TAILORING…</span>}
                        {state==="error"&&<button className="bgh" onClick={()=>tailorResume(job)} style={{color:"#F87171",borderColor:"#4A2020"}}>RETRY</button>}
                        {done&&<button className="bg" onClick={()=>generatePDF(state)} disabled={!jsPDFReady}>↓ PDF</button>}
                        {job.source!=="Pasted"&&(job.applyOptions?.length>0?job.applyOptions:[{label:"APPLY",url:job.url}]).map((opt,idx)=>(
                          <a key={idx} href={opt.url} target="_blank" rel="noopener noreferrer" style={{fontSize:10,color:idx===0?"#3D6B9A":"#2D4A6A",textDecoration:"none",textTransform:"uppercase",letterSpacing:".05em"}}>{opt.label} →</a>
                        ))}
                        {job.source!=="Pasted"&&<a href={job.companyUrl} target="_blank" rel="noopener noreferrer" style={{fontSize:10,color:"#2D4A5A",textDecoration:"none",textTransform:"uppercase",letterSpacing:".05em"}}>COMPANY →</a>}
                      </div>
                    </div>
                    {done&&(
                      <div style={{marginTop:10,paddingTop:10,borderTop:"1px solid #21262D"}}>
                        <div style={{fontSize:10,color:"#4ADE80",letterSpacing:".07em",marginBottom:4}}>✓ {state.filename}</div>
                        <div style={{fontSize:11,color:"#7D8590",fontStyle:"italic",lineHeight:1.5}}>"{state.summary?.slice(0,160)}…"</div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          <div>
            <div style={{background:"#161B22",border:"1px solid #21262D",borderRadius:8,overflow:"hidden",position:"sticky",top:16}}>
              <div style={{padding:"10px 14px",borderBottom:"1px solid #21262D",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                <span style={{fontFamily:"'Syne',sans-serif",fontSize:10,fontWeight:700,color:"#7D8590",letterSpacing:".1em"}}>ACTIVITY LOG</span>
                <button onClick={()=>setLog([])} style={{fontSize:10,color:"#2D3440",background:"none",border:"none",cursor:"pointer"}}>CLEAR</button>
              </div>
              <div ref={logRef} style={{height:340,overflowY:"auto",padding:12}}>
                {!log.length&&<div style={{fontSize:11,color:"#1E2A38",textAlign:"center",marginTop:30}}>awaiting activity…</div>}
                {log.map((e,i)=>(
                  <div key={i} style={{fontSize:11,lineHeight:1.7,paddingBottom:3,color:e.type==="success"?"#4ADE80":e.type==="error"?"#F87171":e.type==="loading"?"#F59E0B":"#7D8590"}}>
                    <span style={{color:"#1E2A38",marginRight:8}}>{e.time}</span>{e.icon} {e.msg}
                  </div>
                ))}
              </div>
            </div>
            {Object.values(tailoring).filter(v=>v!=="loading"&&v!=="error").length>0&&(
              <div style={{marginTop:14,background:"#161B22",border:"1px solid #2D6B4A",borderRadius:8,padding:14}}>
                <div style={{fontFamily:"'Syne',sans-serif",fontSize:10,fontWeight:700,color:"#4ADE80",letterSpacing:".1em",marginBottom:10}}>GENERATED ({Object.values(tailoring).filter(v=>v!=="loading"&&v!=="error").length})</div>
                {Object.values(tailoring).filter(v=>v!=="loading"&&v!=="error").map((r,i)=>(
                  <div key={i} style={{display:"flex",justifyContent:"space-between",alignItems:"center",paddingBottom:7,marginBottom:7,borderBottom:"1px solid #1A3A2A",fontSize:11}}>
                    <span style={{color:"#7D8590",maxWidth:170,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{r.filename?.replace("Annabel_Otutu_","").replace(".pdf","")}</span>
                    <button className="bg" style={{padding:"3px 10px",fontSize:10}} onClick={()=>generatePDF(r)} disabled={!jsPDFReady}>↓</button>
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
