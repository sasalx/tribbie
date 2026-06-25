import type { ResultDimension, ScoreResultMeta, WeightsResponseDimension } from '~/types/kansou'

export interface WeightBreakdown {
  key: string
  label: string
  baseWeight: number // static config weight for this dimension, before any genre adjustment
  multiplier: number // blended genre multiplier actually applied, see blendMultiplier()
  effectiveWeight: number // baseWeight * multiplier
  finalWeight: number // effectiveWeight / effectiveWeightSum (this dimension's share of 1.0 across all dimensions)
  primaryGenreMultiplier: number
  secondaryGenresMultiplier: number
  primaryGenreWeight: number // 0..1 blend ratio: 1 = pure primary genre multiplier, 0 = pure secondary
  effectiveWeightSum: number
}

// multiplier = primary * w + secondary * (1 - w), where w = primaryGenreWeight.
// The two early returns below bypass that formula when one side has no real value to blend with:
//  - primary === 0  -> no genre signal at all, fall back to the multiplier already applied upstream
//  - secondary === 0 -> only a primary genre was selected, nothing to blend against
function blendMultiplier(appliedMultiplier: number, primaryGenreMultiplier: number, secondaryGenresMultiplier: number, primaryGenreWeight: number): number {
  if (primaryGenreMultiplier === 0) {
    return appliedMultiplier
  }
  if (secondaryGenresMultiplier === 0) {
    return primaryGenreMultiplier
  }
  return (primaryGenreMultiplier * primaryGenreWeight) + (secondaryGenresMultiplier * (1 - primaryGenreWeight))
}

export function fromResultDimension(dimension: ResultDimension, scoreResult: ScoreResultMeta): WeightBreakdown {
  const primaryGenreMultiplier = dimension.primary_genre_multiplier ?? 0
  const secondaryGenresMultiplier = dimension.secondary_genres_multiplier ?? 0
  const multiplier = blendMultiplier(dimension.applied_multiplier, primaryGenreMultiplier, secondaryGenresMultiplier, scoreResult.primary_genre_weight)

  return {
    key: dimension.key,
    label: dimension.label,
    baseWeight: dimension.base_weight,
    multiplier,
    effectiveWeight: dimension.base_weight * multiplier,
    finalWeight: dimension.final_weight,
    primaryGenreMultiplier,
    secondaryGenresMultiplier,
    primaryGenreWeight: scoreResult.primary_genre_weight,
    effectiveWeightSum: scoreResult.effective_weight_sum,
  }
}

// /weights endpoint already returns multiplier, rest is same as fromResultDimension
export function fromWeightsDimension(dimension: WeightsResponseDimension, primaryGenreWeight: number, effectiveWeightSum: number): WeightBreakdown {
  return {
    key: dimension.key,
    label: dimension.label,
    baseWeight: dimension.base_weight,
    multiplier: dimension.multiplier,
    effectiveWeight: dimension.effective_weight,
    finalWeight: dimension.final_weight,
    primaryGenreMultiplier: dimension.primary_genre_multiplier ?? 0,
    secondaryGenresMultiplier: dimension.secondary_genres_multiplier ?? 0,
    primaryGenreWeight,
    effectiveWeightSum,
  }
}
