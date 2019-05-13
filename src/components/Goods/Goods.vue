<template>
    <div>
        <div class="goods">
            <div class="menu-wrapper" ref="menuWrapper">
                <ul>
                    <li v-for="(item, index) in goods" class="menu-item" @click="selectMenu(index, $event)" :class="{current: currentIndex === index}">
                        <span class="text border-1px">
                            <span v-show="item.type > 0" class="icon" :class="classMap[item.type]"></span>{{item.name}}
                        </span>
                    </li>
                </ul>
            </div>
            <div class="foods-wrapper" ref="foodsWrapper">
                <ul>
                    <li v-for="item in goods" class="food-list food-list-hook">
                        <h1 class="title">{{item.name}}</h1>
                        <ul>
                            <li @click="selectFood(food, $event)" v-for="food in item.foods" class="food-item border-1px">
                                <div class="icon">
                                    <img width="57" height="57" :src="food.icon" alt="">
                                </div>
                                <div class="content">
                                    <h2 class="name">{{food.name}}</h2>
                                    <p class="desc">{{food.description}}</p>
                                    <div class="extra">
                                        <span class="month-sell">月售{{food.sellCount}}份</span>
                                        <span class="food-reting">好评率{{food.reting}}%</span>
                                    </div>
                                    <div class="price">
                                        <span class="now">¥{{food.price}}</span>
                                        <span v-show="food.oldPrice" class="old">¥{{food.oldPrice}}</span>
                                    </div>
                                    <div class="cartcontrol-wrapper">
                                        <cartcontrol :food="food" @cart-add="cartAdd"></cartcontrol>
                                    </div>
                                </div>
                            </li>
                        </ul>
                    </li>
                </ul>
            </div>
            <shopcart :selectFoods="selectFoods" :delivery-price="seller.deliveryPrice" :min-price="seller.minPrice" ref="shopcart"></shopcart>
        </div>
        <food :food="selectedFood" ref="food" @cart-add="cartAdd"></food>
    </div>
</template>

<script>
import axios from 'axios';
// 引入better-scroll库
import BScroll from 'better-scroll';
import shopcart from "../shopcart/shopcart";
import cartcontrol from "../cartcontrol/cartcontrol";
import food from "../food/food";

export default {
   name: "Goods",
   props: {
       seller: {
           type: Object
       }
   },
   data() {
       return {
           goods: [],
           listHeight: [],
           scrollY: 0,
           selectedFood: {}
       }
   },
   created() {
       //左侧菜单图标信息
       this.classMap = ['decrease', 'discount', 'invoice', 'special', 'guarantee'];
       //goods商品数据请求
       axios.get("./static/data.json").then((res) => {
           if (res.data.goods) {
               this.goods = res.data.goods;
            // 等待dom初始化后再执行better-scroll滚动代码,否则某些情况下不生效
            this.$nextTick(()=> {
                // 实现滚动
                this._initScroll();
                // 实现滚动区域高亮
                this._caculateHeight();
            });
           }
       });
   },
   computed: {
       //计算左侧的索引值,与右侧联动
       currentIndex() {
           for (let i = 0; i < this.listHeight.length; i++) {
               let height1 = this.listHeight[i];
               let height2 = this.listHeight[i + 1];
            //    这里必须>=
               if (!height2 || (this.scrollY >= height1 && this.scrollY < height2)) {
                   return i;
               }
           }
           return 0;
       },
       //选中到购物车中的商品数据,由每一个food对象组成
        selectFoods:function(){
            let foods =[];
            this.goods.forEach((item)=>{
                item.foods.forEach((fd)=>{
                    if(fd.count){
                        foods.push(fd)
                    }
                })
            })
            return foods;
        },
   },
   methods: {
    //    event解决浏览器原生事件问题,防止点击两次,自定义事件为true
    //点击菜单显示右侧相应菜单
       selectMenu(index, event) {
           if (!event._constructed) {
               return;
           }
           let foodList = this.$refs.foodsWrapper.getElementsByClassName('food-list-hook');
           let el = foodList[index];
           this.foodsScroll.scrollToElement(el, 300);
       },
    //    初始化滚动条
       _initScroll() {
        //    不设置click:true 则点击事件不生效
           this.menuScroll = new BScroll(this.$refs.menuWrapper, {click: true});

           this.foodsScroll = new BScroll(this.$refs.foodsWrapper, {
            //    设置实时滚动位置,利用了better-scrool的一个接口
               click: true,
               probeType: 3
           });
            
            // 监听滚动事件
           this.foodsScroll.on('scroll', (pos) => {
            //    拿scrollY跟左侧的索引做映射
               this.scrollY = Math.abs(Math.round(pos.y));
           });
       },

    //    获取所有右侧的li可视区高度并保存在数组变量中
       _caculateHeight() {
           let foodList = this.$refs.foodsWrapper.getElementsByClassName('food-list-hook');
           //第一个列表坐标
           let height = 0;
           this.listHeight.push(height);
           for (let i = 0; i < foodList.length; i++) {
               let item = foodList[i];
               height += item.clientHeight;
               this.listHeight.push(height);
           }
       },
      cartAdd(el) {
          // 使用$nextTick优化体验,异步执行下落动画
          this.$nextTick(()=> {
              // 父组件goods通过.$refs属性访问shopCart子组件的drop方法
               this.$refs.shopcart.drop(el);
          })
      },
      // 将点击的食品赋给selectedFood
      selectFood(food, event) {
          if (!event._constructed) {
              return
          }
          this.selectedFood = food;
        //   调用子组件的show方法
          this.$refs.food.show();
      }
   },
//    注册模版
   components: {
        shopcart,
        cartcontrol,
        food
    }
}
</script>

<style lang="stylus" rel="stylesheet/stylus" scoped>
    .goods
        display: flex
        position: absolute
        top: 174px
        bottom: 46px
        width: 100%
        overflow: hidden
        .menu-wrapper
            flex: 0 0 80px
            width: 80px
            background: #f3f5f7
            .menu-item
                display: table
                height: 54px
                width: 56px
                line-height: 14px
                padding: 0 12px
                &.current
                    position: relative
                    z-index: 10
                    margin-top: -1
                    background: #fff
                    font-weight: 700
                &:last-child .text
                    border-none()
                .icon
                    display: inline-block
                    width: 12px
                    height: 12px
                    margin-right: 2px
                    background-size: 12px 12px
                    background-repeat: no-repeat
                    vertical-align: middle
                    &.decrease
                        bg-image('decrease_3')
                    &.discount
                        bg-image('discount_3')
                    &.guarantee
                        bg-image('guarantee_3')
                    &.invoice
                        bg-image('invoice_3')
                    &.special
                        bg-image('special_3')
                .text
                    display: table-cell
                    width: 56px
                    vertical-align: middle
                    border-1px(rgba(7, 17, 27, .1))
                    font-size: 12px
        .foods-wrapper
            flex: 1
            .title
                padding-left: 14px
                height: 26px
                line-height: 26px
                border-left: 1px solid #d9dde1
                font-size: 12px
                color: rgb(147, 153, 159)
                background: #f3f5f7
            .food-item
                display: flex
                margin: 18px
                padding-bottom: 18px
                border-1px(rgba(7, 17, 27, .1))
                &:last-child
                    border-none()
                    margin-bottom: 0
                .icon
                    flex: 0 0 57px
                    margin-right: 10px
                .content
                    flex: 1
                    .name
                        margin: 2px 0 8px 0
                        height: 14px
                        line-height: 14px
                        font-size: 14px
                        color: rgb(7, 17, 27)
                    .desc, .extra
                        font-size: 10px
                        color: rgb(147, 153, 159)
                        height: 10px
                        margin-bottom: 8px
                    .desc
                        height: auto 
                        line-height: 12px
                    .extra
                        font-size: 0
                        margin-bottom: 0
                        .month-sell, .food-reting
                            font-size: 10px
                        .month-sell
                            margin-right: 12px
                    .price
                        font-weight: 700
                        line-height: 24px
                        .now
                            font-size: 14px
                            color: rgb(240, 20, 20)
                            margin-right: 8px
                        .old
                            font-size: 10px
                            color: rgb(147, 153, 159)
                            text-decoration: line-through
                    .cartcontrol-wrapper
                        position: absolute 
                        right: 0
                        bottom: 12px
</style>


