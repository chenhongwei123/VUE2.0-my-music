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
        <div class="middle"
        	   @touchstart.prevent='middleTouchStart'
        	   @touchmove.prevent='middleTouchMove'
        	   @touchend='middleTouchEnd'
        >       
          <!--滚动cd图片-->
          <div class="middle-l" ref="middleL">
            <div class="cd-wrapper" ref="cdWrapper">
              <div class="cd" :class="cdCls">
                <img class="image" :src="currentSong.image">
              </div>
            </div>
            <!--单条歌词显示-->
            <div class="playing-lyric-wrapper">
              <div class="playing-lyric">{{playingLyric}}</div>
            </div>
          </div>
          <!--全部歌词显示-->
          <scroll class="middle-r" ref="lyricList" :data="currentLyric && currentLyric.lines">
            <div class="lyric-wrapper">
              <div v-if="currentLyric">
                <p ref="lyricLine"
                   class="text"
                   :class="{'current': currentLineNum ===index}"
                   v-for="(line,index) in currentLyric.lines">{{line.txt}}</p>
              </div>
            </div>
          </scroll>
        </div>
        <div class="bottom">
          <div class="dot-wrapper">
            <span class="dot" :class="{'active':currentShow === 'cd'}"></span>
            <span class="dot" :class="{'active':currentShow === 'lyric'}"></span>
          </div>
          <div class="progress-wrapper">
            <span class="time time-l">{{format(currentTime)}}</span>
            <div class="progress-bar-wrapper">
              <progress-bar :percent="percent" @percentChange='onProgressBarChange'></progress-bar>
            </div>
            <span class="time time-r">{{format(currentSong.duration)}}</span>
          </div>
          <!--底部播放操作台-->
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
              <i class="icon" @click='toggleFavorite(currentSong)' :class="getFavoriteIcon(currentSong)"></i>
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
	        <div class="control" @click.stop="showPlaylist">
	          <i class="icon-playlist"></i>
	        </div>
	     </div>
	    </transition>  
	    <playlist ref='playlist'></playlist>
	    <audio ref='audio'
	    	     :src="currentSong.url" 
	    	     @play="ready" 
	    	     @error="error"
	    	     @timeupdate="updateTime"
	    	     @ended='end'
	    >  
	    </audio>
  </div>   
</template>

<script type="text/ecmascript-6">
import {mapGetters,mapMutations,mapActions} from 'vuex'
import animations from 'create-keyframe-animation'
import {prefixStyle} from 'common/js/dom'
import ProgressBar from 'base/progress-bar/progress-bar'
import ProgressCircle from 'base/progress-circle/progress-circle'
import {playMode} from 'common/js/config'
//import {shuffle} from 'common/js/util'
import Lyric from 'lyric-parser'     //歌词解析
import Scroll from 'base/scroll/scroll'
import {playerMixin} from 'common/js/mixin'
import Playlist from 'components/playlist/playlist'

const transform = prefixStyle('transform')
const transitionDuration = prefixStyle('transitionDuration')
  
  export default {
      mixins: [playerMixin],
  	  data(){
  	  	return{
  	  		songReady:false,
  	  		currentTime:0,
  	  		radius: 32,
  	  		currentLyric: null,   //当前歌曲的歌词
  	  		currentLineNum: 0 ,  //当前歌词所在的行
  	  		currentShow: 'cd' ,    //滑动绑定样式
  	  		playingLyric: ''
  	  	}
  	  },
  	  created(){   //实例已经创建完成之后被调用
  	  	this.touch={}  //把触摸滑动位置共享数据挂载到这个对象里    （其他地方可以共享使用）
  	  },
      computed:{   //计算属性
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
//      iconMode(){    //判断当前播放模式，并添加相应样式
//  	  //console.log(this.mode)
//      	return this.mode === playMode.sequence ? 'icon-sequence' : this.mode === playMode.loop ?  'icon-loop' : 'icon-random'
//      },
      	...mapGetters([  //获取vuex里的数据
      		'fullScreen',
//    		'playlist',
//    		'currentSong',
      		'playing',
      		'currentIndex',
//    		'mode',
//    		'sequenceList'
      	])
      },
      methods:{
      	back(){        //点击大屏消失
      		this.setFullScreen(false)
      	},
      	open(){        //点击大屏显示
      		this.setFullScreen(true)
      	},
      	end(){     //audio通过end（）监听歌曲播放完毕       （播放完毕后自动跳到下一首）
      		if(this.mode === playMode.loop){   //如果为单曲循环（playMode.loop）
      			 this.loop() 
      		}else{
      			this.next()       
      		}
      	},
      	loop(){     //单曲循环
      		this.$refs.audio.currentTime = 0       //把播放时间设置为0
      		this.$refs.audio.play()               //触发重新开始播放
        	if(this.currentLyric){
    			  this.currentLyric.seek(0)    //循环到下一首时，歌词也跟着跳转
          }
      	},
      	next(){       //下一首
      		if(!this.songReady){
      			return
      		}
      		
      		if(this.playlist.length === 1){    //如果播放列表只有一首歌
      			this.loop()                      //则进行循环播放
      			return
      		}else{
      			let index = this.currentIndex + 1 //下一首歌的索引
      		  console.log(this.playlist.length)
      		
      		  if(index === this.playlist.length){ //如果是最后一首歌，则切换到第一首歌
      			   index = 0
      		  }
      		  this.setCurrentIndex(index)       //索引变为index
      		
      		  if(!this.playing){          //如果点击下一首按钮状态为暂停时
      			   this.togglePlaying()     //变为播放状态，与之匹配
      		  }
      		}
      		
      		this.songReady = false
      	},
      	prev(){     //上一首
      		if(!this.songReady){
      			return
      		}
      		if(this.playlist.length === 1){    //如果播放列表只有一首歌
      			this.loop()                      //则进行循环播放
      		}else{
	      		let index=this.currentIndex - 1
	      		if(index === -1){                //如果第一首歌之前一首，变为最后一首歌的索引
	      			 index = this.playlist.length - 1
	      		}
	      		this.setCurrentIndex(index)      //索引变为index
	      		
	      		if(!this.playing){              //如果点击上一首按钮状态为暂停时
	      			  this.togglePlaying()        //变为播放状态，与之匹配
	      		}
	      	}	
      		this.songReady = false
      	},
      	ready(){        //audio的ready属性（是否切换成功）
      		this.songReady=true
      		this.savePlayHistory(this.currentSong)   
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
      	onProgressBarChange(percent){      //（audio.currentTime） 可读取/设置播放时间
      		
      		const  currentTime= this.currentSong.duration * percent    //计算当前进度条的时间
      		this.$refs.audio.currentTime=currentTime              //传入最新的进度条百分比，
      		
      	  if(!this.playing){
      		 	  this.togglePlaying()
      	  }
      	  
        	if(this.currentLyric){
    			   this.currentLyric.seek(currentTime*1000)    //滑动滚动条，歌词也随之跳转至准确时间
    		  }
      	},
//    	changerMode(){   //切换播放模式 
//   		  const mode =(this.mode + 1) % 3 
//   		  //-------------取余-------------
//   		  //         ( 0 + 1 ) % 3 = ？
//   		  //          3 + 1 = 4
//   		  //          4 / 3 = 1 余 1
//   		  //          以此类推
//   		  
//    		this.setPlayMode(mode)
//    		 
//    		 let list = null
//    		if(mode === playMode.random){   //如果是随机播放
//    			
//    			  list = shuffle(this.sequenceList)    //洗牌，打乱列表顺序
//    			  console.log(list)
//    			  
//    		}else{                        //如果不是随机播放（顺序或循环）
//    			
//    			 list = this.sequenceList    
//    			  console.log(list)
//    		}
//    		this.resetCurrentIndex(list)
//    		this.setPlaylist(list)
//    	},
//    	resetCurrentIndex(list){       //播放模式改变时，把当前歌曲id保持不变
//    		
//    		 let index = list.findIndex((item) =>{  
//    		 	//findIndex() 方法返回传入一个测试条件（函数）符合条件的数组第一个元素位置。
//    		 	
//    		 	  return item.id === this.currentSong.id  //把原始列表中当前id赋值给新列表当前id
//    		 })
//    		 	console.log(index)
//    		 	
//    		 this.setCurrentIndex(index)      //设置歌曲index
//    	},
      	getLyric(){        //歌词处理
      		this.currentSong.getLyric().then((lyric) =>{    //拿到 lyric 这个数据
      			if(this.currentSong.lyric !==lyric){
      				return
      			}
      			this.currentLyric = new Lyric(lyric,this.handleLyric) //通过lyric-parser插件来歌词解析
      			                                                      // this.handleLyric 是回调函数
      			if( this.playing ){                //如果歌曲在播放
      				 this.currentLyric.play()        //触发歌词滚动
      			}
//    			console.log(this.currentLyric)
      		}).catch( () =>{        //catch() 异常处理
      			                      //当获取不到歌词时候，做一些清理操作
      			  this.currentLyric = null    
      			  this.playingLyric = ''
      			  this.currentLineNum= 0
      		})
      	},
      	handleLyric({lineNum, txt}){  //歌词解的回调函数 （当歌曲的行发生改变时进行回调）
      		this.currentLineNum = lineNum     //当前行
      		if(lineNum > 5){            //如果歌词大于五行
      			let lineEl= this.$refs.lyricLine[lineNum-5]     //当前行-5
//    		  console.log(this.$refs.lyricLine[lineNum])
//    		  console.log(lineEl)
      			this.$refs.lyricList.scrollToElement(lineEl, 1000)    //scroll组件自动滚动方法
      		}else{
      			this.$refs.lyricList.scrollTo(0, 0, 1000)
      		}
      		
      		this.playingLyric = txt   //当前播放的歌词映射到 单条歌词显示的div中
      	},
      	showPlaylist(){             //点击播放列表显示
      		 this.$refs.playlist.show()    //调用playlist组件的show()方法
      	},
      	middleTouchStart(e){  //手指刚刚触摸到屏幕时     
      		this.touch.initiated = true           //表示已经初始化 (初始化标志位)
      		const touch = e.touches[0]          //记录第一个手指
      		this.touch.startX = touch.pageX     //记录 横向 第一个手指的位置
      		this.touch.startY = touch.pageY     //记录 纵向 第一个手指的位置
      	},
      	middleTouchMove(e){  //手指滑动时  
      		if(!this.touch.initiated){    //如果没有初始化，返回什么都不做
      			 return
      		}
      		const touch= e.touches[0]          //记录第一个手指
      		const daltaX = touch.pageX - this.touch.startX //（横向的偏移量） 手指滑动的距离 - 初始记录位置
      		//console.log(daltaX)
      		const daltaY = touch.pageY - this.touch.startY //（纵向的偏移量） 手指滑动的距离 - 初始记录位置
      		
      		if(Math.abs(daltaY) > Math.abs(daltaX)){   //如果纵向的偏移量大于横向的偏移量时，什么都不做
      			return                         
      		}
      		
      		const left = this.currentShow ==="cd" ? 0 : -window.innerWidth 
      		// 以页面最右边为中间线，如果歌词还在中间线右边（隐藏），left = 0，否则  left = 页面的宽度
      		
      		const offsetWidth =Math.min(0, Math.max(-window.innerWidth, left + daltaX ) ) 
      		//       偏移宽度           =  小于    (0 ,   大于   （    最小值为 页面的宽度 ,   left的值    + 横向的偏移量）)  右滑为负，左滑为正 
      		
      		this.touch.percent = Math.abs(offsetWidth / window.innerWidth) //滑动的百分比
      	  //	console.log(this.touch.percent)
      		
      		this.$refs.lyricList.$el.style[transform] = `translate3d(${offsetWidth}px, 0, 0)`
      		//  设置歌词滚动组件移动距离的样式
      		//  lyricList 是个组件 ，无法在当前操作此组件的DOM， 只有加上 $el(elenemt)来访问它的DOM
      		
      		this.$refs.lyricList.$el.style[transitionDuration] =0   //移动过渡效果初始化为0
      		console.log(transitionDuration)
      		this.$refs.middleL.style.opacity = 1 - this.touch.percent
      		//设置 唱片图片的透明度，如滑动百分比越大，透明度就越小，反之亦然
      		this.$refs.middleL.style[transitionDuration] =0   //透明度过渡效果初始化为0
      	},
      	middleTouchEnd(){       //手指离开屏幕时  
      		let offsetWidth        //定义歌词所停的位置
      		let opacity           //设置透明度
      		if(this.currentShow === "cd"){  //从右向左滑 （滑动的初始百分比为0%）
      			
  			    if(this.touch.percent > 0.1){  //如果滑动距离超过了10%
  			   	   offsetWidth = -window.innerWidth  //歌词所停的位置就是页面宽度
  			   	   this.currentShow = "lyric"       //说明歌词向左滚过来了，就改变绑定样式为"lyric" 
  			   	   opacity = 0
  			    }else{
  			   	 offsetWidth = 0                     //否则为零，不动
  			   	 opacity = 1
  			    }
      		}else{                            //从左向右滑时  （滑动的初始百分比为100%）
      			if(this.touch.percent < 0.9){  // 如果滑动距离不超过了90%
      				  offsetWidth = 0             // 
      				  this.currentShow = "cd"       //说明歌词向右滚过去了，就改变绑定样式为"cd" 
      				  opacity = 1
      			}else{
      				offsetWidth = -window.innerWidth  //否则没有滑动，距离还是页面宽度
      				opacity = 0
      			}
      		}
      		const time = 300
      		
      		this.$refs.lyricList.$el.style[transform] = `translate3d(${offsetWidth}px, 0, 0)`  //移动距离样式
      		this.$refs.lyricList.$el.style[transitionDuration] = `${time}ms`  //移动过渡效果
      		
      		this.$refs.middleL.style.opacity = opacity
      		//设置 唱片图片的透明度，如滑动百分比越大，透明度就越小，反之亦然
      		this.$refs.middleL.style[transitionDuration] = `${time}ms`  //透明度过渡效果
      		
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
      	console.log(this.currentLyric)
      	if (this.currentLyric) {
          this.currentLyric.togglePlay()    //切换歌曲之前停止当前歌词播放
        }
      },
      disableCls(){       //通过样式来处理歌曲是否切换成功
      	return this.songReady ? '' : 'disable'
      },
      ...mapActions([
      	'savePlayHistory'
      ]),
  	  ...mapMutations({       //通过Mutations映射数据
  		  setFullScreen:'SET_FULL_SCREEN',
//		  setPlayingState:'SET_PLAYING_STATE',
//		  setCurrentIndex:'SET_CURRENT_INDEX',
//		  setPlayMode:'SET_PLAY_MODE',
//		  setPlaylist:'SET_PLAYLIST'
  	  })
    },
    watch:{      //观察Vue实例上的数据变动     
    	
    	currentSong(newSong , oldSong){      //两个参数：第一个新的数据，第二个老的数据
        if(!newSong.id){    //如果没有了歌曲
        	 return       //返回，不执行下面函数
        }
    		if(newSong.id === oldSong.id){     //如果歌曲列表变化了，阻止当前歌曲的变化
    			return
    		}
    		
    		if(this.currentLyric){
    			this.currentLyric.stop()    //切换歌曲之前停止当前歌词播放
    		}
    		clearTimeout(this.timer)
    		this.timer=setTimeout(() =>{    
    			this.$refs.audio.play()
    			this.getLyric()    //获取歌词
    		},1000) 
    	} ,
    	playing(newPlaying, oldPlaying){      //实时观测歌曲播放的状态
    		//console.log(newPlaying)
    		//console.log(oldplaying)
    		const audio=this.$refs.audio
    		this.$nextTick(() =>{
    			//  $nextTick()方法   :  1.Vue 实现响应式并不是数据发生变化之后 DOM 立即变化，而是按一定的策略进行 DOM 的更新。
    			//                    2.因为DOM至少会在当前tick里面的代码全部执行完毕再更新。所以不可能做到在修改数据后并且
    			//                      DOM更新后再执行，要保证在DOM更新以后再执行某一块代码，就必须把这块代码放到下一次事件
    			//                      循环里面，比如setTimeout(fn, 0)，这样DOM更新后，就会立即执行这块代码。
    			//                    3.所以，必须等DOM更新完后，才能进行数据操作
    		  newPlaying ? audio.play() : audio.pause()
    		})
    	}
    },
    components:{
    	ProgressBar,
    	ProgressCircle,
    	Scroll,
    	Playlist
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