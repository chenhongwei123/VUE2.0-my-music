import * as types from './mutation-types'
import {playMode} from 'common/js/config' 
import {shuffle} from 'common/js/util'

function findIndex(list, song){          //返回歌曲在新列表里的索引
	return list.findIndex((item) =>{
	  return	item.id === song.id            
	})
}
export const selectPlay=function({commit, state}, {list, index}){  //点击歌曲播放的数据设置
	
	commit(types.SET_SEQUENCE_LIST, list)  //原始数据顺序列表
	
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
	commit(types.SET_SEQUENCE_LIST, list)              //原始数据顺序列表

    let randomList = shuffle(list)           //创建随机播放列表
    commit(types.SET_PLAYLIST, randomList)   //commit随机播放列表
    
    commit(types.SET_CURRENT_INDEX, 0)  //播放索引
    commit(types.SET_FULL_SCREEN, true)     //是否全屏
	commit(types.SET_PLAYING_STATE, true)    //播放状态
}
