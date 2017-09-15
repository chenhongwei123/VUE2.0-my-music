<!--进度条基础组件-->
<!-- (@touchstart.prevent='')  .prevent   禁止浏览器默认行为-->
<template>
  <div class="progress-bar" ref="progressBar" @click="progressClick">
    <div class="bar-inner">
      <div class="progress" ref="progress" ></div>
      <div class="progress-btn-wrapper" ref="progressBtn"
           @touchstart.prevent="progressTouchStart"      
           @touchmove.prevent="progressTouchMove"
           @touchend="progressTouchEnd"
      >
        <div class="progress-btn"></div>
      </div>
    </div>
  </div>
</template>

<script type="text/ecmascript-6">
  import {prefixStyle} from 'common/js/dom'

  const progressBtnWidth = 16
  const transform = prefixStyle('transform')

  export default {
     props: {
      percent: {
        type: Number,
        default: 0
      }
    },
    created(){
    	this.touch = {}     //把共享数据挂载到这个对象里
    },
    methods:{
    	progressTouchStart(e){      //手指点击                  点击按钮时，进度条的偏移
    		this.touch.initiated = true                 //表示已经初始化
    		this.touch.startX = e.touches[0].pageX     //记录横向第一个手指的位置
    		this.touch.left  = this.$refs.progress.clientWidth  //记录当前按钮的偏移位置（就是进度条按钮的位置）
    		
    	},
    	progressTouchMove(e){     //手指滑动
    		    if(!this.touch.initiated){
    		    	return
    		    }
    		    const deltaX=e.touches[0].pageX - this.touch.startX   //（纵向的偏移量） 进度条移动的距离 = 手指移动的距离 - 初始位置
//  		    console.log(e.touches[0].pageX)
             console.log(this.touch.left)
    		    const offsetWidth = Math.min(this.$refs.progressBar.clientWidth - progressBtnWidth, Math.max(0, this.touch.left + deltaX))
    		                        //    小于   进度条的实际长度                                                                                                            ，                    大于    0   （最初已经偏移量             + 滑动后偏移量）         
    		    this._offset(offsetWidth)
    	},
    	progressTouchEnd(){        //手指离开
    		this.touch.initiated = false    
    		this._triggerPercent()
    	},
    	progressClick(e){    //点击滚动条，播放当前位置开始的进度
        const rect = this.$refs.progressBar.getBoundingClientRect() //getBoundingClientRect（）：获取某个元素相对于视窗的位置集合
        const offsetWidth = e.pageX - rect.left
        
        this._offset(offsetWidth)
        // 这里当我们点击 progressBtn 的时候，e.offsetX 获取不对
         this._offset(e.offsetX)

    		this._triggerPercent()
    	},
    	_triggerPercent(){
    		const barWidth =this.$refs.progressBar.clientWidth - progressBtnWidth     //进度条总长度
    		
    	  // （当前进度条长度 / 进度条总长度 = 当前进度条百分比）
    		const percent = this.$refs.progress.clientWidth / barWidth       
    		
    		this.$emit('percentChange', percent)                                     //将当前进度条百分比派发出去 
    	},
    	_offset(offsetWidth){      //获取移动距离修改样式
    	  	this.$refs.progress.style.width= `${offsetWidth}px`
					this.$refs.progressBtn.style[transform]=`translate3d(${offsetWidth}px,0,0)`
    	}
    },
    watch:{          //数据实时变化操作
			percent(newPercent){
//				console.log(newPercent)
				if(newPercent>=0 && !this.touch.initiated ){
					const barWidth =this.$refs.progressBar.clientWidth - progressBtnWidth     //进度条总长度
//					console.log(barWidth)
					const offsetWidth = newPercent * barWidth       //通过  （进度条所占百分比  * 进度条总长度=当前进度条长度）
					this._offset(offsetWidth)                    
				}
			}
    }
  }
</script>

<style scoped lang="stylus" rel="stylesheet/stylus">
  @import "~common/stylus/variable"

  .progress-bar
    height: 30px
    .bar-inner
      position: relative
      top: 13px
      height: 4px
      background: rgba(0, 0, 0, 0.3)
      .progress
        position: absolute
        height: 100%
        background: $color-theme
      .progress-btn-wrapper
        position: absolute
        left: -8px
        top: -13px
        width: 30px
        height: 30px
        .progress-btn
          position: relative
          top: 7px
          left: 7px
          box-sizing: border-box
          width: 16px
          height: 16px
          border: 3px solid $color-text
          border-radius: 50%
          background: $color-theme
</style>