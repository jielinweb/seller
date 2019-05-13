<template>
    <div class="seller" ref="seller">
        <div class="seller-content">
            <div class="overview">
                <h1 class="title">{{seller.name}}</h1>
                <div class="desc border-1px">
                    <star :size="36" :score="seller.score"></star>
                    <span class="text">({{seller.ratingCount}})</span>
                    <span class="text">月售{{seller.sellCount}}单</span>
                </div>
                <ul class="remark">
                    <li class="block">
                        <h2>起送价</h2>
                        <div class="content">
                            <span class="stress">{{seller.minPrice}}</span>元
                        </div>
                    </li>
                    <li class="block">
                        <h2>商家配送</h2>
                        <div class="content">
                            <span class="stress">{{seller.deliveryPrice}}</span>元
                        </div>
                    </li>
                    <div class="block">
                        <h2>平均配送时间</h2>
                        <div class="content">
                            <span class="stress">{{seller.deliveryTime}}</span>元
                        </div>
                    </div>
                </ul>
                <!-- 收藏按钮 -->
                <div class="favorite" @click="toggleFavorite($event)">
                    <span class="icon-favorite" :class="{'active':favorite}"></span>
                    <span class="text">{{favoriteText}}</span>
                </div>
            </div>
            <split></split>
            <!-- 公告与活动 -->
            <div class="bulletin">
                <h1 class="title">活动与公告</h1>
                <div class="content-wrapper border-1px">
                    <p class="content">{{seller.bulletin}}</p>
                </div>
                <!-- 优惠列表 -->
                <ul class="supports">
                    <li class="support-item border-1px" v-for="(item,index) in seller.supports">
                        <!--使用classMap做对应-->
                        <span class="icon" :class="classMap[seller.supports[index].type]"></span>
                        <span class="text">{{seller.supports[index].description}}</span>
                    </li>
                </ul>
            </div>
            <split></split>
            <!-- 商家实景 -->
            <div class="pics">
                <h1 class="title">商家实景</h1>
                <!--两个ref绑定picWrapper,picList-->
                <div class="pic-wrapper" ref="picWrapper">
                    <!-- 循环输出图片 -->
                    <ul class="pic-list" ref="picList">
                        <li class="pic-item" v-for="pic in seller.pics">
                            <!-- 固定图片尺寸 -->
                            <img :src="pic" width="120" height="90">
                        </li>
                    </ul>
                </div>
            </div>
            <split></split>
            <!-- 商家信息 -->
            <div class="info">
                <h1 class="title border-1px">商家信息</h1>
                <ul>
                    <li class="info-item" v-for="info in seller.infos">{{info}}</li>
                </ul>
            </div>
        </div>
        <shopcart :selectFoods="selectFoods" :delivery-price="seller.deliveryPrice" :min-price="seller.minPrice" ref="shopcart"></shopcart>
    </div>
</template>

<script>
import BScroll from 'better-scroll';
import star from '../star/star';
import split from '../split/split';
import shopcart from "../shopcart/shopcart";
// 引入一个利用html5的localstorage的存储模块
import { saveToLocal, localFromLocal } from "../../common/js/store";

export default {
    name: "Seller",
    props: {
        seller: {
            type: Object
        }
    },
    data() {
        return {
            favorite: (() => {
                return localFromLocal(this.seller.id, 'favorite', false);
            })(), // vue需要返回的data必须是函数,所以加上()
            goods: []
        }
    },
    created() {
        this.classMap = ['decrease', 'discount', 'invoice', 'special', 'guarantee'];
    },
    computed: {
        favoriteText() {
            return this.favorite ? "已收藏" : "未收藏";
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
        }
    },
    //当seller变动的时候会触发
    watch: {
        'seller'() {
            this.$nextTick(() => {
                this._initScroll();
                this._initPics();
            });
        }
    },
    //在dom被渲染之后触发
    mounted() {
        this.$nextTick(() => {
            this._initScroll();
            this._initPics();
        });
    },
    methods: {
        _initScroll() { //编程习惯的前置下划线,代表内部使用的方法
            if (!this.scroll) {
                this.scroll = new BScroll(this.$refs.seller, {click: true});
            } else {
                this.scroll.refresh();
            }
        },
        // 商家图片滚动
        _initPics() {  //编程习惯的前置下划线,代表内部使用的方法
            if (this.seller.pics) {
                let picWidth = 120;
                let margin = 6;
                // 图片列表总长度
                let width = (picWidth + margin) * this.seller.pics.length - margin;
                //设置图片列表的宽度等于列表的总长度
                this.$refs.picList.style.width = width + 'px';
                //异步绑定滚动
                this.$nextTick(() => {
                    if (!this.picScroll) {
                        this.picScroll = new BScroll(this.$refs.picWrapper, {
                            scrollX: true,  //bscroll的横向滚动属性
                            eventPassthrough: 'vertical' //bscroll的过滤垂直滚动
                         });
                    } else {
                        this.picScroll.refresh();
                    }
                });
            }
        },
        // 收藏按钮
        toggleFavorite(event) {
            if (!event._constructed) return;
            //通过取反来设置切换
            this.favorite = !this.favorite;
            //利用localstorage存储这个属性
            saveToLocal(this.seller.id, 'favorite', this.favorite);
        }
    },
    components: {
        star,
        split,
        shopcart
    }
}
</script>

<style lang="stylus" rel="stylesheet/stylus" scoped>
    .seller
        position: absolute
        top: 174px
        left: 0
        bottom: 0
        width: 100%
        overflow: hidden
        .overview
            position: relative
            padding: 18px
            .title
                margin-bottom: 8px
                line-height: 14px
                font-size: 14px
                color: rgb(7, 17, 27)
            .desc
                font-size: 0
                padding-bottom: 18px
                border-1px(rgba(7, 17, 27, .1))
                .star
                    display: inline-block
                    margin-right: 8px
                    vertical-align: top
                .text
                    display: inline-block
                    margin-right: 12px
                    line-height: 18px
                    font-size: 10px
                    vertical-align: top
                    color: rgb(77, 85, 93)
            .remark
                display: flex
                padding-top: 18px
                .block
                    flex: 1
                    text-align: center
                    border-right: 1px solid rgba(7, 17, 27, .1)
                    &:last-child
                        border: none
                    h2
                        margin-bottom: 4px
                        line-height: 10px
                        font-size: 10px
                        color: rgb(147, 153, 159)
                    .content
                        line-height: 24px
                        font-size: 10px
                        color: rgb(7, 17, 27)
                        .stress
                            font-size: 24px
                            font-weight: 200
                            color: rgb(7, 17, 27)
                            line-height: 24px
            .favorite
                position: absolute 
                width: 50px
                right: 11px
                top: 18px
                text-align: center
                .icon-favorite
                    display: block
                    margin-bottom: 4px
                    line-height: 24px
                    font-size: 24px
                    color: #d4d6d9
                    &.active
                        color: rgb(240, 20, 20)
                .text
                    line-height: 10px
                    font-size: 10px
                    color: rgb(77, 85, 93)
        .bulletin
            padding: 18px 18px 0 18px
            .title
                margin-bottom: 8px
                line-height: 14px
                color: rgb(7, 17, 27)
                font-size: 14px
            .content-wrapper
                padding: 0 12px 16px 12px
                border-1px(rgba(7, 17, 27, .1))
                .content
                    line-height: 24px
                    font-size: 12px
                    color: rgb(240, 20, 20)
            .supports
                .support-item
                    padding: 16px 12px
                    border-1px(rgba(7, 17, 27, .1))
                    font-size: 0
                    &:last-child
                        border-none()
                    .icon
                        display: inline-block
                        width: 16px
                        height: 16px
                        vertical-align: top
                        margin-right: 6px
                        background-size: 16px 16px
                        background-repeat: no-repeat
                        &.decrease //使用设计要求的大小的图标
                            bg-image('decrease_4') //使用mixin处理这些图标
                        &.discount
                            bg-image('discount_4')
                        &.guarantee
                            bg-image('guarantee_4')
                        &.invoice
                            bg-image('invoice_4')
                        &.special
                            bg-image('special_4')
                    .text
                        line-height: 16px
                        font-size: 12px
                        color: rgb(7, 17, 27)                    
        .pics
            padding: 18px
            .title
                margin-bottom: 12px
                line-height: 14px
                color: rgb(7, 17, 27)
                font-size: 14px
            .pic-wrapper
                width: 100%
                overflow: hidden
                white-space: nowrap 
                .pic-list
                    font-size: 0
                    .pic-item
                        display: inline-block
                        margin-right: 6px
                        width: 120px
                        height: 90px
                        &:last-child
                            margin: 0
        .info 
            padding: 18px
            .title 
                border-1px(rgba(7, 17, 27, .1))
                padding-bottom: 12px
            .info-item
                padding: 16px 12px
                line-height: 16px
                font-size: 12px
                color: rgb(7, 17, 27)
                border-1px(rgba(7, 17, 27, .1))
                font-weight: 200
                &:last-child
                    border-none()
</style>


