import Vue from 'vue'
import VueRouter from 'vue-router'
import IndexPage from '@/components/IndexPage'
import mainPage from '@/components/mainPage'
import LfxListPage from '@/components//LfxListPage'
import LfxDetailPage from '@/components/LfxDetailPage'
import YiErListPage from '@/components/YiErListPage'
import BuBuListPage from '@/components/BuBuListPage'
import HomePage from '@/components/HomePage'

Vue.use(VueRouter)

const router = new VueRouter({
	mode: 'hash',
	base: __dirname,
	//路由映射map
	routes: [
		{ path: '/', redirect: '/index' },
		{ path: '*', redirect: '/index' },
		{
			path: '/index',
			name: 'IndexPage',
			component: IndexPage
		},
		{
			path: '/',
			name: 'mainPage',
			component: mainPage,
			children: [
				{
					path: '/lfxList',
					name: 'LfxListPage',
					component: LfxListPage
				},
				{
					path: '/lfxDetail/:Id',
					name: 'LfxDetailPage',
					component: LfxDetailPage
				},
				{
					path: '/yierList',
					name: 'YiErListPage',
					component: YiErListPage
				},
				{
					path: '/bubuList',
					name: 'BuBuListPage',
					component: BuBuListPage
				},
				{
					path: '/love-lfx',
					name: 'HomePage',
					component: HomePage
				},
			]
		},
	]
});

export default router;