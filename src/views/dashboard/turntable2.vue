<template>
  <div class="dashboard-container">
    <div class="turntable-container">
      <div class="bg"></div>
      <div class="content">
        <!-- 下货口 -->
        <ul class="upload-group">
          <li
            v-for="(u, i) in uploadList"
            :key="`upload-group-${i}`"
            :class="['group-item', `group-${i + 1}`]">
            <ul class="upload-list">
              <li
                v-for="(upl, j) in u"
                :key="`upload-${j}`"
                :class="['item', `status-${upl.status}`]">{{ upl.id }}</li>
            </ul>
          </li>
        </ul>
        <!-- 小车列表 -->
        <ul class="cart-group">
          <li
            v-for="(c, i) in cartList"
            :key="`cart-group-${i}`"
            :class="['group-item', `group-${i + 1}`]">
            <ul class="cart-list">
              <li
                v-for="car in c"
                :key="`cart-${car.index}`"
                :class="['item', `item-${car.index}`]"
                :title="`下货口：${car.exitPort}`">
                <div class="icon-con">
                  <i v-show="car.topArrow" class="el-icon-top" />
                </div>
                <span :class="['cart', `status-${car.status}`]">{{ car.exitPort }}</span>
                <div class="icon-con">
                  <i v-show="!car.topArrow" class="el-icon-bottom" style="position: relative; top: -3px;" />
                </div>
              </li>
            </ul>
          </li>
        </ul>
        <ul class="camera-list">
          <li
            v-for="(c, i) in cameraList"
            :key="`camera-${i}`"
            :class="['camera', `camera-${i + 1}`]">
            <div class="left">
              <i class="icon" />
            </div>
            <div class="right">
              <div class="cartId">小车编号：{{ c.cartId }}</div>
              <div class="trackNum">条码：{{ c.trackNum }}</div>
            </div>
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import { getList } from '@/api/turntable'

export default {
  name: 'Dashboard',
  data() {
    // 下货口数量 74
    // 下货口列表 - 按照顺时针方向，分为四个数组[[],[],[],[]]
    const uploadList = Array.from({ length: 4 }, (v, i) => (
      Array.from({ length: 40 }, (s, j) => ({
        id: (i * 40 + j + 1),
        status: (j % 3 + 1)
      }))
    ))
    // 小车列表 - 同下货口数组，直线轨道26个，半圆轨道11个 - 74
    // 小车数量 162 - 74 = 88 = 8 + 8 + 36 + 36
    // 8 * 30 = 240，36 * 30 = 1080
    // 1100px * 326px;    // 1809 * 537
    // 背景图片：（1100 + 1080）/ 1100 * 1809 = 3585
    // 背景图片：（326 + 240）/ 326 * 537 = 932

    let index = 1
    const cartList = Array.from({ length: 4 }, (v, i) => {
      // 横向 26 + 36 个 竖向 11 + 8个
      const len = i % 2 === 0 ? 62 : 19

      return Array.from({ length: len }, (s, j) => {
        const car = {
          index,
          id: index,
          status: (j % 3 ? 1 : j % 6 ? 2 : 3),
          exitPort: index,
          exitPortDirection: (index % 4 ? index : ''),
          title: 'hovertitle-' + index
        }
        // 计算小车箭头隐藏、显示
        const topArrow = (index > 32 && index < 69 && (!car.exitPortDirection)) ||
                          ((index < 33 || index > 68) && car.exitPortDirection)
        car.topArrow = topArrow
        index++
        return car
      })
    })

    return {
      cartGroup: [62, 19, 62, 19],
      speed: 1.5, // 流水线速度
      notification: '', // 文本显示，和speed放在一起就好了
      cartList,
      cart: {
        id: 10, // 小车编号
        status: '', // 不同状态显示不同颜色
        exitPort: 888, // 格口
        exitPortDirection: 0 // 0或者1
      },
      chuteList: [],
      chute: {
        status: '', // 不同状态显示不同颜色
        parcelCount: 10 // 包裹数量,文本显示
      },
      cameraList: [{
        status: '', // 相机状态
        cartId: 10, // 小车编号
        trackNum: '77777' // 包裹编号
      },
      {
        status: '', // 相机状态
        cartId: 11, // 小车编号
        trackNum: '77777' // 包裹编号
      }],
      camera: {
        status: '', // 相机状态
        cartId: 10, // 小车编号
        trackNum: '77777' // 包裹编号
      },
      uploadList,
      upload: {
        id: 1, // 供包台id
        notice: '' // 提示文本信息
      },
      printerList: [],
      printer: {
        id: 1, // 打印机id
        notice: '' // 提示文本信息
      }
    }
  },
  computed: {
    ...mapGetters([
      'name'
    ])
  },
  mounted() {
    getList().then(res => {
      // 修改卡口状态
      this.uploadList.forEach((g, i) => {
        g.forEach((upload, j) => {
          const index = i * 8 + j
          upload.status = res.data.uploadList[index].status
        })
      })

      // 修改小车状态
      const cartData = res.data.cartList
      this.cartList.forEach((g, i) => {
        g.forEach((cart, j) => {
          let index = 0
          this.cartGroup.forEach((num, sub) => {
            if (sub <= i) {
              index += num
            }
          })

          cart.status = cartData[index].status
          cart.exitPort = cartData[index].exitPort
          cart.exitPortDirection = cartData[index].exitPortDirection
        })
      })

      // 修改顶拍相机
      res.data.cameraList.forEach((camera, i) => {
        this.cameraList[i].status = camera.cartId
        this.cameraList[i].trackNum = camera.trackNum
      })
    })
  }
}
</script>

<style lang="scss" scoped>
$turntable-width: 2180px;    // 1809 * 537
$turntable-height: 566px;    // 326 + 240
$turntable-radius: 163px;
$turn-width: 50px;
$cart-width: 25px;
// 轨道周长：(1100+1100-326-326 + 3.14*(326-50-50)) 2257 74 = 30   26 26 11 11
ul {
  margin: 0;
  padding: 0;
}
li {
  list-style-type:none;
}
.dashboard {
  &-container {
    overflow: scroll;
    margin: 30px;
  }
}
.turntable-container {
  position: relative;
  // border: 1px solid greenyellow;
  width: $turntable-width;
  height: $turntable-height + 70;
  .bg, .content {
    position: absolute;
    left: 50%;
    top: 50%;
    margin-left: -$turntable-width/2;
    margin-top: -$turntable-height/2;
    width: $turntable-width;
    height: $turntable-height;
  }
  .bg {
    background: url('../../assets/bg-2.png') no-repeat;
    background-size: contain;
  }
  .content {
    // position: relative;
    // z-index: 9;
  }
  .item {
    display: inline-block;
    box-sizing: border-box;
    border: 1px solid #c3c3c3;
    border-radius: 5px;
    color: #333;
  }
  .upload-group {
    height: 0;
    .group-item {
      position: relative;
      height: 35px;
      &.group-1 {
        left: $turntable-radius + 2;
        top: -36px;
      }
      &.group-2 {
        left: $turntable-radius + 2;
        top: 24px;
      }
      &.group-3 {
        top: 400px;
        left: $turntable-radius + 266;
      }
      &.group-4 {
        top: 462px;
        left: $turntable-radius + 266;
      }
    }
  }
  .upload-list {
    height: 35px;
    .item {
      margin-right: 5px;
      width: 35px;
      height: 35px;
      line-height: 35px;
      text-align: center;
    }
    .status-1 {
      background-color: #67c343;
    }
    .status-2 {
      background-color: #619ed8;
    }
    // 异常闪烁
    .status-3 {
      background-color: #ef8886;
      animation: blink 1s linear infinite;
    }
    .status-4 {
      background-color: #e6b843;
    }
    /* 定义keyframe动画，命名为blink */
    @keyframes blink{
      0%{opacity: 1;}
      100%{opacity: 0;}
    }
  }
  .cart-group {
    font-size: 0;
    .group-item {
      position: relative;
      z-index: 99;
      // height: $turn-width - 6;
    }
    .group-1 {
      left: $turntable-radius;
      .cart-list {
        display: flex;
      }
    }
    .group-2 {
      position: absolute;
      left: $turntable-width - $turn-width;
      top: 0;
      width: $turn-width;
    }
    .group-3 {
      right: $turntable-radius - 5;
      top: 457px;
      .cart-list {
        // display: flex;
      }
      .item {
        float: right;
      }
    }
    .group-4 {
      position: absolute;
      left: 0;
      top: 0;
      width: $turn-width;
    }
    .item {
      position: relative;
      margin-top: 6px;
      margin-right: 5px;
      text-align: center;
      width: 25px;
      height: $turn-width - 5;
      border-radius: 5px;
      font-size: 14px;
      .icon-con {
        width: 100%;
        height: 12px;
        i {
          font-size: 12px;
        }
      }
    }
    .cart {
      display: block;
      box-sizing: border-box;
      // margin-left: 3px;
      width: 23px;
      height: 18px;
      line-height: 18px;
      border-radius: 9px;
      &.status-2 {
        background-color: #e6b843;
      }
      &.status-3 {
        background-color: #ef8886;
      }
    }
    // 圆环第一组
    .item-63, .item-81 {
      left: -100px;
    }
    .item-63 {
      top: 3px;
      transform: rotate(15deg);
    }
    .item-81 {
      top: -413px;
      transform: rotate(-15deg);
    }
    .item-144, .item-162 {
      left: 126px;
    }
    .item-144 {
      top: 505px;
      transform: rotate(15deg);
    }
    .item-162 {
      top: -915px;
      transform: rotate(-15deg);
    }
    // 圆环第二组
    .item-64, .item-80 {
      left: -66px;
    }
    .item-64 {
      top: -36px;
      transform: rotate(30deg);
    }
    .item-80 {
      top: -375px;
      transform: rotate(-30deg);
    }
    .item-145, .item-161 {
      left: 91px;
    }
    .item-145 {
      top: 442px;   // 203 442
      transform: rotate(30deg);
    }
    .item-161 {
      top: -852px;  // -444 -852 = -408
      transform: rotate(-30deg);
    }
    // 圆环第三组
    .item-65, .item-79 {
      left: -37px;
    }
    .item-65 {
      top: -67px;
      transform: rotate(45deg);
    }
    .item-79 {
      top: -345px;
      transform: rotate(-45deg);
    }
    .item-146, .item-160 {
      left: 61px;
    }
    .item-146 {
      top: 370px;
      transform: rotate(45deg);
    }
    .item-160 {
      top: -781px;
      transform: rotate(-45deg);
    }
    // 圆环第四组
    .item-66, .item-78 {
      left: -14px;
    }
    .item-66 {
      top: -91px;
      transform: rotate(60deg);
    }
    .item-78 {
      top: -323px;
      transform: rotate(-60deg);
    }
    .item-147, .item-159 {
      left: 37px;
    }
    .item-147 {
      top: 291px;
      transform: rotate(60deg);
    }
    .item-159 {
      top: -701px;
      transform: rotate(-60deg);
    }
    // 圆环第五组
    .item-67, .item-77 {
      left: 1px; // -46px;
    }
    .item-67 {
      top: -108px;
      transform: rotate(75deg);
    }
    .item-77 {
      top: -306px;
      transform: rotate(-75deg);
    }
    .item-148, .item-158 {
      left: 22px;
    }
    .item-148 {
      top: 205px;
      transform: rotate(75deg);
    }
    .item-158 {
      top: -618px;
      transform: rotate(-75deg);
    }
    // 圆环横向
    .item-68, .item-69, .item-70, .item-71, .item-72, .item-73, .item-74, .item-75, .item-76 {
      left: 7px;
      top: -122px;
      transform: rotate(90deg);
    }
    .item-69 {
      top: -143px;
    }
    .item-70 {
      top: -164px;
    }
    .item-71 {
      top: -185px;
    }
    .item-72 {
      top: -206px;
    }
    .item-73 {
      top: -227px;
    }
    .item-74 {
      top: -248px;
    }
    .item-75 {
      top: -269px;
    }
    .item-76 {
      top: -290px;
    }
    .item-149, .item-150, .item-151, .item-152, .item-153, .item-154, .item-155, .item-156, .item-157 {
      left: 17px;
      transform: rotate(-90deg);
    }
    .item-149 {
      top: 119px;
    }
    .item-150 {
      top: 38px;
    }
    .item-151 {
      top: -43px;
    }
    .item-152 {
      top: -124px;
    }
    .item-153 {
      top: -205px;
    }
    .item-154 {
      top: -286px;
    }
    .item-155 {
      top: -367px;
    }
    .item-156 {
      top: -449px;
    }
    .item-157 {
      top: -531px;
    }
  }
  // 顶拍相机
  .camera-list {
    position: absolute;
    top: 0;
    width: 100%;
    .camera {
      display: flex;
      .left, .right {
        display: inline-block;
      }
      .left {
        width: 60px;
      }
    }
    .camera-1 {
      position: relative;
      top: 181px;
      left: 2178px;
      .left {
        // transform: rotate(-26deg);
      }
    }
    .camera-2 {
      position: relative;
      left: 63px;
      top: 249px;
    }
    .icon {
      display: inline-block;
      width: 54px;
      height: 50px;
      background: url('../../assets/camera.png') no-repeat;  // 620 * 583
      background-size: contain;
    }
  }
}
</style>
