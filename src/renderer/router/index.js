import Vue from 'vue';
import Router from 'vue-router';

Vue.use(Router);

export default new Router({
  routes: [
    {
      path: '/',
      name: 'landing-page',
      component: require('../pages/LandingPage').default,
    },
    {
      path: '/multiScreen',
      name: 'MultiScreen',
      component: require('../pages/multiScreen').default,
    },
    {
      path: '/sharedScreen',
      name: 'SharedScreen',
      component: require('../pages/sharedScreen').default,
    },
    {
      path: '/localStream',
      name: 'LocalStream',
      component: require('../pages/localStreamPage').default,
    },
    {
      path: '*',
      redirect: '/',
    },
  ],
});
