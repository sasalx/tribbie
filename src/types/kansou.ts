export interface Dimension {
  key: string
  label: string
  description: string
  weight: number
}

export interface DimensionsResponse {
  config_hash: string
  dimensions: Dimension[]
}
