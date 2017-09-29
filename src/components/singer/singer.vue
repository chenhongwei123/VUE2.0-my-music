<template>
  <div class="singer" ref="singer">
  	<list-view @select="selectSinger" :data='singers' ref="list"></list-view>
  	<router-view></router-view>
  </div>
</template>

<script type="text/ecmascript-6">
	import ListView from 'base/listview/listview'
	import {getSingerList} from 'api/singer'
	import {ERR_OK} from 'api/config'
	import Singer from 'common/js/singer'
	import {mapMutations} from "vuex"
	import {playlistMixin} from 'common/js/mixin'
	
	  const HOT_NAME='热门'
	  const HOT_SINGER_LEN = 10
	  
     export default{
     	  mixins :[playlistMixin], //插入mixins
     	    data(){
     	     	return{
     	     		singers:[]
     	     	}
     	    },
     	    created(){
     	    	this._getSingerList()
     	    },
     	    methods:{
     	    	handlePlaylist(playlist){  //引入mixins里的handlePlaylist（）方法
     	    		const bottom = playlist.length > 0 ? "60px" : ''
     	    		//如果有列表数据，就把滚动组件的底部向上60px，从而不被底部小播放器遮盖，否则不变
     	    		this.$refs.singer.style.bottom = bottom
     	    		this.$refs.list.refresh()    //调用scroll组件的刷新方法，重新刷新计算一次
     	    	},
     	    	selectSinger(singer){    //点击每一个歌手路由跳转至
     	    		//console.log(singer)
     	    		this.$router.push({
     	    			path:`/singer/${singer.id}`
     	    		})
     	    		this.setSinger(singer)
     	    	},
     	    	_getSingerList(){  
     	    		getSingerList().then((res) =>{
     	    			if(res.code==ERR_OK){
     	    				 console.log(this._normalizeSinger(res.data.list))
     	    				 this.singers =this._normalizeSinger(res.data.list)
   	    				   console.log(res.data.list)
     	    			}
     	    		})
     	    	},
     	    	_normalizeSinger(list){            //对数据重新创建并排列
     	    		console.log(list)
     	    		let map={                       //重新创建一个map.hot对象（热门数据）
     	    			hot:{               
     	    				title:HOT_NAME,
     	    				items:[]
     	    			}
     	    		}
     	    		
     	    		list.forEach((item, index) => {
     	    			//console.log(index)
			          if (index < HOT_SINGER_LEN) {  //如果indx<10
			            map.hot.items.push(new Singer({    //将数据push到map对象的hot里面
			              name: item.Fsinger_name,
			              id: item.Fsinger_mid
			            }))
			          }
			          const key = item.Findex
			         // console.log(map[key])
			          if (!map[key]) {          //如果没有key，就进行创建对象
			            map[key] = {
			              title: key,
			              items: []
			            }
			          }
			          map[key].items.push(new Singer({         
			            name: item.Fsinger_name,
			            id: item.Fsinger_mid
			          }))
     	    		})
     	    		console.log(map)
     	    		// 为了得到有序列表，我们需要处理 map
			        let ret = []
			        let hot = []
			        for(let key in map){
			        //	console.log(key)
			        	let val = map[key]
			        	//console.log(val)
			        	if (val.title.match(/[a-zA-Z]/)) {
			            ret.push(val)
			          } else if (val.title === HOT_NAME) {
			            hot.push(val)
			          }
			        }
			        ret.sort((a, b) => {
			        	// console.log(a.title.charCodeAt(0) - b.title.charCodeAt(0))
		            return a.title.charCodeAt(0) - b.title.charCodeAt(0)       //降序排列
		          })
		          return hot.concat(ret)
     	    	},
     	    	...mapMutations({
     	    		setSinger:"SET_SINGER"
     	    	})
     	    },
        components:{
        	ListView
        }
     }
     
     
     
</script>

<style scoped lang="stylus" rel="stylesheet/stylus">
  .singer
    position: fixed
    top: 88px
    bottom: 0
    width: 100%
</style>