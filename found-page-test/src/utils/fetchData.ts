import { ref, type Ref } from 'vue'
import { getFeedList } from '../api/mockapi'
import type { FeedItem } from '../types/feed'

export const useFetchFeed = (
  list: Ref<FeedItem[]>,
  type: Ref<'hot' | 'new'>
) => {
  const page = ref(1)
  const loading = ref(false)
  const finished = ref(false)
  const refreshing = ref(false)

  // 加载数据
  const loadData = async (reset = false) => {
    if (loading.value || (finished.value && !reset)) return
    
    try {
      loading.value = true
      
      if (reset) {
        page.value = 1
        finished.value = false
      }
      
      const res = await getFeedList(type.value, page.value)
      
      if (reset || refreshing.value) {
        list.value = res.data
      } else {
        list.value.push(...res.data)
      }
      
      // 判断是否加载完毕
      if (res.data.length < 10) {
        finished.value = true
      } else {
        page.value++
      }
      
      refreshing.value = false
    } catch (error) {
      console.error('数据加载失败', error)
    } finally {
      loading.value = false
    }
  }

  // 刷新数据
  const onRefresh = () => {
    refreshing.value = true
    loadData(true)
  }

  // 重置数据 (切换类型时)
  const resetData = () => {
    loadData(true)
  }

  return { loadData, onRefresh, resetData, loading, finished, refreshing }
}