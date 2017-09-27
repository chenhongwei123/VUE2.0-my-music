<template>
  <transition name="slide">
    <music-list :title="title" :bg-image="bgImage" :songs='songs'></music-list>
  </transition>
</template>

<script type="text/ecmascript-6">
import MusicList from 'components/music-list/music-list'
import {getSongList} from 'api/recommend'
import {ERR_OK} from 'api/config'
import {mapGetters} from 'vuex'
import {createSong} from 'common/js/song'

  export default {
  	data(){
  		return{
  			songs:[]
  		}
  	},
    computed:{
    	title(){
    		return  this.disc.disname
    	},
    	bgImage(){
    		return  this.disc.imgurl
    	},
    	...mapGetters([   //接受vuex所映射的数据
    		'disc'
    	])
    },
    created(){
    	this._getSongList()
    	
    },
    methods:{
    	_getSongList(){
    	//	console.log(this.disc.dissid)
    		if( !this.disc.dissid){
    			this.$router.push('/recommend')
    		}
    		getSongList(this.disc.dissid).then((res) =>{    //获取歌单数据
    			//console.log(res.code)
    			if(res.code ===ERR_OK){
    				console.log(res)
    				this.songs = this._normalizeSongs(res.cdlist[0].songlist)
    				//console.log(this.songs)
    			}
    		})
    	},
    	_normalizeSongs(list){
    		let ret = []     //定义一个新数组
    		list.forEach((musicData) =>{       //将list数据进行遍历（forEach），通过musicData接受每一组数据
    			//console.log(musicData)
    			if(musicData.songid && musicData.albummid){   //如果每一组数据中有songid和albummid
    				  ret.push(createSong(musicData))       //通过createSong（）方法创建一个新的对象
    				 // ret1.push(musicData)
    			}
    		})
    		return ret
    	}
    },
    components: {
      MusicList
    }
  }
</script>

<style scoped lang="stylus" rel="stylesheet/stylus">
  .slide-enter-active, .slide-leave-active
    transition: all 0.3s

  .slide-enter, .slide-leave-to
    transform: translate3d(100%, 0, 0)
</style>