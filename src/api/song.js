import {commonParams} from './config'
import axios from 'axios'
 
export function getLyric(mid) {
  const url = '/api/lyric'

  const data = Object.assign({}, commonParams, {   //获取歌词
    songmid: mid,
    platform: 'yqq',
    hostUin: 0,
    needNewCode: 0,
    categoryId: 10000000,
    pcachetime: +new Date(),
    format: 'json'
  })

  return axios.get(url, {      //通过axios进行代理处理
    params: data
  }).then((res) => {
    return Promise.resolve(res.data)
  })
}