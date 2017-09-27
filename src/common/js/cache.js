//存储或缓存的封装方法
import storage from 'good-storage'          //缓存插件

const SEARCH_KEY = '__search__'              //搜索历史数据的键值
const SEARCH_MAX_LEN = 15                     //最大存15条数据

const PLAY_KEY = '__play__'                  //播放历史数据的键值
const PLAY_MAX_LEN = 200                 

const FAVORITE_KEY = '__favorite__'           //收藏列表数据的键值
const FAVORITE_MAX_LEN = 200

function insertArray(arr, val, compare, maxLen) {   //最新存储的数据放在第一位，并且删除相同的数据
  const index = arr.findIndex(compare)   //先查找数据中是否有新插入数据，有就返回索引，没有返回 -1
  if (index === 0) {         //如果是第一条数据，返回不处理
    return
  }
  if (index > 0) {          //如果之前有相同数据，并且不是在第一位
    arr.splice(index, 1)    //先删掉    之前的相同数据
  }    
  arr.unshift(val)          //再把新数据插入到第一个位置
 
 if (maxLen && arr.length > maxLen) {    //如果插入的新数据之后，整体长度大于所限制的长度
    arr.pop()                            //就删掉最后一条数据，以此保持固定长度
  }
}

function deleteFromArray(arr, compare) {  //在存储中删除一项方法
  const index = arr.findIndex(compare)    //先查找数据中是否有新插入数据，有就返回索引，没有返回 -1
  if (index > -1) {              //如果有这个数据
    arr.splice(index, 1)        //存储中删掉这项
  }
}

export function saveSearch(query) {      //存储操作
  let searches = storage.get(SEARCH_KEY, [])   //先获取 SEARCH_KEY 中的值，初始为空数组
  
  insertArray(searches, query, (item) => {      //调用 insertArray 这个存储规则
    return item === query                      //比较函数
  }, SEARCH_MAX_LEN)
  storage.set(SEARCH_KEY, searches)       //再重新存入
  return searches                         //返回出去
}

export function deleteSearch(query) {   //删除操作
  let searches = storage.get(SEARCH_KEY, [])     //先获取 SEARCH_KEY 中的值，初始为空数组
  deleteFromArray(searches, (item) => {           //调用 deleteFromArray 这个删除规则
    return item === query                     //比较函数
  })
  storage.set(SEARCH_KEY, searches)               //再重新存入
  return searches                                //返回出去
}

export function clearSearch() {       //清空缓存操作
  storage.remove(SEARCH_KEY)
  return []
}

export function loadSearch() {        //为了让vuex读取到 存储的值
  return storage.get(SEARCH_KEY, [])
}

export function savePlay(song) {           //存储播放历史
  let songs = storage.get(PLAY_KEY, [])      //当前列表
  insertArray(songs, song, (item) => {
    return song.id === item.id
  }, PLAY_MAX_LEN)
  storage.set(PLAY_KEY, songs)
  return songs
}

export function loadPlay() {          //为了让vuex读取到 播放历史存储的值     
  return storage.get(PLAY_KEY, [])
}

export function saveFavorite(song) {    //存储一首歌到收藏列表
  let songs = storage.get(FAVORITE_KEY, []) //先拿到收藏列表数据，没有的话就是空数组
  insertArray(songs, song, (item) => {   //把歌曲插入到收藏列表中
    return song.id === item.id
  }, FAVORITE_MAX_LEN)
  storage.set(FAVORITE_KEY, songs)       //插入完就存储到FAVORITE_KEY中
  return songs                          //并把新数据返回出去
}

export function deleteFavorite(song) {      //删除收藏列表里的这首歌
  let songs = storage.get(FAVORITE_KEY, []) 
  deleteFromArray(songs, (item) => {
    return item.id === song.id
  })
  storage.set(FAVORITE_KEY, songs)
  return songs
}

export function loadFavorite() {         //为了让vuex读取到 收藏列表存储的值    （初始状态） 
  return storage.get(FAVORITE_KEY, [])
}

