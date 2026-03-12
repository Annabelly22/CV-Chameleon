import { useState, useEffect, useRef } from "react";

const MASTER_RESUME = {
  name: "Annabel Otutu",
  contact: "Dallas, TX  ·  linkedin.com/in/annabel-otutu  ·  anabelotutu5@gmail.com",
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

// ═══════════════════════════════════════════════════════════════════════════
// STRATEGIC RESUME TAILORING SYSTEM PROMPT
// Based on the Strategic Resume Generator skill methodology
// ═══════════════════════════════════════════════════════════════════════════
const TAILOR_SYSTEM = `You are a strategic resume positioning expert whose sole mission is to get Annabel Otutu an interview. You don't just "tailor" — you WEAPONIZE her background for each specific employer.

CORE PRINCIPLE: The same background gets positioned completely differently depending on what the employer values. A defense contractor sees FAR/DFARS compliance expertise. A creative agency sees narrative flow and editorial judgment. FEMA sees emergency management planning. You identify what THIS employer values and rebuild everything through that lens.

═══ OUTPUT SCHEMA ═══

Return ONLY valid JSON starting with { matching this exact schema:

{
  "name": "Annabel Otutu",
  "headerTitle": "[Strategic title matching target role | Specialization]",
  "contact": "Dallas, TX  ·  linkedin.com/in/annabel-otutu  ·  annabelotutu5@gmail.com",
  "summary": "[3-4 sentences using employer's own language]",
  "competencies": [
    { "category": "[Category from JD]", "items": ["Item1", "Item2", "Item3", "Item4"] },
    { "category": "[Category from JD]", "items": ["Item1", "Item2", "Item3"] }
  ],
  "experience": [
    {
      "title": "[ALWAYS reframed to align with target role]",
      "company": "[Company with industry context in parentheses when helpful]",
      "dates": "[Unchanged dates]",
      "bullets": [
        "**Bold action verb phrase** rest of accomplishment with JD-specific language.",
        "**Another bold opening** connecting to a specific JD requirement."
      ]
    }
  ],
  "education": [{ "degree": "Bachelor of Science — Computer Networking and Cybersecurity", "school": "Champlain College", "focus": "[Strategic focus area if relevant to role, or empty string]" }],
  "additionalQualifications": "[Clearance status, certifications, or empty string if not applicable]",
  "filename": "Annabel_Otutu_[Company]_[Role].pdf"
}

═══ HEADER TITLE ═══

This appears under her name. It must create immediate cognitive alignment with the target role.
Examples:
- "Technical Proposal Manager | DoD & Cybersecurity Specialist" (defense)
- "Senior Technical Writer & Accessibility Analyst | Section 508 Specialist" (federal IT)
- "Content Strategist | Creative & Structured Content Lead" (agency)
- "Technical Writer & Federal Program Analyst" (federal general)
Match the JD's exact role title and add a specialization from the JD requirements.

═══ SUMMARY ═══

Formula: [Strategic title] with [X+ years] experience [scope matching JD] for [2-3 companies that signal relevant experience]. [Core expertise using exact JD terminology]. [Differentiator]. [Clearance if applicable].
- Lead with degree ONLY when it's a strategic differentiator (cybersecurity for security/compliance roles)
- Name-drop companies strategically (Microsoft for tech cred, EPA for federal cred, Parkland for healthcare)
- Every framework, tool, standard from the JD MUST appear if she can plausibly claim it
- If role requires clearance: end with "Public Trust Clearable (U.S. Citizen)."

═══ COMPETENCIES ═══

Return 4-5 categorized groups, each with 3-6 items. Categories must map directly to JD requirement clusters.
- First items in each category should be VERBATIM from the JD
- Add plausible adjacent skills the employer would value
- Order categories by importance to the target role
Example for FEMA:
  {"category": "Federal Documentation", "items": ["Operational Plans", "SOPs", "Needs Assessments", "Policy Papers"]}
  {"category": "Section 508 Compliance", "items": ["Accessibility Testing", "Document Tagging", "Alt Text", "Accessible Templates"]}

═══ EXPERIENCE ═══

COMPANY CONTEXTUALIZATION — Add industry descriptors in parentheses:
- For Karthik Consulting: "(Environmental Protection Agency)" or "(Federal Systems)" or "(Federal Defense Contractor)" — choose what matches target employer
- For Parkland Health: "(Healthcare Emergency Management)" for FEMA roles, plain for healthcare roles
- For Microsoft: "(Enterprise Documentation)" for doc roles, plain for tech roles
- For Cox Automotive: "(Enterprise Content & Knowledge Management)" 
- For Indeed.com: "(Enterprise Technical Documentation)"
Choose the contextualization that creates the strongest bridge to the target employer.

TITLE REFRAMING — ALWAYS reframe every job title to create narrative alignment with the target role. This is NOT optional. Each title should make a recruiter immediately see the connection to the job they're hiring for:
- "Contract/Proposal Analyst" → "Technical Writer & Emergency Preparedness Documentation Lead" (for FEMA)
- "Contract/Proposal Analyst" → "Contract Proposal Specialist | Federal Compliance" (for defense)
- "Contract/Proposal Analyst" → "Senior Proposal & Marketing Manager" (for marketing-heavy roles)
- "Technical Writer" → "Technical Writer & Federal Program Analyst" (for federal roles)
- "IT Technical Writer" → "Technical Documentation Specialist" (for enterprise roles)
- "Cybersecurity Technical Writer" → "Cybersecurity Documentation & Compliance Analyst" (for security roles)
- "Contract Technical Writer" → "Content Strategist & Knowledge Management Specialist" (for content roles)
Reframe EVERY title for EVERY role in the experience section. The only limits: never fabricate level changes (Junior→Senior), never invent entirely new functions not performed, dates always accurate.

BULLETS — Every bullet MUST follow this format:
"**Bold action verb + what** context/how/tool with JD-specific outcome."

Rules:
- Each bullet must map to a specific JD responsibility or requirement
- Use the JD's EXACT verbs, terminology, systems, and standards
- If JD says "operational plans" → use "operational plans"
- If JD says "Section 508" → reference Section 508
- If JD says "SharePoint" → mention SharePoint
- Cut any bullet that doesn't serve the JD. Replace with a stronger one that does
- 3-5 bullets per role. Quality over quantity. Most relevant role gets 4-5
- Least relevant roles get 2-3 tight bullets that still connect
- NO generic bullets ("responsible for", "helped with", "assisted in")
- Every bullet must feel like direct evidence for a specific JD requirement

═══ EDUCATION ═══

Keep degree and school unchanged. Add a "focus" field ONLY when it creates strategic value:
- Cybersecurity compliance role → focus: "Emphasis: Information Assurance, Network Security, Federal Compliance Frameworks"
- Emergency management → focus: "Emphasis: Critical Infrastructure Protection, Incident Response, Risk Analysis"
- Generic tech role → focus: "" (empty, not needed)

═══ ADDITIONAL QUALIFICATIONS ═══

Include ONLY if the role mentions clearance, citizenship, or certifications.
Example: "Public Trust Clearable (U.S. Citizen) · Proficient in Adobe Acrobat Pro, Microsoft Office Suite (Advanced), SharePoint"

═══ CRITICAL RULES ═══

1. Employment dates are NEVER changed
2. Core company names are never changed (but ALWAYS add context in parentheses)
3. Degree and school are never changed
4. Job titles in experience section MUST be reframed for every role — never leave them as-is
5. Every element must earn its place by connecting to the JD
6. The resume must read like Annabel wrote it specifically for this posting
7. Mirror the JD's language so closely that the resume feels like a direct response to the requirements
8. Be AGGRESSIVE — this resume must guarantee an interview`;

const TAILOR_USER = (job, master) =>
  `MASTER RESUME (raw material — titles, bullets, skills are all yours to rewrite):\n${JSON.stringify(master)}\n\nTARGET ROLE: ${job.title} at ${job.company}\nLOCATION: ${job.location}\n\nFULL JOB DESCRIPTION:\n${job.description}\n\nCRITICAL REMINDER: You MUST reframe every job title in the experience section to align with the "${job.title}" role. The original titles like "Contract/Proposal Analyst", "IT Technical Writer", "Contract Technical Writer" etc. are her ACTUAL titles but for the resume output you MUST rewrite them to create narrative alignment with this specific JD. For example, if the target is a Technical Writer role at FEMA, "Contract/Proposal Analyst" becomes "Technical Writer & Emergency Preparedness Documentation Lead", "IT Technical Writer" becomes "Technical Documentation & Knowledge Management Specialist", etc. Do NOT return the original titles unchanged.\n\nAlso MUST: add company context in parentheses (e.g. "Karthik Consulting LLC (Environmental Protection Agency)"), categorize competencies into 4-5 groups, use **bold opening** on every bullet.\n\nReturn ONLY the JSON, starting with {`;

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

const callClaude = async (system, userMsg, maxTokens = 4096) => {
  const res = await fetch("/api/claude", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ model: "claude-sonnet-4-20250514", max_tokens: maxTokens, system, messages: [{ role: "user", content: userMsg }] })
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
  .jd-input{width:100%;background:#0D1117;border:1px solid #2D3A4A;border-radius:6px;padding:12px 14px;color:#E6EDF3;font-family:'DM Mono','Courier New',monospace;font-size:11px;outline:none;resize:vertical;line-height:1.6;transition:border-color .2s}
  .jd-input:focus{border-color:#6A3DAA}
  .jd-input::placeholder{color:#2D3A4A}
  .fi{background:#0D1117;border:1px solid #2D3A4A;border-radius:5px;padding:8px 10px;color:#E6EDF3;font-family:'DM Mono','Courier New',monospace;font-size:11px;outline:none;width:100%;transition:border-color .2s}
  .fi:focus{border-color:#6A3DAA}
  .fi::placeholder{color:#2D3A4A}
`;

export default function App() {
  const [phase, setPhase] = useState("idle");
  const [jobs, setJobs] = useState([]);
  const [tailoring, setTailoring] = useState({});
  const [log, setLog] = useState([{ msg: "CV Chameleon ready — find jobs or paste a JD", type: "success", icon: "✓", time: new Date().toLocaleTimeString("en-US",{hour12:false}) }]);
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

  useEffect(() => {
    const s = document.createElement("script");
    s.src = "https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js";
    s.onload = () => setJsPDFReady(true);
    document.head.appendChild(s);
  }, []);

  useEffect(() => { if (logRef.current) logRef.current.scrollTop = logRef.current.scrollHeight; }, [log]);

  const addLog = (msg, type = "info") => {
    const icons = { info: "›", success: "✓", error: "✗", loading: "⟳" };
    setLog(prev => [...prev, { msg, type, icon: icons[type], time: new Date().toLocaleTimeString("en-US",{hour12:false}) }]);
  };

  const findJobs = async () => {
    setPhase("searching"); setJobs([]); setTailoring({});
    addLog("Querying Google Jobs via SerpAPI…", "loading");
    try {
      const results = await searchJobs(titles, locations);
      if (!results.length) { addLog("No results — try different titles or locations", "error"); setPhase("idle"); return; }
      setJobs(results);
      addLog(`${results.length} live jobs found`, "success");
      setPhase("results");
    } catch(e) {
      addLog(`Search error: ${e.message}`, "error");
      setPhase("idle");
    }
  };

  const tailorResume = async (job) => {
    setTailoring(prev => ({ ...prev, [job.id]: "loading" }));
    addLog(`Tailoring for ${job.company}…`, "loading");
    try {
      const text = await callClaude(TAILOR_SYSTEM, TAILOR_USER(job, MASTER_RESUME), 4096);
      const clean = text.replace(/```json\s*/g,"").replace(/```\s*/g,"").trim();
      const jsonStart = clean.indexOf("{");
      if (jsonStart === -1) throw new Error("No JSON in response");
      const parsed = JSON.parse(clean.slice(jsonStart));
      // Ensure filename exists
      if (!parsed.filename) {
        const co = (job.company||"Co").replace(/[^a-z0-9]/gi,"_").slice(0,20);
        const role = (job.title||"Role").replace(/[^a-z0-9]/gi,"_").slice(0,25);
        parsed.filename = `Annabel_Otutu_${co}_${role}.pdf`;
      }
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
      title: pasteTitle.trim(), company: pasteCompany.trim(),
      location: pasteLocation.trim() || "Remote",
      url: "#", companyUrl: "#", source: "Pasted",
      description: pasteJD.trim(), salary: null, posted: "Now", applyOptions: []
    };
    addLog(`Tailoring pasted JD — ${job.company}…`, "loading");
    try {
      const text = await callClaude(TAILOR_SYSTEM, TAILOR_USER(job, MASTER_RESUME), 4096);
      const clean = text.replace(/```json\s*/g,"").replace(/```\s*/g,"").trim();
      const jsonStart = clean.indexOf("{");
      if (jsonStart === -1) throw new Error("No JSON in response");
      const parsed = JSON.parse(clean.slice(jsonStart));
      if (!parsed.filename) {
        const co = job.company.replace(/[^a-z0-9]/gi,"_").slice(0,20);
        const role = job.title.replace(/[^a-z0-9]/gi,"_").slice(0,25);
        parsed.filename = `Annabel_Otutu_${co}_${role}.pdf`;
      }
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

  // ═══════════════════════════════════════════════════════════════════════
  // PDF GENERATION — Matches skill spec: bold-opening bullets,
  // categorized competencies, header title, section backgrounds
  // ═══════════════════════════════════════════════════════════════════════
  const generatePDF = (r) => {
    if (!jsPDFReady || !window.jspdf) { alert("PDF loading, try again in a moment."); return; }
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF({ unit: "mm", format: "letter" });
    const pW = 215.9, m = 12.7, cW = pW - m * 2; // 0.5in margins
    let y = 14;

    // Colors from skill spec
    const C_HEADER = [26, 26, 26];     // #1a1a1a
    const C_ACCENT = [44, 90, 160];    // #2c5aa0
    const C_BODY = [42, 42, 42];       // #2a2a2a
    const C_SEC = [74, 74, 74];        // #4a4a4a
    const C_BG = [232, 240, 248];      // #e8f0f8

    const checkPage = (need) => { if (y + need > 264) { doc.addPage(); y = 14; } };

    // Helper: render bullet text with bold opening
    const renderBullet = (text, x, maxW) => {
      const boldMatch = text.match(/^\*\*(.*?)\*\*\s*(.*)/);
      if (boldMatch) {
        const boldPart = boldMatch[1];
        const rest = boldMatch[2];
        const full = `\u2022 ${boldPart} ${rest}`;
        // We'll render the whole thing as normal text but bold the first part
        // jsPDF limitation: split first, then render line by line with mixed fonts
        const testLines = doc.setFont("helvetica","normal").setFontSize(9.5).splitTextToSize(`\u2022 ${boldPart} ${rest}`, maxW);
        
        // Simple approach: render full text, then overlay bold portion
        // Better approach: render bold part, measure, continue with normal
        const bulletStr = "\u2022 ";
        const bulletW = doc.getStringUnitWidth(bulletStr) * 9.5 / doc.internal.scaleFactor;
        
        checkPage(testLines.length * 4.2 + 2);
        
        // Render line by line
        let remaining = `${boldPart} ${rest}`;
        let lineX = x;
        let isFirstLine = true;
        let boldRemaining = boldPart.length;
        
        for (const line of testLines) {
          let lineText = line;
          if (isFirstLine) {
            // Draw bullet
            doc.setFont("helvetica","normal").setFontSize(9.5).setTextColor(...C_BODY);
            doc.text("\u2022 ", lineX, y);
            lineText = line.substring(2); // Remove "• "
            lineX = x + bulletW;
          } else {
            lineX = x + 2;
          }
          
          if (boldRemaining > 0) {
            // Part of this line is bold
            const charsInLine = lineText.length;
            const boldChars = Math.min(boldRemaining, charsInLine);
            const boldText = lineText.substring(0, boldChars);
            const normalText = lineText.substring(boldChars);
            
            doc.setFont("helvetica","bold").setFontSize(9.5).setTextColor(...C_HEADER);
            doc.text(boldText, lineX, y);
            
            if (normalText) {
              const boldW = doc.getStringUnitWidth(boldText) * 9.5 / doc.internal.scaleFactor;
              doc.setFont("helvetica","normal").setFontSize(9.5).setTextColor(...C_BODY);
              doc.text(normalText, lineX + boldW, y);
            }
            boldRemaining -= boldChars;
          } else {
            doc.setFont("helvetica","normal").setFontSize(9.5).setTextColor(...C_BODY);
            doc.text(lineText, lineX, y);
          }
          
          y += 4.2;
          isFirstLine = false;
        }
        y += 1;
      } else {
        // No bold markers — render as plain bullet
        const lines = doc.setFont("helvetica","normal").setFontSize(9.5).splitTextToSize(`\u2022 ${text}`, maxW);
        checkPage(lines.length * 4.2 + 2);
        doc.setTextColor(...C_BODY);
        doc.text(lines, x, y);
        y += lines.length * 4.2 + 1;
      }
    };

    // Section header with background
    const sectionHeader = (title) => {
      checkPage(14);
      y += 3;
      doc.setFillColor(...C_BG);
      doc.setDrawColor(...C_ACCENT);
      doc.roundedRect(m, y - 4, cW, 7, 0.5, 0.5, "FD");
      doc.setFont("helvetica","bold").setFontSize(10).setTextColor(...C_HEADER);
      doc.text(title.toUpperCase(), m + 3, y + 0.5);
      y += 8;
    };

    // ── NAME ──
    doc.setFont("helvetica","bold").setFontSize(18).setTextColor(...C_HEADER);
    doc.text(r.name || "Annabel Otutu", pW / 2, y, { align: "center" });
    y += 5;

    // ── HEADER TITLE ──
    if (r.headerTitle) {
      doc.setFont("helvetica","normal").setFontSize(11).setTextColor(...C_SEC);
      doc.text(r.headerTitle, pW / 2, y, { align: "center" });
      y += 5;
    }

    // ── CONTACT ──
    doc.setFont("helvetica","normal").setFontSize(9).setTextColor(...C_SEC);
    doc.text(r.contact || "Dallas, TX  \u00B7  linkedin.com/in/annabel-otutu  \u00B7  annabellotutu@gmail.com", pW / 2, y, { align: "center" });
    y += 3;

    // Divider
    doc.setDrawColor(...C_ACCENT);
    doc.setLineWidth(0.6);
    doc.line(m, y, pW - m, y);
    y += 6;

    // ── SUMMARY ──
    if (r.summary) {
      sectionHeader("Summary");
      const sumLines = doc.setFont("helvetica","normal").setFontSize(9.5).splitTextToSize(r.summary, cW - 6);
      doc.setTextColor(...C_BODY);
      doc.text(sumLines, m + 3, y);
      y += sumLines.length * 4.5 + 4;
    }

    // ── CORE COMPETENCIES ──
    const comps = r.competencies || [];
    if (comps.length > 0) {
      sectionHeader("Core Competencies");
      comps.forEach(comp => {
        checkPage(8);
        const label = `${comp.category}: `;
        const items = (comp.items || []).join(", ") + ".";
        
        doc.setFont("helvetica","bold").setFontSize(9.5).setTextColor(...C_HEADER);
        const labelW = doc.getStringUnitWidth(label) * 9.5 / doc.internal.scaleFactor;
        doc.text(label, m + 3, y);
        
        // Wrap the items text
        const itemsMaxW = cW - 6 - labelW;
        const firstLineItems = doc.setFont("helvetica","normal").setFontSize(9.5).splitTextToSize(items, itemsMaxW);
        doc.setTextColor(...C_BODY);
        
        if (firstLineItems.length === 1) {
          doc.text(items, m + 3 + labelW, y);
          y += 5;
        } else {
          // First line next to label
          doc.text(firstLineItems[0], m + 3 + labelW, y);
          y += 4.5;
          // Remaining lines full width
          if (firstLineItems.length > 1) {
            const rest = items.substring(firstLineItems[0].length).trim();
            const restLines = doc.splitTextToSize(rest, cW - 6);
            doc.text(restLines, m + 3, y);
            y += restLines.length * 4.5;
          }
        }
      });
      y += 2;
    } else if (r.skills && r.skills.length > 0) {
      // Fallback: flat skills array (backward compatibility)
      sectionHeader("Core Competencies");
      doc.setFont("helvetica","normal").setFontSize(9.5).setTextColor(...C_BODY);
      for (let i = 0; i < r.skills.length; i += 3) {
        checkPage(6);
        doc.text(r.skills.slice(i, i + 3).join("   \u00B7   "), m + 3, y);
        y += 4.5;
      }
      y += 2;
    }

    // ── PROFESSIONAL EXPERIENCE ──
    if (r.experience?.length) {
      sectionHeader("Professional Experience");
      r.experience.forEach(j => {
        checkPage(18);
        // Job title
        doc.setFont("helvetica","bold").setFontSize(10.5).setTextColor(...C_HEADER);
        doc.text(j.title || "", m + 1, y);
        y += 4.5;
        // Company + dates
        doc.setFont("helvetica","italic").setFontSize(9.5).setTextColor(...C_ACCENT);
        doc.text(`${j.company || ""}  \u00B7  ${j.dates || ""}`, m + 1, y);
        y += 5;
        // Bullets
        (j.bullets || []).forEach(b => {
          renderBullet(b, m + 3, cW - 6);
        });
        y += 3;
      });
    }

    // ── EDUCATION ──
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
        if (e.focus) {
          doc.setFont("helvetica","italic").setFontSize(9).setTextColor(...C_SEC);
          doc.text(e.focus, m + 3, y);
          y += 4;
        }
      });
    }

    // ── ADDITIONAL QUALIFICATIONS ──
    if (r.additionalQualifications) {
      sectionHeader("Additional Qualifications");
      const aqLines = doc.setFont("helvetica","normal").setFontSize(9.5).splitTextToSize(r.additionalQualifications, cW - 6);
      doc.setTextColor(...C_BODY);
      doc.text(aqLines, m + 3, y);
    }

    doc.save(r.filename || "Annabel_Otutu_Resume.pdf");
    addLog(`Downloaded: ${r.filename}`, "success");
  };

  const srcColor = { "LinkedIn":"#0A66C2","Indeed":"#2164F3","Builtin":"#6C47FF","Company Site":"#059669","Google Jobs":"#4285F4","Pasted":"#9333EA" };

  return (
    <div style={{minHeight:"100vh",background:"#0D1117",color:"#E6EDF3",fontFamily:"'DM Mono','Courier New',monospace"}}>
      <style>{STYLES}</style>

      <div style={{borderBottom:"1px solid #21262D",padding:"16px 28px",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
        <div>
          <div style={{fontFamily:"'Syne',sans-serif",fontSize:20,fontWeight:800,color:"#E6EDF3",letterSpacing:"-0.02em"}}>CV CHAMELEON <span style={{color:"#3D6B9A",fontSize:13,fontWeight:600}}>/ ANNABEL OTUTU</span></div>
          <div style={{fontSize:10,color:"#7D8590",marginTop:2,letterSpacing:".05em"}}>FIND · TAILOR · DOWNLOAD  ·  <span style={{color:"#4ADE80"}}>● LIVE</span></div>
        </div>
        <span style={{fontSize:10,color:jsPDFReady?"#4ADE80":"#F59E0B",letterSpacing:".08em"}}>{jsPDFReady?"● PDF READY":"⟳ PDF LOADING"}</span>
      </div>

      <div style={{padding:"20px 28px",maxWidth:1100,margin:"0 auto"}}>

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
              <div style={{fontSize:9,color:"#7D8590",letterSpacing:".1em",marginBottom:5}}>JOB DESCRIPTION — paste the FULL text for maximum targeting precision</div>
              <textarea className="jd-input" rows={12} placeholder="Paste the complete job description. Every responsibility, qualification, tool, standard, and cultural signal feeds directly into strategic positioning of every bullet, skill, and summary line…" value={pasteJD} onChange={e=>setPasteJD(e.target.value)} />
            </div>
            <div style={{display:"flex",gap:10,alignItems:"center"}}>
              <button className="bp2" onClick={tailorFromPaste} disabled={pasting||!pasteJD.trim()||!pasteTitle.trim()||!pasteCompany.trim()}>
                {pasting?<span className="pulse">TAILORING…</span>:"⚡ TAILOR FROM JD"}
              </button>
              <button className="bgh" onClick={()=>{setShowPastePanel(false);setPasteTitle("");setPasteCompany("");setPasteLocation("");setPasteJD("");}}>CANCEL</button>
              {(!pasteTitle.trim()||!pasteCompany.trim()||!pasteJD.trim())&&<span style={{fontSize:10,color:"#3D4A5A"}}>Title, company and JD required</span>}
            </div>
          </div>
        )}

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
                    {group.titles.map(t=>{const checked=titles.includes(t);const atMax=titles.length>=10&&!checked;return(
                      <div key={t} onClick={()=>{if(atMax)return;setTitles(p=>checked?p.filter(x=>x!==t):[...p,t]);}} style={{display:"flex",alignItems:"center",gap:10,padding:"6px 14px",cursor:atMax?"not-allowed":"pointer",opacity:atMax?.35:1}} onMouseEnter={e=>{if(!atMax)e.currentTarget.style.background="#1B2A4A33"}} onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
                        <div style={{width:13,height:13,borderRadius:3,border:`1.5px solid ${checked?group.color:"#3D4A5A"}`,background:checked?group.color:"transparent",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,transition:"all .15s"}}>{checked&&<span style={{color:"#0D1117",fontSize:9,fontWeight:700,lineHeight:1}}>✓</span>}</div>
                        <span style={{fontSize:11,color:checked?"#E6EDF3":"#7D8590"}}>{t}</span>
                      </div>
                    );})}
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

          {jobs.length>0&&<button className="bg" onClick={()=>jobs.forEach(j=>{if(!tailoring[j.id]||tailoring[j.id]==="error")tailorResume(j);})} disabled={jobs.every(j=>tailoring[j.id]&&tailoring[j.id]!=="error")}>TAILOR ALL</button>}
          {jobs.length>0&&<span style={{fontSize:11,color:"#3D4A5A"}}>{jobs.length} JOBS</span>}
        </div>

        <div style={{display:"grid",gridTemplateColumns:"1fr 340px",gap:18}}>
          <div>
            {phase==="idle"&&!jobs.length&&(
              <div style={{textAlign:"center",padding:"60px 0",color:"#2D3A4A"}}>
                <div style={{fontFamily:"'Syne',sans-serif",fontSize:36,fontWeight:800,letterSpacing:"-0.03em",marginBottom:8}}>READY</div>
                <div style={{fontSize:11,letterSpacing:".08em",lineHeight:1.9}}>Search live job boards  ·  or paste any JD directly<br/>Resume strategically positioned for each role via Claude<br/>Download formatted PDF per application</div>
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
                        {state.headerTitle&&<div style={{fontSize:10,color:"#C084FC",marginBottom:3}}>{state.headerTitle}</div>}
                        <div style={{fontSize:11,color:"#7D8590",fontStyle:"italic",lineHeight:1.5}}>"{state.summary?.slice(0,180)}…"</div>
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
