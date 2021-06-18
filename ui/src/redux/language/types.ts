export const SET_LANGUAGE = "SET_LANGUAGE";

export type languages = "en" | "jp";

export interface LanguageState {
  language: languages | null;
}

export interface SetLanguage {
  type: typeof SET_LANGUAGE;
  language: languages;
}

export interface Languages {
  language: string;
  code: languages;
}

export type LanguageActionTypes = SetLanguage;
