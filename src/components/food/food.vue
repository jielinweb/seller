<template>
    <transition name="move">
        <div v-show="showFlag" class="food" ref="food">
            <div class="food-content">
                <div class="image-header">
                    <img :src="food.image" alt="">
                    <div class="back" @click="hide">
                        <i class="icon-arrow_lift"></i>
                    </div>
                </div>
                <div class="content">
                    <h1 class="title">{{food.name}}</h1>
                    <div class="detail">
                        <span class="sell-count">月售{{food.sellCount}}份</span>
                        <span class="rating">好评率{{food.rating}}%</span>
                    </div>
                    <div class="price">
                        <span class="now">¥{{food.price}}</span>
                        <span class="old" v-show="food.oldPrice">¥{{food.oldPrice}}</span>
                    </div>
                    <!--引入cartcontrol组件,并且用一个div包裹他-->
                    <div class="cartcontrol-wrapper">
                        <cartcontrol @cart-add="addFood" :food="food"></cartcontrol>
                    </div>
                    <transition name="fade">
                        <div @click.stop.prevent="addFirst" class="buy" v-show="!food.count || food.count === 0">加入购物车</div>
                    </transition>
                </div>
                <split v-show="food.info"></split>
                <div class="info" v-show="food.info">
                    <h1 class="title">商品信息</h1>
                    <p class="text">{{food.info}}</p>
                </div>
                <split></split>
                <div class="rating">
                    <h1 class="title">商品评价</h1>
                    <ratingselect @select="selectRating" @toggle="toggleContent" :selectType="selectType" :onlyContent="onlyContent" :desc="desc" :ratings="food.ratings"></ratingselect>
                    <!-- 评价列表 -->
                    <div class="rating-wrapper">
                        <ul v-show="food.ratings && food.ratings.length">
                            <li v-for="rating in food.ratings" v-show="needShow(rating.rateType, rating.text)" class="rating-item border-1px">
                                <div class="user">
                                    <span class="name">{{rating.username}}</span>
                                    <img width="20" height="20" :src="rating.avatar" class="avatar">
                                </div>
                                <!-- 过滤时间格式 -->
                                <div class="time">{{rating.rateTime | formatDate}}</div>
                                <p class="text">
                                    <span :class="{'icon-thumb_up':rating.rateType===0,'icon-thumb_down':rating.rateType===1}"></span>
                                    {{rating.text}}
                                </p>
                            </li>
                        </ul>
                        <!-- 如果没有评价就显示该盒子 -->
                        <div class="no-rating" v-show="!food.ratings || !food.ratings.length">暂无评价</div>
                    </div>
                </div>
            </div>
        </div>
    </transition>
</template>

<script>
import BScroll from "better-scroll";
import { formatDate } from "../../common/js/date";
import Vue from "vue";
import cartcontrol from "../cartcontrol/cartcontrol";
import ratingselect from "../ratingselect/ratingselect";
import split from "../split/split";

const ALL = 2; //将控制type类转为常量控制
export default {
    props: {
        food: {
            type: Object
        }
    },
    data() {
        // 这些是传入ratingselect组件的数据,并且初始化值
        return {
            showFlag: false,  
            selectType: ALL,   //默认所有rate
            onlyContent: true,  //默认只显示有内容的rate
            desc: {
                all: '全部',
                positive: '推荐',
                negative: '吐槽'
            }
        }
    },
    methods: {
        // good组件调用的方法(父组件调用子组件的方法)
        show() {
            this.showFlag = true;
            this.selectType = ALL;
            this.onlyContent = true;
            // 页面dom渲染完成后跳用better-scroll
            this.$nextTick(() => {
                if (!this.scroll) {
                    this.scroll = new BScroll(this.$refs.food, {click: true});
                } else {
                    this.scroll.refresh();
                }
            });
        },
        hide() {
            this.showFlag = false;
        },
        // 添加购物车事件
        addFirst(event) {
            if (!event._constructed) { //因为购物车按钮在bscroll里面,所以需要处理掉bscroll的事件类型
                return;
            }
            this.$emit('cart-add', event.target); //触发当前实例food上的事件add(在goods组件上绑定在food组件的add方法)
            Vue.set(this.food, 'count', 1);
        },
        addFood(target) { //跟cart-add关联的addFood方法
            this.$emit('cart-add', target); //触发当前实例food上的事件cart-add(在goods组件上绑定在food组件的cart-add方法)
        },
        selectRating(type) { //设置rate的类型
            this.selectType = type;
            this.$nextTick(() => {//切换的时候需要重新刷新bscroll
            this.scroll.refresh();
            });
        },
        toggleContent() { //切换显示是否有内容的rate
            this.onlyContent = !this.onlyContent;
            this.$nextTick(() => { //切换的时候需要重新刷新bscroll
            this.scroll.refresh();
            });
        },
        // 控制内容的切换
        needShow(type, text) {
            if (this.onlyContent && !text) {
                return false;
            }
            if (this.selectType === ALL) {
                return true;
            } else {
                return type === this.selectType;
            }
        }
    },
    // 过滤时间
    filters: {
        formatDate(time) {
            let date = new Date(time);
            return formatDate(date, 'yyyy-MM-dd hh:mm');
        }
    },
    components: {
        cartcontrol,
        split,
        ratingselect
    }
}
</script>

<style lang="stylus" rel="stylesheet/stylus" scoped>
    .food
        position: fixed
        left: 0;
        top: 0;
        bottom: 48px
        z-index: 30
        width: 100%
        background: #fff
        transition: all .3s linear
        transform: translate3d(0, 0, 0)
        &.move-leave-active,
        &.move-enter
            transform: translate3d(100%, 0, 0)
        // css技巧
        .image-header
            position: relative
            width: 100%
            height: 0
            padding-top: 100%
            img 
                position: absolute 
                top: 0
                left: 0
                width: 100%
                height: 100%
            .back
                position: absolute 
                top: 10px
                left: 0
                z-index: 50
                .icon-arrow_lift
                    display: block
                    padding: 10px
                    font-size: 20px
                    color: #fff
        .content
            position: relative
            padding: 18px
            .title
                line-height: 14px
                margin-bottom: 8px
                font-size: 14px
                font-weight: 700
                color: rgb(7, 17, 27)
            .detail
                margin-bottom: 18px
                line-height: 10px
                height: 10px
                font-size: 0 //注意行内元素的空格
                .sell-count, .rating
                    font-size: 10px
                    color: rgb(147, 153, 159)
                .sell-count
                    margin-right: 12px
            .price //这里的css样式就是在goods.vue出现过的样式,所以直接贴过来使用,也可以做成组件
                font-weight: 700
                line-height: 24px
                .now
                    margin-right: 8px
                    font-size: 14px
                    color: rgb(240, 20, 20)
                .old
                    text-decoration: line-through
                    font-size: 10px
                    color: rgb(147, 153, 159)
            .cartcontrol-wrapper //固定cartcontrol组件的样式
                position: absolute
                right: 12px
                bottom: 12px
            .buy //加入购物车按钮的样式
                position: absolute
                right: 18px
                bottom: 18px
                z-index: 10 //显示在cartcontrol的更外面
                height: 24px
                line-height: 24px
                padding: 0 12px
                box-sizing: border-box //不希望padding和border把整个div撑大
                border-radius: 12px
                font-size: 10px
                color: #fff
                background: rgb(0, 160, 220)
                opacity: 1 //加入动画,一个是为了体验,另外一个是为了延迟触发隐藏,避免小球抛物线动画出现问题
                &.fade-enter-active, &.fade-leave-active
                    transition: all 0.2s
                &.fade-enter, &.fade-leave-active
                    opacity: 0
                    z-index: -1
        .info
            padding: 18px
            .title
                line-height: 14px
                margin-bottom: 6px
                font-size: 14px
                color: rgb(7, 17, 27)
            .text
                line-height: 24px
                padding: 0 8px
                font-size: 12px
                color: rgb(77, 85, 93)
        .rating
            padding-top: 18px
            .title
                line-height: 14px
                margin-left: 18px
                font-size: 14px
                color: rgb(7, 17, 27)
            .rating-wrapper
                padding: 0 18px
                .rating-item
                    position: relative
                    padding: 16px 0
                    border-1px(rgba(7, 17, 27, .1))
                    .user
                        position: absolute 
                        right: 0
                        top: 16px
                        line-height: 12px
                        font-size: 0
                        .name
                            display: inline-block
                            margin-right: 6px
                            vertical-align: middle
                            font-size: 12px 
                            color: rgb(147, 153, 159)
                        .avatar
                            border-radius: 50%
                            width: 20px
                            height: 20px
                            margin-right: 12px
                            vertical-align: middle
                    .time
                        margin-bottom: 6px
                        line-height: 12px
                        font-size: 10px
                        color: rgb(147, 153, 159)
                    .text
                        line-height: 16px
                        font-size: 12px
                        color: rgb(7, 17, 27)
                        .icon-thumb_up,
                        .icon-thumb_down
                            margin-right: 4px
                            line-height: 24px
                            font-size: 12px
                        .icon-thumb_up
                            color: rgb(0, 160, 220)
                        .icon-thumb_down
                            color: rgb(147, 153, 159)
                .no-rating
                    padding: 16px 0
                    font-size: 12px
                    color: rgb(147, 153, 159)
</style>
