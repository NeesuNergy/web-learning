// 数据项类型
export interface FeedItem {
    id: number
    type: 'video' | 'image'
    url: string
    cover?: string
    title: string
    likeCount: number
    avatar?: string // 用户头像
    nickname?: string // 用户昵称
    height?: number // 图片/视频高度
    tag: string // 标签
}

// 接口响应类型
export interface ApiResponse<T> {
    code: number
    data: T
    message?: string
}