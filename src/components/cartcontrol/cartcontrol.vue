<template>
    <div class="cartcontrol">
        <transition name="move">
            <!-- 减少商品 -->
            <div class="cart-decrease icon-remove_circle_outline" v-show="food.count>0" @click.stop.prevent="decreaseCart($event)"></div>
        </transition>
        <!-- 添加商品 -->
        <div class="cart-count" v-show="food.count>0">{{food.count}}</div>
        <!-- 点击按钮触发addCart,将事件对象作为参数传递 -->
        <div class="cart-add icon-add_circle" @click.stop.prevent="addCart($event)"></div>
    </div>
</template>

<script type="text/ecmascript-6">
import Vue from "vue";
export default {
    props: {
        food: {
            type: Object
        }
    },
    created() {
        // console.log(this.food);
    },
    methods: {
        addCart(event) {
            // 检测事件派发是否来自better-scroll
            if (!event._constructed) {
                return;
            }
            if (!this.food.count) {
                // 当给一个检测对象添加一个它不存在的属性的时候,直接赋值是无效的,需要使用Vue.set这个属性
                // 这里需要引入vue为其赋值,如果直接给this.food赋值就无法触发视图更新,需要调用vue的一个内置方法vue.set
                Vue.set(this.food, 'count', 1);
            } else {
                this.food.count++;
            }
            // 向父级组件触发一个自定义的cart-add事件,同时将事件对象传递给父组件
            // $emit实现监听事件，提交'cart-add'事情给父组件，第二个是要传递的参数
            this.$emit('cart-add', event.target);
        },
        decreaseCart(event) {
            if (!event._constructed) {
                return;
            }
            if (this.food.count) {
                this.food.count--;
            }
        }
    }
}
</script>

<style lang="stylus" rel="stylesheet/stylus" scoped>
    .cartcontrol
        font-size: 0
        .cart-decrease, .cart-add
            display: inline-block
            padding: 6px
            line-height: 24px
            font-size: 24px
            color: rgb(0, 160, 220)
            transition: all .4s linear
            &.move-transition
                opacity: 1
                transform: translate3d(0, 0, 0)
                .inner
                    display: inline-block
                    line-height: 24px
                    font-size: 24px
                    color: rgb(0, 160, 220)
                    transition: all .4s linear 
                    transform: rotate(0) 
            &.move-enter, &.move-leave
                opacity: 0
                transform: translate3d(24px, 0, 0);
                .inner
                    transform: rotate(180deg)
        .cart-count
            display: inline-block
            vertical-align: top
            width: 12px
            padding-top: 6px
            line-height: 24px
            text-align: center
            font-size: 10px
            color: rgb(147, 153, 159)
        .cart-add
            display: inline-block
</style>


