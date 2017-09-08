<template>
  <div class="player" v-show="playlist.length>0" >
  	  <!--大的播放器-->
  	  <transition name='normal'
  	  	          @enter='enter' 
  	  	          @after-enter='afterEnter'
  	  	          @leave='leave'
  	  	          @after-leave='afterLeave'
  	  >	          
	     <div class="normal-player" v-show="fullScreen" >
	      <div class="background">
          <img width="100%" height="100%" :src="currentSong.image">
        </div>
        <div class="top">
          <div class="back" @click="back">
            <i class="icon-back"></i>
          </div>
          <h1 class="title" v-html="currentSong.name"></h1>
          <h2 class="subtitle" v-html="currentSong.singer"></h2>
        </div>
        <div class="middle">
          <div class="middle-l" ref="middleL">
            <div class="cd-wrapper" ref="cdWrapper">
              <div class="cd" :class="cdCls">
                <img class="image" :src="currentSong.image">
              </div>
            </div>
            <!--<div class="playing-lyric-wrapper">
              <div class="playing-lyric">{{playingLyric}}</div>
            </div>-->
          </div>
          <!--<scroll class="middle-r" ref="lyricList" :data="currentLyric && currentLyric.lines">
            <div class="lyric-wrapper">
              <div v-if="currentLyric">
                <p ref="lyricLine"
                   class="text"
                   :class="{'current': currentLineNum ===index}"
                   v-for="(line,index) in currentLyric.lines">{{line.txt}}</p>
              </div>
            </div>
          </scroll>-->
        </div>
        <div class="bottom">
          <!--<div class="dot-wrapper">
            <span class="dot" :class="{'active':currentShow==='cd'}"></span>
            <span class="dot" :class="{'active':currentShow==='lyric'}"></span>
          </div>-->
          <div class="progress-wrapper">
            <span class="time time-l">{{format(currentTime)}}</span>
            <div class="progress-bar-wrapper">
              <progress-bar :percent="percent" @percentChange='onProgressBarChange'></progress-bar>
            </div>
            <span class="time time-r">{{format(currentSong.duration)}}</span>
          </div>
          <div class="operators">
            <div class="icon i-left">
              <i :class="iconMode" @click="changerMode"></i>
            </div>
            <div class="icon i-left" :class="disableCls">
              <i @click="prev" class="icon-prev"></i>
            </div>
            <div class="icon i-center" :class="disableCls">
              <i @click="togglePlaying" :class="playIcon"></i>
            </div>
            <div class="icon i-right" :class="disableCls">
              <i @click="next"  class="icon-next"></i>
            </div>
            <div class="icon i-right">
              <i class="icon icon-not-favorite"></i>
            </div>
          </div>
        </div>
      
	     </div>
	    </transition> 
	    
	    <transition name='mini'> 
	     <!--底部小的播放器-->
 	     <div class="mini-player" v-show="!fullScreen" @click="open">
		     	 <div class="icon">
	          <img :class="cdCls"  width="40" height="40" :src="currentSong.image">
	        </div>
	        <div class="text">
	          <h2 class="name" v-html="currentSong.name"></h2>
	          <p class="desc" v-html="currentSong.singer"></p>
	        </div>
	        <div class="control">
	        	<progress-circle :radius="radius" :percent="percent">
	        		 <i  @click.stop="togglePlaying" :class="miniIcon" class="icon-mini" ></i>  
	              <!-- @click.stop=" "  点击阻止事件冒泡-->
	        	</progress-circle>
	          
	        </div>
	        <div class="control">
	          <i class="icon-playlist"></i>
	        </div>
	     </div>
	    </transition>  
	    <audio ref='audio'
	    	     :src="currentSong.url" 
	    	     @canplay="ready" 
	    	     @error="error"
	    	     @timeupdate="updateTime"
	    	     @ended='end'
	    > 
	    </audio>
  </div>   
</template>

<script type="text/ecmascript-6">
import {mapGetters,mapMutations} from 'vuex'
import animations from 'create-keyframe-animation'
import {prefixStyle} from 'common/js/dom'
import ProgressBar from 'base/progress-bar/progress-bar'
import ProgressCircle from 'base/progress-circle/progress-circle'
import {playMode} from 'common/js/config'
import {shuffle} from 'common/js/util'
//import Lyric from 'lyric-parser'
//import Scroll from 'base/scroll/scroll'
//import {playerMixin} from 'common/js/mixin'
//import Playlist from 'components/playlist/playlist'

const transform = prefixStyle('transform')
const transitionDuration = prefixStyle('transitionDuration')
  
  export default {
  	  data(){
  	  	return{
  	  		songReady:false,
  	  		currentTime:0,
  	  		radius: 32
  	  	}
  	  },
      computed:{
      	cdCls(){          //播放图片旋转控制
      		return this.playing ? 'play' : 'play pause'
      	},
      	playIcon(){       //大播放器的暂停播放样式变化
      		 return this.playing? 'icon-pause' : 'icon-play'
      	},
      	miniIcon(){      //小播放器的暂停播放样式变化
      		 return this.playing? 'icon-pause-mini' : 'icon-play-mini'
      	},
      	 percent(){        //进度条所占百分比 
      	   return this.currentTime / this.currentSong.duration
        },
        iconMode(){    //判断当前播放模式，并添加相应样式
    	console.log(this.mode)
        	return this.mode === playMode.sequence ? 'icon-sequence' : this.mode === playMode.loop ?  'icon-loop' : 'icon-random'
        },
      	...mapGetters([  //获取vuex里的数据
      		'fullScreen',
      		'playlist',
      		'currentSong',
      		'playing',
      		'currentIndex',
      		'mode',
      		'sequenceList'
      	])
      },
      methods:{
      	back(){        //点击大屏消失
      		this.setFullScreen(false)
      	},
      	open(){        //点击大屏显示
      		this.setFullScreen(true)
      	},
      	end(){     //audio通过end（）监听歌曲播放完毕
      		if(this.mode === playMode.loop){   //如果为单曲循环（playMode.loop）
      			 this.loop() 
      		}else{
      			this.next()       
      		}
      	},
      	loop(){     //单曲循环
      		this.$refs.audio.currentTime = 0       //把播放时间设置为〇
      		this.$refs.audio.play()               //触发重新开始播放
      	},
      	next(){       //下一首
      		if(!this.songReady){
      			return
      		}
      		let index = this.currentIndex + 1 //下一首歌的索引
      		console.log(this.playlist.length)
      		if(index === this.playlist.length){
      			 index = 0
      		}
      		this.setCurrentIndex(index)
      		
      		if(!this.playing){
      			  this.togglePlaying()
      		}
      		this.songReady = false
      	},
      	prev(){     //上一首
      		if(!this.songReady){
      			return
      		}
      		let index=this.currentIndex - 1
      		if(index === -1){
      			 index = this.playing.length - 1
      		}
      		this.setCurrentIndex(index)
      		if(!this.playing){
      			  this.togglePlaying()
      		}
      		this.songReady = false
      	},
      	ready(){        //audio的ready属性（是否切换成功）
      		this.songReady=true
      	},
      	error(){       //audio的error属性    （是否切换错误）
      		this.songReady=true
      	},
      	updateTime(e){
      		this.currentTime = e.target.currentTime     //audio当前播放的时间
      	},
      	format(interval){         //播放时间处理
      		interval = interval | 0       //向下取整
      		//获取分
      		const minute=interval / 60 |0         
      		//获取秒
      		const second=this._pad( interval % 60  ) 
      		//console.log(second)
      		return `${minute}:${second}`
      	},
      	onProgressBarChange(percent){
      		//   （audio.currentTime） 可读取/设置播放时间
      		 this.$refs.audio.currentTime=this.currentSong.duration * percent //传入最新的进度条百分比，计算当前进度条的时间
      		 if(!this.playing){
      		 	  this.togglePlaying()
      		 }
      	},
      	changerMode(){   //切换播放模式 
      		
     		  const mode =(this.mode + 1) % 3 
     		  //-------------取余-------------
     		  //         ( 0 + 1 ) % 3 = ？
     		  //          3 + 1 = 4
     		  //          4 / 3 = 1 余 1
     		  //          以此类推
     		  
      		this.setPlayMode(mode)
      		 
      		 let list = null
      		if(mode === playMode.random){   //如果是随机播放
      			
      			  list = shuffle(this.sequenceList)    //洗牌，打乱列表顺序
      			  console.log(list)
      			  
      		}else{                        //如果不是随机播放（顺序或循环）
      			
      			 list = this.sequenceList    
      			  console.log(list)
      		}
      		this.resetCurrentIndex(list)
      		this.setPlaylist(list)
      	},
      	resetCurrentIndex(list){       //播放模式改变时，把当前歌曲id保持不变
      		
      		 let index = list.findIndex((item) =>{  
      		 	//findIndex() 方法返回传入一个测试条件（函数）符合条件的数组第一个元素位置。
      		 	
      		 	  return item.id === this.currentSong.id  //把原始列表中当前id赋值给新列表当前
      		 })
      		 	console.log(index)
      		 	
      		 this.setCurrentIndex(index)      //设置歌曲index
      	},
      	_pad(num, n = 2 ){       // 对时间操作补0 （ 3：1  转换成  3：01 ）
      		
      		let len= num.toString().length
      		//console.log(len)
      		while (len < n){
      			num = '0' + num
      			len++
      		}
      		return num
      	},
      	enter(el, done) {     //进入动画1
        const {x, y, scale} = this._getPosAndScale()

        let animation = {
          0: {
            transform: `translate3d(${x}px,${y}px,0) scale(${scale})`
          },
          60: {
            transform: `translate3d(0,0,0) scale(1.1)`
          },
          100: {
            transform: `translate3d(0,0,0) scale(1)`
          }
        }
        animations.registerAnimation({
          name: 'move',
          animation,
          presets: {
            duration: 400,
            easing: 'linear'
          }
        })
        animations.runAnimation(this.$refs.cdWrapper, 'move', done)
      },
      afterEnter() {         //进入动画后处理1
        animations.unregisterAnimation('move')
        this.$refs.cdWrapper.style.animation = ''
      },
      leave(el, done) {      //进入动画2
        this.$refs.cdWrapper.style.transition = 'all 0.4s'
        const {x, y, scale} = this._getPosAndScale()
        this.$refs.cdWrapper.style[transform] = `translate3d(${x}px,${y}px,0) scale(${scale})`
        this.$refs.cdWrapper.addEventListener('transitionend', done)
      },
      afterLeave() {         //进入动画后处理3
        this.$refs.cdWrapper.style.transition = ''
        this.$refs.cdWrapper.style[transform] = ''
      },
      _getPosAndScale() {    //获取进入动画之前的初始位置数据
        const targetWidth = 40
        const paddingLeft = 40
        const paddingBottom = 30
        const paddingTop = 80
        const width = window.innerWidth * 0.8
        const scale = targetWidth / width
        const x = -(window.innerWidth / 2 - paddingLeft)
        const y = window.innerHeight - paddingTop - width / 2 - paddingBottom
        return {
          x,
          y,
          scale
        }
      },
      togglePlaying(){      // 操作暂停与播放
      	this.setPlayingState(!this.playing)
      },
      disableCls(){       //通过样式来处理歌曲是否切换成功
      	return this.songReady ? '' : 'disable'
      },
  	  ...mapMutations({       //通过Mutations映射数据
  		  setFullScreen:'SET_FULL_SCREEN',
  		  setPlayingState:'SET_PLAYING_STATE',
  		  setCurrentIndex:'SET_CURRENT_INDEX',
  		  setPlayMode:'SET_PLAY_MODE',
  		  setPlaylist:'SET_PLAYLIST'
  	  })
    },
    watch:{      //观察Vue实例上的数据变动     
    	currentSong(newSong , oldSong){
    		if(newSong.id === oldSong.id){     //如果歌曲列表变化了，阻止当前歌曲的变化
    			return
    		}
    		this.$nextTick(() =>{
    			this.$refs.audio.play()
    			
    		})
    	}                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               ,
    	playing(newPlaying){
//  			console.log(this.currentTime / this.currentSong.duration)
    		const audio=this.$refs.audio
    		this.$nextTick(() =>{
    		  newPlaying ? audio.play() : audio.pause()
    		})
    	}
    },
    components:{
    	ProgressBar,
    	ProgressCircle
    }
  }
</script>

<style scoped lang="stylus" rel="stylesheet/stylus">
  @import "~common/stylus/variable"
  @import "~common/stylus/mixin"

  .player
    .normal-player
      position: fixed
      left: 0
      right: 0
      top: 0
      bottom: 0
      z-index: 150
      background: $color-background
      .background
        position: absolute
        left: 0
        top: 0
        width: 100%
        height: 100%
        z-index: -1
        opacity: 0.6
        filter: blur(20px)
      .top
        position: relative
        margin-bottom: 25px
        .back
          position absolute
          top: 0
          left: 6px
          z-index: 50
          .icon-back
            display: block
            padding: 9px
            font-size: $font-size-large-x
            color: $color-theme
            transform: rotate(-90deg)
        .title
          width: 70%
          margin: 0 auto
          line-height: 40px
          text-align: center
          no-wrap()
          font-size: $font-size-large
          color: $color-text
        .subtitle
          line-height: 20px
          text-align: center
          font-size: $font-size-medium
          color: $color-text
      .middle
        position: fixed
        width: 100%
        top: 80px
        bottom: 170px
        white-space: nowrap
        font-size: 0
        .middle-l
          display: inline-block
          vertical-align: top
          position: relative
          width: 100%
          height: 0
          padding-top: 80%
          .cd-wrapper
            position: absolute
            left: 10%
            top: 0
            width: 80%
            height: 100%
            .cd
              width: 100%
              height: 100%
              box-sizing: border-box
              border: 10px solid rgba(255, 255, 255, 0.1)
              border-radius: 50%
              &.play
                animation: rotate 20s linear infinite
              &.pause
                animation-play-state: paused
              .image
                position: absolute
                left: 0
                top: 0
                width: 100%
                height: 100%
                border-radius: 50%

          .playing-lyric-wrapper
            width: 80%
            margin: 30px auto 0 auto
            overflow: hidden
            text-align: center
            .playing-lyric
              height: 20px
              line-height: 20px
              font-size: $font-size-medium
              color: $color-text-l
        .middle-r
          display: inline-block
          vertical-align: top
          width: 100%
          height: 100%
          overflow: hidden
          .lyric-wrapper
            width: 80%
            margin: 0 auto
            overflow: hidden
            text-align: center
            .text
              line-height: 32px
              color: $color-text-l
              font-size: $font-size-medium
              &.current
                color: $color-text
      .bottom
        position: absolute
        bottom: 50px
        width: 100%
        .dot-wrapper
          text-align: center
          font-size: 0
          .dot
            display: inline-block
            vertical-align: middle
            margin: 0 4px
            width: 8px
            height: 8px
            border-radius: 50%
            background: $color-text-l
            &.active
              width: 20px
              border-radius: 5px
              background: $color-text-ll
        .progress-wrapper
          display: flex
          align-items: center
          width: 80%
          margin: 0px auto
          padding: 10px 0
          .time
            color: $color-text
            font-size: $font-size-small
            flex: 0 0 30px
            line-height: 30px
            width: 30px
            &.time-l
              text-align: left
            &.time-r
              text-align: right
          .progress-bar-wrapper
            flex: 1
        .operators
          display: flex
          align-items: center
          .icon
            flex: 1
            color: $color-theme
            &.disable
              color: $color-theme-d
            i
              font-size: 30px
          .i-left
            text-align: right
          .i-center
            padding: 0 20px
            text-align: center
            i
              font-size: 40px
          .i-right
            text-align: left
          .icon-favorite
            color: $color-sub-theme
      &.normal-enter-active, &.normal-leave-active
        transition: all 0.4s
        .top, .bottom
          transition: all 0.4s cubic-bezier(0.86, 0.18, 0.82, 1.32)
      &.normal-enter, &.normal-leave-to
        opacity: 0
        .top
          transform: translate3d(0, -100px, 0)
        .bottom
          transform: translate3d(0, 100px, 0)
    .mini-player
      display: flex
      align-items: center
      position: fixed
      left: 0
      bottom: 0
      z-index: 180
      width: 100%
      height: 60px
      background: $color-highlight-background
      &.mini-enter-active, &.mini-leave-active
        transition: all 0.4s
      &.mini-enter, &.mini-leave-to
        opacity: 0
      .icon
        flex: 0 0 40px
        width: 40px
        padding: 0 10px 0 20px
        img
          border-radius: 50%
          &.play
            animation: rotate 10s linear infinite
          &.pause
            animation-play-state: paused
      .text
        display: flex
        flex-direction: column
        justify-content: center
        flex: 1
        line-height: 20px
        overflow: hidden
        .name
          margin-bottom: 2px
          no-wrap()
          font-size: $font-size-medium
          color: $color-text
        .desc
          no-wrap()
          font-size: $font-size-small
          color: $color-text-d
      .control
        flex: 0 0 30px
        width: 30px
        padding: 0 10px
        .icon-play-mini, .icon-pause-mini, .icon-playlist
          font-size: 30px
          color: $color-theme-d
        .icon-mini
          font-size: 32px
          position: absolute
          left: 0
          top: 0

  @keyframes rotate
    0%
      transform: rotate(0)
    100%
      transform: rotate(360deg)
</style>