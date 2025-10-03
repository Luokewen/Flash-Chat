import { createRouter, createWebHistory } from 'vue-router'

// 使用动态导入方式加载登录视图组件
// 这种方式可以实现组件的懒加载，提高首屏加载速度
// 导入登录页面
const LoginView = () => import('../views/Login.vue')
// 导入首页页面
const HomeView = () => import('../views/Home.vue')
// 导入404页面
const NotFoundView = () => import('../views/NotFound.vue')
// 导入用户信息页面
const InfoPage = () => import('../components/mainBody/infoPage/InfoPage.vue')
// 导入聊天页面
const ChatPage = () => import('../components/mainBody/MainBody.vue')
// 导入群组信息页面
const GroupInfoPage = () => import('../components/mainBody/groupInfoPage/GroupInfoPage.vue')
// 导入背景文字
const DefaultPage = () => import('../components/mainBody/defaultPage/Default.vue')

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      name: 'index',
      redirect: '/login',
    },
    {
      path: '/login',
      name: 'login',
      component: LoginView,
    },
    {
      path: '/home',
      name: 'home',
      component: HomeView,
      children: [
        {
          path: '/home',
          name: 'defaultPage',
          component: DefaultPage,
        },
        {
          path: '/home/infoPage',
          name: 'infoPage',
          component: InfoPage,
        },
        {
          path: '/home/groupInfoPage',
          name: 'groupInfoPage',
          component: GroupInfoPage,
        },
        {
          path: '/home/chatPage',
          name: 'chatPage',
          component: ChatPage,
        },
      ],
    },
    {
      path: '/:pathMatch(.*)*',
      name: 'notFound',
      component: NotFoundView,
    },
  ],
})

router.beforeEach((to, from, next) => {
  // 获取token
  const token = localStorage.getItem('token')
  // 假设登录页路径是 '/'
  const isLoginPage = to.path === '/'
  // 如果没有token且不在登录页，则跳转到登录页
  if (!token && !isLoginPage && to.path !== '/login') {
    next({ name: 'login' })
  }
  // 如果有token但在登录页，则跳转到首页(假设首页是'/home')
  else if (token && isLoginPage && to.path === '/') {
    next({ name: 'home' })
  }
  // 如果有token且不在登录页,禁止前往登录页
  else if (token && !isLoginPage && to.path === '/login') {
    next({ name: 'home' })
  }
  // 其他情况正常放行
  else {
    next()
  }
})

export default router
