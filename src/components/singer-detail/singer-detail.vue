<template>
	<transition name="slide">
	    <music-list :songs='songs' :title='title' :bg-image='bgImage'></music-list>
	 </transition>
</template>

<script type="text/ecmascript-6">
	
	import {getSingerDetail} from 'api/singer'
	import {ERR_OK} from 'api/config'
	import {createSong} from 'common/js/song'
	import {mapGetters} from "vuex"
	import MusicList from 'components/music-list/music-list'
	
	
  export default {
   	data(){
   		return {
         songs: []
      }
   	},
   	computed:{
   		title(){
   			return this.singer.name
   		},
   		bgImage(){
   			return this.singer.avatar
   		},
   		...mapGetters([
   			"singer"
   		])
   	},
   	created(){
   		console.log(this.singer)
   		this._getDetail()
   	   // console.log(this.singer.id)
   	},
   	methods:{
   		_getDetail(){
   			if(!this.singer.id){         //没有歌曲，就跳转至 '/singer'
   				this.$router.push('/singer')
                return
   			}
   			getSingerDetail(this.singer.id).then((res) => {
   				if(res.code === ERR_OK){
   					console.log(res.data.list)
		             this.songs = this._normalizeSongs(res.data.list)
		             console.log( this.songs)
   				}
   			})
     	},
   		_normalizeSongs(list) {
         let ret = []
	        list.forEach((item) => {
	          let {musicData} = item
	          if (musicData.songid && musicData.albummid) {
	            ret.push(createSong(musicData))
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
  @import "~common/stylus/variable"
	  .singer-detail
	  	position: fixed
	  	z-index: 100
	  	top: 0
	  	left: 0
	  	right: 0
	  	bottom: 0
	  	background: $color-background
  
  .slide-enter-active, .slide-leave-active
   transition: all 0.3s

  .slide-enter, .slide-leave-to
   transform: translate3d(100%, 0, 0)

</style>