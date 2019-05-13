<template>
    <!-- 这里不用div包裹会报错,因为vue模板只支持一个元素，不能并列包含两个及以上 -->
    <div>
        <div class="shopcart" @click="toggleList">
            <div class="content">
                <div class="content-left">
                    <div class="logo-wrapper">
                        <div class="logo" :class="{highlight: totalCount > 0}">
                            <i class="icon-shopping_cart" :class="{highlight: totalCount > 0}"></i>
                        </div>
                        <div class="num" v-show="totalCount > 0">{{totalCount}}</div>
                    </div>
                    <div class="price" :class="{highlight: totalPrice > 0}">¥{{totalPrice}}</div>
                    <div class="desc">另需配送费¥{{deliveryPrice}}元</div>
                </div>
                <div class="content-right" @click.stop.prevent="pay">
                    <div class="pay" :class="payClass">{{payDesc}}</div>
                </div>
                
                <!-- 购物车小球 -->
                <div class="ball-container">
                    <!-- <div class="ball" v-for="ball in balls" v-show="ball.show"></div> 
                    <div class="inner inner-hook"></div>  -->
                    <div v-for="(ball,index) of balls" :key="index">
                        <transition name="drop" @before-enter="beforeEnter"
                                    @enter="dropEnter"
                                    @after-enter="afterEnter">
                            <div  class="ball" v-show="ball.show"><!--外层盒子-->
                                <div class="inner inner-hook"></div> <!--内层盒子-->
                            </div>
                        </transition>
                    </div>
                </div>
                <!-- 购物车详情 -->
                <transition name="fold">
                    <div class="shopcart-list" v-show="listShow">
                        <div class="list-header">
                            <h3 class="title">购物车</h3>
                            <span class="empty" @click="empty">清空</span>
                        </div>
                        <div class="list-content" ref="listContent">
                            <ul>
                                <li class="food" v-for="food in selectFoods">
                                    <span class="name">{{food.name}}</span>
                                    <div class="price">
                                        <span>¥{{food.price*food.count}}</span>
                                    </div>
                                    <div class="cartcontrol-wrapper">
                                        <!-- 记得将cartcontrol组件import到shopcart中，并注册components-->
                                        <cartcontrol :food="food"></cartcontrol> 
                                    </div>
                                </li>
                            </ul>
                        </div>
                    </div>
                </transition>
            </div>
        </div>
        <transition name="fade">
            <div class="list-mark" v-show="listShow" @click="hideList"></div>
        </transition>
    </div>
</template>

<script>
import BScroll from 'better-scroll';
import cartcontrol from "../cartcontrol/cartcontrol";
export default {
    // 接收父组件的值
    props: {
        selectFoods: {
            type: Array,
                default() {
                    return [
                        {
                            price: 30,
                            count: 1
                        }
                    ];
                }
        },
        deliveryPrice: {
            type: Number,
            default: 0
        },
        minPrice: {
            type: Number,
            default: 0
        }
    },
    data() {
        return {
            balls: [
                {
                    show: false
                },
                {
                    show: false
                },
                {
                    show: false
                },
                {
                    show: false
                },
                {
                    show: false
                }
            ],
            // 存放下落的小球
            dropBalls: [],
            // 购物车详情变量
            fold: true
        }
    },
    computed: {
        totalPrice() {
            let total = 0;
            this.selectFoods.forEach((food) => {
                total += food.price * food.count;
            });
            return total;
        },
        totalCount() {
            let count = 0;
            this.selectFoods.forEach((food) => {
                count += food.count;
            });
            return count;
        },
        payDesc() {
            if (this.totalPrice === 0) {
                return `¥${this.minPrice}元起送`;
            } else if (this.minPrice > this.totalPrice) {
                let diff = this.minPrice - this.totalPrice;
                return `还差¥${diff}元起送`
            } else {
                return '结算';
            }
        },
        payClass() {
            if (this.totalPrice < this.minPrice) {
                return 'not-enough';
            } else {
                return 'enough';
            }
        },
        // 购物车详情显示与隐藏
        listShow() {
            if (!this.totalCount) {
                this.fold = true;
                return false;
            }
            let show = !this.fold;
            // 初始化
            if (show) {
                this.$nextTick(() => {
                    if (!this.scroll) {
                        this.scroll = new BScroll(this.$refs.listContent, {click: true});
                    } else {
                        this.scroll.refresh();
                    }
                });
            }
            return show;
        }
    },
    methods: {
        drop(el) {
            // 找到所有隐藏的小球,把其设置为true,并将其添加到dropBall里边
            for (let i = 0; i < this.balls.length; i++) {
                let ball = this.balls[i];
                if (!ball.show) {   // 当小球的状态为隐藏时
                    ball.show = true; // 将这个小球的显示状态设置为true
                    ball.el = el; // 将cartControl传过来的对象挂载到ball的el属性上
                    this.dropBalls.push(ball); // 将这个小球放入到dropBalls数组中
                    return;
                }
            }
        },
        // js动画钩子
        // beforeenter
        beforeEnter: function (el) {
            let count = this.balls.length 
            while (count--) {
                let ball = this.balls[count]
                if (ball.show) {
                let rect = ball.el.getBoundingClientRect() // getBoundingClientRect()获取小球相对于视窗的位置，屏幕左上角坐标为0，0
                let x = rect.left - 32 // 小球x方向位移= 小球距离屏幕左侧的距离-外层盒子距离水平的距离
                let y = -(window.innerHeight - rect.top - 22) // 负数，因为是从左上角向下
                el.style.display = ''
                el.style.webkitTransform = `translate3d(0,${y}px,0)` // 设置外层盒子，即小球垂直方向的位移
                el.style.transform = `translate3d(0,${y}px,0)`
                let inner = el.getElementsByClassName('inner-hook')[0]
                inner.style.webkitTransform = `translate3d(${x}px,0,0)` // 设置内层盒子，即小球水平方向的距离
                inner.style.transform = `translate3d(${x}px,0,0)`
                }
            }
        },
        // enter
        dropEnter: function (el, done) {
            /* eslint-disable no-unused-vars */
            // 触发浏览器重绘
            let rf = el.offsetHeight
            // 因为重绘，可能需要等待DOM完全加载完成，所以这里用到了this.$nextTick 
            this.$nextTick(() => { // 让动画效果异步执行,提高性能
                el.style.webkitTransform = 'translate3d(0, 0, 0)'// 设置小球掉落后最终的位置
                el.style.transform = 'translate3d(0, 0, 0)'
                let inner = el.getElementsByClassName('inner-hook')[0]
                inner.style.webkitTransform = 'translate3d(0, 0, 0)'
                inner.style.transform = 'translate3d(0, 0, 0)'
                el.addEventListener('transitionend', done) // Vue为了知道过渡的完成，必须设置相应的事件监听器。它可以是transitionend或 animationend
            })
        },
        afterEnter: function (el) {
            let ball = this.dropBalls.shift() // 完成一次动画就删除一个dropBalls的小球
            if (ball) {
                ball.show = false
                el.style.display = 'none'
            }
        },
        // 购物车详情显示与隐藏
        toggleList() {
            //购物车没有商品的时候不可点击
            if (!this.totalCount) {
                return;
            }
            //当前是收起状态就展开，展开状态就收起
            this.fold = !this.fold;
        },
        // 点击背景隐藏购物车
        hideList() {
            this.fold = true;
        },
        // 清空购物车
        empty() {
            this.selectFoods.forEach((food) => {
                food.count = 0;
            });
        },
        pay() {
            if (this.totalPrice < this.minPrice) {
                return;
            }
            window.alert(`支付${this.totalPrice}元`);
        }
    },
    components: {
        cartcontrol
    }
}
</script>

<style lang="stylus" rel="stylesheet/stylus" scoped>
    .shopcart
        position: fixed
        left: 0
        bottom: 0
        z-index: 50
        width: 100%
        height: 48px
        .content
            display: flex
            background: #141d27
            color: rgba(255, 255, 255, .4)
            .content-left
                font-size: 0
                flex: 1
                .logo-wrapper
                    display: inline-block
                    vertical-align: top
                    position: relative
                    top: -10px
                    margin: 0 12px
                    padding: 6px
                    width: 56px
                    height: 56px
                    box-sizing: border-box
                    border-radius: 50%
                    background: #141d27
                    .logo
                        width: 100%
                        height: 100%
                        border-radius: 50%
                        background: #2b343c
                        text-align: center
                        &.highlight
                            background: rgb(0, 160, 220)
                        .icon-shopping_cart
                            line-height: 44px
                            font-size: 24px
                            color: #80858a
                            &.highlight
                                color: rgb(255, 255, 255)
                    .num 
                        position: absolute
                        top: 0
                        right: 0
                        width: 24px
                        height: 16px
                        line-height: 16px
                        text-align: center
                        border-radius: 16px
                        font-size: 9px
                        font-weight: 700
                        color: #fff
                        background: rgb(240, 20, 20)
                        box-shadow: 0 4px 8px 0 rgba(0, 0, 0, .4)
                .price
                    display: inline-block
                    vertical-align: top
                    font-size: 16px
                    font-weight: 700
                    margin-top: 12px
                    line-height: 24px
                    padding-right: 12px
                    border-right: 1px solid rgba(255, 255, 255, .1)
                    box-sizing: border-box
                    &.highlight
                        color: rgb(255, 255, 255)
                .desc
                    display: inline-block
                    vertical-align: top
                    margin: 12px 0 0 12px
                    line-height: 24px
                    font-size: 10px
            .content-right
                flex: 0 0 105px
                width: 105px
                .pay 
                    height: 48px
                    line-height: 48px
                    text-align: center
                    font-size: 12px
                    font-weight: 700
                    background: #2b333b
                    &.not-enough
                        background: #2b333b
                    &.enough
                        background: #00b43c
                        color: #fff
            .ball-container
                .ball
                    position: fixed
                    left: 32px
                    bottom: 22px
                    z-index: 200
                    &.drop-enter-active
                        transition all .4s cubic-bezier(.49,-.29,.75,.41)
                        .inner
                            width: 16px
                            height: 16px
                            border-radius: 50%
                            background: rgb(0, 160, 220)
                            transition: all .4s linear
            .shopcart-list
                position: absolute 
                left: 0
                top: 0
                z-index: -1
                width: 100%;
                transform translate3d(0, -100%, 0) 
                &.fold-enter-active,
                &.fold-leave-active
                    transition: all .5s linear
                &.fold-enter
                    transform translate3d(0, -100%, 0)
                &.fold-leave-active,
                &.fold-enter 
                    transform translate3d(0, 0, 0)
                .list-header
                    height: 40px
                    line-height: 40px
                    padding: 0 18px
                    background: #f3f5f7
                    border-bottom: 1px solid rgba(7, 17, 27, .1)
                    .title
                        float: left
                        font-size: 14px
                        color: rgb(7, 17, 27)
                    .empty
                        float: right
                        font-size: 12px
                        color: rgb(0, 160, 220)
                .list-content
                    padding: 0 18px
                    max-height: 217px
                    overflow: hidden
                    background: #fff
                    .food
                        position: relative
                        padding: 12px 0
                        box-sizing: border-box
                        border-1px(rbga(7, 17, 27, .1))
                        .name
                            line-height: 24px
                            font-size: 14px
                            color: rgb(7, 17, 27)
                        .price
                            position: absolute 
                            right: 90px
                            bottom: 12px
                            line-height: 24px
                            font-size: 14px
                            font-weight: 700
                            color: rgb(240, 20, 20)
                        .cartcontrol-wrapper
                            position: absolute
                            right: 0
                            bottom: 6px
    .list-mark
        position: fixed;
        top: 0
        left: 0
        width: 100%
        height: 100%
        z-index: 40
        background: rgba(7, 17, 27, .6)
        backdrop-filter: blur(10px)
        &.fade-enter-active,
        &.fade-leave-active
            transition: all .5s
        &.fade-enter
            opacity: 1
            background: rbga(7, 17, 27, .6)
        &.fade-leave-active,
        &.fade-enter
            opacity: 0
            background: rbga(7, 17, 27, .6)
</style>

