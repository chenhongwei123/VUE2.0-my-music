<!--小播放器的圆形进度条基础组件-->
<template>
  <div class="progress-circle">
    <svg :width="radius" :height="radius" viewBox="0 0 100 100" version="1.1" xmlns="http://www.w3.org/2000/svg">
      <circle class="progress-background" r="50" cx="50" cy="50" fill="transparent"/>
      
      <circle class="progress-bar" r="50" cx="50" cy="50" fill="transparent" :stroke-dasharray="dashArray"
              :stroke-dashoffset="dashOffset"/>
              <!--
              	 viewBox：视口大小
              	  第一个circle表示内层园          （r=半径      cx，cy=圆点）
              	  第二个circle表示外层园
              	  stroke-dasharray:  外层圆的周长
              	  stroke-dashoffset：外层圆描边的长度
              -->
    </svg>
    <slot></slot>
  </div>
</template>

<script type="text/ecmascript-6">
  export default {
    props: {
      radius: {                 //svg的长宽数值 
        type: Number,
        default: 100
      },
      percent: {               //进度条百分比
        type: Number,
        default: 0
      }
    },
    data() {
      return {
        dashArray: Math.PI * 100   //2πr
      }
    },
    computed: {
      dashOffset() {
        return (1 - this.percent) * this.dashArray     //外层圆描边的长度
      }
    }
}
</script>

<style scoped lang="stylus" rel="stylesheet/stylus">
  @import "~common/stylus/variable"

  .progress-circle
    position: relative
    circle
      stroke-width: 8px
      transform-origin: center
      &.progress-background
        transform: scale(0.9)
        stroke: $color-theme-d
      &.progress-bar
        transform: scale(0.9) rotate(-90deg)
        stroke: $color-theme
</style>