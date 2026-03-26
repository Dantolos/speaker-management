export const languageMap: Record<string, string> = {
  Englisch: "en",
  Deutsch: "de",
  Französisch: "fr",
  Italienisch: "it",
  // weitere Sprachen nach Bedarf
};

// Gibt den Code zurück, sonst den ursprünglichen Wert
export const toLanguageCode = (name: string): string =>
  languageMap[name] ?? name;
