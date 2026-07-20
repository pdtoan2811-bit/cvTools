/**
 * The CV document shape. This is a superset of the original static
 * `cv-data.js`: same fields, plus `headline` / `achievements` on a role and
 * `certifications` on a degree, which Minh's CV needs.
 */

export type Product = {
  name: string;
  tagline?: string;
  url?: string;
  logo?: string;
  logoBg?: string;
};

export type AchievementGroup = {
  label?: string;
  points: string[];
};

export type Experience = {
  role: string;
  company?: string;
  period?: string;
  /** One-line flavour under the job title, e.g. "Brought Joy to the world". */
  headline?: string;
  points: string[];
  achievements?: AchievementGroup[];
  productsLabel?: string;
  products?: Product[];
};

export type Client = {
  name: string;
  logo?: string;
  url?: string;
  /** Render the logo as a full-bleed tile instead of a contained mark. */
  fill?: boolean;
};

export type Education = {
  degree: string;
  school?: string;
  period?: string;
  certifications?: string[];
};

export type Link = { label?: string; url: string };

export type Language = { name: string; level?: string };

export type Project = {
  name: string;
  description?: string;
  url?: string;
  logo?: string;
  logoBg?: string;
  /** Optional heading that groups several projects together. */
  group?: string;
  extraLinks?: Link[];
};

export type CvData = {
  name: string;
  title?: string;
  photo?: string;
  accent?: string;
  contact: {
    location?: string;
    phone?: string;
    email?: string;
    dob?: string;
    linkedin?: string;
    website?: string;
  };
  summary: string[];
  experience: Experience[];
  clients?: Client[];
  education?: Education[];
  links?: Link[];
  skills?: string[];
  languages?: Language[];
  hobbies?: string;
  projects?: Project[];
};

/** A stored CV: public `id` for reading, secret `editKey` for writing. */
export type CvRecord = {
  id: string;
  editKey: string;
  data: CvData;
  createdAt: string;
  updatedAt: string;
};

export const emptyCv = (name = "Your Name"): CvData => ({
  name,
  title: "",
  photo: "",
  contact: {},
  summary: [],
  experience: [],
  clients: [],
  education: [],
  links: [],
  skills: [],
  languages: [],
  hobbies: "",
  projects: [],
});
