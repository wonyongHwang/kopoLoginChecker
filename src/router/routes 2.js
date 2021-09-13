
const routes = [
  {
    path: '/',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      { path: '', component: () => import('components/Home.vue') },
      { path: 'signup', component: () => import('components/Signup.vue') },
      { path: 'login', component: () => import('components/Login.vue') },
      { path: 'home', component: () => import('components/Home.vue') },
      { path: 'forgotid', component: () => import('components/ForgotId.vue') },
      { path: 'qrscanner', component: () => import('components/QrScanner.vue') },
      { path: 'testqr', component: () => import('components/TestQRScan.vue') },
      { path: 'testcam', component: () => import('components/TestCamera.vue') }



    ]
  },
  // {
  //   path: '/signup',
  //   component: () => import('components/Signup.vue'),
  //   children: [
  //     // { path: '', component: () => import('components/Login.vue') }
  //   ]
  // },
  // Always leave this as last one,
  // but you can also remove it
  {
    path: '/:catchAll(.*)*',
    component: () => import('pages/Error404.vue')
  }
]

export default routes
