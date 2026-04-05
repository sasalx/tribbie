export function toFirstLetterCapitalString(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase()
}

export function displayAltMediaTitle(titleEnglish?: string, titleNative?: string): string {
  if (titleEnglish && titleNative) {
    return `${titleEnglish} / ${titleNative}`
  }
  return titleEnglish || titleNative || ''
}
