<template>
  <div ref="wrapper">
    <slot></slot>
  </div>
</template>

<script type="text/ecmascript-6">
	import BScroll from 'better-scroll'

	export default {
		props: {
			probeType: {
				type: Number,
				dafault: 1
			},
			click: {
				type: Boolean,
				dafault: true
			},
			data: {
				type: Array,
				dafault: null
			},
			listenScroll:{
				type: Boolean,
				dafault: false
			}
		},
		mounted() {
			setTimeout(() => {
				this._initScroll()
			}, 20)
		},
		methods: {
			_initScroll() {
				if(!this.$refs.wrapper) {
					return
				}
				this.scroll = new BScroll(this.$refs.wrapper, {
					probeType: this.probeType,
					click: this.click
				})
				
				if(this.listenScroll){
					let me=this
					this.scroll.on('scroll',(pos) =>{    //监听scroll的滚动事件
						me.$emit('scroll',pos)           //向外派发scroll事件
					})
				}
			},
			disable() {
				this.scroll && this.scroll.disable()
			},
			enable() {
				this.scroll && this.scroll.enable()
			},
			refresh() { //刷新scroll，重新计算高度
				this.scroll && this.scroll.refresh()
			},
			scrollTo(){
				this.scroll && this.scroll.scrollTo.apply(this.scroll,arguments)
			},
			scrollToElement(){
				this.scroll && this.scroll.scrollToElement.apply(this.scroll,arguments)
			}
		},
        watch:{
        	 data(){
        	 	setTimeout(() =>{
        	 		this.refresh()
        	 	},this.refreshDelay)
        	 }
        }
	}
</script>

<style>

</style>