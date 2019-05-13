// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue';
import App from './App';
import router from './router';
import axios from 'axios';
import Vueaxios from 'vue-axios';
import './common/stylus/index.styl';
import './common/stylus/icon.styl';

// 全局使用axios
Vue.prototype.axios = axios;
Vue.use(Vueaxios, axios);

// 关闭生产模式下给出的提示
Vue.config.productionTip = false;

// 这里注释说明不需要给new Vue赋值
/* eslint-disable no-new */

// new 一个vue,设置路由等信息-------------
new Vue({
  el: '#app',
  router,
  components: { App },
  template: '<App/>'
});
