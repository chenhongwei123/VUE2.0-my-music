import Vue from 'vue'
import Router from 'vue-router'

import Recommend from 'components/recommend/recommend'
import Rank from 'components/rank/rank'
import Rearch from 'components/search/search'
import Singer from 'components/singer/singer'

Vue.use(Router)

export default new Router({
	routes: [{
			path: '/',                
			redirect:'/recommend',   //初始化展示Recommend组件
		},
		{
			path: '/recommend',
			name: 'Recommend',
			component: Recommend
		},
		{
			path: '/rank',
			name: 'Rank',
			component: Rank
		},
		{
			path: '/rearch',
			name: 'Rearch',
			component: Recommend
		},
		{
			path: '/singer',
			name: 'Singer',
			component: Singer
		}

	]
})