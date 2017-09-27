<template>
  <transition name="list-fade">
    <div class="playlist" v-show="showFlag" @click='hide'>
      <div class="list-wrapper" @click.stop>
        <div class="list-header">
          <h1 class="title">
            <i class="icon" :class="iconMode"  @click="changerMode"></i>
            <span class="text">{{modeText}}</span>
            <span class="clear" @click="showConfirm"><i class="icon-clear"></i></span>
          </h1>
        </div>
        <scroll ref="listContent" :refreshDelay='refreshDelay' class="list-content" :data='sequenceList'>
          <transition-group ref="list" name="list" tag="ul">
            <li :key='item.id' ref='listItem' class="item" v-for="(item, index) in sequenceList" @click="selectItem(item, index)">
              <i class="current" :class="getCurrentIcon(item)"></i>
              <span class="text">{{item.name}}</span>
              <span @click.stop='toggleFavorite(item)'  class="like">
                <i :class="getFavoriteIcon(item)"></i>
              </span>
              <span  class="delete" @click.stop="deleteOne(item)">
              	                    <!--@click.stop：这样写是因为，父容器也绑定click，所以为了阻止冒泡-->
                <i class="icon-delete"></i>
              </span>
            </li>
          </transition-group >
        </scroll>
        <div class="list-operate">
          <div  class="add">
            <i class="icon-add"></i>
            <span class="text" @click="addSong">添加歌曲到队列</span>
          </div>
        </div>
        <div  class="list-close" @click='hide'>
          <span>关闭</span>
        </div>
      </div>
      <confirm ref="confirm" @confirm="confirmClear" text="是否清空播放列表" confirmBtnText="清空"></confirm>
      <add-song ref="addSong"></add-song>
    </div>
  </transition>
</template>

<script type="text/ecmascript-6">
import {mapActions} from 'vuex'
//import {mapGetters} from 'vuex'
//import {mapMutations} from 'vuex'
import {playMode} from 'common/js/config'
import Scroll from 'base/scroll/scroll'
import Confirm from 'base/confirm/confirm'
import AddSong from 'components/add-song/add-song'
import {playerMixin} from 'common/js/mixin'

  export default {
  	mixins:[playerMixin],
    data(){
    	return {
    		showFlag: false,
    		refreshDelay:100
    	}
    },
    computed:{
    	modeText(){
    		return this.mode===playMode.sequence ? '顺序播放' : this.mode === playMode.random ? '随机播放' : '循环播放'
    	}
//  	...mapGetters([       
//  		'sequenceList',      //拿到vuex里顺序列表数据
//  		'currentSong',       //播放索引
//  		'playlist'  ,         //播放列表
//  		'mode'               //播放模式
//  	])
    },
    methods:{
    	show(){             //显示
    		this.showFlag = true
    		setTimeout(() =>{          
    			this.$refs.listContent.refresh()   //重新计算高度，使其可以滚动
    			this.scrollToCurrent(this.currentSong)   //调用滚动到当前歌曲索引位置
    		},20)
    	},
    	hide(){            //隐藏
    		this.showFlag = false
    	},
    	getCurrentIcon(item){     //当前播放歌曲添加样式
    	//	console.log(this.currentSong.id)
    		if(this.currentSong.id ===item.id){   
    			 return 'icon-play'
    		}
    		return ''
    	},
    	selectItem(item, index){    //切换其他播放
    	//	console.log(index)
    		if(this.mode===playMode.random){    //如果是随机播放 （索引应该对应随机列表里的）
    			index = this.playlist.findIndex((song) =>{      //返回播放列表中当前对应的歌曲索引
    				return song.id === item.id    //当前playlist的id等于item的id
    			})
    		}
    		this.setCurrentIndex(index)     //如果是顺序播放，或者循环，就是当前点击的index
    		this.setPlayingState(true)
    	},
    	scrollToCurrent(current){  //滚动列表到当前歌曲索引位置
    		const index = this.sequenceList.findIndex((song) =>{ 
    			return current.id ===song.id
    		})
    		this.$refs.listContent.scrollToElement(this.$refs.listItem[index], 300)     //滚动到列表元素
    	},
    	 deleteOne(item){     //删除一首歌
    	  this.deleteSong(item)
    	  if(!this.playlist.length){
    	  	this.hide()
    	  }
      },
      showConfirm(){                    //点击显示弹出框
      	this.$refs.confirm.show()
      },
      confirmClear(){                   //清空列表
      	this.deleteSongsList()        
      	this.hide()
      },
      addSong(){           //点击显示添加歌曲组件
      	this.$refs.addSong.show()
      },
//  	...mapMutations({
//  		setCurrentIndex:'SET_CURRENT_INDEX',     //设置播放索引
//  		sePlayingState: 'SET_PLAYING_STATE'      //设置播放状态
//  	}),
    	...mapActions([
    		'deleteSong',         //映射删除歌曲 方法
    		'deleteSongsList'    //映射清空歌曲列表 方法
    	])
    },
    watch:{
    	currentSong(newSong, oldSong){          //实时监听是否切换歌曲索引
    		if(!this.showFlag || newSong===oldSong){
    			return 
    		}
    		this.scrollToCurrent(newSong) //调用滚动到当前歌曲索引位置
    	}
    },
    components:{
    	Scroll,
    	Confirm,
    	AddSong
    },
  }
</script>

<style scoped lang="stylus" rel="stylesheet/stylus">
  @import "~common/stylus/variable"
  @import "~common/stylus/mixin"

  .playlist
    position: fixed
    left: 0
    right: 0
    top: 0
    bottom: 0
    z-index: 200
    background-color: $color-background-d
    &.list-fade-enter-active, &.list-fade-leave-active
      transition: opacity 0.3s
      .list-wrapper
        transition: all 0.3s
    &.list-fade-enter, &.list-fade-leave-to
      opacity: 0
      .list-wrapper
        transform: translate3d(0, 100%, 0)
    &.list-fade-enter
    .list-wrapper
      position: absolute
      left: 0
      bottom: 0
      width: 100%
      background-color: $color-highlight-background
      .list-header
        position: relative
        padding: 20px 30px 10px 20px
        .title
          display: flex
          align-items: center
          .icon
            margin-right: 10px
            font-size: 30px
            color: $color-theme-d
          .text
            flex: 1
            font-size: $font-size-medium
            color: $color-text-l
          .clear
            extend-click()
            .icon-clear
              font-size: $font-size-medium
              color: $color-text-d
      .list-content
        max-height: 240px
        overflow: hidden
        .item
          display: flex
          align-items: center
          height: 40px
          padding: 0 30px 0 20px
          overflow: hidden
          &.list-enter-active, &.list-leave-active
            transition: all 0.1s
          &.list-enter, &.list-leave-to
            height: 0
          .current
            flex: 0 0 20px
            width: 20px
            font-size: $font-size-small
            color: $color-theme-d
          .text
            flex: 1
            no-wrap()
            font-size: $font-size-medium
            color: $color-text-d
          .like
            extend-click()
            margin-right: 15px
            font-size: $font-size-small
            color: $color-theme
            .icon-favorite
              color: $color-sub-theme
          .delete
            extend-click()
            font-size: $font-size-small
            color: $color-theme
      .list-operate
        width: 140px
        margin: 20px auto 30px auto
        .add
          display: flex
          align-items: center
          padding: 8px 16px
          border: 1px solid $color-text-l
          border-radius: 100px
          color: $color-text-l
          .icon-add
            margin-right: 5px
            font-size: $font-size-small-s
          .text
            font-size: $font-size-small
      .list-close
        text-align: center
        line-height: 50px
        background: $color-background
        font-size: $font-size-medium-x
        color: $color-text-l
</style>