<!--搜索组件-->
<template>
  <div class="search">
  	<div class="search-box-wrapper">
  		<!--搜索框组件-->
  		<search-box ref='searchBox' @query='onQueryChanger'></search-box>
  	</div>
	  <div ref='shortcutWrapper' class="shortcut-wrapper" v-show='!query'>
	  	<scroll class="shortcut" ref='shortcut' :data='shortcut'>
	  		<div>
		  		<div class="hot-key">
		  			<h1 class="title">热门搜索</h1>
		  			<ul>
		  				<li @click="addQuery(item.k)" class="item" v-for="item in hotkey">
		  					<span>{{item.k}}</span>
		  				</li>
		  			</ul>
		  		</div>
		  	  <div class="search-history" v-show="searchHistory.length">
          <h1 class="title">
             <span class="text">搜索历史</span>
             <span  class="clear" @click="showConfirm">
               <i class="icon-clear"></i>
             </span>
          </h1> 
          <!--搜索历史列表组件-->
          <search-list @select='addQuery'
          	           @delete='deleteSearchHistory' 
          	           :searches = 'searchHistory'
          >
          </search-list>
        </div>
	  	  </div>
	  	</scroll>
	  </div>
	  <div ref='searchResult' class="search-result" v-show="query">
	  	<suggest @select='saveSearch'
	  		       ref="suggest" 
	  		       :query='query' 
	  		       @listScroll='blurInput'
	    ></suggest>
	  </div>
	  <!--弹出框基础组件-->
	 <confirm ref='confirm'
	 	        text='是否清空所有搜索历史' 
	 	        confirmBtnText='清空'
	 	        @confirm='clearSearchHistory'
	 ></confirm>
	   <router-view></router-view>
	</div>  
</template>

<script type="text/ecmascript-6">
 import SearchBox from 'base/search-box/search-box'
 import {getHotKey} from 'api/search'
 import {ERR_OK} from 'api/config'
 import Suggest from 'components/suggest/suggest'
 import SearchList from 'base/search-list/search-list'
 import Confirm from 'base/confirm/confirm'
 import Scroll from 'base/scroll/scroll'
 import {mapActions, mapGetters} from 'vuex'
 import {playlistMixin} from 'common/js/mixin'

 
 export default{
 	mixins:[playlistMixin],
 	data(){
 		return{
 			hotkey:[],
 			query:''
 		}
 	},
 	created(){
 		this._getHotKey()
 	},
  computed:{
  	shortcut(){       //为了滚动，要把两个列表的数据连接在一起，才能滚动所有显示区域
  		return this.hotkey.concat(this.searchHistory)
  	},
	   ...mapGetters([
	 	   'searchHistory'
	  ])
  },
 	methods:{ 
 		handlePlaylist(playlist){     //处理底部遮挡
 			const bottom = playlist.length > 0 ? '60px' : ''
      this.$refs.shortcutWrapper.style.bottom= bottom
      this.$refs.shortcut.refresh() 
      this.$refs.searchResult.style.bottom= bottom
      this.$refs.suggest.refresh() 
 		},
 		addQuery(query){   //点击热门块
 			//console.log(query)
 			this.$refs.searchBox.setQuery(query)		//调用子组件的 setQuery()	方法
 		},
 		saveSearch(){                             //存储方法
 			this.saveSearchHistory(this.query)     //通过vuex 存储搜索历史
 		},
 		showConfirm(){                      
 			this.$refs.confirm.show()      //调用confirm组件 的show() 的方法
 		},
// 		deleteOne(item){                              //删除方法
// 			this.deleteSearchHistory(item)     //通过vuex 删除存储搜索历史
// 		},
// 		deleteAll(){                        //清空缓存方法
// 			this.clearSearchHistory()
// 		},
 		_getHotKey(){               //获取热门搜索块数据
 			getHotKey().then((res) =>{
 				if(res.code === ERR_OK){
 					console.log(res.data.hotkey)
 					this.hotkey = res.data.hotkey.slice(0,10)   //截取前十个数据
 				}
 			})  
 		},
 		onQueryChanger(query){   //获取子组件 （search-box） 传来的数据
 			this.query = query
 		},
 		blurInput(){        //滑动搜索后的结果，让 search-box 组件里的input框失去焦点，手机上输入法框会消失
 			this.$refs.searchBox.blur()    //调用 search-box 组件的blur()方法
 		},
 		...mapActions([                 //映射vuex 的  Actions中的方法
 			'saveSearchHistory',     //存储搜索数据
 			'deleteSearchHistory' ,           //删除搜索数据
 			'clearSearchHistory'           //清空
 		])
 	},
 	watch:{
   		query(newQuery){
   			if(!newQuery){         //如果没有搜索词
   				 setTimeout(() =>{
   				 	this.$refs.shortcut.refresh()        //手动刷新一下，可以使搜索历史滚动
   				 },20)
   			}
   		}
 	},
 	components:{
 		SearchBox,
 		Suggest,
 		SearchList,
 		Confirm,
 		Scroll
 	}
 }
</script>

<style lang="stylus" rel="stylesheet/stylus">
  @import "~common/stylus/variable"
  @import "~common/stylus/mixin"

  .search
    .search-box-wrapper
      margin: 20px
    .shortcut-wrapper
      position: fixed
      top: 178px
      bottom: 0
      width: 100%
      .shortcut
        height: 100%
        overflow: hidden
        .hot-key
          margin: 0 20px 20px 20px
          .title
            margin-bottom: 20px
            font-size: $font-size-medium
            color: $color-text-l
          .item
            display: inline-block
            padding: 5px 10px
            margin: 0 20px 10px 0
            border-radius: 6px
            background: $color-highlight-background
            font-size: $font-size-medium
            color: $color-text-d
        .search-history
          position: relative
          margin: 0 20px
          .title
            display: flex
            align-items: center
            height: 40px
            font-size: $font-size-medium
            color: $color-text-l
            .text
              flex: 1
            .clear
              extend-click()
              .icon-clear
                font-size: $font-size-medium
                color: $color-text-d
    .search-result
      position: fixed
      width: 100%
      top: 178px
      bottom: 0
</style>