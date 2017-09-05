<template>
	<div id="app">
		<m-header></m-header>
		<tab></tab>
		<!--<keep-alive>进行数据缓存，避免重新加载-->
		<keep-alive>      
			<router-view></router-view>
		</keep-alive>
		<player></player>
	</div>
</template>
<script type="text/ecmascript-6">
	import MHeader from 'components/m-header/m-header'
	import Tab from "components/tab/tab"
	import Player from 'components/player/player'

	export default {
		components: {
			MHeader,
			Tab,
			Player
		},
	}
</script>