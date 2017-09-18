import Vue from 'vue'
import Router from 'vue-router'

import Recommend from 'components/recommend/recommend'
import Rank from 'components/rank/rank'
import Singer from 'components/singer/singer'
import SingerDetail from 'components/singer-detail/singer-detail'
import Rearch from 'components/search/search'
import Disc from 'components/disc/disc'
import TopList from 'components/top-list/top-list'

Vue.use(Router)

export default new Router({
	routes: [{
			path: '/',                
			redirect:'/recommend',   //初始化展示Recommend组件
		},
		{
			path: '/recommend',
			name: 'Recommend',
			component: Recommend,
			children:[{
				path:':id',
				name:'Disc',
				component:Disc
			}]
		},
		{
			path: '/rank',
			name: 'Rank',
			component: Rank,
			children:[{
				path: ':id',
				name: 'TopList',
				component: TopList
			}]
		},
		{
			path: '/search',
			name: 'Rearch',
			component: Rearch
		},
		{
			path: '/singer',
			name: 'Singer',
			component: Singer,
			children:[
			 {
			 	path:':id',
			 	name: 'SingerDetail',
			 	component:SingerDetail
			 }
			]
		}
	]
})