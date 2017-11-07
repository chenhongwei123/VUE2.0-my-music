<!--搜索结果列表-->
<template>
  <scroll :data='result'
  	      ref="suggest"  
  	      class="suggest"
  	      :pullup='pullup'
  	      :beforeScroll='beforeScroll'
  	      @scrollToEnd='searchMore'
  	      @beforeScroll='listScroll'
  >
    <ul class="suggest-list">
      <li @click="selectItem(item)" class="suggest-item" v-for="item in result">
        <div class="icon">
          <i :class="getIconClass(item)"></i>
        </div>
        <div class="name">
          <p class="text" v-html="getDisplayName(item)"></p>
        </div>
      </li>
      <loading v-show="hasMore" title=""></loading>
    </ul>
    <div v-show="!hasMore && !result.length" class="no-result-wrapper">
      <no-result title="抱歉，暂无搜索结果"></no-result>
    </div>
  </scroll>
</template>

<script type="text/ecmascript-6">
import Scroll from 'base/scroll/scroll'
import Loading from 'base/loading/loading'
import NoResult from 'base/no-result/no-result'
import {search} from 'api/search'
import {ERR_OK} from 'api/config'
//import {filterSinger} from 'common/js/song'
import {createSong} from 'common/js/song'
import {mapMutations, mapActions} from 'vuex'
import Singer from 'common/js/singer'

  const TYPE_SINGER = 'singer'
  const perpage = 20

  export default {
      props:{
      	query:{
      		type:String,
      		default: ''
      	},
      	showSinger: {
	        type: Boolean,
	        default: true
	      }
      },
      data(){
      	return {
      		page:1,
      		result:[],
      		pullup: true,
      		beforeScroll:true,
      		hasMore:true    //标志符
      	}
      },
      methods:{
      	search(){                  //获取搜索数据，并对数据处理
      		this.page = 1            //首次初始化页数为1
      		this.hasMore = true      
      		this.$refs.suggest.scrollTo(0,0)   //当前滑动元素在顶部
      		search(this.query, this.page, this.showSinger, perpage).then((res) =>{
      			if(res.code === ERR_OK){
      				this.result=this._genResult(res.data)
      			  this._checkMore(res.data)
      			//	console.log(this.result)
      			}
      		})
      	},
      	searchMore(){         //  上拉加载
      		if(!this.hasMore){     
      			return
      		}
      		this.page++   //页数加1
      		search(this.query, this.page, this.showSinger, perpage).then((res) =>{   //再获取下一页的数据
      			if(res.code === ERR_OK){
      				this.result= this.result.concat(this._genResult(res.data))  //把当前数据与新数据拼接
      			  this._checkMore(res.data)
      				console.log(this.result)
      			}
      		})
      	},
      	selectItem(item){      //点击搜索内容跳转相应歌手或歌曲
      		console.log(item)
      		if(item.type === TYPE_SINGER){
      			const singer = new Singer({    //通过数据创建一个Singer对象
      				 id: item.singermid,
               name: item.singername
      			})
      		  // console.log(singer)	
      			this.$router.push({       // 二级路由跳转至 带有id
      		    	path:`/search/${singer.id}`
	      		})
      			
	      		this.setSinger(singer)     //调用映射方法传入数据
      		}else{
      			this.insetSong(item)      //调用映射 actions 中的 'insetSong' 方法提交数据操作
      		}
      		this.$emit('select')     
      		//本组件做完了自己要做的事情之后，可以派发一个事件出去，给关心本事件的组件（保存搜索历史，是由父组件来完成的）
      	},
      	getDisplayName(item){    //歌曲名字处理
      		//console.log(item)
      		if(item.type === TYPE_SINGER){ 
      			return item.singername
      		}else{
      			return `${item.name}-${item.singer}`
      		}
      	},
      	getIconClass(item){   //搜索列表图标样式处理
      		if(item.type === TYPE_SINGER){ 
      			return 'icon-mine'
      		}else{
      			return 'icon-music'
      		}
      	},
      	refresh(){       //代理重新计算高度的方法出去
      		this.$refs.suggest.refresh()
      	},
      	listScroll(){     //
      		this.$emit('listScroll')
      	},
      	_checkMore(data){      //判断上拉是否还有数据可以加载
      		const song = data.song
      		if(!song.list.length || (song.curnum + song.curpage * perpage) >= song.totalnum){
      			this.hasMore = false    //如果没有了数据，把 hasMore 标志符变为false
      		}
      	},
      	_genResult(data){      //对数据重新操作处理
      		let ret=[]
      		if(data.zhida && data.zhida.singerid){ //如果有歌手信息并且有id数据
      			ret.push({...data.zhida, ...{type:TYPE_SINGER}})
      			// ...对象扩展运算符，把  data.zhida 的所有对象都拷贝到空数组
      			//                   把 type为 'singer' 创建到数组中
      		}
      		if(data.song){
      			 ret = ret.concat(this._normalizeSongs(data.song.list)) //连接这个数组
      		}
      		console.log(ret)
      		return ret
      	},
      	_normalizeSongs(list){ //通过createSong工厂模式改造list数据，方便解析
      		let ret = []
      		list.forEach((musicData) =>{
      			if(musicData.songid && musicData.albummid){
      				ret.push(createSong(musicData))
      			}
      		})
      		return ret
      	},
      	...mapMutations({               //VUEX映射歌手对象方法
      		setSinger:'SET_SINGER' 
      	}),
      	...mapActions([               //VUEX映射 actions 中的 'insetSong' 方法
      		 'insetSong'
      	])
      },
      watch:{    
      	query(){           //实时观测搜索词的变化
      		this.search()    //通过 search() 方法
      	}
      },
      components:{
      	Scroll,
      	Loading,
      	NoResult
      }
  }
</script>

<style scoped lang="stylus" rel="stylesheet/stylus">
  @import "~common/stylus/variable"
  @import "~common/stylus/mixin"

  .suggest
    height: 100%
    overflow: hidden
    .suggest-list
      padding: 0 30px
      .suggest-item
        display: flex
        align-items: center
        padding-bottom: 20px
      .icon
        flex: 0 0 30px
        width: 30px
        [class^="icon-"]
          font-size: 14px
          color: $color-text-d
      .name
        flex: 1
        font-size: $font-size-medium
        color: $color-text-d
        overflow: hidden
        .text
          no-wrap()
    .no-result-wrapper
      position: absolute
      width: 100%
      top: 50%
      transform: translateY(-50%)
</style>