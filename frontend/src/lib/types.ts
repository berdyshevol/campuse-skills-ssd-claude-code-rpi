export type User = {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
};

export type Skill = {
  id: number;
  owner: User;
  title: string;
  description: string;
  category: SkillCategory;
  pricing_type: "free" | "paid";
  price: string | null;
  contact_pref: "email" | "phone" | "inapp";
  availability: "available" | "busy" | "paused";
  image_url: string | null;
  average_rating: number | null;
  rating_count: number;
  created_at: string;
  updated_at: string;
};

export type SkillCategory =
  | "tutoring"
  | "design"
  | "coding"
  | "music"
  | "sports"
  | "writing"
  | "other";

export const SKILL_CATEGORIES: { value: SkillCategory; label: string }[] = [
  { value: "tutoring", label: "Tutoring" },
  { value: "design", label: "Design" },
  { value: "coding", label: "Coding" },
  { value: "music", label: "Music" },
  { value: "sports", label: "Sports" },
  { value: "writing", label: "Writing" },
  { value: "other", label: "Other" },
];

export type Rating = {
  id: number;
  skill: number;
  reviewer: User;
  stars: number;
  review: string;
  created_at: string;
};

export type Booking = {
  id: number;
  skill: Skill;
  requester: User;
  message: string;
  proposed_at: string;
  status: "pending" | "accepted" | "rejected" | "completed" | "cancelled";
  created_at: string;
  updated_at: string;
};

export type Paginated<T> = {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
};
