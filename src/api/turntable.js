import request from '@/utils/request'

export function getList(data) {
  return request({
    url: 'getlist',
    method: 'get',
    data
  })
}
