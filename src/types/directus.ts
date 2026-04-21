// types/directus.ts
export interface DirectusSchema {
  events: Events[];
  themes: Themes[];
}

export interface Events {
  id: string;
  airtable_id?: string;
  access_password?: string;
  event_name: string;
  theme?: Themes;
  content_display?: string[];
}

export interface Themes {
  id: number;
  theme_name: string;
  primary_color: string;
  secondary_color: string;
  background: string;
  foreground: string;
}
