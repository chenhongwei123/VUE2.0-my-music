<!--排行榜-->
<template>
  <transition name="slide">
    <music-list :rank='rank' :title="title" :bgImage='bgImage' :songs='songs'></music-list>
  </transition>
</template>

<script type="text/ecmascript-6">
import MusicList from 'components/music-list/music-list'
import {getMusicList} from 'api/rank'
import {ERR_OK} from 'api/config'
import {mapGetters} from 'vuex'
import {createSong} from 'common/js/song'

  export default {
  	data(){
  		return{
  			songs:[],
  			rank :true
  		}
  	},
  	computed:{
  		title(){     //标题
  			return this.topList.topTitle
  		},
  		bgImage(){   //封面图片
  			if(this.songs.length){     
  				return  this.songs[0].image 
  			}
  			return ""
  		},
  		...mapGetters([
  			 "topList"
  		])
  	},
  	created(){    
  		this._getMusicList()
  	},
  	methods:{
  		_getMusicList(){     //获取排行榜里的歌曲列表
  			if(!this.topList.id){
  			 this.$router.push('/rank')
          return
  			}
  			getMusicList(this.topList.id).then((res) =>{
  				if(res.code === ERR_OK){
  					console.log(res.songlist)
  					this.songs=this._normalizeSongs(res.songlist)
  				}
  			})
  		},
  		_normalizeSongs(list){  //通过createSong（）工厂模式，转化成songs的实例
  			 let ret=[]
  			 list.forEach((item)=>{    //遍历list
  			 	 const musicData = item.data
  			 	if(musicData.songid && musicData.albummid){
  			 		 ret.push(createSong(musicData))     //push到新数组ret
  			 	}
  			 })
  			  return ret
  		}
  	},
  	components:{
  		MusicList
  	}
  }
    
</script>

<style scoped lang="stylus" rel="stylesheet/stylus">
  .slide-enter-active, .slide-leave-active
    transition: all 0.3s ease

  .slide-enter, .slide-leave-to
    transform: translate3d(100%, 0, 0)
</style>