export function decimalToPercentage(value: number): string {
  return `${Math.trunc(value * 1000) / 10}%`
}

export function toFirstLetterCapitalString(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase()
}

export function beautifyNumber(value: number, decimals = 3): string {
  return (Math.trunc(value * 10 ** decimals) / 10 ** decimals).toString()
}

export function displayAltMediaTitle(titleEnglish?: string, titleNative?: string): string {
  if (titleEnglish && titleNative) {
    return `${titleEnglish} / ${titleNative}`
  }
  return titleEnglish || titleNative || ''
}
