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

export function hamiltonPercentages(values: number[], decimals = 1): string[] {
  if (values.length === 0) {
    return []
  }

  const scale = 10 ** decimals
  const total = 100 * scale
  const raw = values.map(v => v * total)
  const floors = raw.map(v => Math.floor(v))
  const remainder = total - floors.reduce((a, b) => a + b, 0)

  const order = raw
    .map((v, i) => ({ frac: v - floors[i], i }))
    .sort((a, b) => b.frac - a.frac)

  const result = [...floors]

  for (let k = 0; k < remainder; k++) result[order[k].i]++

  return result.map(v => `${v / scale}%`)
}
