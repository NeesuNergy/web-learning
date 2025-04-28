<template>
  <div class="home">
    <Waterfall :list="feedList" :loading="loading" :finished="finished" :refreshing="refreshing" @refresh="onRefresh"
      @load-more="loadMore" />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import Waterfall from '../components/Waterfall.vue'
import { useFetchFeed } from '../utils/fetchData'
import type { FeedItem } from '../types/feed'

// 响应数据
const feedList = ref<FeedItem[]>([])
const currentType = ref<'hot' | 'new'>('hot')
const sourceFilter = ref('all')

// 初始化请求函数
const {
  loadData,
  onRefresh,
  resetData,
  loading,
  finished,
  refreshing
} = useFetchFeed(feedList, currentType)

// 加载更多数据
const loadMore = () => {
  loadData()
}

// 监听 URL 参数变化
const updateUrlParams = () => {
  const url = new URL(window.location.href)
  url.searchParams.set('type', currentType.value)
  url.searchParams.set('source', sourceFilter.value)
  window.history.replaceState({}, '', url.toString())
}

// 从 URL 参数恢复状态
const restoreFromUrl = () => {
  const params = new URLSearchParams(window.location.search)
  const typeParam = params.get('type')
  const sourceParam = params.get('source')

  if (typeParam === 'hot' || typeParam === 'new') {
    currentType.value = typeParam
  }

  if (sourceParam) {
    sourceFilter.value = sourceParam
  }
}

// 监听数据源筛选变化
watch(sourceFilter, () => {
  updateUrlParams()
  resetData()
})

watch(currentType, () => {
  updateUrlParams()
})

onMounted(() => {
  restoreFromUrl()
  loadData()

  // 添加提示
  const format = new URLSearchParams(window.location.search).get('format')

  if (!format) {
    console.info('提示：您可以添加URL参数来获取不同格式的数据，例如：?format=detail&source=video')
  }
})
</script>

<style scoped>
.home {
  max-width: 800px;
  margin: 0 auto;
  padding-bottom: 20px;
}

/* 移动端适配 */
@media (max-width: 480px) {
  .home {
    padding-bottom: 15px;
  }
}
</style>