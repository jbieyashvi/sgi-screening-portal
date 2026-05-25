export const requisitions = [
  {
    id: "REQ-2715",
    title: "Senior Data Analyst",
    location: "Atlanta, GA",
    applicants: 1474,
    status: "Active",
    adpSync: "Synced",
    lastSync: "2 min ago",
    department: "Analytics",
    posted: "2026-04-18",
  },
  {
    id: "REQ-2701",
    title: "Regional Performance Manager",
    location: "Austin, TX",
    applicants: 340,
    status: "Active",
    adpSync: "Synced",
    lastSync: "11 min ago",
    department: "Operations",
    posted: "2026-04-10",
  },
  {
    id: "REQ-2698",
    title: "BSC Representative",
    location: "Greenville, SC",
    applicants: 89,
    status: "Active",
    adpSync: "Pending",
    lastSync: "1 hr ago",
    department: "Customer Service",
    posted: "2026-04-05",
  },
  {
    id: "REQ-2690",
    title: "Field Sales",
    location: "Austin, TX",
    applicants: 210,
    status: "Active",
    adpSync: "Synced",
    lastSync: "23 min ago",
    department: "Sales",
    posted: "2026-03-30",
  },
  {
    id: "REQ-2680",
    title: "Claims Adjuster",
    location: "Indianapolis, IN",
    applicants: 56,
    status: "Closed",
    adpSync: "Synced",
    lastSync: "—",
    department: "Claims",
    posted: "2026-02-14",
  },
  {
    id: "REQ-2675",
    title: "Marketing Coordinator",
    location: "Atlanta, GA",
    applicants: 0,
    status: "Draft",
    adpSync: "Not Synced",
    lastSync: "—",
    department: "Marketing",
    posted: "2026-05-20",
  },
];

// Helper: build a candidate with sensible defaults
const make = (o) => ({
  reqId: "REQ-2715",
  sponsorship: false,
  hybridOK: true,
  sql: "Advanced",
  industry: "Insurance / Warranty",
  ...o,
  activity: o.activity || [
    { date: o.applied, text: "Applied via ADP" },
    {
      date: o.applied,
      text:
        o.status === "Knocked Out"
          ? `AI knocked out — ${o.knockoutReason || "criteria mismatch"}`
          : o.match
          ? `AI screened — ${o.match}% match`
          : "AI screened",
    },
    ...(o.status === "Screening"
      ? [{ date: o.applied, text: "Advanced to Screening by recruiter" }]
      : []),
    ...(o.status === "Declined"
      ? [{ date: o.applied, text: "Declined by recruiter" }]
      : []),
  ],
});

// ---------------- TO REVIEW ----------------
const toReview = [
  make({
    id: "c1",
    name: "Marcus Reid",
    title: "Senior Data Analyst",
    location: "Duluth, GA",
    applied: "2026-05-19",
    years: 7,
    match: 94,
    status: "To Review",
    aiSummary:
      "Marcus brings 7 years of analytics experience with deep SQL chops and a track record building executive dashboards in the warranty industry. Currently leads a small analytics pod at AssuranceX, owns the full ETL → BI stack, and ships forecasts that drive renewal pricing. Strong geographic fit (Atlanta metro), no sponsorship needed, and explicitly comfortable with hybrid.",
    checks: {
      Location: true,
      Sponsorship: true,
      Hybrid: true,
      Experience: true,
      SQL: true,
      "Industry match": true,
    },
    experience: [
      { role: "Lead Data Analyst", company: "AssuranceX", years: "2023 – Present" },
      { role: "Senior Data Analyst", company: "Cox Automotive", years: "2020 – 2023" },
      { role: "Data Analyst", company: "Equifax", years: "2018 – 2020" },
    ],
    screening: [
      { q: "Authorized to work in US without sponsorship?", a: "Yes" },
      { q: "Open to hybrid (3 days onsite, Atlanta HQ)?", a: "Yes" },
      { q: "Years of SQL experience?", a: "7+" },
    ],
  }),
  make({
    id: "c2",
    name: "Aisha Patel",
    title: "Data Analyst II",
    location: "Woodstock, GA",
    applied: "2026-05-18",
    years: 6,
    match: 89,
    industry: "Fintech",
    status: "To Review",
    aiSummary:
      "Aisha has 6 years of analytics experience, most recently leading customer-segmentation work at a fintech. Strong SQL + Python, has built Tableau and Looker stacks from scratch. Local to Atlanta metro, no sponsorship needed. Industry is fintech rather than warranty — minor gap but transferable.",
    checks: { Location: true, Sponsorship: true, Hybrid: true, Experience: true, SQL: true, "Industry match": false },
    experience: [
      { role: "Senior Analyst", company: "Kabbage", years: "2022 – Present" },
      { role: "Data Analyst", company: "Mailchimp", years: "2019 – 2022" },
    ],
    screening: [
      { q: "Authorized to work in US without sponsorship?", a: "Yes" },
      { q: "Open to hybrid?", a: "Yes" },
      { q: "Years of SQL experience?", a: "6" },
    ],
  }),
  make({
    id: "c3",
    name: "David Kim",
    title: "Data Analyst",
    location: "Marietta, GA",
    applied: "2026-05-15",
    years: 5,
    match: 82,
    industry: "Insurance",
    status: "To Review",
    aiSummary:
      "David has 5 years of analytics experience including 3 in insurance. Strong SQL, comfortable with hybrid, Atlanta-local. Good baseline fit; slightly less senior than the top picks.",
    checks: { Location: true, Sponsorship: true, Hybrid: true, Experience: true, SQL: true, "Industry match": true },
    experience: [
      { role: "Data Analyst", company: "Aflac", years: "2022 – Present" },
      { role: "Analyst", company: "State Farm", years: "2020 – 2022" },
    ],
    screening: [
      { q: "Authorized to work without sponsorship?", a: "Yes" },
      { q: "Hybrid OK?", a: "Yes" },
    ],
  }),
  make({
    id: "c4",
    name: "James Lim",
    title: "Analyst",
    location: "Alpharetta, GA",
    applied: "2026-05-17",
    years: 5,
    match: 76,
    sql: "Intermediate",
    industry: "Retail",
    status: "To Review",
    aiSummary:
      "James has 5 years of analytics experience in retail. Solid intermediate SQL and Excel, less depth on modern BI tooling. Atlanta-local, hybrid OK, no sponsorship. Industry gap is larger here; would need ramp time on warranty domain.",
    checks: { Location: true, Sponsorship: true, Hybrid: true, Experience: true, SQL: false, "Industry match": false },
    experience: [
      { role: "Analyst", company: "Home Depot", years: "2021 – Present" },
      { role: "Junior Analyst", company: "Macy's", years: "2019 – 2021" },
    ],
    screening: [
      { q: "Hybrid OK?", a: "Yes" },
      { q: "Years of SQL?", a: "5" },
    ],
  }),
  make({
    id: "c5",
    name: "Priya Shah",
    title: "BI Analyst",
    location: "Sandy Springs, GA",
    applied: "2026-05-21",
    years: 4,
    match: 71,
    sponsorship: true,
    sql: "Intermediate",
    industry: "Healthcare",
    status: "To Review",
    aiSummary:
      "Priya has 4 years of BI experience in healthcare. Requires H1B sponsorship — SGI policy on this role does not support sponsorship. Otherwise a reasonable skills fit.",
    checks: { Location: true, Sponsorship: false, Hybrid: true, Experience: false, SQL: false, "Industry match": false },
    experience: [
      { role: "BI Analyst", company: "Emory Healthcare", years: "2022 – Present" },
    ],
    screening: [{ q: "Sponsorship required?", a: "Yes (H1B transfer)" }],
  }),
  make({
    id: "c6",
    name: "Ryan Thompson",
    title: "Business Analyst",
    location: "Buckhead, GA",
    applied: "2026-05-13",
    years: 4,
    match: 68,
    sql: "Intermediate",
    industry: "Banking",
    status: "To Review",
    aiSummary:
      "Ryan has 4 years of business analysis experience at a regional bank. Comfortable with SQL and Tableau but lighter on the modeling side. Strong communicator — would likely partner well with finance. Atlanta-local, hybrid OK.",
    checks: { Location: true, Sponsorship: true, Hybrid: true, Experience: false, SQL: false, "Industry match": false },
    experience: [
      { role: "Business Analyst", company: "Truist", years: "2022 – Present" },
      { role: "Operations Analyst", company: "Regions Bank", years: "2020 – 2022" },
    ],
    screening: [
      { q: "Hybrid OK?", a: "Yes" },
      { q: "SQL proficiency?", a: "Intermediate" },
    ],
  }),
  make({
    id: "c7",
    name: "Sarah Johnson",
    title: "Data Analyst III",
    location: "Decatur, GA",
    applied: "2026-05-11",
    years: 5,
    match: 65,
    sql: "Intermediate",
    industry: "E-commerce",
    status: "To Review",
    aiSummary:
      "Sarah is a mid-level analyst with 5 years at an Atlanta e-commerce company. Strong reporting fundamentals but limited exposure to predictive modeling. Atlanta-local, ready to start within 2 weeks.",
    checks: { Location: true, Sponsorship: true, Hybrid: true, Experience: true, SQL: false, "Industry match": false },
    experience: [
      { role: "Data Analyst III", company: "Mailchimp", years: "2021 – Present" },
      { role: "Analyst", company: "Groupon", years: "2019 – 2021" },
    ],
    screening: [
      { q: "Hybrid OK?", a: "Yes" },
      { q: "Start date?", a: "2 weeks notice" },
    ],
  }),
  make({
    id: "c8",
    name: "Kevin Park",
    title: "Analytics Engineer",
    location: "Smyrna, GA",
    applied: "2026-05-09",
    years: 3,
    match: 62,
    industry: "SaaS",
    status: "To Review",
    aiSummary:
      "Kevin is an analytics engineer with strong dbt and Snowflake skills but only 3 years of experience — slightly below the senior bar. Could be a stretch hire if pipeline ownership is a priority. Atlanta-local, no sponsorship.",
    checks: { Location: true, Sponsorship: true, Hybrid: true, Experience: false, SQL: true, "Industry match": false },
    experience: [
      { role: "Analytics Engineer", company: "Calendly", years: "2023 – Present" },
      { role: "Data Analyst", company: "MailerLite", years: "2022 – 2023" },
    ],
    screening: [
      { q: "Years of experience?", a: "3" },
      { q: "dbt experience?", a: "Yes — 2 years" },
    ],
  }),
];

// ---------------- SCREENING ----------------
const screening = [
  make({
    id: "s1",
    name: "Emily Chen",
    title: "Senior Analyst",
    location: "Atlanta, GA",
    applied: "2026-05-08",
    years: 8,
    match: 91,
    status: "Screening",
    aiSummary:
      "Emily is a strong senior candidate — 8 years across warranty and insurance analytics, currently at a competitor. Has led teams of 3-4 analysts, owns roadmap planning, and is comfortable presenting to VPs. Already in panel interviews.",
    checks: { Location: true, Sponsorship: true, Hybrid: true, Experience: true, SQL: true, "Industry match": true },
    experience: [
      { role: "Senior Analyst", company: "Asurion", years: "2022 – Present" },
      { role: "Analyst", company: "Allstate", years: "2018 – 2022" },
    ],
    screening: [
      { q: "Open to hybrid?", a: "Yes" },
      { q: "Notice period?", a: "3 weeks" },
    ],
  }),
  make({
    id: "s2",
    name: "Michael Torres",
    title: "Data Lead",
    location: "Marietta, GA",
    applied: "2026-05-06",
    years: 9,
    match: 87,
    industry: "Insurance",
    status: "Screening",
    aiSummary:
      "Michael has 9 years of analytics leadership experience including 4 at a top-3 P&C insurer. Comfortable scoping multi-quarter roadmaps and partnering with finance. Stronger on people-leadership than IC depth — fit depends on team structure.",
    checks: { Location: true, Sponsorship: true, Hybrid: true, Experience: true, SQL: true, "Industry match": true },
    experience: [
      { role: "Data Lead", company: "Progressive", years: "2021 – Present" },
      { role: "Senior Analyst", company: "Travelers", years: "2018 – 2021" },
    ],
    screening: [
      { q: "People management experience?", a: "Yes — team of 5" },
      { q: "Hybrid OK?", a: "Yes" },
    ],
  }),
  make({
    id: "s3",
    name: "Priya Sharma",
    title: "BI Developer",
    location: "Alpharetta, GA",
    applied: "2026-05-05",
    years: 6,
    match: 84,
    industry: "Healthcare",
    status: "Screening",
    aiSummary:
      "Priya is a BI developer with 6 years building Power BI and Tableau stacks. Strong on data modeling and governance. Has driven multiple SSOT initiatives. Currently in technical screen stage.",
    checks: { Location: true, Sponsorship: true, Hybrid: true, Experience: true, SQL: true, "Industry match": false },
    experience: [
      { role: "BI Developer", company: "Piedmont Healthcare", years: "2021 – Present" },
      { role: "Reporting Analyst", company: "Northside Hospital", years: "2019 – 2021" },
    ],
    screening: [
      { q: "Power BI / Tableau?", a: "Both, 5+ years each" },
    ],
  }),
  make({
    id: "s4",
    name: "Jordan Williams",
    title: "Analytics Manager",
    location: "Duluth, GA",
    applied: "2026-05-04",
    years: 10,
    match: 79,
    industry: "Insurance",
    status: "Screening",
    aiSummary:
      "Jordan has 10 years experience including 6 in insurance analytics leadership. Currently managing a team of 7. SGI is exploring whether the role is the right fit at this seniority level — may slot into a higher band.",
    checks: { Location: true, Sponsorship: true, Hybrid: true, Experience: true, SQL: true, "Industry match": true },
    experience: [
      { role: "Analytics Manager", company: "Liberty Mutual", years: "2020 – Present" },
      { role: "Senior Analyst", company: "Geico", years: "2016 – 2020" },
    ],
    screening: [
      { q: "Expected comp range?", a: "$160k–$185k" },
    ],
  }),
  make({
    id: "s5",
    name: "Ashley Brown",
    title: "Data Analyst",
    location: "Roswell, GA",
    applied: "2026-05-03",
    years: 5,
    match: 74,
    industry: "Telecom",
    status: "Screening",
    aiSummary:
      "Ashley has 5 years of analytics experience at AT&T. Strong on SQL and operational reporting. Industry transition would require some ramp but skills are transferable.",
    checks: { Location: true, Sponsorship: true, Hybrid: true, Experience: true, SQL: true, "Industry match": false },
    experience: [
      { role: "Data Analyst", company: "AT&T", years: "2021 – Present" },
      { role: "Junior Analyst", company: "Cox Communications", years: "2020 – 2021" },
    ],
    screening: [
      { q: "Hybrid OK?", a: "Yes" },
    ],
  }),
  make({
    id: "s6",
    name: "Chris Lee",
    title: "SQL Analyst",
    location: "Sandy Springs, GA",
    applied: "2026-05-02",
    years: 4,
    match: 70,
    industry: "Logistics",
    status: "Screening",
    aiSummary:
      "Chris is a SQL-focused analyst with 4 years at a logistics company. Heavy on operational queries, less on visualization. Local, no sponsorship. Currently in initial screen.",
    checks: { Location: true, Sponsorship: true, Hybrid: true, Experience: false, SQL: true, "Industry match": false },
    experience: [
      { role: "SQL Analyst", company: "UPS", years: "2022 – Present" },
      { role: "Analyst Intern", company: "FedEx", years: "2021 – 2022" },
    ],
    screening: [
      { q: "Years of SQL?", a: "4" },
    ],
  }),
  make({
    id: "s7",
    name: "Nadia Patel",
    title: "Reporting Analyst",
    location: "Kennesaw, GA",
    applied: "2026-05-01",
    years: 4,
    match: 67,
    sql: "Intermediate",
    industry: "Retail",
    status: "Screening",
    aiSummary:
      "Nadia is a reporting analyst from a retail background. Comfortable with weekly/monthly executive decks. Lighter on data modeling. Recruiter advanced her based on strong soft skills.",
    checks: { Location: true, Sponsorship: true, Hybrid: true, Experience: false, SQL: false, "Industry match": false },
    experience: [
      { role: "Reporting Analyst", company: "Kroger", years: "2022 – Present" },
      { role: "Operations Analyst", company: "Publix", years: "2020 – 2022" },
    ],
    screening: [
      { q: "Hybrid OK?", a: "Yes" },
    ],
  }),
  make({
    id: "s8",
    name: "Tyler Davis",
    title: "Junior Analyst",
    location: "Chamblee, GA",
    applied: "2026-04-29",
    years: 2,
    match: 63,
    sql: "Intermediate",
    industry: "Startup",
    status: "Screening",
    aiSummary:
      "Tyler is a junior analyst with 2 years of experience. Stretch hire — recruiter is exploring fit at the junior end of the band. Strong learning velocity and SQL fundamentals.",
    checks: { Location: true, Sponsorship: true, Hybrid: true, Experience: false, SQL: false, "Industry match": false },
    experience: [
      { role: "Junior Analyst", company: "Mailchimp", years: "2024 – Present" },
      { role: "Data Intern", company: "OneTrust", years: "2023 – 2024" },
    ],
    screening: [
      { q: "Years of experience?", a: "2" },
    ],
  }),
];

// ---------------- DECLINED ----------------
const declinedTemplate = (id, name, title, applied, years, match, summary) =>
  make({
    id,
    name,
    title,
    location: "Atlanta, GA",
    applied,
    years,
    match,
    status: "Declined",
    aiSummary: summary,
    checks: { Location: true, Sponsorship: true, Hybrid: true, Experience: years >= 5, SQL: true, "Industry match": false },
    experience: [
      { role: title, company: "Confidential", years: `${2026 - years} – Present` },
      { role: "Analyst", company: "Prior Employer", years: `${2026 - years - 2} – ${2026 - years}` },
    ],
    screening: [
      { q: "Hybrid OK?", a: "Yes" },
      { q: "Notice period?", a: "2 weeks" },
    ],
  });

const declined = [
  declinedTemplate(
    "d1",
    "Robert Garcia",
    "Data Scientist",
    "2026-05-10",
    6,
    72,
    "Robert applied for the analyst role but skill profile is data-science heavy — better fit for an ML role. Declined: role mismatch."
  ),
  declinedTemplate(
    "d2",
    "Lisa Martinez",
    "Analytics Lead",
    "2026-05-07",
    11,
    81,
    "Lisa is over-qualified for this IC-leaning role and her comp expectations are above band. Declined: leveling mismatch."
  ),
  declinedTemplate(
    "d3",
    "Tom Wilson",
    "BI Analyst",
    "2026-05-06",
    4,
    66,
    "Tom's resume reads well but reference checks raised concerns about tenure. Declined: pipeline closed at recruiter discretion."
  ),
  declinedTemplate(
    "d4",
    "Amanda Clark",
    "Data Engineer",
    "2026-05-04",
    5,
    69,
    "Amanda is a strong data engineer but this role is reporting-led. Declined: skill emphasis mismatch."
  ),
  declinedTemplate(
    "d5",
    "Steven Hall",
    "Analyst",
    "2026-05-02",
    3,
    61,
    "Steven is too junior for the senior band on this req. Encouraged to apply to REQ-2698. Declined: experience below threshold."
  ),
  declinedTemplate(
    "d6",
    "Rachel Adams",
    "Senior Analyst",
    "2026-04-30",
    7,
    78,
    "Rachel performed well in screen but withdrew citing competing offer. Marked declined to clear pipeline."
  ),
  declinedTemplate(
    "d7",
    "Daniel Wright",
    "Data Analyst",
    "2026-04-28",
    5,
    73,
    "Daniel was a close pass but the team selected stronger Atlanta-local candidates. Declined: comparative ranking."
  ),
  declinedTemplate(
    "d8",
    "Jessica Lewis",
    "BI Developer",
    "2026-04-26",
    6,
    75,
    "Jessica was strong on technical screen but didn't pass team-fit panel. Declined: panel feedback."
  ),
];

// ---------------- KNOCKED OUT ----------------
const koTemplate = (id, name, title, loc, applied, years, reason, sponsorship = false) =>
  make({
    id,
    name,
    title,
    location: loc,
    applied,
    years,
    match: null,
    sponsorship,
    hybridOK: false,
    status: "Knocked Out",
    knockoutReason: reason,
    aiSummary: `Strong candidate on paper but ${reason.toLowerCase()}. AI flagged automatically based on screening criteria.`,
    checks: {
      Location: false,
      Sponsorship: !sponsorship,
      Hybrid: false,
      Experience: years >= 5,
      SQL: true,
      "Industry match": false,
    },
    experience: [
      { role: title, company: "Confidential", years: `${2026 - years} – Present` },
    ],
    screening: [
      sponsorship
        ? { q: "Sponsorship required?", a: "Yes" }
        : { q: "Open to relocation?", a: "No" },
    ],
  });

const knockedOut = [
  make({
    id: "k1",
    name: "Tanya Nguyen",
    title: "Senior Data Analyst",
    location: "Columbus, OH",
    applied: "2026-05-16",
    years: 6,
    match: null,
    hybridOK: false,
    industry: "Insurance",
    status: "Knocked Out",
    knockoutReason: "Out of state (OH) — role requires Atlanta hybrid",
    aiSummary:
      "Strong on paper — 6 years, advanced SQL, insurance industry — but candidate is based in Columbus, OH and indicated they cannot relocate. Role requires Atlanta hybrid presence.",
    checks: { Location: false, Sponsorship: true, Hybrid: false, Experience: true, SQL: true, "Industry match": true },
    experience: [{ role: "Senior Analyst", company: "Nationwide", years: "2021 – Present" }],
    screening: [{ q: "Open to relocating to Atlanta?", a: "No" }],
  }),
  make({
    id: "k2",
    name: "Brian Walsh",
    title: "Senior Analyst",
    location: "Denver, CO",
    applied: "2026-05-14",
    years: 8,
    match: null,
    hybridOK: false,
    industry: "SaaS",
    status: "Knocked Out",
    knockoutReason: "Out of state (CO) — remote not offered for this role",
    aiSummary:
      "Senior candidate with strong analytics background but based in Denver and seeking fully remote. Role is Atlanta hybrid only.",
    checks: { Location: false, Sponsorship: true, Hybrid: false, Experience: true, SQL: true, "Industry match": false },
    experience: [{ role: "Senior Analyst", company: "Salesforce", years: "2020 – Present" }],
    screening: [{ q: "Open to relocation?", a: "No, remote only" }],
  }),
  koTemplate("k3", "Alex Cooper", "Data Analyst", "Seattle, WA", "2026-05-20", 5, "Out of state (WA)"),
  koTemplate("k4", "Maria Rodriguez", "Senior Analyst", "Chicago, IL", "2026-05-18", 7, "Out of state (IL)"),
  koTemplate("k5", "John Smith", "BI Analyst", "New York, NY", "2026-05-17", 6, "Out of state (NY) + needs sponsorship", true),
  koTemplate("k6", "Emma Davis", "Data Engineer", "Austin, TX", "2026-05-15", 5, "Out of state (TX)"),
  koTemplate("k7", "Sam Brown", "Analytics Lead", "Boston, MA", "2026-05-12", 9, "Needs sponsorship", true),
  koTemplate("k8", "Nina Patel", "Data Scientist", "Phoenix, AZ", "2026-05-10", 6, "Out of state (AZ)"),
];

export const candidates = [...toReview, ...screening, ...declined, ...knockedOut];

export const funnel = [
  { stage: "Applied", count: 1474 },
  { stage: "Screened", count: 312 },
  { stage: "Interview", count: 48 },
  { stage: "Offer", count: 9 },
  { stage: "Hired", count: 6 },
];

export const analyticsMetrics = {
  timeToScreen: { value: "1.4 hrs", trend: "-62%", note: "vs manual baseline" },
  timeToHire: { value: "18 days", trend: "-9 days", note: "vs prior quarter" },
  aiAccuracy: { value: "92%", trend: "+4%", note: "recruiter agreement rate" },
  costPerHire: { value: "$1,840", trend: "-22%", note: "vs prior quarter" },
};
