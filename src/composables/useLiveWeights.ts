import type { WeightsRequestBody, WeightsResponse } from '~/types/kansou'
import { api } from '~/api/client'

export function useLiveWeights(getParams: () => WeightsRequestBody | null, debounceMs = 300) {
  const weights = ref<WeightsResponse | null>(null)
  const loading = ref(false)
  const error = ref<unknown>(null)

  let timeoutId: ReturnType<typeof setTimeout> | undefined
  let requestId = 0

  async function fetchWeights() {
    const body = getParams()
    if (!body) {
      weights.value = null
      return
    }

    const currentRequestId = ++requestId
    loading.value = true
    error.value = null

    try {
      const response = await api.post<WeightsResponse>('/v1/weights', body)
      if (currentRequestId === requestId) {
        weights.value = response
      }
    }
    catch (e) {
      if (currentRequestId === requestId) {
        error.value = e
      }
    }
    finally {
      if (currentRequestId === requestId) {
        loading.value = false
      }
    }
  }

  watch(getParams, () => {
    clearTimeout(timeoutId)
    timeoutId = setTimeout(fetchWeights, debounceMs)
  }, { immediate: true })

  onScopeDispose(() => clearTimeout(timeoutId))

  return { weights, loading, error }
}
