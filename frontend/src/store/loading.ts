import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useLoadingStore = defineStore('loading', () => {
  const loadingMap = ref<Map<string, number>>(new Map())

  const isLoading = computed(() => loadingMap.value.size > 0)

  const startLoading = (key: string = 'global') => {
    const count = loadingMap.value.get(key) || 0
    loadingMap.value.set(key, count + 1)
  }

  const stopLoading = (key: string = 'global') => {
    const count = loadingMap.value.get(key)
    if (count !== undefined) {
      if (count <= 1) {
        loadingMap.value.delete(key)
      } else {
        loadingMap.value.set(key, count - 1)
      }
    }
  }

  const isKeyLoading = (key: string): boolean => {
    return (loadingMap.value.get(key) || 0) > 0
  }

  const clearAll = () => {
    loadingMap.value.clear()
  }

  return {
    isLoading,
    loadingMap,
    startLoading,
    stopLoading,
    isKeyLoading,
    clearAll,
  }
})
