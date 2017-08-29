<template>
	<scroll :data='data'
		    class='listview'
		    ref='listView'
		    :listenScroll="listenScroll"
		    :probeType="probeType"
		    @scroll="scroll">
		 <ul>
		 	<li class="list-group" v-for="group in data" ref='listGroup'>
		 		<h2 class="list-group-title">{{group.title}}</h2>
		 		<ul>
		 			<li v-for="item in group.items" class="list-group-item">
		 				<img v-lazy="item.avatar" class="avatar"/>
		 				<span class="name">{{item.name}}</span>
		 			</li>
		 		</ul>
		 	</li>
		 </ul>
		 <div class="list-shortcut" @touchstart='onSgorcutTouchStart' @touchmove.stop.prevent='onSgorcutTouchMove'>
		 	<ul>
		 		<li v-for="(item,index) in shortcutList" 
		 			class="item" 
		 			:data-index='index'
		 			:class="{'current' : currentIndex === index}">
		 			{{item}}
		 		</li>
		 	</ul>
		 </div>
	</scroll>
</template>

<script type="text/ecmascript-6">
	import Scroll from 'base/scroll/scroll'
	import {getData} from 'common/js/dom'
	
	const ANCHOR_HEIGHT=18
	
	export default {
		data(){
			return{
				scrollY:-1,
				currentIndex:0
			}
		},
		created(){
			this.touch={}//数据存入
			this.listenScroll=true
			this.listHeight = []
			this.probeType = 3
		},
		
		props:{
			data:{
				type:Array,
				default:[]
			}
		},
		computed:{
			shortcutList(){
				return this.data.map(function(group){
					//console.log(data.title.substr(0,1))
					//return data.title.substr(0,1)
					return group.title.substr(0,1)
				})
			}
		},
		methods:{
			onSgorcutTouchStart(e){         //点击跳转
				let anchorIndex=getData(e.target,'index')
				console.log(anchorIndex)
				
				let firstTouch=e.touches[0]
				
				this.touch.y1=firstTouch.pageY  //第一次触摸屏幕的y轴位置
				
				this.touch.anchorIndex =anchorIndex
				
				this._scrollTo(anchorIndex)
			},
			onSgorcutTouchMove(e){        //滑动跳转
				let firstTouch=e.touches[0]
				this.touch.y2=firstTouch.pageY  //最后触摸屏幕的y轴位置
				//偏移量
				let delta=(this.touch.y2-this.touch.y1)/ ANCHOR_HEIGHT | 0   
				
				let anchorIndex=parseInt(this.touch.anchorIndex)    + delta         //计算获取所要跳转的index
			
			    this._scrollTo(anchorIndex)
			},
			scroll(pos){
				this.scrollY=pos.y
				//console.log(this.scrollY)
				
			},
			_scrollTo(index){         //点击右侧字母，跳转到左侧对应的index 的方法
				this.$refs.listView.scrollToElement(this.$refs.listGroup[index], 0)
			},
			_calcuateHeight(){
				this.listHeight=[]
				const list = this.$refs.listGroup
				let height = 0
				this.listHeight.push(height)
				for(let i = 0; i< list.length; i++){
					let item = list[i]
					height += item.clientHeight
					this.listHeight.push(height)
				}
				//console.log(height)
			}
		},
		watch:{
			data(){
				setTimeout(() =>{
					this._calcuateHeight()
				},20)
			},
			scrollY(newY) {
	        const listHeight = this.listHeight
	        // 当滚动到顶部，newY>0
	        if (newY > 0) {
	          this.currentIndex = 0
	          return
	        }
	        // 在中间部分滚动
	        for (let i = 0; i < listHeight.length - 1; i++) {
	          let height1 = listHeight[i]
	          let height2 = listHeight[i + 1]
	          if (-newY >= height1 && -newY < height2) {
	            this.currentIndex = i
	            this.diff = height2 + newY
	            return
	          }
	        }
	        // 当滚动到底部，且-newY大于最后一个元素的上限
	        this.currentIndex = listHeight.length - 2
	      }
		},
		
		components:{
			Scroll
		}
	}
	
</script>

<style scoped lang="stylus" rel="stylesheet/stylus">
  @import "~common/stylus/variable"

  .listview
    position: relative
    width: 100%
    height: 100%
    overflow: hidden
    background: $color-background
    .list-group
      padding-bottom: 30px
      .list-group-title
        height: 30px
        line-height: 30px
        padding-left: 20px
        font-size: $font-size-small
        color: $color-text-l
        background: $color-highlight-background
      .list-group-item
        display: flex
        align-items: center
        padding: 20px 0 0 30px
        .avatar
          width: 50px
          height: 50px
          border-radius: 50%
        .name
          margin-left: 20px
          color: $color-text-l
          font-size: $font-size-medium
    .list-shortcut
      position: absolute
      z-index: 30
      right: 0
      top: 50%
      transform: translateY(-50%)
      width: 20px
      padding: 20px 0
      border-radius: 10px
      text-align: center
      background: $color-background-d
      font-family: Helvetica
      .item
        padding: 3px
        line-height: 1
        color: $color-text-l
        font-size: $font-size-small
        &.current
          color: $color-theme
    .list-fixed
      position: absolute
      top: 0
      left: 0
      width: 100%
      .fixed-title
        height: 30px
        line-height: 30px
        padding-left: 20px
        font-size: $font-size-small
        color: $color-text-l
        background: $color-highlight-background
    .loading-container
      position: absolute
      width: 100%
      top: 50%
      transform: translateY(-50%)
</style>