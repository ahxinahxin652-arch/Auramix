import request from '@/utils/request'
export interface OssPolicy {
  accessKeyId: string
  policy: string
  signature: string
  dir: string
  host: string
  expire: number
}
export function getOssPolicy(type: 'audio' | 'video' | 'lyrics' | 'cover'): Promise<OssPolicy> {
  return request.get<unknown, OssPolicy>('/admin/manage/oss/policy', { params: { type } })
}
