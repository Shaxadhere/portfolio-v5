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

export type CuriousItem = {
    id: string;
    name: string;
    label: string;
    url?: string;
    kind: "product" | "link" | "pdf" | "folder";
    description?: string;
    stack?: string;
    date?: string;
    accent: string;
    icon: ProjectIcon;
    iconImage?: string;
};
