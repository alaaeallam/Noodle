export const RTL_LANGUAGES = ["ar", "ur", "fa"];
export function isRtl(lang: string) {
  return RTL_LANGUAGES.includes(lang);
}
