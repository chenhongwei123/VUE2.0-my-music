import {playMode} from 'common/js/config'
import {loadSearch} from 'common/js/cache'

const state = {
	singer: {},       //歌手对象
	playing:false,    //播放状态
	fullScreen:false,  //是否全屏
	playlist:[],       //播放列表
	sequenceList:[],   //顺序列表
	mode:playMode.sequence,   //播放模式
	currentIndex: -1,   //播放索引
	disc:{} ,         //歌单对象
	topList:{},         //排行榜数据对象
	searchHistory: loadSearch()   //搜索历史（读取本地存储的数据）
}

export default state
