import {playMode} from 'common/js/config'
const state = {
	singer: {},
	playing:false,    //播放状态
	fullScreen:false,  //是否全屏
	playlist:[],       //播放列表
	sequenceList:[],   //顺序列表
	mode:playMode.sequence,   //播放模式
	currentIndex: -1,   //播放索引
	
}

export default state
