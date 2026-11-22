export type ProjectIcon =
    | "simplifi"
    | "ydrive"
    | "bhealthy"
    | "fishfin"
    | "davinci"
    | "range"
    | "github"
    | "linkedin"
    | "mail"
    | "globe"
    | "pdf"
    | "instagram"
    | "folder";

/** Raw project entry — match this shape when adding new projects */
export type ProjectEntry = {
    title: string;
    category: string;
    link?: string;
    date: string;
    shortDesc: string;
    stack: string;
    /** Optional path under /public, e.g. "/project-icons/aroya.png" */
    iconImage?: string;
    /** Set to true to show this project in the "Featured products" section of every mode */
    featured?: boolean;
};

export type Project = {
    id: string;
    name: string;
    tag: string;
    description: string;
    stack: string[];
    accent: string;
    icon: ProjectIcon;
    iconImage?: string;
    url?: string;
    date: string;
    curiousFileName?: string;
    curiousLabel?: string;
    featured: boolean;
};

export type ExperienceProject = {
    name: string;
    description: string;
    iconImage?: string;
    icon?: ProjectIcon;
};

export type Experience = {
    company: string;
    role: string;
    location: string;
    period: string;
    highlights: string[];
    /** Optional path under /public, e.g. "/company-icons/simplifi.png" */
    iconImage?: string;
    icon?: ProjectIcon;
    projects?: ExperienceProject[];
};

/** Several projects shown as one product in Just Curious mode */
export type ProductGroupEntry = {
    id: string;
    /** Window title, e.g. "SimplifiPay Suite" */
    name: string;
    /** Short desktop / dock label, e.g. "SimplifiPay" */
    label: string;
    description: string;
    accent: string;
    iconImage?: string;
    /** Set to true to feature the whole product (one card) in every mode */
    featured?: boolean;
    /** Project ids (project title in kebab-case) in display order */
    projectIds: string[];
};

/** One card in the "Featured products" sections — a single project or a whole product group */
export type FeaturedProduct = {
    id: string;
    name: string;
    /** Project category, or "3 products" for a group */
    tag: string;
    description: string;
    stack: string[];
    accent: string;
    icon: ProjectIcon;
    iconImage?: string;
    /** Single date, or a "start — end" timeline for a group */
    date: string;
    /** Every project in this product — one for a single project */
    projects: Project[];
};

export type CuriousItem = {
    id: string;
    name: string;
    label: string;
    url?: string;
    kind: "product" | "link" | "pdf";
    description?: string;
    /** Comma-separated stack (all projects combined for a product group) */
    stack?: string;
    /** Single date, or a "start — end" timeline for a product group */
    date?: string;
    accent: string;
    icon: ProjectIcon;
    iconImage?: string;
    /** Any project inside is flagged `featured: true` */
    featured?: boolean;
    /** Projects listed in the product info window (kind "product") */
    projects?: Project[];
};
