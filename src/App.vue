<template>
  <div id="app">
    <vHeader :seller="sell"></vHeader>
    <div class="tab border-1px">
      <div class="tab-item">
        <router-link to="/goods">商品</router-link>
      </div>
      <div class="tab-item">
        <router-link to="/ratings">评论</router-link>
      </div>
      <div class="tab-item">
        <router-link to="/seller">商家</router-link>
      </div>
    </div>
    <!-- 路由外链 -->
    <!-- 这里需要传入seller,否则子组件无法接收seller -->
    <!-- keep-alive-缓存页面 -->
    <!-- exclude 不缓存的页面 include 缓存的页面 -->
    <keep-alive include="Goods,Ratings">
      <router-view :seller="sell"></router-view>
    </keep-alive>
  </div>
</template>
<script>
// 引入header组件
import vHeader from 'components/header/header';
import axios from 'axios';
import { urlParse } from 'common/js/utils';

// 注册header组件
export default {
  data() {
    return {
      sell: {
        // 拿到ID
        id: (() => {
          let queryParam = urlParse();
          console.log(queryParam);
          return queryParam.id;
        })()
      },
      goods: {},
      ratings: {},
    }
  },

  created() {
    axios.get('./static/data.json').then(res => {
      this.sell = res.data.seller;
      // this.sell = Object.assign({}, this.sell, res.data.seller);
      this.goods = res.data.goods;
      this.ratings = res.data.ratings;
    }, err => {
      console.log(err);
    });
  },

  components: {
    vHeader
  }
};

</script>
<style lang="stylus" scoped>
#app .tab {
  display: flex;
  width: 100%;
  height: 40px;
  line-height: 40px;
  border-1px(rgba(7, 17, 27, 0.1));
}

#app .tab-item {
  flex: 1;
  text-align: center;
}

#app .tab a {
  display: block;
  font-size: 14px;
  color: rgb(77, 85, 93);
}

#app .tab a.active {
  color: rgb(240, 20, 20);
}

</style>
