import request from '@/utils/request'

const prefix = 'api/v1'

export function getList(data) {
  return request({
    url: 'getlist',
    method: 'get',
    data
  })
}

/**
 * 获取格口信息接口
 * @param
 */
export function getChuteList() {
  return request({
    url: `${prefix}/chute/status`,
    method: 'get'
  })
}

/**
 * 获取小车信息接口
 * @param
 */
export function getCartList() {
  return request({
    url: `${prefix}/cartinfo`,
    method: 'get'
  })
}

/**
 * 获取供包台信息接口
 * @param
 */
export function getUploadList(data) {
  return request({
    url: `${prefix}/upload`,
    method: 'get',
    data
  })
}

/**
 * 获取大盘信息接口
 * @param
 */
export function getInfoList(data) {
  return request({
    url: `${prefix}/info`,
    method: 'get',
    data
  })
}
