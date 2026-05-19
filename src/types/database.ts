export interface Household {
  id: string;
  name: string;
  created_at: string;
}

export interface Profile {
  id: string;
  household_id: string;
  full_name: string;
  avatar_url?: string;
}
