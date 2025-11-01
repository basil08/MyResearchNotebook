export interface ResearchLog {
  id: string;
  created_by: string;
  date: string; // ISO date string
  plan_to_read: string;
  did_read: string;
  learned_today: string;
  new_thoughts: string;
  coded_today: string;
  wrote_or_taught: string;
  try_tomorrow: string;
  created_at: string; // ISO datetime string
  updated_at: string; // ISO datetime string
}

export interface CreateResearchLogInput {
  date: string;
  plan_to_read: string;
  did_read: string;
  learned_today: string;
  new_thoughts: string;
  coded_today: string;
  wrote_or_taught: string;
  try_tomorrow: string;
}

export interface UpdateResearchLogInput extends Partial<CreateResearchLogInput> {
  id: string;
}

export interface FilterOptions {
  dateFrom?: string;
  dateTo?: string;
}

