import Vue from 'vue'
import VueRouter from 'vue-router'
import IndexPage from '@/components/IndexPage'
import MainHomePage from '@/components/MainHomePage'
import LfxListPage from '@/components//LfxListPage'
import LfxDetailPage from '@/components/LfxDetailPage'
import YiErListPage from '@/components/YiErListPage'
import BuBuListPage from '@/components/BuBuListPage'
import HomePage from '@/components/HomePage'
import MusicPlayerPage from '@/components/MusicPlayerPage'
import SnakeGamePage from '@/components/SnakeGamePage'
import YiErLetterPage from '@/components/YiErLetterPage'


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
			name: 'MainHomePage',
			component: MainHomePage,
			children: [
				{
					path: '/lfx-list',
					name: 'LfxListPage',
					component: LfxListPage
				},
				{
					path: '/lfx-detail',
					name: 'LfxDetailPage',
					component: LfxDetailPage
				},
				{
					path: '/yier-list',
					name: 'YiErListPage',
					component: YiErListPage
				},
				{
					path: '/bubu-list',
					name: 'BuBuListPage',
					component: BuBuListPage
				},
				{
					path: '/love-lfx',
					name: 'HomePage',
					component: HomePage
				},
				{
					path: '/music-player',
					name: 'MusicPlayerPage',
					component: MusicPlayerPage
				},
				{
					path: '/snake-game',
					name: 'SnakeGamePage',
					component: SnakeGamePage
				},
				{
					path: '/yier_letter',
					name: 'YiErLetterPage',
					component: YiErLetterPage
				},
			]
		},
	]
});

export default router;