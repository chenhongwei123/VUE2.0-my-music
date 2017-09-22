<!--搜索框基础组件-->
<template>
  <div class="search-box">
    <i class="icon-search"></i>
    <input ref="query" v-model="query" class="box" :placeholder="placeholder"/>
    <i @click="clear" v-show="query" class="icon-dismiss"></i>
  </div>
</template>

<script type="text/ecmascript-6">
import {debounce} from 'common/js/util'

export default {
      props:{
      	placeholder:{
      		type: String,
      		default:"搜索歌曲、歌手"
      	}
      },
      data(){
	    	return{
	    		query:''
	    	}
	    },
	    methods:{
	    	clear(){          //清除填写的数据
	    	 this.query=''
	    	},
	    	setQuery(query){     //点击热门搜索块，并把标题赋值给搜索框的一个方法
	    	 this.query = query
	      },
	      blur(){        //失去焦点事件方法
	      	this.$refs.query.blur()
	      }
	    },
	    created(){
	    	this.$watch('query', debounce((newQuery) =>{    //query的值，暴露到外边           debounce()截流函数，防止搜索歌曲时，过度浪费加载 
	    		this.$emit('query',newQuery)         //派发出去
	    	},200))
	    }
}
</script>

<style scoped lang="stylus" rel="stylesheet/stylus">
  @import "~common/stylus/variable"

  .search-box
    display: flex
    align-items: center
    box-sizing: border-box
    width: 100%
    padding: 0 6px
    height: 40px
    background: $color-highlight-background
    border-radius: 6px
    .icon-search
      font-size: 24px
      color: $color-background
    .box
      flex: 1
      margin: 0 5px
      line-height: 18px
      background: $color-highlight-background
      color: $color-text
      font-size: $font-size-medium
      &::placeholder
        color: $color-text-d
    .icon-dismiss
      font-size: 16px
      color: $color-background
</style>