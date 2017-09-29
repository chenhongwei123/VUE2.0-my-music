<!--歌手的歌曲列表基础组件-->
<template>
  <div class="song-list">
    <ul>
    	
    	<li @click="selectItem(song ,index)" v-for='(song,index) in songs' class="item">
    		 <div class="rank" v-show="rank">
    		 	  <span :class="getRankCls(index)" v-text="getRankText(index)"> </span>
    		 </div>
    		 <div class="content">
    		 	 <h2 class="name">{{song.name}}</h2>
    		 	 <p class="desc">{{getDesc(song)}}</p>
    		 </div>
    		 
    	</li>
    </ul>
  </div>
</template>

<script type="text/ecmascript-6">
export default {
    props: {
      songs: {
        type: Array,
        default: []
      },
      rank: {
        type: Boolean,
        default: false
      }
    },
//  created(){
//  	console.log(this.songs)
//  },
    methods:{
    	getDesc(song){         //歌曲名--歌唱作者
    		//console.log(song)
    		return `${song.singer} - ${song.album} `
    		
    	},
    	selectItem(item,index){   //把歌曲数据传到外面
    		this.$emit('select',item,index)
    	},
    	getRankCls(index){    //排行榜的排行样式
    		if(index<=2){
    			 return `icon icon${index}`
    		}else{
    			return 'text'
    		}
    	},
    	getRankText(index){ 
    		if (index > 2) {    //如果排行榜数据大于2
          return index + 1  //排行榜数据加1 （0开始）
        }
    	}
    }
}
</script>

<style scoped lang="stylus" rel="stylesheet/stylus">
  @import "~common/stylus/variable"
  @import "~common/stylus/mixin"

  .song-list
    .item
      display: flex
      align-items: center
      box-sizing: border-box
      height: 64px
      font-size: $font-size-medium
      .rank
        flex: 0 0 25px
        width: 25px
        margin-right: 30px
        text-align: center
        .icon
          display: inline-block
          width: 25px
          height: 24px
          background-size: 25px 24px
          &.icon0
            bg-image('first')
          &.icon1
            bg-image('second')
          &.icon2
            bg-image('third')
        .text
          color: $color-theme
          font-size: $font-size-large
      .content
        flex: 1
        line-height: 20px
        overflow: hidden
        .name
          no-wrap()
          color: $color-text
        .desc
          no-wrap()
          margin-top: 4px
          color: $color-text-d
</style>