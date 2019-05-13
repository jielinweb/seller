<template>
    <div class="rating" ref="ratings">
        <div class="rating-content">
            <div class="overview">
                <div class="overview-left">
                    <h1 class="score">{{seller.score}}</h1>
                    <div class="title">综合评分</div>
                    <div class="rank">高于周边商家{{seller.rankRate}}%</div>
                </div>
                <!--三个一样的模块,服务态度,商品评分,送达时间-->
                <div class="overview-right">
                    <div class="score-wrapper">
                        <span class="title">服务态度</span>
                        <!-- 引入star组件 -->
                        <star :size="36" :score="seller.serviceScore"></star>
                        <span class="score">{{seller.serviceScore}}</span>
                    </div>
                    <div class="score-wrapper">
                        <span class="title">商品评分</span>
                        <star :size="36" :score="seller.foodScore"></star>
                        <span class="score">{{seller.serviceScore}}</span>
                    </div>
                    <div class="score-wrapper">
                        <span class="title">送达时间</span>
                        <span class="score">{{seller.deliveryTime}}分钟</span>
                    </div>
                </div>
            </div>
            <split></split>
            <ratingselect @select="selectRating" @toggle="toggleContent" :selectType="selectType" :onlyContent="onlyContent" :ratings="ratings"></ratingselect>
            <div class="rating-wrapper">
                <ul>
                    <!--使用needShow方法控制显示-->
                    <li v-for="rating in ratings" class="rating-item border-1px" v-show="needShow(rating.rateType, rating.text)">
                        <div class="avatar">
                            <img width="28" height="28" :src="rating.avatar" />
                        </div>
                        <div class="content">
                            <h1 class="name">{{rating.username}}</h1>
                            <div class="star-wrapper">
                                <!--引入star组件-->
                                <star :size="24" :score="rating.score"></star>
                                <span class="delivery" v-show="rating.deliveryTime">{{rating.deliveryTime}}</span>
                            </div>
                            <p class="text">{{rating.text}}</p>
                            <!--recommend的处理,尤其注意class跟布局的使用-->
                            <div class="recommend" v-show="rating.recommend && rating.recommend.length">
                                <span class="icon-thumb_up"></span>
                                <span class="item" v-for="item in rating.recommend">{{item}}</span>
                            </div>
                            <!-- 过滤时间格式 -->
                            <div class="time">{{rating.rateTime | formatDate}}</div>
                        </div>
                    </li>
                </ul>
            </div>
        </div>
        <shopcart :selectFoods="selectFoods" :delivery-price="seller.deliveryPrice" :min-price="seller.minPrice" ref="shopcart"></shopcart>
    </div>
</template>

<script>
import BScroll from "better-scroll";
import axios from 'axios';
import star from "../star/star";
import ratingselect from "../ratingselect/ratingselect";
import split from "../split/split";
import { formatDate } from "../../common/js/date";
import shopcart from "../shopcart/shopcart";
const ALL = 2;
export default {
    name: "Ratings",
    props: {
        seller: {
            type: Object
        }
    },
    data() {
        return {
            ratings: [],
            showFlag: false,
            selectType: ALL,
            onlyContent: true,
            goods: []
        }
    },
    created() {
        axios.get("./static/data.json").then((res) => {
            var data = res.data.ratings;
            if (data) {
                this.ratings = data;
            }
            // 页面dom渲染完成后跳用better-scroll
            this.$nextTick(() => {
                if (!this.scroll) {
                    this.scroll = new BScroll(this.$refs.ratings, {click: true});
                } else {
                    this.scroll.refresh();
                }
            });
        });
        
    },
    computed: {
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
    methods: {
        needShow(type, text) {
            if (this.onlyContent && !text) {
                return false;
            }
            if (this.selectType === ALL) {
                return true;
            } else {
                return type === this.selectType;
            }
        },
        // tab选项卡
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
        }
    },
    components: {
        star,
        ratingselect,
        split,
        shopcart
    },
    // 过滤时间
    filters: {
        formatDate(time) {
            let date = new Date(time);
            return formatDate(date, 'yyyy-MM-dd hh:mm');
        }
    }
}
</script>

<style lang="stylus" rel="stylesheet/stylus" scoped>
    .rating
        position: absolute
        top: 174px
        bottom: 0
        left: 0
        width: 100%
        overflow: hidden
        .overview
            display: flex
            padding: 18px 0
            .overview-left
                flex: 0 0 137px   // flex布局,固定左边,右边自动适配
                padding: 6px 0
                width: 137px
                border-right: 1px solid rgba(7, 17, 27, .1)
                text-align: center
                @media only screen and (max-width: 320px) {
                    flex: 0 0 120px
                    width: 120px
                }
                .score
                    margin-bottom: 6px
                    line-height: 28px
                    font-size: 24px
                    color: rgb(255, 153, 0)
                .title
                    margin-bottom: 8px
                    margin-right: 12px
                    line-height: 12px
                    font-size: 12px
                    color: rgb(7, 17, 27)
                .rank
                    line-height: 10px
                    font-size: 10px
                    color: rgb(147, 153, 159)
            .overview-right
                flex: 1 //flex布局,固定左边,右边自动适配
                padding: 6px 0 6px 24px
                @media only screen and (max-width: 320px)
                    padding-left: 6px
                .score-wrapper
                    margin-bottom: 8px
                    font-size: 0
                    .title
                        margin-right: 12px
                        display: inline-block
                        line-height: 18px
                        vertical-align: top
                        font-size: 12px
                        color: rgb(7, 17, 27)
                    .star
                        display: inline-block
                        margin: 0 6px
                        vertical-align: top
                    .score
                        display: inline-block
                        line-height: 18px
                        vertical-align: top
                        font-size: 12px
                        color: rgb(147, 153, 159)
        .rating-wrapper
            padding: 0 18px
            .rating-item
                display: flex
                padding: 18px 0
                border-1px(rgba(7, 17, 27, .1))
                .avatar
                    flex: 0 0 28px
                    width: 28px
                    margin-right: 12px
                    img 
                        border-radius: 50%
                .content
                    position: relative //重新定义相对布局的参考父div,被内部元素做绝对布局使用
                    flex: 1
                    .name
                        margin-bottom: 4px
                        line-height: 12px
                        font-size: 10px
                        color: rgb(7, 17, 27)
                    .star-wrapper
                        margin-bottom: 6px
                        font-size: 0
                        .star
                            display: inline-block
                            margin-right: 6px
                            vertical-align: top
                        .delivery
                            display: inline-block
                            vertical-align: top
                            line-height: 12px
                            font-size: 10px
                            color: rgb(147, 153, 159)
                    .text
                        margin-bottom: 8px
                        line-height: 18px
                        color: rbg(7, 17, 27)
                        font-size: 12px
                    .recommend
                        line-height: 16px
                        font-size: 0
                        .icon-thumb_up, .item
                            display: inline-block
                            margin: 0 8px 4px 0  //分配右外边距和下外边距
                            font-size: 9px
                        .icon-thumb_up
                            color: rgb(0, 160, 220)
                        .item
                            padding: 0 6px
                            border: 1px solid rgba(7, 17, 27, .1)
                            border-radius: 1px
                            color: rgb(147, 153, 159)
                            background: rgb(255, 255, 255)
                    .time
                        position: absolute 
                        top: 0
                        right: 0
                        line-height: 12px
                        font-size: 10px
                        color: rgb(147, 153, 159)
        .rating-footer
            height: 40px
            line-height: 40px
            text-align: center
            font-size: 12px
            color: rgb(147, 153, 159)

</style>


