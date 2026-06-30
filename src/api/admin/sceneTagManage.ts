import request from '@/utils/request'

export interface SceneTag {
  id: string
  name: string
  description: string
  icon: string | null
  sceneType: number
  conditionsJson: string
  timezoneOffset: number
  priority: number
  displayOrder: number
  status: number
  createdAt: string
  updatedAt: string
}

/** 获取所有场景标签 */
export function getAllSceneTags() {
  return request<SceneTag[]>({
    url: '/admin/manage/sceneTag/all',
    method: 'get',
  })
}

export interface AddSceneTagParams {
  name: string
  description: string
  icon: string
  sceneType: number
  conditionsJson: string
  timezoneOffset: number
  priority: number
  displayOrder: number
  status: number
}

/** 新增场景标签 */
export function addSceneTag(data: AddSceneTagParams) {
  return request<void>({
    url: '/admin/manage/sceneTag/add',
    method: 'post',
    data,
  })
}

/** 更新场景标签 */
export function updateSceneTag(id: string, data: AddSceneTagParams) {
  return request<void>({
    url: `/admin/manage/sceneTag/update/${id}`,
    method: 'put',
    data,
  })
}

/** 删除场景标签 */
export function deleteSceneTag(id: string) {
  return request<void>({
    url: `/admin/manage/sceneTag/delete/${id}`,
    method: 'delete',
  })
}
