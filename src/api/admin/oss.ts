import request from '@/utils/request'

export interface OssPolicy {
  accessKeyId: string
  policy: string
  signature: string
  dir: string
  host: string
  expire: number
}

export interface OssUploadResult {
  objectKey: string
  url: string
  size: number
  eTag: string
}

export function getOssPolicy(type: 'audio' | 'video' | 'lyrics' | 'cover'): Promise<OssPolicy> {
  return request.get<unknown, OssPolicy>('/admin/manage/oss/policy', { params: { type } })
}

/**
 * 后端代理上传文件到 OSS
 * 将文件通过 multipart/form-data 提交到后端，后端调用 OssService.upload() 完成上传
 */
export function uploadFile(file: File, type: 'audio' | 'video' | 'image' | 'lyrics' | 'cover'): Promise<OssUploadResult> {
  const formData = new FormData()
  formData.append('file', file)
  formData.append('type', type)
  return request.post<unknown, OssUploadResult>('/admin/manage/oss/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
}

/**
 * 删除 OSS 上的文件
 */
export function deleteObject(objectKey: string): Promise<void> {
  return request.delete<unknown, void>('/admin/manage/oss/object', { params: { objectKey } })
}
