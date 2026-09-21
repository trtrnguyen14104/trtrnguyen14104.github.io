export interface ProjectImages {
  left: string;
  main: string;
  right: string;
}

export interface ProjectItem {
  id: string;
  number: string;
  title: string;
  subtitle: string;
  tags: string[];
  description: string;
  bgColor: string;
  accentColor: string;
  mockImages: ProjectImages;
  links: {
    github?: string;
    demo?: string;
  };
}

export interface SkillItem {
  name: string;
  category: string;
  level: number;
  icon?: string;
}

export interface Profile {
  name: string;
  role: string;
  tagline: string;
  location: string;
  email: string;
  phone: string;
  github: string;
  linkedin: string;
  status: string;
  avatar: string;
}

export interface PortfolioData {
  profile: Profile;
  skills: SkillItem[];
  projects: ProjectItem[];
}
