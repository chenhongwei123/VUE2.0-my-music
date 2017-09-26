import * as types from './mutation-types'
import {playMode} from 'common/js/config' 
import {shuffle} from 'common/js/util'
import {saveSearch, deleteSearch, clearSearch,savePlay} from 'common/js/cache'

function findIndex(list, song){          //返回歌曲在新列表里的索引
	return list.findIndex((item) =>{
	  return	item.id === song.id            
	})
}
export const selectPlay=function({commit, state}, {list, index}){  //点击歌曲播放的数据设置
	
	commit(types.SET_SEQUENCE_LIST, list)  //顺序播放列表
	
	if(state.mode === playMode.random){              //如果点击后为随机播放
		let randomList = shuffle(list)              //创建随机播放列表
		console.log(randomList)
        commit(types.SET_PLAYLIST, randomList)       //commit随机播放列表
        index = findIndex(randomList, list[index])  //返回歌曲在随机列表里的索引
        console.log(index)
	}else{
		commit(types.SET_PLAYLIST, list)       //播放列表
	}
	
	commit(types.SET_CURRENT_INDEX, index)  //播放索引
	commit(types.SET_FULL_SCREEN, true)     //是否全屏
	commit(types.SET_PLAYING_STATE, true)    //播放状态
}

export const randomPlay=function({commit},{list}){  //随机播放的数据设置
	
	commit(types.SET_PLAY_MODE, playMode.random) //播放模式
	commit(types.SET_SEQUENCE_LIST, list)              //顺序播放列表

    let randomList = shuffle(list)           //创建随机播放列表
    commit(types.SET_PLAYLIST, randomList)   //commit随机播放列表
    
    commit(types.SET_CURRENT_INDEX, 0)  //播放索引
    commit(types.SET_FULL_SCREEN, true)     //是否全屏
	commit(types.SET_PLAYING_STATE, true)    //播放状态
}

export const insetSong = function ({commit,state}, song){    //点击搜索的音乐，播放处理
	// 因为Songer实例拿不到 playlist，sequenceList，currentIndex，所以要用state来获取
	let playlist=state.playlist.slice()          //用slice() 方法来获取副本修改，才不会报错
	let sequenceList= state.sequenceList.slice()
	let currentIndex= state.currentIndex
	
    let currentSong = playlist[currentIndex]          // 记录当前歌曲
    
    // --------------在播放列表中插入该首歌-------------
    let fpIndex = findIndex(playlist, song)          // 查找当前播放列表中是否有待插入的歌曲并返回其索引
 
    currentIndex++                                   // 因为是插入歌曲，所以索引+1
  
   playlist.splice(currentIndex, 0, song)             // 插入这首歌到当前索引位置
  
   if (fpIndex > -1) {                                // 如果已经包含了这首歌
     if (currentIndex > fpIndex) {                    // 如果当前插入的序号大于列表中的序号
       playlist.splice(fpIndex, 1)                    // 删除列表中的序号歌曲（当前索引）
       currentIndex--
     } else {                                         // 如果当前插入的序号小于列表中的序号
      playlist.splice(fpIndex + 1, 1)                  // 删除列表中的序号歌曲（索引加一）
     }
   }
   
   // --------------在顺序列表中插入该首歌-------------
   
   let currentSIndex = findIndex(sequenceList, currentSong) + 1
   //   插入到顺序列表中的位置 =  查找  顺序列表中，当前歌曲的位置  +1
   
   let  fsIndex =findIndex(sequenceList, song)       // 查找当前顺序播放列表中是否有待插入该歌曲并返回其索引
   
   sequenceList.splice(currentSIndex, 0, song)       //在顺序播放列表中插入这首歌
   
    if (fsIndex > -1) {                              // 如果已经包含了这首歌（大于1）
	     if (currentIndex > fsIndex) {                   // 如果当前插入的序号大于列表中的序号
	       sequenceList.splice(fsIndex, 1)                   // 删除列表中的序号歌曲（当前索引）
	       currentIndex--
	     } else {                                        // 如果当前插入的序号小于列表中的序号
	      sequenceList.splice(fsIndex + 1, 1) // 删除列表中的序号歌曲（索引加一）
	     }  
    }
     
    commit(types.SET_PLAYLIST, playlist)            //提交最新的播放列表
    commit(types.SET_SEQUENCE_LIST, sequenceList)     //提交最新的顺序播放列表
    commit(types.SET_CURRENT_INDEX, currentIndex)    //提交最新的播放索引
    commit(types.SET_FULL_SCREEN, true)              //打开全屏
	commit(types.SET_PLAYING_STATE, true)            //播放状态 
 }

export const saveSearchHistory = function({commit}, query){        //缓存搜索历史
	commit(types.SET_SEARCH_HISTORY, saveSearch(query))
}

export const deleteSearchHistory = function({commit}, query){        //删除搜索历史
	commit(types.SET_SEARCH_HISTORY, deleteSearch(query))
}

export const clearSearchHistory = function({commit}){        //清空搜索历史
	commit(types.SET_SEARCH_HISTORY, clearSearch())
}

export const deleteSong = function({commit, state}, song){        //删除一首歌
		// 因为Songer实例拿不到 playlist，sequenceList，currentIndex，所以要用state来获取
	let playlist=state.playlist.slice()          //用slice() 方法来获取副本修改，才不会报错
	let sequenceList= state.sequenceList.slice()
	let currentIndex= state.currentIndex  
	
	let pIndex= findIndex(playlist, song)   //找到这首歌在playlist（播放列表）下的索引
	playlist.splice(pIndex,1)                //并在playlist中删除
	
	let sIndex= findIndex(sequenceList, song)   //找到这首歌在sequenceList（顺序列表）下的索引
	sequenceList.splice(sIndex,1)                //并在sequenceList中删除
	
	if(currentIndex > pIndex || currentIndex ===playlist.length){
		//如果当前播放的歌曲在被删除歌曲的前面  或者  删除的是最后一首歌
		currentIndex--      //都要把歌曲索引减1
	}
	
	commit(types.SET_PLAYLIST, playlist)            //提交最新的播放列表
    commit(types.SET_SEQUENCE_LIST, sequenceList)     //提交最新的顺序播放列表
    commit(types.SET_CURRENT_INDEX, currentIndex)    //提交最新的播放索引

	
	
	if(!playlist.length){     //如果说把整个播放列表删除完了
		commit(types.SET_PLAYING_STATE, false)       //设置播放状态为停止播放 
	}else{
		commit(types.SET_PLAYING_STATE, true)       //设置播放状态为开始播放 
	}
	
}

export const deleteSongsList = function({commit}){    //清空播放列表
	commit(types.SET_PLAYLIST, [])                    //播放列表 
    commit(types.SET_SEQUENCE_LIST, [])               //顺序播放列表设为空数组
    commit(types.SET_CURRENT_INDEX, -1)               //播放索引 设为-1
    commit(types.SET_PLAYING_STATE, false)            //设置播放状态为停止播放 
}

export const savePlayHistory = function({commit}, song){
	commit(types.SET_PLAY_HISTORY,savePlay(song))
}
