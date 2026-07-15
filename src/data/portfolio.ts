// =============================================================================
// PORTFOLIO DATA — single source of truth. Edit everything here.

import { CuriousItem, Experience, Project, ProjectEntry, ProjectIcon } from "./types";

export type { CuriousItem, Experience, ExperienceProject, Project, ProjectEntry, ProjectIcon } from "./types";

// =============================================================================
export const PORTFOLIO = {
  personal: {
    name: "Shehzad Ahmed",
    title: "Senior Software & AI Automations Engineer",
    email: "shaxad.here@gmail.com",
    phone: "+92 (303) 280-4856",
    website: "https://shehzadahmed.me",
    city: "Karachi, Pakistan",
    summary:
      "Senior Software Engineer with extensive experience in full-stack development, cloud infrastructure, and CI/CD automation. Proven track record of building scalable web and mobile applications using React, TypeScript, and AWS.",
  },

  links: {
    github: "https://github.com/shaxadhere",
    linkedin: "https://linkedin.com/in/shaxadhere",
    calendly: "https://calendly.com/shaxad-here/30min",
    resume: "/api/resume",
    sourceRepo: "https://github.com/shaxadhere/portfolio-v5",
  },

  roles: [
    {
      id: "recruiter",
      index: "01",
      title: "Recruiter",
      tagline: "Hiring?",
      description:
        "Tools, skills, products, experience, education — everything you need to evaluate me.",
      href: "/recruiter",
      glyph: "◫",
    },
    {
      id: "founder",
      index: "02",
      title: "Founder",
      tagline: "Building something?",
      description:
        "See what I've shipped, what I can build for you, and book time directly.",
      href: "/founder",
      glyph: "◈",
    },
    {
      id: "curious",
      index: "03",
      title: "Just Curious",
      tagline: "Exploring?",
      description:
        "Browse my work like a macOS desktop — dock, files, and hidden gems.",
      href: "/curious",
      glyph: "◎",
    },
  ],

  recruiterNav: [
    { id: "tools", label: "Tools" },
    { id: "skills", label: "Skills" },
    { id: "products", label: "Products" },
    { id: "experience", label: "Experience" },
    { id: "education", label: "Education" },
    { id: "resume", label: "Resume" },
  ],

  founderTitleRoles: [
    "Senior Software Engineer",
    "Full-Stack Developer",
    "Product Builder",
    "Cloud Architect",
    "AI Integrator",
  ],

  tools: [
    { name: "VS Code", category: "Editor" },
    { name: "Cursor", category: "Editor" },
    { name: "GitHub", category: "Version Control" },
    { name: "GitHub Actions", category: "CI/CD" },
    { name: "AWS CDK", category: "Cloud" },
    { name: "Docker", category: "DevOps" },
    { name: "Figma", category: "Design" },
    { name: "Jira", category: "Project Mgmt" },
    { name: "Cypress", category: "Testing" },
    { name: "Postman", category: "API" },
    { name: "Claude Code", category: "AI" },
    { name: "GitHub Copilot", category: "AI" },
  ],

  skillGroups: [
    {
      label: "Programming",
      items: ["JavaScript", "TypeScript", "Node.js"],
    },
    {
      label: "Frontend",
      items: ["React.js", "React Native", "Vue.js", "Next.js"],
    },
    {
      label: "Backend",
      items: ["NestJS", "MySQL", "MongoDB"],
    },
    {
      label: "AI & Automation",
      items: ["AI Integrations", "n8n", "Zapier", "MCP Servers", "Agentic Workflows"],
    },
    {
      label: "DevOps & Cloud",
      items: ["AWS", "AWS CDK", "Azure", "CI/CD", "GitHub Actions"],
    },
    {
      label: "AI & Tools",
      items: ["GitHub Copilot", "Claude Code", "Agentic AI", "MCP Servers"],
    },
    {
      label: "Methodologies",
      items: ["Agile", "SDLC", "Jira", "Cypress E2E"],
    },
  ],

  experience: [
    {
      company: "Simplifi Pay",
      role: "Senior Software Engineer",
      location: "Dubai, UAE",
      period: "Sep 2024 — May 2026",
      // iconImage: "/company-icons/simplifi.png",
      highlights: [
        "Developed core fintech product across web and mobile, elevating performance and reliability.",
        "Built transaction reporting, receipt workflows, debit card branding, and a reusable React Web SDK.",
        "Launched public-facing B2B and B2C websites supporting marketing and sales.",
        "Introduced Cypress E2E testing and optimized API caching for faster load times.",
        "Engineered AWS CDK infrastructure and GitHub Actions CI/CD pipelines.",
        "Integrated AI agents, custom chatbots, and MCP server implementations.",
      ],
    },
    {
      company: "Koderlabs LLC",
      role: "Senior Software Engineer",
      location: "Karachi, Pakistan",
      period: "Nov 2022 — Sep 2024",
      highlights: [
        "Delivered high-performance apps across fintech, e-commerce, and enterprise domains.",
        "Led end-to-end feature development from architecture through deployment.",
        "Implemented AWS CDK and GitHub Actions for automated deployments.",
      ],
      projects: [
        {
          name: "YDrive",
          description:
            "Ride-sharing platform — built Admin, Customer, Driver apps with React, React Native, SignalR, and live map dashboards.",
        },
        {
          name: "BHealthy",
          description:
            "Online therapy system with responsive patient and therapist experiences.",
        },
        {
          name: "FishFin",
          description:
            "Fishing community social network admin panel for content and user management.",
        },
        {
          name: "DaVinci Vaporizer",
          description:
            "Full-stack device dashboard with real-time monitoring, analytics, and remote control.",
        },
        {
          name: "Range WebChat",
          description:
            "Floating chat SDK enabling lightweight, embeddable chat for client websites.",
        },
      ],
    },
    {
      company: "Fine Solutions",
      role: "Software Engineer",
      location: "Karachi, Pakistan",
      period: "Feb 2022 — Oct 2022",
      highlights: [
        "Built UrAudits auditing application frontend with responsive, intuitive UI.",
        "Led backend engineers on clean architecture and scalable API design.",
        "Developed Next.js websites and HRM system features.",
      ],
    },
    {
      company: "ARTT Business School",
      role: "Software Engineer",
      location: "Karachi, Pakistan",
      period: "Dec 2020 — Jan 2022",
      highlights: [
        "Developed LMS with DRM video lectures, Zoom live classes, and examination modules.",
        "Built accounting system financial workflows and reporting features.",
      ],
    },
    {
      company: "Marsotech",
      role: "Software Engineer",
      location: "Karachi, Pakistan",
      period: "Mar 2019 — Apr 2020",
      highlights: [
        "Developed survey web application using ASP.NET MVC and Entity Framework.",
        "Implemented data collection, storage, and reporting features.",
      ],
    },
  ] satisfies Experience[],

  education: [
    {
      school: "Virtual University",
      degree: "Bachelor of Computer Science",
      location: "Karachi, Pakistan",
      period: "2019 — 2023",
    },
    {
      school: "APTECH Computer Education",
      degree: "Advanced Diploma in Software Engineering",
      location: "Karachi, Pakistan",
      period: "2017 — 2020",
    },
  ],

  // ── PROJECTS — add / edit entries here ──────────────────────────────────────
  // Optional: iconImage: "/project-icons/my-project.png"
  projects: [
    {
      title: "Aroya Cruise Booking",
      category: "Frontend Development.",
      link: "https://aroya.com/en",
      date: "Nov 2025",
      shortDesc:
        "A modern cruise-booking frontend built to deliver a smooth, visually rich, and user-friendly reservation experience.",
      stack: "React.js, Tailwind CSS, React Query.",
      iconImage: "/icons/aroya-cruises.png",
    },
    {
      title: "Simplifi Portal",
      category: "Frontend Development.",
      link: "https://prod-portal.simplifipay.com",
      date: "Jan 2025",
      shortDesc:
        "A production-grade financial portal frontend designed for secure, seamless digital transactions and account management.",
      stack: "React.js, Tailwind CSS, Ant Design, React Query",
      iconImage: "/icons/simplifipay.png"
    },
    {
      title: "SimplifiPay Website",
      category: "Website Development.",
      link: "https://simplifipay.com/",
      date: "Sep 2025",
      shortDesc:
        "A high-performance fintech website designed to communicate SimplifiPay's payment solutions through modern UI/UX.",
      stack: "Next.js, Tailwind CSS, Framer Motion",
      iconImage: "/icons/simplifipay.png"
    },
    {
      title: "SimplifiGo Website",
      category: "Website Development.",
      link: "https://simplifigo.com/",
      date: "Sep 2025",
      shortDesc:
        "A sleek, mobile-optimized website highlighting SimplifiGo's payment offerings and customer features.",
      stack: "Next.js, Tailwind CSS, Framer Motion",
      iconImage: "/icons/simplifipay.png"
    },
    {
      title: "Income Bridge Solutions Website",
      category: "Website Development.",
      link: "https://incomebridgesolutions.com/",
      date: "April 2026",
      shortDesc:
        "A sleek, mobile-optimized website highlighting Income Bridge Solutions' services and customer features.",
      stack: "Next.js, Tailwind CSS, Framer Motion",
      iconImage: "/icons/growthbridgesolutions.png"
    },
    {
      title: "WithMe App Website",
      category: "Website Development.",
      link: "https://www.withmeapp.pk/",
      date: "April 2026",
      shortDesc:
        "A sleek, mobile-optimized website highlighting WithMe App's services and customer features.",
      stack: "Next.js, Tailwind CSS, Framer Motion",
      iconImage: "/icons/withmeapp.ico",
    },
    {
      title: "Pets Care n Cure Website",
      category: "Website Development.",
      link: "https://vets-website.vercel.app/",
      date: "April 2026",
      shortDesc:
        "A sleek, mobile-optimized website highlighting Pets Care n Cure's services and customer features.",
      stack: "Next.js, Tailwind CSS, Framer Motion",
      iconImage: "/icons/petscarencure.png"
    },
    {
      title: "AI Reel Maker",
      category: "Product Development.",
      link: "https://warzone-clip-crafter.vercel.app/",
      date: "April 2026",
      shortDesc:
        "An AI-powered web app that automatically turns your gameplay clips into shareable highlight reels.",
      stack: "Next.js, Tailwind CSS, Framer Motion",
    },
    {
      title: "Portfolio V4",
      category: "Website Development",
      link: "https://portfolio-v4-one-mu.vercel.app/",
      date: "April 2026",
      shortDesc: "A sleek, mobile-optimized website for my portfolio.",
      stack: "Next.js, Tailwind CSS, Framer Motion",
    },
    {
      title: "RunOcean Website",
      category: "Website Development.",
      link: "https://runocean-proposal.vercel.app",
      date: "Oct 2025",
      shortDesc:
        "A clean and responsive marketing website showcasing RunOcean's services and brand identity.",
      stack: "Next.js, Tailwind CSS, Vercel",
      iconImage: "/icons/ocean-logo.png"
    },
    {
      title: "Maryam Haider Portfolio",
      category: "Website Development.",
      link: "https://maryamhaider.vercel.app/",
      date: "June 2025",
      shortDesc:
        "A personal portfolio site built with premium design, animations, and a strong focus on professional presentation.",
      stack: "React.js, Chakra UI",
      iconImage: "/icons/maryam-display.jpeg"
    },
    {
      title: "Evolv LMS Admin",
      category: "Frontend Development.",
      link: "https://lms.bytetrons.com/",
      date: "Nov 2023",
      shortDesc:
        "A robust admin dashboard enabling course management, student tracking, and analytics for an LMS ecosystem.",
      stack: "React.js, Chakra UI, React Query, Redux",
      iconImage: "/icons/evolv.png"
    },
    {
      title: "YDrive Admin",
      category: "Frontend Development.",
      date: "Jan 2024",
      shortDesc:
        "A structured frontend dashboard enabling management of vehicles, drivers, and fleet operations.",
      stack: "React.js, Chakra UI, React Query, Redux",
      iconImage: "/icons/ydrive.webp"
    },
    {
      title: "Evolv LMS Student Web App",
      category: "Frontend Development.",
      link: "https://student-lms.bytetrons.com/",
      date: "Dec 2023",
      shortDesc:
        "A student-centric LMS application offering course access, progress tracking, and interactive learning tools.",
      stack: "React.js, Chakra UI, React Query, Redux",
      iconImage: "/icons/evolv.png"
    },
    {
      title: "Evolv Accounts App",
      category: "Frontend Development.",
      link: "https://lms-accounts.bytetrons.com/",
      date: "Sep 2023",
      shortDesc:
        "A dedicated accounts/finance interface for managing invoicing, transactions, and LMS-related billing.",
      stack: "React.js, Chakra UI, React Query, Redux",
      iconImage: "/icons/evolv.png"
    },
    {
      title: "Evolv LMS Landing Site",
      category: "Website Development.",
      date: "Aug 2023",
      shortDesc:
        "A modern landing page showcasing the LMS platform's features, benefits, and user journeys.",
      stack: "Astro.js, Tailwind CSS",
      iconImage: "/icons/evolv.png"
    },
    {
      title: "Digital Tax Firm",
      category: "Frontend Development.",
      link: "https://digital-tax-firm.vercel.app/",
      date: "Feb 2025",
      shortDesc:
        "A research-focused web app that lets tax advisors and students search large datasets of case laws, statutes, while creating drafts and notices directly from the content.",
      stack: "React.js, Tailwind CSS, Shadcn UI",
      iconImage: "/icons/digitaltaxfirm.png"
    },
    {
      title: "PeopleWhoDevelop Website",
      category: "Website Development.",
      link: "https://www.peoplewhodevelop.com/",
      date: "Feb 2025",
      shortDesc:
        "A professional agency website highlighting development services, portfolio, and brand identity.",
      stack: "Astro.js, Tailwind CSS",
      iconImage: "/icons/peoplewhodevelop.png"
    },
    {
      title: "Media Creative Hub",
      category: "Full Stack Development.",
      link: "https://mediacreativehub.com/",
      date: "Feb 2025",
      shortDesc:
        "A Next.js-based e-commerce platform where vendors sell digital assets and admins manage vendors, customers, and payments.",
      stack: "Next.js, Tailwind CSS, Shadcn UI",
      iconImage: "/icons/mediacreativehub.png"
    },
    {
      title: "Evolv Invoices",
      category: "Full Stack Development.",
      link: "https://invoicing.bytetrons.com/",
      date: "Dec 2024",
      shortDesc:
        "A dynamic invoicing system with real-time invoice creation, tracking, and financial reporting.",
      stack: "React.js, Shadcn UI, Tailwind CSS, Node.js, MongoDB, React Query",
      iconImage: "/icons/evolv.png"
    },
    {
      title: "Forgot Me Knot Website",
      category: "Website Development.",
      link: "https://wedding-planner-forgot-me-knot.vercel.app/",
      date: "Nov 2024",
      shortDesc:
        "A beautifully designed wedding-planner site offering booking flows, venue details, and services.",
      stack: "HTML, CSS, Javascript",
      iconImage: "/icons/forgotmeknot.png"
    },
    {
      title: "DenVenues Booking",
      category: "Frontend Development.",
      link: "https://venue-booking-six.vercel.app/",
      date: "Jul 2024",
      shortDesc:
        "A responsive venue-booking frontend allowing users to explore and reserve event spaces.",
      stack: "React.js, Tailwind CSS, Hero UI",
    },
    {
      title: "Vitalize Website",
      category: "Website Development.",
      link: "https://vitalize.care/",
      date: "Nov 2024",
      shortDesc:
        "A health-focused website presenting Vitalize's wellness services with clean visuals and modern UX.",
      stack: "React.js, Tailwind CSS, Shadcn UI",
      iconImage: "/icons/vitalize.png"
    },
    {
      title: "Vitalize WebApp",
      category: "Frontend Development.",
      link: "https://app.vitalize.care/",
      date: "Nov 2024",
      shortDesc:
        "A patient-oriented web app providing appointment scheduling, wellness tracking, and service management.",
      stack: "React.js, Tailwind CSS, Shadcn UI",
      iconImage: "/icons/vitalize.png"
    },
    {
      title: "Fishfin Admin Portal",
      category: "Frontend Development.",
      link: "https://admin.fishfinapp.com/",
      date: "Jul 2024",
      shortDesc:
        "Admin dashboard for a fishing-focused social app where users can create in-app stores; admins manage users, stores, and revenue shares.",
      stack: "Vue.js, Vuestrap UI",
      iconImage: "/icons/fishfinapp.webp"
    },
    {
      title: "Range Webchat Admin Portal",
      category: "Frontend Development.",
      link: "https://admin.digitalrange.com/",
      date: "Mar 2023",
      shortDesc:
        "A complete admin interface for managing chat bots, users, and conversation automation.",
      stack: "React.js, Redux, HTML, CSS",
      iconImage: "/icons/digital-range.png"
    },
    {
      title: "Range Clubchat Client Portal",
      category: "Frontend Development.",
      link: "https://my.clubchat.io/",
      date: "Mar 2023",
      shortDesc:
        "A client portal enabling real-time chat, group communication, and user interactions.",
      stack: "React.js, Redux, HTML, CSS",
      iconImage: "/icons/clubchat.png"
    },
    {
      title: "Range Webchat Floating ChatSDK",
      category: "Frontend Development.",
      link: "https://webchat.digitalrange.com/",
      date: "Mar 2023",
      shortDesc:
        "A frontend chat SDK providing embeddable real-time messaging for websites.",
      stack: "React.js, Redux, HTML, CSS",
      iconImage: "/icons/rangewebchat.png"
    },
    {
      title: "Robopac",
      category: "Mobile App Development.",
      link: "https://apps.apple.com/us/app/robopac-usa-sales-genie/id1602838633",
      date: "Nov 2022",
      shortDesc:
        "A mobile app showcasing Robopac USA's industrial packaging machines, providing product information across multiple manufacturing industries.",
      stack: "React Native, React Query",
      iconImage: "/icons/robopac.webp"
    },
    {
      title: "Origination Boost",
      category: "Mobile App Development.",
      link: "https://play.google.com/store/apps/details?id=com.app.pmr.pmr",
      date: "Sept 2023",
      shortDesc:
        "A performance-tracking app for mortgage loan officers to monitor daily sales activity and boost origination productivity.",
      stack: "React Native, React Query",
      iconImage: "/icons/originboost.png"
    },
    {
      title: "Cofit 365",
      category: "Mobile App Development.",
      link: "https://play.google.com/store/apps/details?id=com.newcofit365&hl=en",
      date: "Aug 2024",
      shortDesc:
        "A fitness and social networking app connecting outdoor activity enthusiasts through events, group workouts, and local community engagement.",
      stack: "React Native, React Query",
      iconImage: "/icons/cofit365.webp"
    },
    {
      title: "The Wedding App",
      category: "Mobile App Development.",
      link: "https://play.google.com/store/apps/details?id=com.carolinacreations.theweddingapp",
      date: "Jan 2023",
      shortDesc:
        "A centralized wedding coordination platform offering real-time updates, guest list access, and seamless communication for couples, planners, vendors, and guests.",
      stack: "React Native, React Query",
      iconImage: "/icons/thewedding.webp"
    },
    {
      title: "Wezaads",
      category: "Website Development.",
      link: "https://wezaads.com/index.html",
      date: "Aug 2023",
      shortDesc:
        "A simple, elegant digital business card platform built as a marketing and identity solution.",
      stack: "Wordpress",
      iconImage: "/icons/wezaad.png"

    },
    {
      title: "Siplifleet Admin",
      category: "Frontend Development.",
      link: "https://www.siplifleet.it/",
      date: "Oct 2023",
      shortDesc:
        "A fleet-management frontend portal supporting vehicle tracking, reporting, and administrative tasks.",
      stack: "React.js, MUI, React Query, Zustand",
      iconImage: "/icons/splifleet.webp"
    },
    {
      title: "Shehzad Ahmed Portfolio",
      category: "Website Development.",
      link: "https://shaxadd.vercel.app/",
      date: "Nov 2022",
      shortDesc:
        "My own personal developer portfolio showcasing projects, skills, and professional story.",
      stack: "Gatsby.js, Styled Components",
      iconImage: "/icons/shaxad-portfolio.png"
    },
    {
      title: "Bhealthy - Therapy Portal",
      category: "Frontend Development.",
      date: "Mar 2024",
      shortDesc:
        "A frontend therapy platform enabling session booking, therapist management, and patient interactions.",
      stack: "React.js, React Query, Zustand, Tailwind CSS",
    },
    {
      title: "Bytetrons Point of Sale",
      category: "Full Stack Development.",
      date: "Oct 2023",
      link: "https://app.bytetrons.com/",
      shortDesc:
        "A complete POS system with inventory, billing, and real-time sales management.",
      stack: "React.js, Chakra UI, React Query, Redux",
      iconImage: "/icons/bytetrons-pos.png"
    },
    {
      title: "PTax, Your Complete Tax Assistant",
      category: "Full Stack Development.",
      date: "Sep 2022",
      shortDesc:
        "A full-stack digital tax solution built for managing filings, calculations, and tax workflows.",
      stack: "React.js, Chakra UI, Node.js, MongoDB, React Query, Redux",
      iconImage: '/icons/ptax.jpg'
    },
    {
      title: "UrAudits Web App",
      category: "Full Stack Development.",
      link: "https://www.uraudits.com/",
      date: "Aug 2022",
      shortDesc:
        "A full-featured auditing platform enabling companies to create, manage, and review digital audits.",
      stack: "React.js, Node.js, MySQL, Express.js, MUI",
      iconImage: "/icons/uraudits.webp"
    },
    {
      title: "Fixnxl Web App",
      category: "Frontend Development",
      date: "Oct 2021",
      shortDesc:
        "A tool that provides insights and analytics to help Amazon sellers optimize product marketing and performance.",
      stack: "React.js, .Net Core, MongoDB, Azure App Service",
    },
    {
      title: "Moreo Web App",
      category: "Full Stack Development",
      date: "Jan 2021",
      shortDesc:
        "A custom-built e-commerce platform offering tailored shopping experiences and business-specific functionality.",
      stack: "PHP, MySQL, Bootstrap",
    },
    {
      title: "ARTT Website",
      category: "Full Stack Development",
      link: "https://artt.edu.pk",
      date: "Feb 2021",
      shortDesc:
        "A clean, educational website representing the ARTT institute and its programs.",
      stack: "PHP, MySQL, Bootstrap",
      iconImage: "/icons/artt.png"
    },
    {
      title: "EARTT - Accounting System",
      category: "Full Stack Development",
      date: "Feb 2021",
      shortDesc:
        "A full-stack accounting platform supporting ledger management, reports, and transaction tracking.",
      stack: "PHP, MySQL, Bootstrap",
      iconImage: '/icons/artt.png'
    },
    {
      title: "ARTT LMS Web App",
      category: "Full Stack Development",
      date: "Dec 2020",
      shortDesc:
        "A full LMS system offering course modules, student management, and performance tracking.",
      stack: "PHP, MySQL, Bootstrap",
      iconImage: "/icons/artt.png"
    },
  ] satisfies ProjectEntry[],

  canBuild: [
    {
      title: "SaaS Products",
      description:
        "Full-stack web apps from MVP to scale — auth, billing, dashboards, APIs.",
    },
    {
      title: "Mobile Apps",
      description:
        "Cross-platform React Native apps with native performance and offline support.",
    },
    {
      title: "Fintech & Payments",
      description:
        "Transaction flows, reporting, SDKs, and compliance-ready architectures.",
    },
    {
      title: "Real-time Systems",
      description:
        "Live maps, chat, notifications — WebSockets, SignalR, and event-driven backends.",
    },
    {
      title: "Cloud Infrastructure",
      description:
        "AWS CDK, CI/CD pipelines, and deployment automation from day one.",
    },
    {
      title: "AI Integrations",
      description:
        "Custom chatbots, MCP servers, and agentic workflows in production apps.",
    },
  ],

  curious: {
    wallpaper: "/desktop-me.jpg",
    menuBarItems: ["Finder", "File", "Edit", "View", "Go", "Window", "Help"],
    /** Project ids pinned to the macOS dock (see derived ids from titles) */
    dockProjectIds: [
      "aroya-cruise-booking",
      "withme-app-website",
      "siplifleet-admin",
      "vitalize-website",
      "simplifi-portal",
      "simplifipay-website",
      "artt-website",
    ],
    /** Leave empty to auto-populate all projects with a live link on the desktop */
    desktopProjectIds: [] as string[],
    dockLinks: [
      { id: "github", label: "GitHub", icon: "github" as const, accent: "#636366" },
      { id: "linkedin", label: "LinkedIn", icon: "linkedin" as const, accent: "#0a66c2" },
      { id: "mail", label: "Email", icon: "mail" as const, accent: "#0a84ff" },
    ],
  },
};

// =============================================================================
// Derived exports — used by components. Do not edit below; edit PORTFOLIO above.
// =============================================================================

const ACCENT_PALETTE = [
  "#0071e3",
  "#5856d6",
  "#ff9500",
  "#34c759",
  "#ff2d55",
  "#64d2ff",
  "#bf5af2",
  "#30d158",
  "#ff375f",
  "#0a84ff",
];

function toProjectId(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function parseStack(stack: string): string[] {
  return stack
    .split(",")
    .map((item) => item.trim().replace(/\.$/, ""))
    .filter(Boolean);
}

function cleanCategory(category: string): string {
  return category.replace(/\.$/, "").trim();
}

function iconForCategory(category: string): ProjectIcon {
  const normalized = category.toLowerCase();
  if (normalized.includes("mobile")) return "ydrive";
  if (normalized.includes("full stack")) return "davinci";
  if (normalized.includes("product")) return "range";
  if (normalized.includes("website")) return "globe";
  if (normalized.includes("frontend")) return "simplifi";
  return "folder";
}

function toCuriousFileName(title: string): string {
  const cleaned = title.replace(/\s+/g, "");
  return `${cleaned}.app`;
}


function enrichProject(entry: ProjectEntry, index: number): Project {
  const id = toProjectId(entry.title);
  const tag = cleanCategory(entry.category);

  return {
    id,
    name: entry.title,
    tag,
    description: entry.shortDesc,
    stack: parseStack(entry.stack),
    accent: ACCENT_PALETTE[index % ACCENT_PALETTE.length],
    icon: iconForCategory(entry.category),
    iconImage: entry.iconImage,
    url: entry.link,
    date: entry.date,
    curiousFileName: toCuriousFileName(entry.title),
    curiousLabel: entry.title,
  };
}

const { personal, links, curious } = PORTFOLIO;

export const projects: Project[] = PORTFOLIO.projects.map(enrichProject);

function projectToCuriousItem(project: Project): CuriousItem {
  return {
    id: project.id,
    name: project.curiousFileName ?? project.name,
    label: project.curiousLabel ?? project.name,
    url: project.url,
    kind: "product",
    description: project.description,
    stack: project.stack.join(", "),
    date: project.date,
    accent: project.accent,
    icon: project.icon,
    iconImage: project.iconImage,
  };
}

function getProject(id: string): Project {
  const project = projects.find((p) => p.id === id);
  if (!project) throw new Error(`Project not found: ${id}`);
  return project;
}

export const featuredProjects = projects.map(
  ({ id, name, tag, description, stack, accent, url, date, icon, iconImage }) => ({
    id,
    name,
    tag,
    description,
    stack,
    accent,
    url,
    date,
    icon,
    iconImage,
  }),
);

export const builtProjects = projects.map(
  ({ id, name, tag, description, stack, url, date, icon, iconImage, accent }) => ({
    id,
    name,
    type: tag,
    description,
    stack,
    url,
    date,
    icon,
    iconImage,
    accent,
  }),
);

const desktopProjectIds =
  curious.desktopProjectIds.length > 0
    ? curious.desktopProjectIds
    : projects.filter((p) => p.url).map((p) => p.id);

export const dockItems: CuriousItem[] = [
  ...curious.dockProjectIds.map((id) => projectToCuriousItem(getProject(id))),
  ...curious.dockLinks.map((link) => ({
    id: link.id,
    name: link.label,
    label: link.label,
    url:
      link.id === "github"
        ? links.github
        : link.id === "linkedin"
          ? links.linkedin
          : `mailto:${personal.email}`,
    kind: "link" as const,
    accent: link.accent,
    icon: link.icon,
  })),
];

export const desktopFiles: CuriousItem[] = [
  {
    id: "resume",
    name: "resume.pdf",
    label: "resume.pdf",
    url: links.resume,
    kind: "pdf",
    accent: "#ff3b30",
    icon: "pdf",
  },
  ...desktopProjectIds.map((id) => projectToCuriousItem(getProject(id))),
  {
    id: "website",
    name: "shehzadahmed.me",
    label: "Portfolio",
    url: personal.website,
    kind: "link",
    accent: "#86868b",
    icon: "globe",
  },
];

export const {
  roles,
  recruiterNav,
  founderTitleRoles,
  tools,
  skillGroups,
  education,
  canBuild,
} = PORTFOLIO;

export const experience: Experience[] = PORTFOLIO.experience;

export { personal, links };
export const calendlyUrl = links.calendly;
export const sourceRepoUrl = links.sourceRepo;
export const menuBarItems = curious.menuBarItems;
export const curiousWallpaper = curious.wallpaper;
