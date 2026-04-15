// types/directus.ts
export interface DirectusSchema {
  events: Events[];
}

export interface Events {
  id: string;
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
