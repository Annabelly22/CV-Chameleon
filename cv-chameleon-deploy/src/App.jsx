import { useState, useEffect, useRef } from "react";
import { jsPDF } from "jspdf";

// ═══════════════════════════════════════════════════════════════════════════
// BRIDGE LIST — 33 roles filtered for Nigeria-remote, no certs required
// Scored on: Fit · Odds · Demand · Speed (weighted composite)
// ═══════════════════════════════════════════════════════════════════════════
const BRIDGE_ROLES = [
  // APPLY THIS WEEK (score >= 84)
  {t:"AI Training Expert — Finance, Code & Compliance",c:"AI contract",fit:9,odds:9,dem:9,spd:10,pay:"$30–100/hr",tier:1,
    w:"The money bridge. Nigeria-eligible, no interview panel, fastest-paying thing on this list.",
    where:"Mercor · micro1 · Turing via Deel · Alignerr · Terac"},
  {t:"AI Code Evaluation / RLHF — Coding",c:"AI contract",fit:8,odds:9,dem:10,spd:10,pay:"$25–80/hr",tier:1,
    w:"Highest-volume category on every AI platform right now. Grading model-written code.",
    where:"Mercor · micro1 · Turing · Terac · AfterQuery"},
  {t:"Security Questionnaire & Trust Analyst",c:"Compliance",fit:10,odds:9,dem:9,spd:8,pay:"$55k–95k",tier:1,
    w:"SaaS vendors are buried in customer security questionnaires — SOC 2, CAIQ, VSA.",
    where:"OpsArmy · Remotive · SafeBase · Conveyor ecosystems"},
  {t:"Technical Writer — Security & Compliance Docs",c:"Writing",fit:10,odds:9,dem:8,spd:8,pay:"$60k–105k",tier:1,
    w:"Policies, procedures, control narratives. The exact work you did for EPA and Parkland.",
    where:"Security vendors · fintech · Write the Docs · Remotive"},
  {t:"AI Data Annotation — Specialist Tier",c:"AI contract",fit:7,odds:9,dem:10,spd:9,pay:"$15–60/hr",tier:1,
    w:"Annotation demand rose 154% this year. Specialist tier pays several times the general pool.",
    where:"Alignerr · Terac · Mindrift · Appen · CrowdGen"},
  {t:"Compliance Analyst — SaaS / Commercial",c:"Compliance",fit:10,odds:8,dem:9,spd:7,pay:"$60k–105k",tier:1,
    w:"Control mapping, evidence collection, policy drafting, audit prep.",
    where:"Vanta · Drata · Secureframe · compliance consultancies"},
  {t:"Proposal / RFP Response Specialist — Commercial",c:"Proposals",fit:10,odds:8,dem:8,spd:8,pay:"$55k–95k",tier:1,
    w:"You hold this title already. Target commercial and SaaS bid teams.",
    where:"SaaS bid teams · consultancies · staffing agencies"},
  // STRONG SECOND WAVE (score 74-83)
  {t:"Compliance Documentation Specialist",c:"Compliance",fit:10,odds:8,dem:7,spd:8,pay:"$55k–95k",tier:2,
    w:"Narrower than general technical writing and far less contested.",
    where:"Health-tech · fintech · compliance consultancies"},
  {t:"Documentation Specialist",c:"Writing",fit:9,odds:8,dem:7,spd:9,pay:"$50k–85k",tier:2,
    w:"The generalist version of your strongest skill. Easiest to land.",
    where:"Remotive · WeWorkRemotely · staffing agencies"},
  {t:"AI Integration Specialist (freelance)",c:"AI contract",fit:8,odds:8,dem:9,spd:8,pay:"$40–120/hr",tier:2,
    w:"Up 178% year on year. Wiring language models into existing business systems.",
    where:"Upwork · Contra · direct to small businesses"},
  {t:"Policy & Procedure Writer",c:"Writing",fit:9,odds:8,dem:7,spd:8,pay:"$55k–95k",tier:2,
    w:"Information security policies, SOPs, handbooks mapped to frameworks.",
    where:"Compliance consultancies · MSSPs · SaaS companies"},
  {t:"Knowledge Management Specialist",c:"Writing",fit:9,odds:8,dem:7,spd:8,pay:"$55k–95k",tier:2,
    w:"Owning the internal documentation estate — taxonomy, Confluence architecture.",
    where:"Mid-size SaaS · Atlassian ecosystem consultancies"},
  {t:"Business Process / Documentation Analyst",c:"Ops",fit:9,odds:8,dem:7,spd:8,pay:"$55k–95k",tier:2,
    w:"Mapping how work actually happens, writing it down, then improving it.",
    where:"Mid-market companies · consultancies · shared-services teams"},
  {t:"Technical Writer — Developer Documentation",c:"Writing",fit:9,odds:8,dem:8,spd:7,pay:"$60k–110k",tier:2,
    w:"API references, SDK guides, quickstarts.",
    where:"Devtool companies · fintech · Write the Docs · Remotive"},
  {t:"Automation Consultant (Make / n8n / Python)",c:"Ops",fit:8,odds:8,dem:8,spd:8,pay:"$40–100/hr",tier:2,
    w:"Short projects, fast starts, no residency question anywhere.",
    where:"Make Partner · n8n experts · Upwork"},
  {t:"AI Chatbot / Agent Developer (freelance)",c:"AI contract",fit:8,odds:8,dem:8,spd:8,pay:"$35–100/hr",tier:2,
    w:"Up 71% on Upwork. High volume of small, well-scoped briefs.",
    where:"Upwork · Fiverr Pro · n8n and Make communities"},
  {t:"Technical Support Engineer (Tier 2)",c:"Client-facing",fit:7,odds:8,dem:8,spd:9,pay:"$35k–70k",tier:2,
    w:"Fast loops, closes in two to four weeks. Floor option.",
    where:"SaaS companies · Support Driven board"},
  {t:"Third-Party / Vendor Risk Analyst",c:"Compliance",fit:9,odds:7,dem:8,spd:7,pay:"$60k–100k",tier:2,
    w:"Assessing vendors rather than answering for your own company.",
    where:"Enterprise security teams · OneTrust · Prevalent · MSSPs"},
  {t:"Security Awareness Content Developer",c:"Compliance",fit:8,odds:8,dem:7,spd:8,pay:"$55k–95k",tier:2,
    w:"Phishing simulations, training modules, policy explainers.",
    where:"KnowBe4 · Hoxhunt · Living Security"},
  {t:"Enablement / Training Content Developer",c:"Writing",fit:8,odds:8,dem:7,spd:8,pay:"$55k–95k",tier:2,
    w:"Internal training material, onboarding paths, certification content.",
    where:"SaaS enablement teams · corporate L&D"},
  {t:"Technical Content Marketer — Security / Fintech",c:"Writing",fit:8,odds:7,dem:8,spd:8,pay:"$55k–100k",tier:2,
    w:"Marketing roles close in about twenty days. Compliance-literate marketers are scarce.",
    where:"Security vendors · fintech · Animalz · Draft.dev · Contra"},
  {t:"Prompt Engineer / AI Workflow Designer",c:"AI contract",fit:8,odds:7,dem:8,spd:8,pay:"$60k–120k",tier:2,
    w:"You build agentic workflows in Make.com and the Claude API and ship them.",
    where:"AI-native startups · Wellfound · Upwork enterprise tier"},
  {t:"Contracts Administrator / Analyst",c:"Proposals",fit:9,odds:7,dem:7,spd:7,pay:"$55k–90k",tier:2,
    w:"Contract lifecycle, compliance review, renewals. Literally your current title.",
    where:"SaaS legal-ops teams · procurement consultancies"},
  {t:"API Documentation Specialist",c:"Writing",fit:9,odds:7,dem:7,spd:7,pay:"$60k–115k",tier:2,
    w:"Narrower and better paid than general technical writing.",
    where:"Fintech and devtool companies · Toptal · Contra"},
  {t:"Customer Success Manager — Compliance SaaS",c:"Client-facing",fit:7,odds:8,dem:8,spd:7,pay:"$55k–100k",tier:2,
    w:"Vanta, Drata and Secureframe need CSMs who understand what a control is.",
    where:"Vanta · Drata · Secureframe · Thoropass"},
  {t:"Implementation / Onboarding Specialist — SaaS",c:"Client-facing",fit:8,odds:7,dem:8,spd:7,pay:"$55k–100k",tier:2,
    w:"Configuring a product for a new customer and documenting it.",
    where:"Fintech · compliance SaaS · Vanta · Drata implementation teams"},
  // RUN IN PARALLEL (score < 74)
  {t:"Bid Writer — Technology / Consulting (UK & EU)",c:"Proposals",fit:9,odds:7,dem:6,spd:7,pay:"$50k–90k",tier:3,
    w:"UK and EU firms hire remotely. Your working hours cover their entire day.",
    where:"UK/EU consultancies · Reed · Otta · Welcome to the Jungle"},
  {t:"Content Strategist — B2B Technical",c:"Writing",fit:8,odds:7,dem:7,spd:7,pay:"$60k–105k",tier:3,
    w:"Owning what gets written and why across a technical product.",
    where:"B2B SaaS · agencies · Remotive · Otta"},
  {t:"Technical Writer — AI / ML Products",c:"Writing",fit:8,odds:7,dem:7,spd:7,pay:"$70k–130k",tier:3,
    w:"Model cards, evaluation documentation, SDK guides. Newer and less crowded.",
    where:"AI infrastructure startups · Hugging Face · Wellfound"},
  {t:"QA Analyst / Test Documentation",c:"Ops",fit:7,odds:7,dem:7,spd:7,pay:"$40k–80k",tier:3,
    w:"Test plans, cases, defect documentation. Playwright experience helps.",
    where:"SaaS QA teams · Turing · contract-to-hire"},
  {t:"RevOps / Business Systems Analyst",c:"Ops",fit:7,odds:7,dem:7,spd:7,pay:"$55k–100k",tier:3,
    w:"Process mapping, systems integration, reporting.",
    where:"SaaS companies · RevOps Co-op · Wellfound"},
  {t:"Technical Editor — Engineering Content",c:"Writing",fit:7,odds:7,dem:6,spd:8,pay:"$30–70/hr",tier:3,
    w:"Editing other engineers' writing for clarity and correctness.",
    where:"O'Reilly · Manning · engineering blogs · Upwork"},
  {t:"Technical Trainer — Compliance Products",c:"Writing",fit:7,odds:7,dem:6,spd:7,pay:"$50k–90k",tier:3,
    w:"Teaching customers to use a compliance platform.",
    where:"Compliance SaaS enablement teams · training vendors"}
];

const TIER_LABELS = {
  1: { name: "Apply this week", desc: "your CV is close to the job advert", color: "#4ADE80" },
  2: { name: "Strong second wave", desc: "good fit, slightly longer odds or loops", color: "#F59E0B" },
  3: { name: "Run in parallel", desc: "real options, weaker on one axis", color: "#7D8590" }
};

const CATEGORIES = ["All", "Compliance", "Writing", "AI contract", "Proposals", "Ops", "Client-facing"];

const TARGET_COMPANIES = {
  compliance: ["Vanta", "Drata", "Secureframe", "Thoropass", "OneTrust", "Prevalent", "SafeBase", "Conveyor"],
  aiPlatforms: ["Mercor", "micro1", "Turing", "Alignerr", "Terac", "Mindrift", "AfterQuery"],
  jobBoards: ["Remotive", "WeWorkRemotely", "Write the Docs", "Wellfound", "Otta", "Contra", "Upwork"],
  securityVendors: ["KnowBe4", "Hoxhunt", "Living Security", "OpsArmy"]
};

const WORK_SAMPLES = [
  { title: "NIST RMF AC-2", desc: "Account Management control narrative with evidence mapping", framework: "NIST SP 800-53" },
  { title: "SOC 2 CC6.1", desc: "Logical and Physical Access Controls documentation", framework: "SOC 2 Type II" },
  { title: "ISO 27001 / CMMC", desc: "Information security policy aligned to Annex A controls", framework: "ISO 27001:2022" }
];

// ═══════════════════════════════════════════════════════════════════════════
// STRATEGIC RESUME TAILORING — Optimized for COMMERCIAL COMPLIANCE from Nigeria
// ═══════════════════════════════════════════════════════════════════════════
const TAILOR_SYSTEM = `You are a strategic resume positioning expert helping Annabel Otutu land a remote job from Nigeria. She cannot pursue federal/GovCon roles (Public Trust requires US residency). Position her for COMMERCIAL compliance, SaaS, and international opportunities.

CORE POSITIONING: Technical compliance analyst — NIST SP 800-37, SOC 2, ISO 27001 — who interviews engineers, produces auditor-ready documentation, and automates the pipeline in Python.

KEY DIFFERENTIATORS TO EMPHASIZE:
1. She has ACTUAL WORK SAMPLES (NIST RMF, SOC 2 CC6.1, ISO 27001) when everyone else has coursework
2. She automated compliance workflows in Python at a hospital system — not a toy project
3. Microsoft, EPA, Indeed on her CV — enterprise credibility
4. She ships AI products (CV Chameleon, ROOT VI, BlueGum Studio) — rare for compliance writers
5. Cybersecurity degree from Champlain College — academic foundation

REMOTE POSITIONING:
- Available for remote work
- Do NOT include specific location, timezone, or EOR details in resume

═══ OUTPUT SCHEMA ═══

Return ONLY valid JSON:
{
  "name": "Annabel Otutu",
  "headerTitle": "[Strategic title matching target role | Specialization]",
  "contact": "linkedin.com/in/annabel-otutu  ·  anabelotutu5@gmail.com",
  "summary": "[3-4 sentences positioning for commercial/international, NOT federal]",
  "competencies": [
    { "category": "[Category from JD]", "items": ["Item1", "Item2", "Item3", "Item4"] }
  ],
  "experience": [
    {
      "title": "[Reframed for commercial positioning]",
      "company": "[Company with context]",
      "dates": "[Unchanged]",
      "bullets": ["**Bold opening** rest of accomplishment."]
    }
  ],
  "education": [{ "degree": "Bachelor of Science — Computer Networking and Cybersecurity", "school": "Champlain College", "focus": "" }],
  "workSamples": ["NIST RMF AC-2 Control Documentation", "SOC 2 CC6.1 Control Response", "ISO 27001 Policy Documentation"],
  "remoteReadiness": "",
  "filename": "Annabel_Otutu_[Company]_[Role].pdf"
}

═══ TITLE REFRAMING FOR COMMERCIAL ═══

NEVER position as "Federal Technical Writer" — that market is closed from Nigeria.

Instead:
- "Contract/Proposal Analyst" → "Compliance Documentation Analyst" or "Proposal Response Specialist"
- "Technical Writer (EPA)" → "Technical Compliance Writer" or "GRC Documentation Specialist"
- "IT Technical Writer (Indeed)" → "Knowledge Management Specialist" or "Technical Documentation Engineer"
- "Cybersecurity Technical Writer (Microsoft)" → "Security Documentation Specialist"

For AI CONTRACT roles (Mercor, micro1, Turing):
- Lead with Python, MQL5, automation, Claude API experience
- Emphasize shipped products: CV Chameleon, ROOT VI, Watchman
- Frame compliance as "regulated-industry documentation expertise"

═══ SUMMARY FORMULA ═══

For Compliance roles: "Technical compliance analyst with [X] years producing auditor-ready documentation for [SOC 2/ISO 27001/NIST]. Proven ability to interview engineers, translate controls into evidence, and automate evidence collection in Python. Work samples available: [list]."

For Writing roles: "Technical writer specializing in [security/compliance/API] documentation with enterprise experience at Microsoft, Indeed, and EPA contractor work. Portfolio includes [samples]."

For AI Contract roles: "Finance and code specialist with production MQL5 systems, Python automation, and Claude API integrations. Shipped: CV Chameleon, ROOT VI, Watchman EA Manager. Compliance domain expertise in NIST, SOC 2, ISO 27001."

═══ CRITICAL RULES ═══

1. NEVER mention Public Trust, security clearance, or federal preference
2. ALWAYS include work samples section — this is her key differentiator
3. Do NOT include location, timezone, or EOR details in resume output
4. Position Python automation as a core skill, not an add-on
5. For AI platforms, lead with code and trading systems experience
6. Employment dates NEVER change
7. Be aggressive — she needs this job`;

const TAILOR_USER = (job, master) =>
  `MASTER RESUME:\n${JSON.stringify(master)}\n\nTARGET ROLE: ${job.title} at ${job.company}\nLOCATION: ${job.location}\nCATEGORY: ${job.category || "Commercial"}\n\nJOB DESCRIPTION:\n${job.description}\n\nIMPORTANT: This application is for a REMOTE role. Do NOT position for federal/GovCon. Do NOT include location/timezone/EOR details. Emphasize:\n1. Work samples (NIST RMF, SOC 2, ISO 27001)\n2. Python automation at Parkland\n3. Shipped AI products\n\nReturn ONLY the JSON.`;

const STORAGE_KEYS = {
  LOG: "cv_chameleon_log",
  MASTER_RESUME: "cv_chameleon_master_resume",
  MODE: "cv_chameleon_mode"
};

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
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || `Search API error ${res.status}`);
  }
  const data = await res.json();
  return data.jobs || [];
};

function bridgeScore(r) {
  const W = { fit: 1.0, odds: 1.0, dem: 0.8, spd: 0.8 };
  return Math.round((r.fit * W.fit + r.odds * W.odds + r.dem * W.dem + r.spd * W.spd) / (W.fit + W.odds + W.dem + W.spd) * 10);
}

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
  .bmoney{background:linear-gradient(135deg,#4A3D0A,#6A5A1A);color:#FBBF24;border:1px solid #A08A2A;border-radius:6px;padding:10px 22px;font-family:inherit;font-size:12px;font-weight:500;letter-spacing:.08em;cursor:pointer;transition:all .2s;text-transform:uppercase}
  .bmoney:hover:not(:disabled){background:linear-gradient(135deg,#6A5A1A,#8A7A2A);color:#FCD34D}
  .pulse{animation:pulse 1.5s ease-in-out infinite}@keyframes pulse{0%,100%{opacity:1}50%{opacity:.4}}
  .si{animation:si .3s ease-out forwards}@keyframes si{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}
  .tag{display:inline-block;padding:2px 8px;border-radius:4px;font-size:10px;letter-spacing:.05em;font-weight:500}
  .jd-input{width:100%;background:#0D1117;border:1px solid #2D3A4A;border-radius:6px;padding:12px 14px;color:#E6EDF3;font-family:'DM Mono','Courier New',monospace;font-size:11px;outline:none;resize:vertical;line-height:1.6;transition:border-color .2s}
  .jd-input:focus{border-color:#6A3DAA}
  .fi{background:#0D1117;border:1px solid #2D3A4A;border-radius:5px;padding:8px 10px;color:#E6EDF3;font-family:'DM Mono','Courier New',monospace;font-size:11px;outline:none;width:100%;transition:border-color .2s}
  .fi:focus{border-color:#6A3DAA}
  .modal-overlay{position:fixed;inset:0;background:rgba(0,0,0,0.85);z-index:1000;display:flex;align-items:center;justify-content:center;padding:20px}
  .modal-content{background:#161B22;border:1px solid #3D5A80;border-radius:12px;max-width:800px;width:100%;max-height:90vh;overflow:hidden;display:flex;flex-direction:column}
  .modal-header{padding:16px 20px;border-bottom:1px solid #21262D;display:flex;justify-content:space-between;align-items:center}
  .modal-body{flex:1;overflow-y:auto;padding:20px}
  .modal-footer{padding:16px 20px;border-top:1px solid #21262D;display:flex;gap:12px;justify-content:flex-end}
  .tier-header{padding:14px 0 8px;border-bottom:1px solid;margin-bottom:12px;font-family:'Syne',sans-serif;font-size:12px;font-weight:700;letter-spacing:.1em;text-transform:uppercase;display:flex;justify-content:space-between}
  .score-badge{font-family:'DM Mono',monospace;font-size:18px;font-weight:600;width:44px;height:44px;border-radius:6px;display:flex;align-items:center;justify-content:center;flex-shrink:0}
  .bar{height:4px;background:#21262D;border-radius:2px;overflow:hidden;flex:1}
  .bar-fill{height:100%;border-radius:2px}
`;

export default function App() {
  const [phase, setPhase] = useState("bridge");
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
  const [mode, setMode] = useState("bridge"); // "bridge" or "money"
  const logRef = useRef(null);

  useEffect(() => {
    const loadMasterResume = async () => {
      const stored = localStorage.getItem(STORAGE_KEYS.MASTER_RESUME);
      if (stored) {
        try { setMasterResume(JSON.parse(stored)); return; } catch (e) {}
      }
      try {
        const res = await fetch("/masterResume.json");
        if (res.ok) {
          const data = await res.json();
          setMasterResume(data);
          localStorage.setItem(STORAGE_KEYS.MASTER_RESUME, JSON.stringify(data));
        }
      } catch (e) {}
    };
    loadMasterResume();
  }, []);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEYS.LOG);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) { setLog(parsed); return; }
      } catch (e) {}
    }
    setLog([{ msg: "CV Chameleon v2 — Bridge List loaded (33 Nigeria-remote roles)", type: "success", icon: "✓", time: new Date().toLocaleTimeString("en-US",{hour12:false}) }]);
  }, []);

  useEffect(() => {
    if (log.length > 0) localStorage.setItem(STORAGE_KEYS.LOG, JSON.stringify(log.slice(-100)));
  }, [log]);

  useEffect(() => { if (logRef.current) logRef.current.scrollTop = logRef.current.scrollHeight; }, [log]);

  const addLog = (msg, type = "info") => {
    const icons = { info: "›", success: "✓", error: "✗", loading: "⟳" };
    setLog(prev => [...prev, { msg, type, icon: icons[type], time: new Date().toLocaleTimeString("en-US",{hour12:false}) }]);
  };

  const filteredRoles = selectedCategory === "All"
    ? BRIDGE_ROLES
    : BRIDGE_ROLES.filter(r => r.c === selectedCategory);

  const rolesByTier = {
    1: filteredRoles.filter(r => r.tier === 1),
    2: filteredRoles.filter(r => r.tier === 2),
    3: filteredRoles.filter(r => r.tier === 3)
  };

  const tailorForRole = async (role) => {
    if (!masterResume) { addLog("Master resume not loaded", "error"); return; }
    const jobId = `bridge_${role.t.replace(/\s+/g, "_")}`;
    setTailoring(prev => ({ ...prev, [jobId]: "loading" }));
    addLog(`Tailoring for ${role.t}…`, "loading");

    const job = {
      id: jobId,
      title: role.t,
      company: role.where.split("·")[0].trim(),
      location: "Remote",
      category: role.c,
      description: `Role: ${role.t}\nCategory: ${role.c}\nWhy it fits: ${role.w}\nTarget companies: ${role.where}\nPay range: ${role.pay}\n\nThis is a ${role.c} role. Fit score: ${role.fit}/10. Emphasize relevant experience.`
    };

    try {
      const text = await callClaude(TAILOR_SYSTEM, TAILOR_USER(job, masterResume), 4096);
      const clean = text.replace(/```json\s*/g,"").replace(/```\s*/g,"").trim();
      const jsonStart = clean.indexOf("{");
      if (jsonStart === -1) throw new Error("No JSON in response");
      const parsed = JSON.parse(clean.slice(jsonStart));
      if (!parsed.filename) {
        parsed.filename = `Annabel_Otutu_${role.c}_${role.t.replace(/[^a-z0-9]/gi,"_").slice(0,25)}.pdf`;
      }
      setTailoring(prev => ({ ...prev, [jobId]: parsed }));
      addLog(`Resume ready — ${role.t}`, "success");
    } catch(e) {
      setTailoring(prev => ({ ...prev, [jobId]: "error" }));
      addLog(`Failed: ${role.t} — ${e.message}`, "error");
    }
  };

  const tailorFromPaste = async () => {
    if (!pasteJD.trim() || !pasteTitle.trim() || !pasteCompany.trim() || !masterResume) return;
    setPasting(true);
    const job = {
      id: `paste_${Date.now()}`,
      title: pasteTitle.trim(),
      company: pasteCompany.trim(),
      location: pasteLocation.trim() || "Remote",
      category: "Custom",
      description: pasteJD.trim()
    };
    addLog(`Tailoring for ${job.company}…`, "loading");
    try {
      const text = await callClaude(TAILOR_SYSTEM, TAILOR_USER(job, masterResume), 4096);
      const clean = text.replace(/```json\s*/g,"").replace(/```\s*/g,"").trim();
      const jsonStart = clean.indexOf("{");
      if (jsonStart === -1) throw new Error("No JSON in response");
      const parsed = JSON.parse(clean.slice(jsonStart));
      if (!parsed.filename) {
        parsed.filename = `Annabel_Otutu_${job.company.replace(/[^a-z0-9]/gi,"_")}_${job.title.replace(/[^a-z0-9]/gi,"_").slice(0,20)}.pdf`;
      }
      setTailoring(prev => ({ ...prev, [job.id]: parsed }));
      addLog(`Resume ready — ${job.company}`, "success");
      setPasteTitle(""); setPasteCompany(""); setPasteLocation(""); setPasteJD("");
      setShowPastePanel(false);
    } catch(e) {
      addLog(`Failed — ${e.message}`, "error");
    }
    setPasting(false);
  };

  const generatePDF = (r) => {
    const doc = new jsPDF({ unit: "mm", format: "letter" });
    const pW = 215.9, m = 12.7, cW = pW - m * 2;
    let y = 14;
    const C_HEADER = [26, 26, 26], C_ACCENT = [44, 90, 160], C_BODY = [42, 42, 42], C_SEC = [74, 74, 74], C_BG = [232, 240, 248];
    const checkPage = (need) => { if (y + need > 264) { doc.addPage(); y = 14; } };

    const renderBullet = (text, x, maxW) => {
      const boldMatch = text.match(/^\*\*(.*?)\*\*\s*(.*)/);
      if (boldMatch) {
        const boldPart = boldMatch[1], rest = boldMatch[2];
        const testLines = doc.setFont("helvetica","normal").setFontSize(9.5).splitTextToSize(`• ${boldPart} ${rest}`, maxW);
        checkPage(testLines.length * 4.2 + 2);
        let isFirstLine = true, boldRemaining = boldPart.length;
        for (const line of testLines) {
          let lineText = line, lineX = x;
          if (isFirstLine) {
            doc.setFont("helvetica","normal").setFontSize(9.5).setTextColor(...C_BODY);
            doc.text("• ", lineX, y);
            lineText = line.substring(2);
            lineX = x + 4;
          } else { lineX = x + 2; }
          if (boldRemaining > 0) {
            const boldChars = Math.min(boldRemaining, lineText.length);
            doc.setFont("helvetica","bold").setFontSize(9.5).setTextColor(...C_HEADER);
            doc.text(lineText.substring(0, boldChars), lineX, y);
            if (lineText.length > boldChars) {
              const boldW = doc.getStringUnitWidth(lineText.substring(0, boldChars)) * 9.5 / doc.internal.scaleFactor;
              doc.setFont("helvetica","normal").setTextColor(...C_BODY);
              doc.text(lineText.substring(boldChars), lineX + boldW, y);
            }
            boldRemaining -= boldChars;
          } else {
            doc.setFont("helvetica","normal").setTextColor(...C_BODY);
            doc.text(lineText, lineX, y);
          }
          y += 4.2; isFirstLine = false;
        }
        y += 1;
      } else {
        const lines = doc.setFont("helvetica","normal").setFontSize(9.5).splitTextToSize(`• ${text}`, maxW);
        checkPage(lines.length * 4.2 + 2);
        doc.setTextColor(...C_BODY).text(lines, x, y);
        y += lines.length * 4.2 + 1;
      }
    };

    const sectionHeader = (title) => {
      checkPage(14); y += 3;
      doc.setFillColor(...C_BG).setDrawColor(...C_ACCENT);
      doc.roundedRect(m, y - 4, cW, 7, 0.5, 0.5, "FD");
      doc.setFont("helvetica","bold").setFontSize(10).setTextColor(...C_HEADER);
      doc.text(title.toUpperCase(), m + 3, y + 0.5);
      y += 8;
    };

    doc.setFont("helvetica","bold").setFontSize(18).setTextColor(...C_HEADER);
    doc.text(r.name || "Annabel Otutu", pW / 2, y, { align: "center" });
    y += 5;
    if (r.headerTitle) {
      doc.setFont("helvetica","normal").setFontSize(11).setTextColor(...C_SEC);
      doc.text(r.headerTitle, pW / 2, y, { align: "center" });
      y += 5;
    }
    doc.setFont("helvetica","normal").setFontSize(9).setTextColor(...C_SEC);
    doc.text(r.contact || "linkedin.com/in/annabel-otutu  ·  anabelotutu5@gmail.com", pW / 2, y, { align: "center" });
    y += 3;
    doc.setDrawColor(...C_ACCENT).setLineWidth(0.6).line(m, y, pW - m, y);
    y += 6;

    if (r.summary) {
      sectionHeader("Summary");
      const sumLines = doc.setFont("helvetica","normal").setFontSize(9.5).splitTextToSize(r.summary, cW - 6);
      doc.setTextColor(...C_BODY).text(sumLines, m + 3, y);
      y += sumLines.length * 4.5 + 4;
    }

    if (r.competencies?.length > 0) {
      sectionHeader("Core Competencies");
      r.competencies.forEach(comp => {
        checkPage(8);
        const label = `${comp.category}: `;
        doc.setFont("helvetica","bold").setFontSize(9.5).setTextColor(...C_HEADER);
        const labelW = doc.getStringUnitWidth(label) * 9.5 / doc.internal.scaleFactor;
        doc.text(label, m + 3, y);
        doc.setFont("helvetica","normal").setTextColor(...C_BODY);
        doc.text((comp.items || []).join(", ") + ".", m + 3 + labelW, y);
        y += 5;
      });
      y += 2;
    }

    if (r.workSamples?.length > 0) {
      sectionHeader("Work Samples");
      doc.setFont("helvetica","normal").setFontSize(9.5).setTextColor(...C_BODY);
      doc.text(r.workSamples.join("  ·  "), m + 3, y);
      y += 6;
    }

    if (r.experience?.length) {
      sectionHeader("Professional Experience");
      r.experience.forEach(j => {
        checkPage(18);
        doc.setFont("helvetica","bold").setFontSize(10.5).setTextColor(...C_HEADER);
        doc.text(j.title || "", m + 1, y);
        y += 4.5;
        doc.setFont("helvetica","italic").setFontSize(9.5).setTextColor(...C_ACCENT);
        doc.text(`${j.company || ""}  ·  ${j.dates || ""}`, m + 1, y);
        y += 5;
        (j.bullets || []).forEach(b => renderBullet(b, m + 3, cW - 6));
        y += 3;
      });
    }

    if (r.education?.length) {
      sectionHeader("Education");
      r.education.forEach(e => {
        checkPage(12);
        doc.setFont("helvetica","bold").setFontSize(10).setTextColor(...C_HEADER);
        doc.text(e.degree || "", m + 3, y);
        y += 4.5;
        doc.setFont("helvetica","normal").setFontSize(9.5).setTextColor(...C_ACCENT);
        doc.text(e.school || "", m + 3, y);
        y += 4;
      });
    }

    
    doc.save(r.filename || "Annabel_Otutu_Resume.pdf");
    addLog(`Downloaded: ${r.filename}`, "success");
  };

  const renderBoldText = (text) => {
    const boldMatch = text.match(/^\*\*(.*?)\*\*\s*(.*)/);
    if (boldMatch) return <><strong style={{color:"#E6EDF3"}}>{boldMatch[1]}</strong> {boldMatch[2]}</>;
    return text;
  };

  return (
    <div style={{minHeight:"100vh",background:"#0D1117",color:"#E6EDF3",fontFamily:"'DM Mono','Courier New',monospace"}}>
      <style>{STYLES}</style>

      {previewResume && (
        <div className="modal-overlay" onClick={() => setPreviewResume(null)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <div>
                <div style={{fontFamily:"'Syne',sans-serif",fontSize:14,fontWeight:700}}>RESUME PREVIEW</div>
                <div style={{fontSize:10,color:"#7D8590",marginTop:2}}>{previewResume.filename}</div>
              </div>
              <button className="bgh" onClick={() => setPreviewResume(null)} style={{padding:"6px 12px"}}>✕</button>
            </div>
            <div className="modal-body" style={{background:"#0D1117"}}>
              <div style={{background:"#fff",color:"#1a1a1a",padding:24,borderRadius:8,fontFamily:"Georgia, serif",fontSize:12,lineHeight:1.6}}>
                <div style={{textAlign:"center",marginBottom:16}}>
                  <div style={{fontSize:22,fontWeight:700}}>{previewResume.name}</div>
                  {previewResume.headerTitle && <div style={{fontSize:13,color:"#4a4a4a",marginTop:4}}>{previewResume.headerTitle}</div>}
                  <div style={{fontSize:11,color:"#666",marginTop:4}}>{previewResume.contact}</div>
                </div>
                {previewResume.summary && <div style={{marginBottom:16}}><div style={{background:"#E8F0F8",padding:"6px 10px",marginBottom:8,fontSize:11,fontWeight:700,textTransform:"uppercase"}}>Summary</div><div style={{paddingLeft:8}}>{previewResume.summary}</div></div>}
                {previewResume.workSamples?.length > 0 && <div style={{marginBottom:16}}><div style={{background:"#E8F0F8",padding:"6px 10px",marginBottom:8,fontSize:11,fontWeight:700,textTransform:"uppercase"}}>Work Samples</div><div style={{paddingLeft:8}}>{previewResume.workSamples.join("  ·  ")}</div></div>}
                {previewResume.competencies?.length > 0 && <div style={{marginBottom:16}}><div style={{background:"#E8F0F8",padding:"6px 10px",marginBottom:8,fontSize:11,fontWeight:700,textTransform:"uppercase"}}>Core Competencies</div>{previewResume.competencies.map((c,i) => <div key={i} style={{paddingLeft:8,marginBottom:4}}><strong>{c.category}:</strong> {c.items?.join(", ")}.</div>)}</div>}
                {previewResume.experience?.length > 0 && <div style={{marginBottom:16}}><div style={{background:"#E8F0F8",padding:"6px 10px",marginBottom:8,fontSize:11,fontWeight:700,textTransform:"uppercase"}}>Professional Experience</div>{previewResume.experience.map((exp,i) => <div key={i} style={{marginBottom:12,paddingLeft:8}}><div style={{fontWeight:700,fontSize:13}}>{exp.title}</div><div style={{color:"#2C5A9A",fontStyle:"italic",marginBottom:4}}>{exp.company}  ·  {exp.dates}</div><ul style={{margin:0,paddingLeft:18}}>{exp.bullets?.map((b,j) => <li key={j} style={{marginBottom:3}}>{renderBoldText(b)}</li>)}</ul></div>)}</div>}
                              </div>
            </div>
            <div className="modal-footer">
              <button className="bgh" onClick={() => setPreviewResume(null)}>CANCEL</button>
              <button className="bg" onClick={() => { generatePDF(previewResume); setPreviewResume(null); }}>↓ DOWNLOAD PDF</button>
            </div>
          </div>
        </div>
      )}

      <div style={{borderBottom:"1px solid #21262D",padding:"16px 28px"}}>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",flexWrap:"wrap",gap:12}}>
          <div>
            <div style={{fontFamily:"'Syne',sans-serif",fontSize:20,fontWeight:800,letterSpacing:"-0.02em"}}>
              CV CHAMELEON <span style={{color:"#4ADE80",fontSize:13,fontWeight:600}}>/ BRIDGE LIST</span>
            </div>
            <div style={{fontSize:10,color:"#7D8590",marginTop:2,letterSpacing:".05em"}}>
              33 ROLES · NIGERIA-REMOTE · NO CERTS REQUIRED · <span style={{color:"#4ADE80"}}>● LIVE</span>
            </div>
          </div>
          <div style={{display:"flex",gap:8,alignItems:"center"}}>
            <button className={mode === "bridge" ? "bg" : "bgh"} onClick={() => setMode("bridge")} style={{padding:"6px 12px",fontSize:10}}>BRIDGE LIST</button>
            <button className={mode === "money" ? "bmoney" : "bgh"} onClick={() => setMode("money")} style={{padding:"6px 12px",fontSize:10}}>💰 MONEY TRACK</button>
          </div>
        </div>
      </div>

      <div style={{padding:"20px 28px",maxWidth:1200,margin:"0 auto"}}>

        {/* Work Samples Banner */}
        <div style={{background:"linear-gradient(135deg,#1A2A3A,#2A3A4A)",border:"1px solid #3D5A80",borderRadius:8,padding:16,marginBottom:20}}>
          <div style={{fontFamily:"'Syne',sans-serif",fontSize:11,fontWeight:700,color:"#7EB5F7",letterSpacing:".1em",marginBottom:10}}>YOUR KEY DIFFERENTIATOR — WORK SAMPLES</div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(200px,1fr))",gap:12}}>
            {WORK_SAMPLES.map((s,i) => (
              <div key={i} style={{background:"#0D1117",border:"1px solid #21262D",borderRadius:6,padding:12}}>
                <div style={{fontSize:12,fontWeight:600,color:"#E6EDF3",marginBottom:4}}>{s.title}</div>
                <div style={{fontSize:10,color:"#7D8590",marginBottom:4}}>{s.desc}</div>
                <div style={{fontSize:9,color:"#4ADE80",letterSpacing:".05em"}}>{s.framework}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Controls */}
        <div style={{display:"flex",gap:8,marginBottom:20,flexWrap:"wrap",alignItems:"center"}}>
          {CATEGORIES.map(cat => (
            <button key={cat} className={selectedCategory === cat ? "bp" : "bgh"} onClick={() => setSelectedCategory(cat)} style={{padding:"8px 14px",fontSize:10}}>
              {cat.toUpperCase()} {cat === "All" ? `(${BRIDGE_ROLES.length})` : `(${BRIDGE_ROLES.filter(r => r.c === cat).length})`}
            </button>
          ))}
          <div style={{flex:1}} />
          <button className="bp2" onClick={() => setShowPastePanel(p => !p)} style={{padding:"10px 18px",fontSize:11}}>
            {showPastePanel ? "✕ CLOSE" : "⊕ PASTE JD"}
          </button>
        </div>

        {/* Paste Panel */}
        {showPastePanel && (
          <div className="si" style={{background:"#161B22",border:"1px solid #6A3DAA",borderRadius:8,padding:20,marginBottom:20}}>
            <div style={{fontFamily:"'Syne',sans-serif",fontSize:12,fontWeight:700,color:"#C084FC",letterSpacing:".1em",marginBottom:14}}>PASTE REAL JOB DESCRIPTION</div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:10,marginBottom:12}}>
              {[["Job Title",pasteTitle,setPasteTitle,"e.g. Compliance Analyst"],["Company",pasteCompany,setPasteCompany,"e.g. Vanta"],["Location",pasteLocation,setPasteLocation,"e.g. Remote"]].map(([label,val,setter,ph])=>(
                <div key={label}><div style={{fontSize:9,color:"#7D8590",letterSpacing:".1em",marginBottom:5}}>{label.toUpperCase()}</div><input className="fi" value={val} onChange={e=>setter(e.target.value)} placeholder={ph} /></div>
              ))}
            </div>
            <div style={{marginBottom:12}}>
              <div style={{fontSize:9,color:"#7D8590",letterSpacing:".1em",marginBottom:5}}>FULL JOB DESCRIPTION</div>
              <textarea className="jd-input" rows={10} placeholder="Paste the complete job description…" value={pasteJD} onChange={e=>setPasteJD(e.target.value)} />
            </div>
            <div style={{display:"flex",gap:10}}>
              <button className="bp2" onClick={tailorFromPaste} disabled={pasting||!pasteJD.trim()||!pasteTitle.trim()||!pasteCompany.trim()}>
                {pasting?<span className="pulse">TAILORING…</span>:"⚡ TAILOR"}
              </button>
              <button className="bgh" onClick={()=>{setShowPastePanel(false);setPasteTitle("");setPasteCompany("");setPasteLocation("");setPasteJD("");}}>CANCEL</button>
            </div>
          </div>
        )}

        {mode === "money" ? (
          // MONEY TRACK VIEW
          <div>
            <div style={{background:"linear-gradient(135deg,#3A2A0A,#4A3A1A)",border:"2px solid #FBBF24",borderRadius:8,padding:20,marginBottom:20}}>
              <div style={{fontFamily:"'Syne',sans-serif",fontSize:16,fontWeight:800,color:"#FBBF24",marginBottom:8}}>💰 MONEY TRACK — DAYS 1-3</div>
              <div style={{fontSize:13,color:"#E6EDF3",lineHeight:1.6,marginBottom:12}}>
                Nigeria-eligible, assessment-based, pays within weeks. Apply as a <strong>finance and code specialist</strong>, not a generalist — the band difference is 3-5× the rate.
              </div>
              <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(180px,1fr))",gap:12}}>
                {TARGET_COMPANIES.aiPlatforms.map(c => (
                  <a key={c} href={`https://www.google.com/search?q=${encodeURIComponent(c + " AI training jobs")}`} target="_blank" rel="noopener noreferrer" style={{background:"#0D1117",border:"1px solid #FBBF24",borderRadius:6,padding:12,textDecoration:"none",color:"#FBBF24",fontSize:12,fontWeight:600,textAlign:"center"}}>
                    {c} →
                  </a>
                ))}
              </div>
            </div>
            <div style={{fontFamily:"'Syne',sans-serif",fontSize:12,fontWeight:700,color:"#FBBF24",marginBottom:12}}>AI CONTRACT ROLES</div>
            {BRIDGE_ROLES.filter(r => r.c === "AI contract").map((role, i) => {
              const jobId = `bridge_${role.t.replace(/\s+/g, "_")}`;
              const state = tailoring[jobId];
              const done = state && state !== "loading" && state !== "error";
              return (
                <div key={i} className="jc si" style={{marginBottom:10,borderColor:"#FBBF24"}}>
                  <div style={{display:"flex",gap:16,alignItems:"flex-start"}}>
                    <div className="score-badge" style={{background:"#3A2A0A",color:"#FBBF24"}}>{bridgeScore(role)}</div>
                    <div style={{flex:1}}>
                      <div style={{fontFamily:"'Syne',sans-serif",fontSize:14,fontWeight:700,marginBottom:4}}>{role.t}</div>
                      <div style={{fontSize:12,color:"#7D8590",marginBottom:6}}>{role.w}</div>
                      <div style={{fontSize:11,color:"#FBBF24",marginBottom:4}}>{role.pay}</div>
                      <div style={{fontSize:10,color:"#5A6470"}}>Where: {role.where}</div>
                    </div>
                    <div style={{display:"flex",flexDirection:"column",gap:6}}>
                      {!state && <button className="bmoney" onClick={() => tailorForRole(role)} style={{padding:"6px 12px",fontSize:10}}>TAILOR</button>}
                      {state === "loading" && <span className="pulse" style={{fontSize:11,color:"#FBBF24"}}>TAILORING…</span>}
                      {state === "error" && <button className="bgh" onClick={() => tailorForRole(role)} style={{color:"#F87171"}}>RETRY</button>}
                      {done && <button className="bgh" onClick={() => setPreviewResume(state)} style={{padding:"4px 10px",fontSize:9}}>👁 PREVIEW</button>}
                      {done && <button className="bmoney" onClick={() => generatePDF(state)} style={{padding:"4px 10px",fontSize:9}}>↓ PDF</button>}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          // BRIDGE LIST VIEW
          <div style={{display:"grid",gridTemplateColumns:"1fr 300px",gap:20}}>
            <div>
              {[1, 2, 3].map(tier => {
                const roles = rolesByTier[tier];
                if (roles.length === 0) return null;
                const tierInfo = TIER_LABELS[tier];
                return (
                  <div key={tier}>
                    <div className="tier-header" style={{borderColor:tierInfo.color,color:tierInfo.color}}>
                      <span>{tierInfo.name}</span>
                      <span style={{color:"#5A6470",fontWeight:400,fontSize:10,textTransform:"none"}}>{tierInfo.desc}</span>
                    </div>
                    {roles.map((role, i) => {
                      const jobId = `bridge_${role.t.replace(/\s+/g, "_")}`;
                      const state = tailoring[jobId];
                      const done = state && state !== "loading" && state !== "error";
                      const score = bridgeScore(role);
                      return (
                        <div key={i} className="jc si" style={{marginBottom:10,animationDelay:`${i*.03}s`}}>
                          <div style={{display:"flex",gap:14,alignItems:"flex-start"}}>
                            <div className="score-badge" style={{background:tier===1?"#0D2B1F":tier===2?"#2A2A0A":"#1A1A1A",color:tierInfo.color}}>{score}</div>
                            <div style={{flex:1,minWidth:0}}>
                              <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:4,flexWrap:"wrap"}}>
                                <span className="tag" style={{background:`${tierInfo.color}22`,color:tierInfo.color,border:`1px solid ${tierInfo.color}44`}}>{role.c}</span>
                                <span style={{fontSize:11,color:"#4ADE80"}}>{role.pay}</span>
                              </div>
                              <div style={{fontFamily:"'Syne',sans-serif",fontSize:14,fontWeight:700,marginBottom:4}}>{role.t}</div>
                              <div style={{fontSize:12,color:"#7D8590",lineHeight:1.5,marginBottom:6}}>{role.w}</div>
                              <div style={{fontSize:10,color:"#5A6470"}}>Where: {role.where}</div>
                              <div style={{display:"flex",gap:12,marginTop:8}}>
                                {["FIT","ODDS","DEM","SPD"].map((k,j) => (
                                  <div key={k} style={{flex:1,maxWidth:60}}>
                                    <div style={{fontSize:8,color:"#5A6470",marginBottom:2}}>{k}</div>
                                    <div className="bar"><div className="bar-fill" style={{width:`${role[k.toLowerCase().replace("dem","dem").replace("spd","spd")]*10}%`,background:tierInfo.color}} /></div>
                                  </div>
                                ))}
                              </div>
                            </div>
                            <div style={{display:"flex",flexDirection:"column",gap:6,minWidth:80}}>
                              {!state && <button className="bg" onClick={() => tailorForRole(role)} style={{padding:"6px 12px",fontSize:10}}>TAILOR</button>}
                              {state === "loading" && <span className="pulse" style={{fontSize:10,color:"#F59E0B"}}>TAILORING…</span>}
                              {state === "error" && <button className="bgh" onClick={() => tailorForRole(role)} style={{color:"#F87171",fontSize:10}}>RETRY</button>}
                              {done && <button className="bgh" onClick={() => setPreviewResume(state)} style={{padding:"4px 10px",fontSize:9}}>👁 PREVIEW</button>}
                              {done && <button className="bg" onClick={() => generatePDF(state)} style={{padding:"4px 10px",fontSize:9}}>↓ PDF</button>}
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
              <div style={{background:"#161B22",border:"1px solid #21262D",borderRadius:8,overflow:"hidden",position:"sticky",top:16}}>
                <div style={{padding:"10px 14px",borderBottom:"1px solid #21262D",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                  <span style={{fontFamily:"'Syne',sans-serif",fontSize:10,fontWeight:700,color:"#7D8590",letterSpacing:".1em"}}>ACTIVITY LOG</span>
                  <button onClick={() => setLog([{msg:"Log cleared",type:"info",icon:"›",time:new Date().toLocaleTimeString("en-US",{hour12:false})}])} style={{fontSize:10,color:"#2D3440",background:"none",border:"none",cursor:"pointer"}}>CLEAR</button>
                </div>
                <div ref={logRef} style={{height:280,overflowY:"auto",padding:12}}>
                  {log.map((e,i)=>(
                    <div key={i} style={{fontSize:11,lineHeight:1.7,paddingBottom:3,color:e.type==="success"?"#4ADE80":e.type==="error"?"#F87171":e.type==="loading"?"#F59E0B":"#7D8590"}}>
                      <span style={{color:"#1E2A38",marginRight:8}}>{e.time}</span>{e.icon} {e.msg}
                    </div>
                  ))}
                </div>
              </div>

              {/* Target Companies */}
              <div style={{marginTop:14,background:"#161B22",border:"1px solid #21262D",borderRadius:8,padding:14}}>
                <div style={{fontFamily:"'Syne',sans-serif",fontSize:10,fontWeight:700,color:"#7EB5F7",letterSpacing:".1em",marginBottom:10}}>TARGET COMPANIES</div>
                <div style={{fontSize:10,color:"#4ADE80",marginBottom:6}}>Compliance SaaS</div>
                <div style={{fontSize:11,color:"#7D8590",marginBottom:10}}>{TARGET_COMPANIES.compliance.join(" · ")}</div>
                <div style={{fontSize:10,color:"#FBBF24",marginBottom:6}}>AI Platforms</div>
                <div style={{fontSize:11,color:"#7D8590",marginBottom:10}}>{TARGET_COMPANIES.aiPlatforms.join(" · ")}</div>
                <div style={{fontSize:10,color:"#C084FC",marginBottom:6}}>Job Boards</div>
                <div style={{fontSize:11,color:"#7D8590"}}>{TARGET_COMPANIES.jobBoards.join(" · ")}</div>
              </div>

              {/* Generated Resumes */}
              {Object.values(tailoring).filter(v => v !== "loading" && v !== "error").length > 0 && (
                <div style={{marginTop:14,background:"#161B22",border:"1px solid #2D6B4A",borderRadius:8,padding:14}}>
                  <div style={{fontFamily:"'Syne',sans-serif",fontSize:10,fontWeight:700,color:"#4ADE80",letterSpacing:".1em",marginBottom:10}}>
                    GENERATED ({Object.values(tailoring).filter(v => v !== "loading" && v !== "error").length})
                  </div>
                  {Object.values(tailoring).filter(v => v !== "loading" && v !== "error").map((r, i) => (
                    <div key={i} style={{display:"flex",justifyContent:"space-between",alignItems:"center",paddingBottom:7,marginBottom:7,borderBottom:"1px solid #1A3A2A",fontSize:11}}>
                      <span style={{color:"#7D8590",maxWidth:140,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{r.filename?.replace("Annabel_Otutu_","").replace(".pdf","")}</span>
                      <div style={{display:"flex",gap:4}}>
                        <button className="bgh" style={{padding:"2px 6px",fontSize:8}} onClick={() => setPreviewResume(r)}>👁</button>
                        <button className="bg" style={{padding:"2px 8px",fontSize:9}} onClick={() => generatePDF(r)}>↓</button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
