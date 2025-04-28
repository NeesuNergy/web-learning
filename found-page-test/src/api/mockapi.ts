import type { ApiResponse, FeedItem } from '../types/feed'

// 模拟不同数据类型的响应
export const getFeedList = (
  type: 'hot' | 'new',
  page: number = 1,
  pageSize: number = 10
): Promise<ApiResponse<FeedItem[]>> => {
  return new Promise((resolve) => {
    // 添加一个随机延迟，模拟网络请求
    setTimeout(() => {
      // 使用URL参数来获取不同格式的数据
      const params = new URLSearchParams(window.location.search)
      const format = params.get('format') || 'default' // 可以是'default'或'detail'
      const source = params.get('source') || 'all' // 可以是'all'、'video'或'image'
      
      // 动态加载 JSON 文件
      import(`../mock/feed_${type}.json`)
        .then((data) => {
          let result: FeedItem[] = [...data.data]
          
          // 根据source参数过滤数据
          if (source === 'video') {
            result = result.filter(item => item.type === 'video')
          } else if (source === 'image') {
            result = result.filter(item => item.type === 'image')
          }
          
          // 根据format参数决定返回的数据结构
          const start = (page - 1) * pageSize
          const end = start + pageSize
          const pageData = result.slice(start, end)
          
          if (format === 'detail') {
            // 返回更详细的数据格式
            resolve({
              code: 200,
              data: pageData,
              pagination: {
                page,
                pageSize,
                total: result.length,
                hasMore: end < result.length
              },
              message: 'Success'
            } as any)
          } else {
            // 默认简洁格式
            resolve({
              code: 200,
              data: pageData,
              message: 'Success'
            })
          }
        })
        .catch(() => resolve({
          code: 404,
          data: [],
          message: 'Data not found'
        }))
    }, 500)
  })
}