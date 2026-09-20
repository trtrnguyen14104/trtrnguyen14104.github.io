import { PortfolioData } from "@/types/portfolio";

export const portfolioData: PortfolioData = {
  profile: {
    name: "Trần Trung Nguyên",
    role: "Full-Stack Developer",
    tagline:
      "Building clean, functional web applications with a focus on great user experience.",
    location: "Ho Chi Minh City, Vietnam 🇻🇳",
    email: "trtrnguyen14104@gmail.com",
    phone: "0354066043",
    github: "https://github.com/trtrnguyen14104",
    linkedin: "https://linkedin.com/in/trung-nguyên-trần-82b1403b8",
    status: "Open to work",
    avatar: "/pictures/me.png",
  },
  skills: [
    { name: "JavaScript", category: "Language", level: 90 },
    { name: "TypeScript", category: "Language", level: 80 },
    { name: "React", category: "Framework", level: 85 },
    { name: "Next.js", category: "Framework", level: 75 },
    { name: "Node.js", category: "Runtime", level: 75 },
    { name: "Express.js", category: "Framework", level: 75 },
    { name: "FastAPI", category: "Backend", level: 70 },
    { name: "PostgreSQL", category: "Database", level: 70 },
    { name: "Docker", category: "DevOps", level: 70 },
    { name: "Git & GitHub", category: "Tools", level: 85 },
  ],
  projects: [
    {
      id: "project-1",
      number: "01",
      title: "Quiz App",
      subtitle: "Solo Project | Fullstack Developer",
      tags: ["React", "Express", "Node.js", "TailwindCSS"],
      description:
        "A full-stack Quiz App featuring topic selection, timed quizzes, interactive score tracking, and performance analytics.",
      bgColor: "#a3d95b",
      accentColor: "#ffffff",
      mockImages: {
        left: "/samples/project-1.png",
        main: "/samples/project-1.png",
        right: "/samples/project-1.png",
      },
      links: {
        github: "https://github.com/trtrnguyen14104/Quiz_app",
      },
    },
    {
      id: "project-2",
      number: "02",
      title: "Social Media AloChat",
      subtitle: "Team Size: 3 | Fullstack Developer",
      tags: ["React", "Express", "Redis", "Socket.io"],
      description:
        "A real-time messaging and social application built with instant messaging, live presence, Redis caching, and WebSocket streams.",
      bgColor: "#4a69e2",
      accentColor: "#ffffff",
      mockImages: {
        left: "/samples/project-2.png",
        main: "/samples/project-2.png",
        right: "/samples/project-2.png",
      },
      links: {
        github: "https://github.com/trtrnguyen14104/Social-Media-AloChat",
      },
    },
    {
      id: "project-3",
      number: "03",
      title: "Research Data Management System",
      subtitle: "Team Size: 2 | Fullstack Developer",
      tags: ["Next.js", "FastAPI", "TypeScript", "PostgreSQL"],
      description:
        "A comprehensive management platform for scientific research publications featuring staging, peer review, approval pipelines, and search.",
      bgColor: "#f4c430",
      accentColor: "#ffffff",
      mockImages: {
        left: "/samples/project-3.png",
        main: "/samples/project-3.png",
        right: "/samples/project-3.png",
      },
      links: {
        github: "https://github.com/NTriCuong/Research-data-managerment-system",
      },
    },
    {
      id: "project-4",
      number: "04",
      title: "Next Project",
      subtitle: "Personal Exploration | In Progress",
      tags: ["Coming Soon", "Full-Stack"],
      description:
        "In progress ... Stay tuned for updates on my latest project, exploring new technologies and building something exciting to share with the community.",
      bgColor: "#2a2a2e",
      accentColor: "#ffffff",
      mockImages: {
        left: "/samples/project-1.png",
        main: "/samples/project-2.png",
        right: "/samples/project-3.png",
      },
      links: {
        github: "https://github.com/trtrnguyen14104?tab=repositories",
      },
    },
  ],
};
