import Vue from 'vue';
import Router from 'vue-router';
import Goods from '@/components/Goods/Goods';
import Ratings from '@/components/Ratings/Ratings';
import Seller from '@/components/Seller/Seller';

// 路由使用
Vue.use(Router);

export default new Router({
  linkActiveClass: 'active',
  // 路由路径设置
  routes: [
    {
      path: '/',
      name: 'Goods',
      component: Goods
    },
    {
      path: '/goods',
      name: 'Goods',
      component: Goods
    },
    {
      path: '/ratings',
      name: 'Ratings',
      component: Ratings
    },
    {
      path: '/seller',
      name: 'Seller',
      component: Seller
    }
  ]
});
