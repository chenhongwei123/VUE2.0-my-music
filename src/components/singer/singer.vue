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
	
	  const HOT_NAME='热门'
	  const HOT_SINGER_LEN = 10
	  
     export default{
     	    data(){
     	     	return{
     	     		singers:[]
     	     	}
     	    },
     	    created(){
     	    	this._getSingerList()
     	    },
     	    methods:{
//   	    	 handlePlaylist(playlist) {
//			        const bottom = playlist.length > 0 ? '60px' : ''
//			        this.$refs.singer.style.bottom = bottom
//			        this.$refs.list.refresh()
//			      },
     	    	selectSinger(singer){
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
//   	    				 console.log(this.singers)
     	    			}
     	    		})
     	    	},
     	    	_normalizeSinger(list){            //对数据重新创建并排列
     	    		let map={
     	    			hot:{               
     	    				title:HOT_NAME,
     	    				items:[]
     	    			}
     	    		}
     	    		
     	    		list.forEach((item, index) => {
			          if (index < HOT_SINGER_LEN) {
			            map.hot.items.push(new Singer({
			              name: item.Fsinger_name,
			              id: item.Fsinger_mid
			            }))
			          }
			          const key = item.Findex
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