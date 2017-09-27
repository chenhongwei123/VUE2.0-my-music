<template>
	<div class="recommend" ref="recommend">
		<scroll ref="scroll" class="recommend-content" :data='discList'>
			<div>
				<div v-if="recommends.length" class="slider-wrapper">
					<slider>
						<div v-for="item in recommends" class="">
							<a :href="item.linkUrl">
								<img class="needsclick" :src="item.picUrl" />
							</a>
						</div>
					</slider>
				</div>
				<div class="recommend-list">
					<h1 class="list-title">热门歌单推荐</h1>
					<ul>
						<li v-for="item in discList" class="item" @click="selectItem(item)">
							<div class="icon">
								<img v-lazy="item.imgurl" width="60" height="60"  />
							</div>
							<div class="text">
								<h2 class="name" v-html="item.creator.name"></h2>
								<p class="desc" v-html="item.dissname"></p>
							</div>
						</li> 
					</ul>
				</div>
			</div>
			<div class="loading-container" v-show="!discList.length">
            <loading></loading>
            </div>
		</scroll>
		<router-view></router-view>
	</div>
</template>

<script type="text/ecmascript-6">
	import Loading from 'base/loading/loading'
	import Scroll from 'base/scroll/scroll'
	import Slider from 'base/slider/slider'
	import { getRecommend, getDiscList } from 'api/recommend'
	import { ERR_OK } from 'api/config'
	import { playlistMixin } from 'common/js/mixin'
	import {mapMutations} from "vuex"

	export default {
		mixins : [playlistMixin],       //插入mixins
		data() {
			return {
				recommends: [],
				discList: []
			}
		},
		created() {
			//location.reload()
			this._getRecommend()
			this._getDiscList()
		},
		methods: {
			handlePlaylist(playlist){          //引入mixins里的handlePlaylist（）方法
				const bottom = playlist.length > 0 ? '60px' : ''
					//如果有列表数据，就把滚动组件的底部向上60px，从而不被底部小播放器遮盖，否则不变
				this.$refs.recommend.style.bottom = bottom
				this.$refs.scroll.refresh()     //调用scroll组件的刷新方法，重新刷新计算一次
			},
			selectItem(item){               //
				this.$router.push({
					path:`/recommend/${item.dissid}`
				})
				this.setDisc(item)           //把数据传入vuex所映射的这个方法里
			},
			_getRecommend() {        //获取轮播图数据
				getRecommend().then((res) => {
					if(res.code === ERR_OK) {
						console.log(res.data.slider)
						this.recommends = res.data.slider
					}
				})
			}, 
			_getDiscList() {       //获取热门歌单推荐数据
				getDiscList().then((res) => {
					if(res.code === ERR_OK) {
						console.log(res.data.list)
						this.discList = res.data.list
					}
				})
			},
			...mapMutations({ 
     	    		setDisc:"SET_DISC"      //vuex 一个映射方法
     	    	})

		},
		components: {
			Slider,
			Scroll,
			Loading
		}
	}
</script>

<style scoped lang="stylus" rel="stylesheet/stylus">
  @import "~common/stylus/variable"

  .recommend
    position: fixed
    width: 100%
    top: 88px
    bottom: 0
    .recommend-content
      height: 100%
      overflow: hidden
      .slider-wrapper
        position: relative
        width: 100%
        overflow: hidden
      .recommend-list
        .list-title
          height: 65px
          line-height: 65px
          text-align: center
          font-size: $font-size-medium
          color: $color-theme
        .item
          display: flex
          box-sizing: border-box
          align-items: center
          padding: 0 20px 20px 20px
          .icon
            flex: 0 0 60px
            width: 60px
            padding-right: 20px
          .text
            display: flex
            flex-direction: column
            justify-content: center
            flex: 1
            line-height: 20px
            overflow: hidden
            font-size: $font-size-medium
            .name
              margin-bottom: 10px
              color: $color-text
            .desc
              color: $color-text-d
      .loading-container
        position: absolute
        width: 100%
        top: 50%
        transform: translateY(-50%)
</style>