<template>
  <div class="waterfall-container">
    <!-- 下拉刷新区域 -->
    <div 
      class="pull-refresh" 
      :class="{ 'refreshing': refreshing }"
      @touchstart="touchStart"
      @touchmove="touchMove"
      @touchend="touchEnd"
    >
      <div class="refresh-text" v-if="pullDistance > 0">
        {{ refreshing ? '刷新中...' : pullDistance > 50 ? '松开刷新' : '下拉刷新' }}
      </div>
    </div>

    <!-- 瀑布流内容 -->
    <div class="waterfall">
      <div class="waterfall-column left">
        <div 
          v-for="item in leftColumn"
          :key="item.id"
          class="waterfall-card"
        >
          <div class="media-wrapper">
            <video 
              v-if="item.type === 'video'"
              :poster="item.cover"
              controls
              @play="onVideoPlay($event)"
              :style="{height: item.height ? item.height + 'px' : 'auto'}"
            >
              <source :src="item.url" type="video/mp4">
            </video>
            <img v-else :src="item.url" :alt="item.title" :style="{height: item.height ? item.height + 'px' : 'auto'}">
          </div>
          <div class="card-info">
            <div class="title">{{ item.title }}</div>
            <div v-if="item.tag">
              <div class="tag">{{ item.tag }}</div>
            </div>
            <div class="user-box">
              <div class="user-info">
                <img class="avatar" :src="item.avatar" alt="avatar" v-if="item.avatar">
                <span class="nickname">{{ item.nickname || '匿名用户' }}</span>
              </div>
              <div class="actions">
                <van-icon name="thumb-circle" size="16" />
                <span class="action">{{ item.likeCount }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div class="waterfall-column right">
        <div 
          v-for="item in rightColumn"
          :key="item.id"
          class="waterfall-card"
        >
          <div class="media-wrapper">
            <video 
              v-if="item.type === 'video'"
              :poster="item.cover"
              controls
              @play="onVideoPlay($event)"
              :style="{height: item.height ? item.height + 'px' : 'auto'}"
            >
              <source :src="item.url" type="video/mp4">
            </video>
            <img v-else :src="item.url" :alt="item.title" :style="{height: item.height ? item.height + 'px' : 'auto'}">
          </div>
          <div class="card-info">
            <div class="title">{{ item.title }}</div>
            <div v-if="item.tag">
              <div class="tag">{{ item.tag }}</div>
            </div>
            <div class="user-box">
              <div class="user-info">
                <img class="avatar" :src="item.avatar" alt="avatar" v-if="item.avatar">
                <span class="nickname">{{ item.nickname || '匿名用户' }}</span>
              </div>
              <div class="actions">
                <van-icon name="thumb-circle" size="16" />
                <span class="action">{{ item.likeCount }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 加载状态 -->
    <div class="loading-status">
      <div v-if="loading" class="loading">加载中...</div>
      <div v-else-if="finished" class="finished">没有更多内容了</div>
      <div v-else class="load-more" @click="$emit('load-more')">加载更多</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, onMounted, onUnmounted } from 'vue'
import type { FeedItem } from '../types/feed'

const props = defineProps<{
  list: FeedItem[]
  loading?: boolean
  finished?: boolean
  refreshing?: boolean
}>()

const emit = defineEmits(['refresh', 'load-more'])

// 手动拆分两列，确保高度平衡
const leftColumn = computed(() => {
  return props.list.filter((_, index) => index % 2 === 0)
})

const rightColumn = computed(() => {
  return props.list.filter((_, index) => index % 2 === 1)
})

// 下拉刷新逻辑
const pullDistance = ref(0)
const touchStartY = ref(0)
const touchThreshold = 50

const touchStart = (e: TouchEvent) => {
  if (window.scrollY === 0) {
    touchStartY.value = e.touches[0].clientY
  }
}

const touchMove = (e: TouchEvent) => {
  if (props.refreshing) return
  
  if (touchStartY.value > 0 && window.scrollY === 0) {
    const distance = e.touches[0].clientY - touchStartY.value
    if (distance > 0) {
      pullDistance.value = Math.min(distance / 2, 100)
      e.preventDefault()
    }
  }
}

const touchEnd = () => {
  if (pullDistance.value > touchThreshold && !props.refreshing) {
    emit('refresh')
  }
  pullDistance.value = 0
  touchStartY.value = 0
}

// 上拉加载逻辑
const onScroll = () => {
  if (props.loading || props.finished) return
  
  const scrollHeight = document.documentElement.scrollHeight
  const scrollTop = document.documentElement.scrollTop || document.body.scrollTop
  const clientHeight = document.documentElement.clientHeight
  
  if (scrollTop + clientHeight >= scrollHeight - 200) {
    emit('load-more')
  }
}

// 视频播放处理 - 确保同时只有一个视频播放
const onVideoPlay = (event: Event) => {
  const videos = document.querySelectorAll('video')
  videos.forEach(video => {
    if (video !== event.target) {
      video.pause()
    }
  })
}

onMounted(() => {
  window.addEventListener('scroll', onScroll)
})

onUnmounted(() => {
  window.removeEventListener('scroll', onScroll)
})
</script>

<style scoped>
.waterfall-container {
  position: relative;
  width: 100%;
  padding: 0 8px;
}

.pull-refresh {
  height: 0;
  overflow: hidden;
  display: flex;
  justify-content: center;
  align-items: center;
  transition: height 0.3s;
}

.pull-refresh.refreshing {
  height: 50px;
}

.refresh-text {
  color: #666;
  text-align: center;
}

.waterfall {
  display: flex;
  gap: 10px;
}

.waterfall-column {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.waterfall-card {
  background: #fff;
  border-radius: 14px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.06);
  overflow: hidden;
  margin-bottom: 0;
  display: flex;
  flex-direction: column;
}

.media-wrapper {
  width: 100%;
  background: #f5f5f5;
  display: flex;
  align-items: center;
  justify-content: center;
}

.media-wrapper img,
.media-wrapper video {
  width: 100%;
  object-fit: cover;
  display: block;
}

.card-info {
  padding: 10px 12px 8px 12px;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.user-box {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

  
.user-info {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 2px;
}

.avatar {
  width: 16px;
  height: 16px;
  border-radius: 50%;
  object-fit: cover;
  border: 1px solid #eee;
}

.nickname {
  font-size: 13px;
  color: #666;
}

.title {
  font-size: 15px;
  color: #222;
  font-weight: 500;
  margin-bottom: 2px;
  line-height: 1.2;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.tag {
  display: inline-block;
  font-size: 12px;
  color: #888;
  line-height: 1.3;
  margin-bottom: 2px;
  border-radius: 6px;
  background: #f2f3f5;
  padding: 2px 4px;
}

.actions {
  display: flex;
  gap: 6px;
  margin-top: 2px;
}

.action {
  display: flex;
  align-items: center;
  gap: 3px;
  font-size: 12px;
  color: #999;
}

/* 样式化图标（可用图标字体替代） */
.icon-like, .icon-comment {
  width: 16px;
  height: 16px;
  background: #f0f0f0;
  border-radius: 50%;
  display: inline-block;
}

.loading-status {
  margin: 20px 0;
  text-align: center;
  padding: 10px 0;
  color: #666;
  font-size: 14px;
}

.load-more {
  color: #007bff;
  cursor: pointer;
}

/* 移动端响应式 */
@media (max-width: 600px) {
  .waterfall {
    gap: 6px;
  }
  .waterfall-container {
    padding: 0 2px;
  }
}

/* 移动端也保持两列 */
</style>