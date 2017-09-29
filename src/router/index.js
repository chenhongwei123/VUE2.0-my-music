import Vue from 'vue'
import Router from 'vue-router'

Vue.use(Router)
//import Recommend from 'components/recommend/recommend'
//import Rank from 'components/rank/rank'
//import Singer from 'components/singer/singer'
//import SingerDetail from 'components/singer-detail/singer-detail'
//import Rearch from 'components/search/search'
//import Disc from 'components/disc/disc'
//import TopList from 'components/top-list/top-list'
//import UserCenter from 'components/user-center/user-center'


//异步加载
const Recommend = (resolve) => {
  import('components/recommend/recommend').then((module) => {
    resolve(module)
  })
}

const Rank = (resolve) => {
  import('components/rank/rank').then((module) => {
    resolve(module)
  })
}

const Singer = (resolve) => {
  import('components/singer/singer').then((module) => {
    resolve(module)
  })
}

const SingerDetail = (resolve) => {
  import('components/singer-detail/singer-detail').then((module) => {
    resolve(module)
  })
}

const Rearch = (resolve) => {
  import('components/search/search').then((module) => {
    resolve(module)
  })
}

const Disc = (resolve) => {
  import('components/disc/disc').then((module) => {
    resolve(module)
  })
}

const TopList = (resolve) => {
  import('components/top-list/top-list').then((module) => {
    resolve(module)
  })
}


const UserCenter = (resolve) => {
  import('components/user-center/user-center').then((module) => {
    resolve(module)
  })
}

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
			component: Rearch,
			children:[
			 {
			 	path:':id',
			 	name: 'SingerDetail',
			 	component:SingerDetail
			 }
			]
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
		},
		{
			path:'/user',
			name:'UserCenter',
			component: UserCenter
		}
	]
})
