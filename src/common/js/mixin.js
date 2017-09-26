import { mapGetters, mapMutations, mapActions } from 'vuex'
import { playMode } from 'common/js/config'
import { shuffle } from 'common/js/util'

//------------------------------播放列表相同业务逻辑---------------------------------------------
export const playlistMixin = {       
	computed: {
		...mapGetters([ //拿到列表数据
			'playlist'
		])
	},
	mounted() {
		this.handlePlaylist(this.playlist)
	},
	activated() {
		this.handlePlaylist(this.playlist)
	},
	watch: { //实时监控数据的变化
		playlist(newVal) {
			this.handlePlaylist(newVal)
		}
	},
	methods: {
		handlePlaylist() { //列表处理方法
			throw new Error('component must implement handlePlaylist method') //组件如果没有这个方法，抛出异常
		}
	}
}

//-----------------------------播放相同业务逻辑-------------------------------------------
export const playerMixin = {     
	computed: {
		iconMode() { //判断当前播放模式，并添加相应样式
			//console.log(this.mode)
			return this.mode === playMode.sequence ? 'icon-sequence' : this.mode === playMode.loop ? 'icon-loop' : 'icon-random'
		},
		...mapGetters([
			'sequenceList', //拿到vuex里顺序列表数据
			'currentSong', //播放索引
			'playlist', //播放列表
			'mode' //播放模式
		])
	},
	methods: {
		changerMode() { //切换播放模式 
			const mode = (this.mode + 1) % 3
			//-------------取余-------------
			//         ( 0 + 1 ) % 3 = ？
			//          3 + 1 = 4
			//          4 / 3 = 1 余 1
			//          以此类推

			this.setPlayMode(mode)

			let list = null
			if(mode === playMode.random) { //如果是随机播放

				list = shuffle(this.sequenceList) //洗牌，打乱列表顺序
				console.log(list)

			} else { //如果不是随机播放（顺序或循环）

				list = this.sequenceList
				console.log(list)
			}
			this.resetCurrentIndex(list)
			this.setPlaylist(list)
		},
		resetCurrentIndex(list) { //播放模式改变时，把当前歌曲id保持不变
			let index = list.findIndex((item) => {
				//findIndex() 方法返回传入一个测试条件（函数）符合条件的数组第一个元素位置。

				return item.id === this.currentSong.id //把原始列表中当前id赋值给新列表当前id
			})
			console.log(index)

			this.setCurrentIndex(index) //设置歌曲index
		},
		...mapMutations({ //通过Mutations映射数据
			setPlayingState: 'SET_PLAYING_STATE',
			setCurrentIndex: 'SET_CURRENT_INDEX',
			setPlayMode: 'SET_PLAY_MODE',
			setPlaylist: 'SET_PLAYLIST'
		})
	}

}
//-------------------------------搜索相同业务逻辑---------------------------------------
export const searchMixin = {      
	data() {
		return {
			query: '',
			refreshDelay: 120
		}
	},
	computed: {
		...mapGetters([
			'searchHistory'
		])
	},
	methods: {
		onQueryChanger(query) { //获取子组件 （search-box） 传来的数据
			this.query = query
		},
		blurInput() { //滑动搜索后的结果，让 search-box 组件里的input框失去焦点，手机上输入法框会消失
			this.$refs.searchBox.blur() //调用 search-box 组件的blur()方法
		},
		addQuery(query) { //点击热门块
			//console.log(query)
			this.$refs.searchBox.setQuery(query) //调用子组件的 setQuery()	方法
		},
		saveSearch() {    //存储方法
			this.saveSearchHistory(this.query) //通过vuex 存储搜索历史
		},
		...mapActions([
			'saveSearchHistory', //存储搜索数据
			'deleteSearchHistory' //删除搜索数据
		])
	}
}