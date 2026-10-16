import { useState, useEffect, useRef } from "react";
import { jsPDF } from "jspdf";

// ═══════════════════════════════════════════════════════════════════════════
// BRIDGE LIST — 33 roles filtered for Nigeria-remote, no certs required
// ═══════════════════════════════════════════════════════════════════════════
const BRIDGE_ROLES = [
  {t:"AI Training Expert — Finance, Code & Compliance",c:"AI contract",fit:9,odds:9,dem:9,spd:10,pay:"$30–100/hr",tier:1,w:"The money bridge. Nigeria-eligible, no interview panel, fastest-paying thing on this list.",where:"Mercor · micro1 · Turing via Deel · Alignerr · Terac"},
  {t:"AI Code Evaluation / RLHF — Coding",c:"AI contract",fit:8,odds:9,dem:10,spd:10,pay:"$25–80/hr",tier:1,w:"Highest-volume category on every AI platform right now.",where:"Mercor · micro1 · Turing · Terac · AfterQuery"},
  {t:"Security Questionnaire & Trust Analyst",c:"Compliance",fit:10,odds:9,dem:9,spd:8,pay:"$55k–95k",tier:1,w:"SaaS vendors are buried in customer security questionnaires — SOC 2, CAIQ, VSA.",where:"OpsArmy · Remotive · SafeBase · Conveyor"},
  {t:"Technical Writer — Security & Compliance Docs",c:"Writing",fit:10,odds:9,dem:8,spd:8,pay:"$60k–105k",tier:1,w:"Policies, procedures, control narratives. The exact work you did for EPA and Parkland.",where:"Security vendors · fintech · Write the Docs · Remotive"},
  {t:"AI Data Annotation — Specialist Tier",c:"AI contract",fit:7,odds:9,dem:10,spd:9,pay:"$15–60/hr",tier:1,w:"Annotation demand rose 154% this year.",where:"Alignerr · Terac · Mindrift · Appen · CrowdGen"},
  {t:"Compliance Analyst — SaaS / Commercial",c:"Compliance",fit:10,odds:8,dem:9,spd:7,pay:"$60k–105k",tier:1,w:"Control mapping, evidence collection, policy drafting, audit prep.",where:"Vanta · Drata · Secureframe · compliance consultancies"},
  {t:"Proposal / RFP Response Specialist — Commercial",c:"Proposals",fit:10,odds:8,dem:8,spd:8,pay:"$55k–95k",tier:1,w:"You hold this title already. Target commercial and SaaS bid teams.",where:"SaaS bid teams · consultancies · staffing agencies"},
  {t:"Compliance Documentation Specialist",c:"Compliance",fit:10,odds:8,dem:7,spd:8,pay:"$55k–95k",tier:2,w:"Narrower than general technical writing and far less contested.",where:"Health-tech · fintech · compliance consultancies"},
  {t:"Documentation Specialist",c:"Writing",fit:9,odds:8,dem:7,spd:9,pay:"$50k–85k",tier:2,w:"The generalist version of your strongest skill. Easiest to land.",where:"Remotive · WeWorkRemotely · staffing agencies"},
  {t:"AI Integration Specialist (freelance)",c:"AI contract",fit:8,odds:8,dem:9,spd:8,pay:"$40–120/hr",tier:2,w:"Up 178% year on year. Wiring language models into existing systems.",where:"Upwork · Contra · direct to small businesses"},
  {t:"Policy & Procedure Writer",c:"Writing",fit:9,odds:8,dem:7,spd:8,pay:"$55k–95k",tier:2,w:"Information security policies, SOPs, handbooks mapped to frameworks.",where:"Compliance consultancies · MSSPs · SaaS companies"},
  {t:"Knowledge Management Specialist",c:"Writing",fit:9,odds:8,dem:7,spd:8,pay:"$55k–95k",tier:2,w:"Owning the internal documentation estate — taxonomy, Confluence architecture.",where:"Mid-size SaaS · Atlassian ecosystem consultancies"},
  {t:"Business Process / Documentation Analyst",c:"Ops",fit:9,odds:8,dem:7,spd:8,pay:"$55k–95k",tier:2,w:"Mapping how work actually happens, writing it down, then improving it.",where:"Mid-market companies · consultancies · shared-services teams"},
  {t:"Technical Writer — Developer Documentation",c:"Writing",fit:9,odds:8,dem:8,spd:7,pay:"$60k–110k",tier:2,w:"API references, SDK guides, quickstarts.",where:"Devtool companies · fintech · Write the Docs · Remotive"},
  {t:"Automation Consultant (Make / n8n / Python)",c:"Ops",fit:8,odds:8,dem:8,spd:8,pay:"$40–100/hr",tier:2,w:"Short projects, fast starts, no residency question anywhere.",where:"Make Partner · n8n experts · Upwork"},
  {t:"AI Chatbot / Agent Developer (freelance)",c:"AI contract",fit:8,odds:8,dem:8,spd:8,pay:"$35–100/hr",tier:2,w:"Up 71% on Upwork. High volume of small, well-scoped briefs.",where:"Upwork · Fiverr Pro · n8n and Make communities"},
  {t:"Technical Support Engineer (Tier 2)",c:"Client-facing",fit:7,odds:8,dem:8,spd:9,pay:"$35k–70k",tier:2,w:"Fast loops, closes in two to four weeks. Floor option.",where:"SaaS companies · Support Driven board"},
  {t:"Third-Party / Vendor Risk Analyst",c:"Compliance",fit:9,odds:7,dem:8,spd:7,pay:"$60k–100k",tier:2,w:"Assessing vendors rather than answering for your own company.",where:"Enterprise security teams · OneTrust · Prevalent · MSSPs"},
  {t:"Security Awareness Content Developer",c:"Compliance",fit:8,odds:8,dem:7,spd:8,pay:"$55k–95k",tier:2,w:"Phishing simulations, training modules, policy explainers.",where:"KnowBe4 · Hoxhunt · Living Security"},
  {t:"Enablement / Training Content Developer",c:"Writing",fit:8,odds:8,dem:7,spd:8,pay:"$55k–95k",tier:2,w:"Internal training material, onboarding paths, certification content.",where:"SaaS enablement teams · corporate L&D"},
  {t:"Technical Content Marketer — Security / Fintech",c:"Writing",fit:8,odds:7,dem:8,spd:8,pay:"$55k–100k",tier:2,w:"Marketing roles close in about twenty days.",where:"Security vendors · fintech · Animalz · Draft.dev · Contra"},
  {t:"Prompt Engineer / AI Workflow Designer",c:"AI contract",fit:8,odds:7,dem:8,spd:8,pay:"$60k–120k",tier:2,w:"You build agentic workflows in Make.com and the Claude API.",where:"AI-native startups · Wellfound · Upwork enterprise tier"},
  {t:"Contracts Administrator / Analyst",c:"Proposals",fit:9,odds:7,dem:7,spd:7,pay:"$55k–90k",tier:2,w:"Contract lifecycle, compliance review, renewals.",where:"SaaS legal-ops teams · procurement consultancies"},
  {t:"API Documentation Specialist",c:"Writing",fit:9,odds:7,dem:7,spd:7,pay:"$60k–115k",tier:2,w:"Narrower and better paid than general technical writing.",where:"Fintech and devtool companies · Toptal · Contra"},
  {t:"Customer Success Manager — Compliance SaaS",c:"Client-facing",fit:7,odds:8,dem:8,spd:7,pay:"$55k–100k",tier:2,w:"Vanta, Drata and Secureframe need CSMs who understand controls.",where:"Vanta · Drata · Secureframe · Thoropass"},
  {t:"Implementation / Onboarding Specialist — SaaS",c:"Client-facing",fit:8,odds:7,dem:8,spd:7,pay:"$55k–100k",tier:2,w:"Configuring a product for a new customer and documenting it.",where:"Fintech · compliance SaaS · Vanta · Drata"},
  {t:"Bid Writer — Technology / Consulting (UK & EU)",c:"Proposals",fit:9,odds:7,dem:6,spd:7,pay:"$50k–90k",tier:3,w:"UK and EU firms hire remotely.",where:"UK/EU consultancies · Reed · Otta · Welcome to the Jungle"},
  {t:"Content Strategist — B2B Technical",c:"Writing",fit:8,odds:7,dem:7,spd:7,pay:"$60k–105k",tier:3,w:"Owning what gets written and why across a technical product.",where:"B2B SaaS · agencies · Remotive · Otta"},
  {t:"Technical Writer — AI / ML Products",c:"Writing",fit:8,odds:7,dem:7,spd:7,pay:"$70k–130k",tier:3,w:"Model cards, evaluation documentation, SDK guides.",where:"AI infrastructure startups · Hugging Face · Wellfound"},
  {t:"QA Analyst / Test Documentation",c:"Ops",fit:7,odds:7,dem:7,spd:7,pay:"$40k–80k",tier:3,w:"Test plans, cases, defect documentation.",where:"SaaS QA teams · Turing · contract-to-hire"},
  {t:"RevOps / Business Systems Analyst",c:"Ops",fit:7,odds:7,dem:7,spd:7,pay:"$55k–100k",tier:3,w:"Process mapping, systems integration, reporting.",where:"SaaS companies · RevOps Co-op · Wellfound"},
  {t:"Technical Editor — Engineering Content",c:"Writing",fit:7,odds:7,dem:6,spd:8,pay:"$30–70/hr",tier:3,w:"Editing other engineers' writing for clarity and correctness.",where:"O'Reilly · Manning · engineering blogs · Upwork"},
  {t:"Technical Trainer — Compliance Products",c:"Writing",fit:7,odds:7,dem:6,spd:7,pay:"$50k–90k",tier:3,w:"Teaching customers to use a compliance platform.",where:"Compliance SaaS enablement teams · training vendors"}
];

const TIER_LABELS = {
  1: { name: "Apply this week", desc: "your CV is close to the job advert", color: "#4ADE80" },
  2: { name: "Strong second wave", desc: "good fit, slightly longer odds", color: "#F59E0B" },
  3: { name: "Run in parallel", desc: "real options, weaker on one axis", color: "#7D8590" }
};

const CATEGORIES = ["All", "Compliance", "Writing", "AI contract", "Proposals", "Ops", "Client-facing"];

// Job titles for Live Jobs search (from v1)
const TITLE_GROUPS = [
  { label: "AI & Forward Deployed", color: "#00FFF9", titles: ["AI Technical Writer","Prompt Engineer","AI Documentation Specialist","AI Content Strategist","AI Implementation Specialist","AI Solutions Consultant","AI Integration Engineer"]},
  { label: "High Probability", color: "#4ADE80", titles: ["Technical Writer","Documentation Specialist","Content Developer","Content Strategist","Knowledge Management Specialist","Technical Communications Specialist"]},
  { label: "Compliance & GRC", color: "#C084FC", titles: ["Compliance Analyst","Security Questionnaire Analyst","GRC Analyst","Trust Analyst","Vendor Risk Analyst","Policy Writer"]},
  { label: "Proposals & Contracts", color: "#F59E0B", titles: ["Proposal Writer","RFP Specialist","Bid Writer","Contracts Analyst","Proposal Manager"]},
  { label: "Developer Docs", color: "#7EB5F7", titles: ["API Documentation Writer","Developer Documentation Specialist","SDK Documentation Writer","Technical Documentation Engineer"]}
];

const ALL_TITLES = [...new Set(TITLE_GROUPS.flatMap(g => g.titles))];
const LOCATION_OPTIONS = [
  { label: "Remote", emoji: "🌍" },
  { label: "USA", emoji: "🇺🇸" },
  { label: "UK", emoji: "🇬🇧" },
  { label: "EU", emoji: "🇪🇺" },
  { label: "Contract", emoji: "📝" }
];

const WORK_SAMPLES = [
  { title: "NIST RMF AC-2", desc: "Account Management control narrative", framework: "NIST SP 800-53" },
  { title: "SOC 2 CC6.1", desc: "Logical and Physical Access Controls", framework: "SOC 2 Type II" },
  { title: "ISO 27001 / CMMC", desc: "Information security policy", framework: "ISO 27001:2022" }
];

const TAILOR_SYSTEM = `You are a strategic resume positioning expert helping Annabel Otutu land a remote job. Position her for COMMERCIAL compliance, SaaS, and international opportunities.

CORE POSITIONING: Technical compliance analyst — NIST SP 800-37, SOC 2, ISO 27001 — who interviews engineers, produces auditor-ready documentation, and automates the pipeline in Python.

KEY DIFFERENTIATORS:
1. ACTUAL WORK SAMPLES (NIST RMF, SOC 2 CC6.1, ISO 27001) when everyone else has coursework
2. Automated compliance workflows in Python at a hospital system
3. Microsoft, EPA, Indeed on her CV — enterprise credibility
4. Ships AI products (CV Chameleon, ROOT VI, BlueGum Studio)
5. Cybersecurity degree from Champlain College

Return ONLY valid JSON:
{
  "name": "Annabel Otutu",
  "headerTitle": "[Strategic title | Specialization]",
  "contact": "linkedin.com/in/annabel-otutu  ·  anabelotutu5@gmail.com",
  "summary": "[3-4 sentences]",
  "competencies": [{ "category": "[Category]", "items": ["Item1", "Item2", "Item3"] }],
  "experience": [{"title": "[Reframed]","company": "[Company]","dates": "[Dates]","bullets": ["**Bold opening** rest."]}],
  "education": [{ "degree": "Bachelor of Science — Computer Networking and Cybersecurity", "school": "Champlain College", "focus": "" }],
  "workSamples": ["NIST RMF AC-2", "SOC 2 CC6.1", "ISO 27001 Policy"],
  "filename": "Annabel_Otutu_[Company]_[Role].pdf"
}

RULES:
1. NEVER mention federal/GovCon/Public Trust
2. ALWAYS include work samples section
3. Do NOT include location/timezone details
4. Position Python automation as core skill
5. Employment dates NEVER change`;

const TAILOR_USER = (job, master) =>
  `MASTER RESUME:\n${JSON.stringify(master)}\n\nTARGET: ${job.title} at ${job.company}\nLOCATION: ${job.location}\n\nJOB DESCRIPTION:\n${job.description}\n\nReturn ONLY JSON.`;

// ═══════════════════════════════════════════════════════════════════════════
// API HELPERS
// ═══════════════════════════════════════════════════════════════════════════
const callClaude = async (system, userMsg, maxTokens = 4096) => {
  const res = await fetch("/api/claude", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ model: "claude-sonnet-4-6", max_tokens: maxTokens, system, messages: [{ role: "user", content: userMsg }] })
  });
  if (!res.ok) throw new Error(`Claude API error ${res.status}`);
  const data = await res.json();
  return (data.content || []).find(b => b.type === "text")?.text || "";
};

const searchJobs = async (titles, locations) => {
  const res = await fetch("/api/jobs", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ titles, locations })
  });
  if (!res.ok) throw new Error(`Search API error ${res.status}`);
  const data = await res.json();
  return data.jobs || [];
};

// Storage API with localStorage fallback for offline PWA
const saveToStorage = async (type, data) => {
  // Try Turso first
  try {
    const res = await fetch("/api/storage", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type, data })
    });
    if (res.ok) return true;
  } catch {}
  // Fallback to localStorage
  try {
    const key = `cv_${type}`;
    const existing = JSON.parse(localStorage.getItem(key) || "[]");
    existing.unshift({ ...data, id: Date.now(), created_at: new Date().toISOString() });
    localStorage.setItem(key, JSON.stringify(existing.slice(0, 100)));
    return true;
  } catch { return false; }
};

const loadFromStorage = async (type) => {
  // Try Turso first
  try {
    const res = await fetch(`/api/storage?type=${type}`);
    if (res.ok) {
      const data = await res.json();
      return data.resumes || data.activity || data.preferences || [];
    }
  } catch {}
  // Fallback to localStorage
  try {
    return JSON.parse(localStorage.getItem(`cv_${type}`) || "[]");
  } catch { return []; }
};

const deleteFromStorage = async (id) => {
  // Try Turso first
  try {
    const res = await fetch(`/api/storage?id=${id}`, { method: "DELETE" });
    if (res.ok) return;
  } catch {}
  // Fallback: remove from localStorage (resumes)
  try {
    const resumes = JSON.parse(localStorage.getItem("cv_resumes") || "[]");
    const filtered = resumes.filter(r => r.id !== id);
    localStorage.setItem("cv_resumes", JSON.stringify(filtered));
  } catch {}
};

function bridgeScore(r) {
  const W = { fit: 1.0, odds: 1.0, dem: 0.8, spd: 0.8 };
  return Math.round((r.fit * W.fit + r.odds * W.odds + r.dem * W.dem + r.spd * W.spd) / (W.fit + W.odds + W.dem + W.spd) * 10);
}

function jobFitScore(jobTitle) {
  const title = jobTitle.toLowerCase();
  if (title.includes("compliance") || title.includes("grc") || title.includes("security questionnaire")) return 95;
  if (title.includes("technical writer") && (title.includes("security") || title.includes("compliance"))) return 92;
  if (title.includes("proposal") || title.includes("rfp") || title.includes("bid")) return 88;
  if (title.includes("documentation") || title.includes("technical writer")) return 85;
  if (title.includes("ai") || title.includes("prompt")) return 82;
  if (title.includes("knowledge management")) return 80;
  if (title.includes("content")) return 75;
  return 60;
}

const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Mono:wght@300;400;500&family=Syne:wght@600;700;800&display=swap');
  *{box-sizing:border-box;margin:0;padding:0}
  ::-webkit-scrollbar{width:4px}::-webkit-scrollbar-track{background:#161B22}::-webkit-scrollbar-thumb{background:#2D3A4A;border-radius:2px}
  .jc{background:#161B22;border:1px solid #21262D;border-radius:8px;padding:16px;transition:border-color .2s,transform .15s}
  .jc:hover{border-color:#3D5A80;transform:translateY(-1px)}
  .bp{background:linear-gradient(135deg,#1B2A4A,#2D4A7A);color:#7EB5F7;border:1px solid #3D5A80;border-radius:6px;padding:10px 20px;font-family:inherit;font-size:11px;font-weight:500;letter-spacing:.08em;cursor:pointer;transition:all .2s;text-transform:uppercase}
  .bp:hover:not(:disabled){background:linear-gradient(135deg,#2D4A7A,#3D5A9A);color:#A8CFFF}.bp:disabled{opacity:.4;cursor:not-allowed}
  .bg{background:linear-gradient(135deg,#0D2B1F,#1A4A35);color:#4ADE80;border:1px solid #2D6B4A;border-radius:6px;padding:8px 14px;font-family:inherit;font-size:10px;font-weight:500;letter-spacing:.06em;cursor:pointer;transition:all .2s;text-transform:uppercase}
  .bg:hover:not(:disabled){background:linear-gradient(135deg,#1A4A35,#2A6B4F);color:#86EFAC}.bg:disabled{opacity:.4;cursor:not-allowed}
  .bgh{background:transparent;color:#7D8590;border:1px solid #2D3440;border-radius:6px;padding:8px 14px;font-family:inherit;font-size:10px;cursor:pointer;transition:all .2s;letter-spacing:.06em;text-transform:uppercase}
  .bgh:hover{color:#E6EDF3;border-color:#5A6470}
  .bp2{background:linear-gradient(135deg,#2D1B4A,#4A2D7A);color:#C084FC;border:1px solid #6A3DAA;border-radius:6px;padding:10px 20px;font-family:inherit;font-size:11px;font-weight:500;letter-spacing:.08em;cursor:pointer;transition:all .2s;text-transform:uppercase}
  .bp2:hover:not(:disabled){background:linear-gradient(135deg,#4A2D7A,#5A3D9A);color:#D8A8FF}.bp2:disabled{opacity:.4;cursor:not-allowed}
  .bmoney{background:linear-gradient(135deg,#4A3D0A,#6A5A1A);color:#FBBF24;border:1px solid #A08A2A;border-radius:6px;padding:10px 20px;font-family:inherit;font-size:11px;font-weight:500;letter-spacing:.08em;cursor:pointer;transition:all .2s;text-transform:uppercase}
  .bmoney:hover:not(:disabled){background:linear-gradient(135deg,#6A5A1A,#8A7A2A);color:#FCD34D}
  .pulse{animation:pulse 1.5s ease-in-out infinite}@keyframes pulse{0%,100%{opacity:1}50%{opacity:.4}}
  .si{animation:si .3s ease-out forwards}@keyframes si{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}
  .tag{display:inline-block;padding:2px 8px;border-radius:4px;font-size:9px;letter-spacing:.05em;font-weight:500}
  .jd-input{width:100%;background:#0D1117;border:1px solid #2D3A4A;border-radius:6px;padding:12px;color:#E6EDF3;font-family:'DM Mono',monospace;font-size:11px;outline:none;resize:vertical;line-height:1.6}
  .jd-input:focus{border-color:#6A3DAA}
  .fi{background:#0D1117;border:1px solid #2D3A4A;border-radius:5px;padding:8px 10px;color:#E6EDF3;font-family:'DM Mono',monospace;font-size:11px;outline:none;width:100%}
  .fi:focus{border-color:#6A3DAA}
  .modal-overlay{position:fixed;inset:0;background:rgba(0,0,0,0.85);z-index:1000;display:flex;align-items:center;justify-content:center;padding:20px}
  .modal-content{background:#161B22;border:1px solid #3D5A80;border-radius:12px;max-width:800px;width:100%;max-height:90vh;overflow:hidden;display:flex;flex-direction:column}
  .modal-header{padding:14px 18px;border-bottom:1px solid #21262D;display:flex;justify-content:space-between;align-items:center}
  .modal-body{flex:1;overflow-y:auto;padding:18px}
  .modal-footer{padding:14px 18px;border-top:1px solid #21262D;display:flex;gap:10px;justify-content:flex-end}
  .tier-header{padding:12px 0 6px;border-bottom:1px solid;margin-bottom:10px;font-family:'Syne',sans-serif;font-size:11px;font-weight:700;letter-spacing:.1em;text-transform:uppercase;display:flex;justify-content:space-between}
  .score-badge{font-family:'DM Mono',monospace;font-size:16px;font-weight:600;width:40px;height:40px;border-radius:6px;display:flex;align-items:center;justify-content:center;flex-shrink:0}
  .bar{height:3px;background:#21262D;border-radius:2px;overflow:hidden;flex:1}
  .bar-fill{height:100%;border-radius:2px}
  .tab-btn{background:transparent;color:#7D8590;border:none;padding:12px 20px;font-family:'Syne',sans-serif;font-size:12px;font-weight:700;letter-spacing:.05em;cursor:pointer;border-bottom:2px solid transparent;transition:all .2s}
  .tab-btn:hover{color:#E6EDF3}
  .tab-btn.active{color:#E6EDF3;border-bottom-color:#4ADE80}
`;

export default function App() {
  const [tab, setTab] = useState("bridge"); // "bridge" | "jobs" | "saved"
  const [jobs, setJobs] = useState([]);
  const [tailoring, setTailoring] = useState({});
  const [log, setLog] = useState([]);
  const [masterResume, setMasterResume] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [showPastePanel, setShowPastePanel] = useState(false);
  const [pasteTitle, setPasteTitle] = useState("");
  const [pasteCompany, setPasteCompany] = useState("");
  const [pasteLocation, setPasteLocation] = useState("");
  const [pasteJD, setPasteJD] = useState("");
  const [pasting, setPasting] = useState(false);
  const [previewResume, setPreviewResume] = useState(null);
  const [savedResumes, setSavedResumes] = useState([]);
  // Live Jobs state
  const [searchTitles, setSearchTitles] = useState(["Compliance Analyst", "Technical Writer", "Proposal Writer"]);
  const [searchLocations, setSearchLocations] = useState(["Remote"]);
  const [searching, setSearching] = useState(false);
  const [liveJobs, setLiveJobs] = useState([]);
  const [showTitlePicker, setShowTitlePicker] = useState(false);
  const logRef = useRef(null);

  // Load master resume
  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch("/masterResume.json");
        if (res.ok) setMasterResume(await res.json());
      } catch {}
    };
    load();
  }, []);

  // Load saved resumes from Turso
  useEffect(() => {
    loadFromStorage("resumes").then(data => {
      if (Array.isArray(data)) setSavedResumes(data);
    });
  }, []);

  // Load activity log from Turso
  useEffect(() => {
    loadFromStorage("activity").then(data => {
      if (Array.isArray(data) && data.length > 0) {
        setLog(data.map(d => ({ msg: d.message, type: d.type, time: new Date(d.timestamp).toLocaleTimeString("en-US", { hour12: false }) })));
      } else {
        setLog([{ msg: "CV Chameleon v2 — Bridge List loaded", type: "success", time: new Date().toLocaleTimeString("en-US", { hour12: false }) }]);
      }
    });
  }, []);

  useEffect(() => { if (logRef.current) logRef.current.scrollTop = logRef.current.scrollHeight; }, [log]);

  const addLog = (msg, type = "info") => {
    const icons = { info: "›", success: "✓", error: "✗", loading: "⟳" };
    const entry = { msg, type, icon: icons[type], time: new Date().toLocaleTimeString("en-US", { hour12: false }) };
    setLog(prev => [...prev, entry]);
    saveToStorage("activity", { message: msg, type });
  };

  const filteredRoles = selectedCategory === "All" ? BRIDGE_ROLES : BRIDGE_ROLES.filter(r => r.c === selectedCategory);
  const rolesByTier = { 1: filteredRoles.filter(r => r.tier === 1), 2: filteredRoles.filter(r => r.tier === 2), 3: filteredRoles.filter(r => r.tier === 3) };

  const tailorForRole = async (role) => {
    if (!masterResume) { addLog("Master resume not loaded", "error"); return; }
    const jobId = `bridge_${role.t.replace(/\s+/g, "_")}`;
    setTailoring(prev => ({ ...prev, [jobId]: "loading" }));
    addLog(`Tailoring for ${role.t}…`, "loading");
    const job = { id: jobId, title: role.t, company: role.where.split("·")[0].trim(), location: "Remote", description: `Role: ${role.t}\nWhy: ${role.w}\nWhere: ${role.where}\nPay: ${role.pay}` };
    try {
      const text = await callClaude(TAILOR_SYSTEM, TAILOR_USER(job, masterResume), 4096);
      const clean = text.replace(/```json\s*/g, "").replace(/```\s*/g, "").trim();
      const jsonStart = clean.indexOf("{");
      if (jsonStart === -1) throw new Error("No JSON");
      const parsed = JSON.parse(clean.slice(jsonStart));
      if (!parsed.filename) parsed.filename = `Annabel_Otutu_${role.c}_${role.t.replace(/[^a-z0-9]/gi, "_").slice(0, 20)}.pdf`;
      setTailoring(prev => ({ ...prev, [jobId]: parsed }));
      addLog(`Resume ready — ${role.t}`, "success");
    } catch (e) {
      setTailoring(prev => ({ ...prev, [jobId]: "error" }));
      addLog(`Failed: ${e.message}`, "error");
    }
  };

  const tailorForJob = async (job) => {
    if (!masterResume) { addLog("Master resume not loaded", "error"); return; }
    setTailoring(prev => ({ ...prev, [job.id]: "loading" }));
    addLog(`Tailoring for ${job.company}…`, "loading");
    try {
      const text = await callClaude(TAILOR_SYSTEM, TAILOR_USER(job, masterResume), 4096);
      const clean = text.replace(/```json\s*/g, "").replace(/```\s*/g, "").trim();
      const jsonStart = clean.indexOf("{");
      if (jsonStart === -1) throw new Error("No JSON");
      const parsed = JSON.parse(clean.slice(jsonStart));
      if (!parsed.filename) parsed.filename = `Annabel_Otutu_${job.company.replace(/[^a-z0-9]/gi, "_").slice(0, 15)}_${job.title.replace(/[^a-z0-9]/gi, "_").slice(0, 15)}.pdf`;
      setTailoring(prev => ({ ...prev, [job.id]: parsed }));
      addLog(`Resume ready — ${job.company}`, "success");
    } catch (e) {
      setTailoring(prev => ({ ...prev, [job.id]: "error" }));
      addLog(`Failed: ${e.message}`, "error");
    }
  };

  const tailorFromPaste = async () => {
    if (!pasteJD.trim() || !pasteTitle.trim() || !pasteCompany.trim() || !masterResume) return;
    setPasting(true);
    const job = { id: `paste_${Date.now()}`, title: pasteTitle.trim(), company: pasteCompany.trim(), location: pasteLocation.trim() || "Remote", description: pasteJD.trim() };
    addLog(`Tailoring for ${job.company}…`, "loading");
    try {
      const text = await callClaude(TAILOR_SYSTEM, TAILOR_USER(job, masterResume), 4096);
      const clean = text.replace(/```json\s*/g, "").replace(/```\s*/g, "").trim();
      const jsonStart = clean.indexOf("{");
      if (jsonStart === -1) throw new Error("No JSON");
      const parsed = JSON.parse(clean.slice(jsonStart));
      if (!parsed.filename) parsed.filename = `Annabel_Otutu_${job.company.replace(/[^a-z0-9]/gi, "_")}_${job.title.replace(/[^a-z0-9]/gi, "_").slice(0, 15)}.pdf`;
      setTailoring(prev => ({ ...prev, [job.id]: parsed }));
      addLog(`Resume ready — ${job.company}`, "success");
      setPasteTitle(""); setPasteCompany(""); setPasteLocation(""); setPasteJD("");
      setShowPastePanel(false);
    } catch (e) { addLog(`Failed — ${e.message}`, "error"); }
    setPasting(false);
  };

  const findLiveJobs = async () => {
    if (!searchTitles.length) return;
    setSearching(true);
    setLiveJobs([]);
    addLog(`Searching for ${searchTitles.length} titles…`, "loading");
    try {
      const results = await searchJobs(searchTitles, searchLocations);
      const sorted = results.sort((a, b) => jobFitScore(b.title) - jobFitScore(a.title));
      setLiveJobs(sorted);
      addLog(`${results.length} jobs found`, "success");
    } catch (e) { addLog(`Search failed: ${e.message}`, "error"); }
    setSearching(false);
  };

  const saveResume = async (resume) => {
    const success = await saveToStorage("resume", { filename: resume.filename, ...resume });
    if (success) {
      addLog(`Saved: ${resume.filename}`, "success");
      const updated = await loadFromStorage("resumes");
      setSavedResumes(updated);
    }
  };

  const deleteSavedResume = async (id) => {
    await deleteFromStorage(id);
    setSavedResumes(prev => prev.filter(r => r.id !== id));
    addLog("Resume deleted", "info");
  };

  const generatePDF = (r) => {
    const doc = new jsPDF({ unit: "mm", format: "letter" });
    const pW = 215.9, m = 12.7, cW = pW - m * 2;
    let y = 14;
    const C_HEADER = [26, 26, 26], C_ACCENT = [44, 90, 160], C_BODY = [42, 42, 42], C_SEC = [74, 74, 74], C_BG = [232, 240, 248];
    const checkPage = (need) => { if (y + need > 264) { doc.addPage(); y = 14; } };
    const renderBullet = (text, x, maxW) => {
      const boldMatch = text.match(/^\*\*(.*?)\*\*\s*(.*)/);
      const lines = doc.setFont("helvetica", "normal").setFontSize(9.5).splitTextToSize(`• ${boldMatch ? boldMatch[1] + " " + boldMatch[2] : text}`, maxW);
      checkPage(lines.length * 4.2 + 2);
      doc.setTextColor(...C_BODY).text(lines, x, y);
      y += lines.length * 4.2 + 1;
    };
    const sectionHeader = (title) => {
      checkPage(14); y += 3;
      doc.setFillColor(...C_BG).setDrawColor(...C_ACCENT);
      doc.roundedRect(m, y - 4, cW, 7, 0.5, 0.5, "FD");
      doc.setFont("helvetica", "bold").setFontSize(10).setTextColor(...C_HEADER);
      doc.text(title.toUpperCase(), m + 3, y + 0.5);
      y += 8;
    };
    doc.setFont("helvetica", "bold").setFontSize(18).setTextColor(...C_HEADER);
    doc.text(r.name || "Annabel Otutu", pW / 2, y, { align: "center" });
    y += 5;
    if (r.headerTitle) { doc.setFont("helvetica", "normal").setFontSize(11).setTextColor(...C_SEC); doc.text(r.headerTitle, pW / 2, y, { align: "center" }); y += 5; }
    doc.setFont("helvetica", "normal").setFontSize(9).setTextColor(...C_SEC);
    doc.text(r.contact || "linkedin.com/in/annabel-otutu  ·  anabelotutu5@gmail.com", pW / 2, y, { align: "center" });
    y += 3;
    doc.setDrawColor(...C_ACCENT).setLineWidth(0.6).line(m, y, pW - m, y);
    y += 6;
    if (r.summary) { sectionHeader("Summary"); const sumLines = doc.setFont("helvetica", "normal").setFontSize(9.5).splitTextToSize(r.summary, cW - 6); doc.setTextColor(...C_BODY).text(sumLines, m + 3, y); y += sumLines.length * 4.5 + 4; }
    if (r.competencies?.length > 0) { sectionHeader("Core Competencies"); r.competencies.forEach(c => { checkPage(8); doc.setFont("helvetica", "bold").setFontSize(9.5).setTextColor(...C_HEADER); const lbl = `${c.category}: `; const lblW = doc.getStringUnitWidth(lbl) * 9.5 / doc.internal.scaleFactor; doc.text(lbl, m + 3, y); doc.setFont("helvetica", "normal").setTextColor(...C_BODY); doc.text((c.items || []).join(", ") + ".", m + 3 + lblW, y); y += 5; }); y += 2; }
    if (r.workSamples?.length > 0) { sectionHeader("Work Samples"); doc.setFont("helvetica", "normal").setFontSize(9.5).setTextColor(...C_BODY); doc.text(r.workSamples.join("  ·  "), m + 3, y); y += 6; }
    if (r.experience?.length) { sectionHeader("Professional Experience"); r.experience.forEach(j => { checkPage(18); doc.setFont("helvetica", "bold").setFontSize(10.5).setTextColor(...C_HEADER); doc.text(j.title || "", m + 1, y); y += 4.5; doc.setFont("helvetica", "italic").setFontSize(9.5).setTextColor(...C_ACCENT); doc.text(`${j.company || ""}  ·  ${j.dates || ""}`, m + 1, y); y += 5; (j.bullets || []).forEach(b => renderBullet(b, m + 3, cW - 6)); y += 3; }); }
    if (r.education?.length) { sectionHeader("Education"); r.education.forEach(e => { checkPage(12); doc.setFont("helvetica", "bold").setFontSize(10).setTextColor(...C_HEADER); doc.text(e.degree || "", m + 3, y); y += 4.5; doc.setFont("helvetica", "normal").setFontSize(9.5).setTextColor(...C_ACCENT); doc.text(e.school || "", m + 3, y); y += 4; }); }
    doc.save(r.filename || "Annabel_Otutu_Resume.pdf");
    addLog(`Downloaded: ${r.filename}`, "success");
  };

  const renderBoldText = (text) => {
    const m = text.match(/^\*\*(.*?)\*\*\s*(.*)/);
    return m ? <><strong style={{ color: "#E6EDF3" }}>{m[1]}</strong> {m[2]}</> : text;
  };

  const srcColor = { LinkedIn: "#0A66C2", Indeed: "#2164F3", Builtin: "#6C47FF", "Company Site": "#059669", "Google Jobs": "#4285F4", Pasted: "#9333EA" };

  return (
    <div style={{ minHeight: "100vh", background: "#0D1117", color: "#E6EDF3", fontFamily: "'DM Mono',monospace" }}>
      <style>{STYLES}</style>

      {/* Preview Modal */}
      {previewResume && (
        <div className="modal-overlay" onClick={() => setPreviewResume(null)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <div style={{ fontFamily: "'Syne',sans-serif", fontSize: 14, fontWeight: 700 }}>PREVIEW</div>
              <button className="bgh" onClick={() => setPreviewResume(null)} style={{ padding: "4px 10px" }}>✕</button>
            </div>
            <div className="modal-body" style={{ background: "#0D1117" }}>
              <div style={{ background: "#fff", color: "#1a1a1a", padding: 20, borderRadius: 8, fontFamily: "Georgia, serif", fontSize: 11, lineHeight: 1.6 }}>
                <div style={{ textAlign: "center", marginBottom: 14 }}>
                  <div style={{ fontSize: 20, fontWeight: 700 }}>{previewResume.name}</div>
                  {previewResume.headerTitle && <div style={{ fontSize: 12, color: "#4a4a4a", marginTop: 3 }}>{previewResume.headerTitle}</div>}
                  <div style={{ fontSize: 10, color: "#666", marginTop: 3 }}>{previewResume.contact}</div>
                </div>
                {previewResume.summary && <div style={{ marginBottom: 12 }}><div style={{ background: "#E8F0F8", padding: "4px 8px", marginBottom: 6, fontSize: 10, fontWeight: 700, textTransform: "uppercase" }}>Summary</div><div style={{ paddingLeft: 6 }}>{previewResume.summary}</div></div>}
                {previewResume.workSamples?.length > 0 && <div style={{ marginBottom: 12 }}><div style={{ background: "#E8F0F8", padding: "4px 8px", marginBottom: 6, fontSize: 10, fontWeight: 700, textTransform: "uppercase" }}>Work Samples</div><div style={{ paddingLeft: 6 }}>{previewResume.workSamples.join("  ·  ")}</div></div>}
                {previewResume.competencies?.length > 0 && <div style={{ marginBottom: 12 }}><div style={{ background: "#E8F0F8", padding: "4px 8px", marginBottom: 6, fontSize: 10, fontWeight: 700, textTransform: "uppercase" }}>Competencies</div>{previewResume.competencies.map((c, i) => <div key={i} style={{ paddingLeft: 6, marginBottom: 3 }}><strong>{c.category}:</strong> {c.items?.join(", ")}.</div>)}</div>}
                {previewResume.experience?.length > 0 && <div style={{ marginBottom: 12 }}><div style={{ background: "#E8F0F8", padding: "4px 8px", marginBottom: 6, fontSize: 10, fontWeight: 700, textTransform: "uppercase" }}>Experience</div>{previewResume.experience.map((exp, i) => <div key={i} style={{ marginBottom: 10, paddingLeft: 6 }}><div style={{ fontWeight: 700, fontSize: 12 }}>{exp.title}</div><div style={{ color: "#2C5A9A", fontStyle: "italic", marginBottom: 3 }}>{exp.company}  ·  {exp.dates}</div><ul style={{ margin: 0, paddingLeft: 16 }}>{exp.bullets?.map((b, j) => <li key={j} style={{ marginBottom: 2 }}>{renderBoldText(b)}</li>)}</ul></div>)}</div>}
              </div>
            </div>
            <div className="modal-footer">
              <button className="bgh" onClick={() => saveResume(previewResume)}>💾 SAVE</button>
              <button className="bg" onClick={() => { generatePDF(previewResume); setPreviewResume(null); }}>↓ PDF</button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div style={{ borderBottom: "1px solid #21262D", padding: "14px 24px" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 10 }}>
          <div>
            <div style={{ fontFamily: "'Syne',sans-serif", fontSize: 18, fontWeight: 800, letterSpacing: "-0.02em" }}>CV CHAMELEON</div>
            <div style={{ fontSize: 9, color: "#7D8590", marginTop: 2 }}>33 ROLES · NIGERIA-REMOTE · PWA</div>
          </div>
          <div style={{ display: "flex", gap: 0, borderBottom: "1px solid #21262D" }}>
            <button className={`tab-btn ${tab === "bridge" ? "active" : ""}`} onClick={() => setTab("bridge")}>BRIDGE LIST</button>
            <button className={`tab-btn ${tab === "jobs" ? "active" : ""}`} onClick={() => setTab("jobs")}>LIVE JOBS</button>
            <button className={`tab-btn ${tab === "saved" ? "active" : ""}`} onClick={() => setTab("saved")}>SAVED ({savedResumes.length})</button>
          </div>
        </div>
      </div>

      <div style={{ padding: "16px 24px", maxWidth: 1200, margin: "0 auto" }}>

        {/* Work Samples Banner */}
        <div style={{ background: "linear-gradient(135deg,#1A2A3A,#2A3A4A)", border: "1px solid #3D5A80", borderRadius: 8, padding: 14, marginBottom: 16 }}>
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            {WORK_SAMPLES.map((s, i) => (
              <div key={i} style={{ background: "#0D1117", border: "1px solid #21262D", borderRadius: 6, padding: 10, flex: 1, minWidth: 160 }}>
                <div style={{ fontSize: 11, fontWeight: 600, color: "#E6EDF3" }}>{s.title}</div>
                <div style={{ fontSize: 9, color: "#4ADE80" }}>{s.framework}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Paste JD Panel */}
        {showPastePanel && (
          <div className="si" style={{ background: "#161B22", border: "1px solid #6A3DAA", borderRadius: 8, padding: 16, marginBottom: 16 }}>
            <div style={{ fontFamily: "'Syne',sans-serif", fontSize: 11, fontWeight: 700, color: "#C084FC", marginBottom: 12 }}>PASTE JOB DESCRIPTION</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, marginBottom: 10 }}>
              <input className="fi" value={pasteTitle} onChange={e => setPasteTitle(e.target.value)} placeholder="Job Title" />
              <input className="fi" value={pasteCompany} onChange={e => setPasteCompany(e.target.value)} placeholder="Company" />
              <input className="fi" value={pasteLocation} onChange={e => setPasteLocation(e.target.value)} placeholder="Location" />
            </div>
            <textarea className="jd-input" rows={8} placeholder="Paste full job description…" value={pasteJD} onChange={e => setPasteJD(e.target.value)} />
            <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
              <button className="bp2" onClick={tailorFromPaste} disabled={pasting || !pasteJD.trim() || !pasteTitle.trim() || !pasteCompany.trim()}>{pasting ? <span className="pulse">TAILORING…</span> : "⚡ TAILOR"}</button>
              <button className="bgh" onClick={() => setShowPastePanel(false)}>CANCEL</button>
            </div>
          </div>
        )}

        {/* ═══════════════════════════════════════════════════════════════════════ */}
        {/* BRIDGE LIST TAB */}
        {/* ═══════════════════════════════════════════════════════════════════════ */}
        {tab === "bridge" && (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 280px", gap: 16 }}>
            <div>
              <div style={{ display: "flex", gap: 6, marginBottom: 14, flexWrap: "wrap" }}>
                {CATEGORIES.map(cat => (
                  <button key={cat} className={selectedCategory === cat ? "bp" : "bgh"} onClick={() => setSelectedCategory(cat)} style={{ padding: "6px 12px", fontSize: 9 }}>
                    {cat.toUpperCase()}
                  </button>
                ))}
                <div style={{ flex: 1 }} />
                <button className="bp2" onClick={() => setShowPastePanel(p => !p)} style={{ padding: "8px 14px", fontSize: 10 }}>{showPastePanel ? "✕" : "⊕ PASTE JD"}</button>
              </div>

              {[1, 2, 3].map(tier => {
                const roles = rolesByTier[tier];
                if (!roles.length) return null;
                const tierInfo = TIER_LABELS[tier];
                return (
                  <div key={tier}>
                    <div className="tier-header" style={{ borderColor: tierInfo.color, color: tierInfo.color }}>
                      <span>{tierInfo.name}</span>
                      <span style={{ color: "#5A6470", fontWeight: 400, fontSize: 9, textTransform: "none" }}>{tierInfo.desc}</span>
                    </div>
                    {roles.map((role, i) => {
                      const jobId = `bridge_${role.t.replace(/\s+/g, "_")}`;
                      const state = tailoring[jobId];
                      const done = state && state !== "loading" && state !== "error";
                      return (
                        <div key={i} className="jc si" style={{ marginBottom: 8 }}>
                          <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                            <div className="score-badge" style={{ background: tier === 1 ? "#0D2B1F" : tier === 2 ? "#2A2A0A" : "#1A1A1A", color: tierInfo.color }}>{bridgeScore(role)}</div>
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 3 }}>
                                <span className="tag" style={{ background: `${tierInfo.color}22`, color: tierInfo.color }}>{role.c}</span>
                                <span style={{ fontSize: 10, color: "#4ADE80" }}>{role.pay}</span>
                              </div>
                              <div style={{ fontFamily: "'Syne',sans-serif", fontSize: 13, fontWeight: 700, marginBottom: 2 }}>{role.t}</div>
                              <div style={{ fontSize: 11, color: "#7D8590", marginBottom: 4 }}>{role.w}</div>
                              <div style={{ fontSize: 9, color: "#5A6470" }}>{role.where}</div>
                            </div>
                            <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                              {!state && <button className="bg" onClick={() => tailorForRole(role)} style={{ padding: "5px 10px", fontSize: 9 }}>TAILOR</button>}
                              {state === "loading" && <span className="pulse" style={{ fontSize: 9, color: "#F59E0B" }}>TAILORING…</span>}
                              {state === "error" && <button className="bgh" onClick={() => tailorForRole(role)} style={{ color: "#F87171", fontSize: 9 }}>RETRY</button>}
                              {done && <button className="bgh" onClick={() => setPreviewResume(state)} style={{ padding: "4px 8px", fontSize: 8 }}>👁</button>}
                              {done && <button className="bg" onClick={() => generatePDF(state)} style={{ padding: "4px 8px", fontSize: 8 }}>↓</button>}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                );
              })}
            </div>

            {/* Sidebar */}
            <div>
              <div style={{ background: "#161B22", border: "1px solid #21262D", borderRadius: 8, overflow: "hidden", position: "sticky", top: 16 }}>
                <div style={{ padding: "8px 12px", borderBottom: "1px solid #21262D", fontSize: 10, fontWeight: 700, color: "#7D8590" }}>ACTIVITY LOG</div>
                <div ref={logRef} style={{ height: 250, overflowY: "auto", padding: 10 }}>
                  {log.slice(-50).map((e, i) => (
                    <div key={i} style={{ fontSize: 10, lineHeight: 1.6, color: e.type === "success" ? "#4ADE80" : e.type === "error" ? "#F87171" : e.type === "loading" ? "#F59E0B" : "#7D8590" }}>
                      <span style={{ color: "#1E2A38", marginRight: 6 }}>{e.time}</span>{e.msg}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ═══════════════════════════════════════════════════════════════════════ */}
        {/* LIVE JOBS TAB */}
        {/* ═══════════════════════════════════════════════════════════════════════ */}
        {tab === "jobs" && (
          <div>
            <div style={{ background: "#161B22", border: "1px solid #21262D", borderRadius: 8, padding: 16, marginBottom: 16 }}>
              <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap", marginBottom: 12 }}>
                <div style={{ position: "relative" }}>
                  <button className="bgh" onClick={() => setShowTitlePicker(p => !p)} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <span>TITLES ({searchTitles.length})</span>
                    <span style={{ fontSize: 8 }}>{showTitlePicker ? "▲" : "▼"}</span>
                  </button>
                  {showTitlePicker && (
                    <div style={{ position: "absolute", top: "100%", left: 0, zIndex: 100, background: "#161B22", border: "1px solid #3D5A80", borderRadius: 8, width: 320, maxHeight: 400, overflowY: "auto", marginTop: 4 }}>
                      {TITLE_GROUPS.map(group => (
                        <div key={group.label}>
                          <div style={{ padding: "8px 12px 4px", fontSize: 9, color: group.color, fontWeight: 600 }}>{group.label.toUpperCase()}</div>
                          {group.titles.map(t => {
                            const checked = searchTitles.includes(t);
                            return (
                              <div key={t} onClick={() => setSearchTitles(p => checked ? p.filter(x => x !== t) : [...p, t])} style={{ display: "flex", alignItems: "center", gap: 8, padding: "5px 12px", cursor: "pointer" }}>
                                <div style={{ width: 12, height: 12, borderRadius: 2, border: `1px solid ${checked ? group.color : "#3D4A5A"}`, background: checked ? group.color : "transparent" }}>{checked && <span style={{ color: "#0D1117", fontSize: 8 }}>✓</span>}</div>
                                <span style={{ fontSize: 10, color: checked ? "#E6EDF3" : "#7D8590" }}>{t}</span>
                              </div>
                            );
                          })}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <div style={{ display: "flex", gap: 4 }}>
                  {LOCATION_OPTIONS.map(({ label, emoji }) => {
                    const active = searchLocations.includes(label);
                    return <button key={label} onClick={() => setSearchLocations(p => active ? p.filter(l => l !== label) : [...p, label])} style={{ background: active ? "#1B2A4A" : "transparent", border: `1px solid ${active ? "#3D6B9A" : "#2D3440"}`, borderRadius: 16, padding: "4px 10px", fontSize: 10, color: active ? "#7EB5F7" : "#7D8590", cursor: "pointer" }}>{emoji} {label}</button>;
                  })}
                </div>
                <button className="bp" onClick={findLiveJobs} disabled={searching || !searchTitles.length} style={{ padding: "10px 24px" }}>
                  {searching ? <span className="pulse">SEARCHING…</span> : "🔍 FIND JOBS"}
                </button>
              </div>
              <div style={{ fontSize: 9, color: "#5A6470" }}>Selected: {searchTitles.slice(0, 5).join(", ")}{searchTitles.length > 5 ? ` +${searchTitles.length - 5} more` : ""}</div>
            </div>

            {liveJobs.length === 0 && !searching && (
              <div style={{ textAlign: "center", padding: 40, color: "#3D4A5A" }}>
                <div style={{ fontFamily: "'Syne',sans-serif", fontSize: 24, fontWeight: 800, marginBottom: 8 }}>SEARCH LIVE JOBS</div>
                <div style={{ fontSize: 11 }}>Select titles and locations, then click Find Jobs</div>
              </div>
            )}

            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {liveJobs.map((job, i) => {
                const state = tailoring[job.id];
                const done = state && state !== "loading" && state !== "error";
                const fitScore = jobFitScore(job.title);
                return (
                  <div key={job.id} className="jc si" style={{ animationDelay: `${i * .03}s` }}>
                    <div style={{ display: "flex", gap: 14, alignItems: "flex-start" }}>
                      <div className="score-badge" style={{ background: fitScore >= 85 ? "#0D2B1F" : fitScore >= 75 ? "#2A2A0A" : "#1A1A1A", color: fitScore >= 85 ? "#4ADE80" : fitScore >= 75 ? "#F59E0B" : "#7D8590" }}>{fitScore}</div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 3, flexWrap: "wrap" }}>
                          <span className="tag" style={{ background: `${srcColor[job.source] || "#21262D"}22`, color: srcColor[job.source] || "#7D8590" }}>{job.source}</span>
                          <span style={{ fontSize: 9, color: "#7D8590" }}>{job.location}</span>
                          {job.salary && <span style={{ fontSize: 9, color: "#4ADE80" }}>💰 {job.salary}</span>}
                          {job.posted && <span style={{ fontSize: 9, color: "#5A6470" }}>{job.posted}</span>}
                        </div>
                        <div style={{ fontFamily: "'Syne',sans-serif", fontSize: 13, fontWeight: 700, marginBottom: 2 }}>{job.title}</div>
                        <div style={{ fontSize: 11, color: "#7EB5F7", marginBottom: 4 }}>{job.company}</div>
                        <div style={{ fontSize: 10, color: "#7D8590", lineHeight: 1.5 }}>{job.description?.slice(0, 200)}…</div>
                      </div>
                      <div style={{ display: "flex", flexDirection: "column", gap: 4, minWidth: 70 }}>
                        {!state && <button className="bg" onClick={() => tailorForJob(job)} style={{ padding: "5px 10px", fontSize: 9 }}>TAILOR</button>}
                        {state === "loading" && <span className="pulse" style={{ fontSize: 9, color: "#F59E0B" }}>…</span>}
                        {state === "error" && <button className="bgh" onClick={() => tailorForJob(job)} style={{ color: "#F87171", fontSize: 9 }}>RETRY</button>}
                        {done && <button className="bgh" onClick={() => setPreviewResume(state)} style={{ padding: "4px 8px", fontSize: 8 }}>👁</button>}
                        {done && <button className="bg" onClick={() => generatePDF(state)} style={{ padding: "4px 8px", fontSize: 8 }}>↓</button>}
                        {job.url && job.url !== "#" && <a href={job.url} target="_blank" rel="noopener noreferrer" style={{ fontSize: 9, color: "#3D6B9A", textDecoration: "none" }}>APPLY →</a>}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ═══════════════════════════════════════════════════════════════════════ */}
        {/* SAVED RESUMES TAB */}
        {/* ═══════════════════════════════════════════════════════════════════════ */}
        {tab === "saved" && (
          <div>
            {savedResumes.length === 0 ? (
              <div style={{ textAlign: "center", padding: 40, color: "#3D4A5A" }}>
                <div style={{ fontFamily: "'Syne',sans-serif", fontSize: 24, fontWeight: 800, marginBottom: 8 }}>NO SAVED RESUMES</div>
                <div style={{ fontSize: 11 }}>Tailor a resume and click 💾 Save to store it here</div>
              </div>
            ) : (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(280px,1fr))", gap: 12 }}>
                {savedResumes.map((r) => (
                  <div key={r.id} className="jc">
                    <div style={{ fontFamily: "'Syne',sans-serif", fontSize: 12, fontWeight: 700, marginBottom: 4 }}>{r.filename?.replace("Annabel_Otutu_", "").replace(".pdf", "")}</div>
                    {r.resume_json?.headerTitle && <div style={{ fontSize: 10, color: "#C084FC", marginBottom: 4 }}>{JSON.parse(r.resume_json).headerTitle}</div>}
                    <div style={{ fontSize: 9, color: "#5A6470", marginBottom: 8 }}>{new Date(r.created_at).toLocaleDateString()}</div>
                    <div style={{ display: "flex", gap: 6 }}>
                      <button className="bgh" onClick={() => setPreviewResume(JSON.parse(r.resume_json))} style={{ padding: "4px 10px", fontSize: 9 }}>👁 VIEW</button>
                      <button className="bg" onClick={() => generatePDF(JSON.parse(r.resume_json))} style={{ padding: "4px 10px", fontSize: 9 }}>↓ PDF</button>
                      <button className="bgh" onClick={() => deleteSavedResume(r.id)} style={{ padding: "4px 10px", fontSize: 9, color: "#F87171" }}>🗑</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
