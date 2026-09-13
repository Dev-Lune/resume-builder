/* Keyword engine for the ATS scanner. Deterministic, the way real applicant
   tracking systems rank: extract terms a posting asks for, match them against
   the resume text with normalization and aliases, weight by how often the
   posting repeats them. No model call. */

export const STOPWORDS = new Set(
  (
    "a an the and or but if then else for to of in on at by with from as is are was were be been being this that these those we you they it he she i our your their his her its will would should could can may might must have has had do does did not no yes will able about above after again against all am any because before below between both each few more most other some such only own same so than too very s t just don now also into over under out up down off then once here there when where why how what which who whom whose your yours ours we're you're they're it's i'm we've you've role roles work working experience years year team teams strong ability skills skill knowledge good great excellent required requirement requirements responsibilities responsible plus preferred nice must-have candidate candidates looking join company companies build building help helping using use used within across including etc job position opportunity please apply per day week month across new using like across within e g ie eg using across able across"
  ).split(/\s+/),
);

/** canonical -> aliases (all lowercase, normalized). Match is case/format insensitive. */
export const SKILLS: Record<string, string[]> = {
  javascript: ["js", "ecmascript", "es6", "es2015", "vanilla js"],
  typescript: ["ts"],
  python: ["py"],
  java: [],
  kotlin: [],
  swift: [],
  "c++": ["cpp", "cplusplus"],
  "c#": ["csharp", "c sharp", "dotnet", ".net", "asp.net"],
  go: ["golang"],
  rust: [],
  ruby: ["rails", "ruby on rails", "ror"],
  php: ["laravel"],
  scala: [],
  r: [],
  sql: [],
  html: ["html5"],
  css: ["css3"],
  react: ["reactjs", "react.js"],
  "next.js": ["nextjs", "next js"],
  vue: ["vuejs", "vue.js", "nuxt"],
  angular: ["angularjs"],
  svelte: ["sveltekit"],
  "node.js": ["node", "nodejs"],
  express: ["expressjs"],
  django: [],
  flask: [],
  fastapi: [],
  spring: ["spring boot", "springboot"],
  ".net core": ["dotnet core"],
  graphql: ["apollo"],
  "rest": ["rest api", "restful", "rest apis"],
  grpc: [],
  tailwind: ["tailwindcss", "tailwind css"],
  redux: [],
  jquery: [],
  webpack: [],
  vite: [],
  "react native": ["reactnative"],
  flutter: [],
  android: [],
  ios: [],
  postgresql: ["postgres", "psql"],
  mysql: [],
  mongodb: ["mongo"],
  redis: [],
  sqlite: [],
  dynamodb: [],
  elasticsearch: ["elastic", "elk"],
  cassandra: [],
  snowflake: [],
  bigquery: [],
  aws: ["amazon web services", "ec2", "s3", "lambda", "cloudfront"],
  azure: ["microsoft azure"],
  gcp: ["google cloud", "google cloud platform"],
  docker: [],
  kubernetes: ["k8s"],
  terraform: [],
  ansible: [],
  jenkins: [],
  "github actions": ["gh actions"],
  gitlab: ["gitlab ci"],
  "ci/cd": ["cicd", "ci cd", "continuous integration", "continuous delivery", "continuous deployment"],
  cloudflare: ["workers", "cloudflare workers"],
  vercel: [],
  netlify: [],
  git: ["github", "version control"],
  linux: ["unix", "bash", "shell"],
  nginx: [],
  kafka: [],
  rabbitmq: [],
  microservices: ["microservice"],
  serverless: [],
  "rest apis": [],
  oauth: ["oauth2", "openid", "sso"],
  jwt: [],
  websockets: ["websocket", "socket.io"],
  "unit testing": ["unit tests"],
  jest: [],
  vitest: [],
  cypress: [],
  playwright: [],
  selenium: [],
  pytest: [],
  junit: [],
  tdd: ["test driven development", "test-driven development"],
  "pandas": [],
  numpy: [],
  "scikit-learn": ["sklearn", "scikit learn"],
  tensorflow: ["tf"],
  pytorch: ["torch"],
  "machine learning": ["ml"],
  "deep learning": [],
  nlp: ["natural language processing"],
  "computer vision": ["cv", "opencv"],
  "data analysis": ["data analytics"],
  "data science": [],
  "data engineering": [],
  spark: ["apache spark", "pyspark"],
  hadoop: [],
  airflow: ["apache airflow"],
  dbt: [],
  etl: ["elt"],
  tableau: [],
  "power bi": ["powerbi"],
  looker: [],
  excel: ["spreadsheets", "google sheets"],
  figma: [],
  sketch: [],
  "adobe xd": ["xd"],
  photoshop: ["adobe photoshop"],
  illustrator: ["adobe illustrator"],
  "ui design": ["user interface design"],
  "ux design": ["user experience design", "ux"],
  "ui/ux": ["ui ux", "ux/ui"],
  wireframing: ["wireframes"],
  prototyping: ["prototypes"],
  "design systems": ["design system"],
  accessibility: ["a11y", "wcag", "aria"],
  "responsive design": ["responsive"],
  agile: ["scrum", "kanban", "sprint", "sprints"],
  jira: [],
  confluence: [],
  "product management": ["product manager", "pm"],
  roadmap: ["roadmapping", "product roadmap"],
  "user research": ["ux research"],
  "a/b testing": ["ab testing", "a b testing", "experimentation"],
  analytics: ["google analytics", "ga4", "mixpanel", "amplitude"],
  seo: ["search engine optimization"],
  sem: ["google ads", "ppc"],
  "content marketing": [],
  "email marketing": ["mailchimp", "klaviyo"],
  "social media": ["social media marketing"],
  hubspot: [],
  salesforce: ["crm", "sfdc"],
  "google ads": ["adwords"],
  "meta ads": ["facebook ads"],
  copywriting: ["copy writing"],
  "project management": ["project manager"],
  stakeholder: ["stakeholder management", "stakeholders"],
  budgeting: ["budget management", "budgets"],
  forecasting: ["forecast"],
  "financial modeling": ["financial modelling", "financial models"],
  accounting: ["gaap", "bookkeeping"],
  "quickbooks": [],
  sap: [],
  "supply chain": ["logistics"],
  "customer success": ["customer support", "customer service"],
  onboarding: [],
  "b2b": [],
  "b2c": [],
  saas: [],
  "go-to-market": ["gtm", "go to market"],
  negotiation: [],
  "communication": ["communication skills"],
  leadership: ["team lead", "mentoring", "mentorship"],
  "cross-functional": ["cross functional"],
  "problem solving": ["problem-solving"],
  "data visualization": ["data viz", "dataviz"],
  "api": ["apis"],
  "system design": ["systems design"],
  "distributed systems": [],
  "performance optimization": ["performance tuning", "web performance", "core web vitals", "lighthouse"],
  security: ["appsec", "infosec", "penetration testing", "pentesting"],
  "code review": ["code reviews"],
  "pair programming": [],
  "object oriented": ["oop", "object-oriented"],
  "functional programming": ["fp"],
  webrtc: [],
  "stripe": [],
  razorpay: [],
  "payment": ["payments", "payment gateway"],
  "firebase": ["firestore"],
  supabase: [],
  prisma: [],
  postman: [],
  storybook: [],
  contentful: ["cms", "sanity", "strapi"],
  wordpress: [],
  shopify: [],
};

/** Build a reverse index alias -> canonical, and the canonical list, once. */
const ALIAS_TO_CANON = new Map<string, string>();
for (const [canon, aliases] of Object.entries(SKILLS)) {
  ALIAS_TO_CANON.set(canon, canon);
  for (const a of aliases) ALIAS_TO_CANON.set(a, canon);
}
export const CANON_TERMS = Object.keys(SKILLS);

/** All surface forms we should try to find in text, longest first (so multiword wins). */
const SURFACE_FORMS = [...ALIAS_TO_CANON.keys()].sort((a, b) => b.length - a.length);

export function normalizeText(s: string): string {
  return s
    .toLowerCase()
    .replace(/[‘’“”]/g, "'")
    .replace(/[^a-z0-9+#./ ]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

const escapeRe = (s: string) => s.replace(/[.*+?^${}()|[\]\\/]/g, "\\$&");

/**
 * Count how many times a canonical skill (any surface form) appears in text.
 * Left boundary is a space (text is space-padded); right boundary allows a
 * space or a trailing "." / "/", so "ci/cd." and "React." still match while
 * "java" never matches inside "javascript".
 */
export function countSkill(canon: string, normText: string): number {
  const hay = ` ${normText} `;
  const forms = [canon, ...(SKILLS[canon] ?? [])];
  let n = 0;
  for (const f of forms) {
    const re = new RegExp(`(?<= )${escapeRe(f)}(?=[ ./])`, "g");
    n += (hay.match(re) ?? []).length;
  }
  return n;
}

export type JdKeyword = { canonical: string; label: string; freq: number; kind: "skill" | "phrase" };

const TITLE_WORDS =
  /(engineer|developer|designer|manager|analyst|scientist|architect|consultant|specialist|lead|director|administrator|coordinator|marketer|writer|strategist|accountant|recruiter|associate|intern)/i;

/** Pull the likely job title from a posting: an explicit label, else the first title-ish line. */
export function extractTitle(jd: string): string {
  const labelled = jd.match(/(?:job title|position|role)\s*[:\-]\s*(.+)/i);
  if (labelled) return labelled[1].split(/[.\n|]/)[0].trim().slice(0, 80);
  for (const raw of jd.split(/\n+/).slice(0, 6)) {
    const line = raw.trim();
    if (line.length >= 3 && line.length <= 70 && TITLE_WORDS.test(line) && !/[.!?]$/.test(line)) {
      return line.replace(/^(we're hiring|hiring|about the role)[:\s-]*/i, "").trim();
    }
  }
  return "";
}

/**
 * Extract the keywords a posting asks for, ranked by how often it repeats them.
 * Dictionary skills first (high signal), then salient capitalized multiword
 * phrases the dictionary missed.
 */
export function extractJdKeywords(jd: string): JdKeyword[] {
  const norm = normalizeText(jd);
  const out: JdKeyword[] = [];

  for (const canon of CANON_TERMS) {
    const freq = countSkill(canon, norm);
    if (freq > 0) out.push({ canonical: canon, label: prettyLabel(canon), freq, kind: "skill" });
  }

  // Capitalized multiword phrases (e.g. "Applicant Tracking", "Series B") the dictionary lacks.
  const phraseFreq = new Map<string, number>();
  const phrases = jd.match(/\b([A-Z][a-zA-Z0-9.+#]+(?:\s+[A-Z][a-zA-Z0-9.+#]+){1,2})\b/g) ?? [];
  for (const p of phrases) {
    const key = p.trim();
    const low = key.toLowerCase();
    if (key.split(/\s+/).some((w) => STOPWORDS.has(w.toLowerCase()))) continue;
    if (ALIAS_TO_CANON.has(low)) continue;
    if (/^(We|Our|You|The|This|A|An|Job|About|What|Why|How|Their)\b/.test(key)) continue;
    phraseFreq.set(key, (phraseFreq.get(key) ?? 0) + 1);
  }
  for (const [label, freq] of phraseFreq) {
    if (freq >= 2 || label.split(/\s+/).length >= 2) out.push({ canonical: label.toLowerCase(), label, freq, kind: "phrase" });
  }

  return out
    .sort((a, b) => b.freq - a.freq || (a.kind === "skill" ? -1 : 1) - (b.kind === "skill" ? -1 : 1))
    .slice(0, 40);
}

export function prettyLabel(canon: string): string {
  const special: Record<string, string> = {
    "javascript": "JavaScript",
    "typescript": "TypeScript",
    "node.js": "Node.js",
    "next.js": "Next.js",
    "ci/cd": "CI/CD",
    "ui/ux": "UI/UX",
    "a/b testing": "A/B testing",
    aws: "AWS",
    gcp: "GCP",
    sql: "SQL",
    html: "HTML",
    css: "CSS",
    seo: "SEO",
    sem: "SEM",
    nlp: "NLP",
    "c#": "C#",
    "c++": "C++",
    api: "API",
    rest: "REST",
    graphql: "GraphQL",
    oauth: "OAuth",
    tdd: "TDD",
    saas: "SaaS",
    b2b: "B2B",
    b2c: "B2C",
    crm: "CRM",
    "power bi": "Power BI",
    devops: "DevOps",
  };
  if (special[canon]) return special[canon];
  return canon.replace(/\b\w/g, (c) => c.toUpperCase());
}
