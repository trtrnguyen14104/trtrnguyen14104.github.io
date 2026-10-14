import { z } from "zod";

const text = (max = 500) => z.string().trim().min(1).max(max);
const optionalText = (max = 500) => z.string().trim().max(max).optional();
const httpsUrl = z.string().trim().max(2048).url().refine((v) => new URL(v).protocol === "https:", "Cần URL HTTPS");
export const imagePath = z.string().trim().max(2048).refine(
  (v) => /^\/(?!\/)[a-zA-Z0-9_./%-]+$/.test(v) && !v.includes("..") || httpsUrl.safeParse(v).success,
  "Cần đường dẫn ảnh nội bộ hoặc URL HTTPS",
);
const lines = z.array(text(2000)).max(50);
const id = text(100).regex(/^[a-zA-Z0-9_-]+$/);
const color = z.string().regex(/^#[a-fA-F0-9]{6}$/);
const email = z.string().trim().max(254).email();

export const profileSchema = z.object({
  name: text(100), role: text(150), tagline: text(1000), location: text(250),
  email, phone: text(50), github: httpsUrl, linkedin: httpsUrl,
  status: text(100), avatar: imagePath,
}).strict();
const skillSchema = z.object({ name: text(100), category: text(100), level: z.number().int().min(0).max(100), icon: imagePath.optional() }).strict();
const projectSchema = z.object({
  id, number: text(10), title: text(200), subtitle: text(300), tags: z.array(text(100)).max(30),
  description: text(5000), bgColor: color, accentColor: color,
  mockImages: z.object({ left: imagePath, main: imagePath, right: imagePath }).strict(),
  links: z.object({ github: httpsUrl.optional(), demo: httpsUrl.optional() }).strict(),
}).strict();
const experienceSchema = z.object({
  id, role: text(200), company: text(200), employmentType: text(100), period: text(200),
  location: text(250), teamSize: optionalText(100), summary: text(5000),
  tech: z.array(text(100)).max(30), highlights: lines, isCurrent: z.boolean().optional(),
}).strict();
const educationSchema = z.object({
  id, institution: text(250), degree: text(250), period: text(200), location: text(250),
  gpa: optionalText(100), highlights: lines.optional(),
}).strict();
const uniqueIds = <T extends { id: string }>(items: T[]) => new Set(items.map((v) => v.id)).size === items.length;
export const sectionSchemas = {
  profile: profileSchema,
  skills: z.array(skillSchema).max(100),
  projects: z.array(projectSchema).max(100).refine(uniqueIds, "ID dự án bị trùng"),
  experience: z.array(experienceSchema).max(100).refine(uniqueIds, "ID kinh nghiệm bị trùng"),
  education: z.array(educationSchema).max(100).refine(uniqueIds, "ID học vấn bị trùng"),
};
export const portfolioSchema = z.object(sectionSchemas).strict();
export const sectionNameSchema = z.enum(["profile", "skills", "projects", "experience", "education"]);
export type SectionName = z.infer<typeof sectionNameSchema>;
export const portfolioPatchSchema = z.object({
  section: sectionNameSchema, version: z.number().int().positive(), value: z.unknown(),
}).strict();
export const contactSchema = z.object({
  submissionId: z.uuid(), name: text(100), email,
  subject: text(200).refine((v) => !/[\r\n]/.test(v), "Tiêu đề không được xuống dòng"),
  message: text(5000), website: z.string().max(500).default(""),
}).strict();
export type ContactInput = z.infer<typeof contactSchema>;
export const contactStatusSchema = z.enum(["new", "read", "archived"]);
export const contactPatchSchema = z.object({ status: contactStatusSchema }).strict();
export const contactQuerySchema = z.object({
  status: contactStatusSchema.optional(), page: z.coerce.number().int().min(1).max(10000).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(20),
}).strict();
