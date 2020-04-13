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
                :class="['item', upl.statusClass]">{{ upl.id }}</li>
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
                  <i v-show="car.topArrow && car.exitPort" class="el-icon-top" />
                </div>
                <span :class="['cart', car.statusClass]">{{ car.id }}</span>
                <div class="icon-con">
                  <i v-show="!car.topArrow && car.exitPort" class="el-icon-bottom" style="position: relative; top: -3px;" />
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
              <i class="icon"></i>
            </div>
            <div class="right">
              <div class="cartId">小车编号：{{ c.cartId }}</div>
              <div class="trackNum">条码：{{ c.trackNum }}</div>
            </div>
          </li>
        </ul>
        <!-- 工包台 -->
        <ul class="chute-list">
          <li
            v-for="(c, i) in chuteList"
            :key="`chute-${i}`"
            :class="['chute', `chute-${i + 1}`]">
            <div class="count">包裹数量：<br />{{ c.parcelCount }}</div>
            <div class="icon"></div>
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
  name: 'Test',
  data() {
    // 设计图内径：宽、高 726 * 388
    // 背景图尺寸： 1809 * 537   1100 / 326  (x-50*2) / (326-50*2) = 726/388
    // statusClass: error - 红色闪烁 yellow - 黄色 blue - 蓝色 green - 绿色
    const uploadList = [[
      { id: 1, status: 0, statusClass: '' },
      { id: 2, status: 1 },
      { id: 3, status: 2 },
      { id: 4, status: 3, statusClass: 'error' },
      { id: 5, status: 1 }
    ], [
      { id: 6, status: 0 },
      { id: 7, status: 1 },
      { id: 8, status: 2 },
      { id: 9, status: 3, statusClass: 'error' },
      { id: 10, status: 0 },
      { id: 11, status: 1 }
    ]]
    // 小车列表 - 同下货口数组，直线轨道26个，半圆轨道11个
    let index = 1
    const cartList = Array.from({ length: 4 }, (v, i) => {
      // 横向 13个 竖向 11个
      const len = i % 2 === 0 ? 13 : 11

      return Array.from({ length: len }, (s, j) => {
        const car = {
          index,
          id: index,
          status: (j % 3 ? 1 : j % 6 ? 2 : 3),
          exitPort: (index % 4 ? index : ''),
          exitPortDirection: j % 2,
          title: 'hovertitle-' + index
        }
        car.statusClass = car.status === 3 ? 'error' : ''
        // 计算小车箭头隐藏、显示
        const topArrow = (index > 19 && index < 69 && (!car.exitPortDirection)) ||
                          ((index < 20 || index > 68) && car.exitPortDirection)
        car.topArrow = topArrow
        index++
        return car
      })
    })

    console.log('cartList')
    console.log(cartList)

    return {
      cartGroup: [13, 11, 13, 11],
      speed: 1.5, // 流水线速度
      notification: '', // 文本显示，和speed放在一起就好了
      cartList,
      cart: {
        id: 10, // 小车编号
        status: '', // 不同状态显示不同颜色
        exitPort: 888, // 格口
        exitPortDirection: 0 // 0或者1
      },
      chuteList: [{
        status: '', // 不同状态显示不同颜色
        parcelCount: 10 // 包裹数量,文本显示
      }],
      chute: {
        status: '', // 不同状态显示不同颜色
        parcelCount: 10 // 包裹数量,文本显示
      },
      cameraList: [{
        status: '', // 相机状态
        cartId: 10, // 小车编号
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
      },
      interval: ''
    }
  },
  mounted() {
    this.interval = setInterval(() => {
      this.updateSatus()
    }, 5000)
  },
  beforeDestroy() {
    clearInterval(this.interval)
  },
  methods: {
    updateSatus() {
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
            cart.id = cartData[index].id
            cart.status = cartData[index].status
            cart.exitPort = cartData[index].exitPort
            cart.exitPortDirection = cartData[index].exitPortDirection

            // 小车颜色状态
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
}
</script>

<style lang="scss" scoped>
$turntable-width: 970px;    // 862 / 537
$turntable-height: 604.6px;
$turn-width: 50px;    // 轨道宽度
$cart-width: 25px;
$inner-radius: 113px;
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
    width: 100%;
    height: calc(100vh - 50px);
    margin: 30px;
  }
}
.turntable-container {
  overflow: scroll;
  position: relative;
  // border: 1px solid greenyellow;
  width: 100%;
  height: calc(100vh - 50px);
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
    background: url('../../assets/turntable_test.png') no-repeat;
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
  .error {
    background-color: #ef8886;
    animation: blink 1s linear infinite;
  }
  /* 定义keyframe动画，命名为blink */
  @keyframes blink{
    0%{opacity: 1;}
    100%{opacity: 0;}
  }
  .yellow {
    background-color: #e6b843;
  }
  .blue {
    background-color: #619ed8
  }
  .green {
    background-color: #67c343
  }
  .upload-group {
    height: 0;
    .group-item {
      position: relative;
      height: 35px;
      &.group-1 {
        left: $turntable-height/2 + 2;
        top: 455px;
      }
      &.group-2 {
        left: 260px;
        top: 572px;
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

  }
  .cart-group {
    font-size: 0;
    .group-item {
      position: relative;
      z-index: 99;
      // height: $turn-width - 6;
    }
    .group-1 {
      left: $turntable-height/2;
      top: 46px;
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
      right: 280px;
      top: 465px;
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
      margin-left: 3px;
      width: 18px;
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
    .item-14, .item-24 {
      left: -195px;
    }
    .item-14 {
      top: 49px;
      transform: rotate(15deg);
    }
    .item-24 {
      top: -8px;
      transform: rotate(-15deg);
    }
    .item-38, .item-48 {
      left: 237px;
    }
    .item-38 {
      top: 510px;
      transform: rotate(15deg);
    }
    .item-48 {
      top: -462px;
      transform: rotate(-15deg);
    }
    // 圆环第二组
    .item-15, .item-23 {
      left: -134px;
    }
    .item-15 {
      top: 21px;
      transform: rotate(30deg);
    }
    .item-23 {
      top: 18px;
      transform: rotate(-30deg);
    }
    .item-39, .item-47 {
      left: 175px;
    }
    .item-39 {
      top: 436px;
      transform: rotate(30deg);
    }
    .item-47 {
      top: -391px;
      transform: rotate(-30deg);
    }
    // 圆环第三组
    .item-16, .item-22 {
      left: -84px;
    }
    .item-16 {
      top: 2px;
      transform: rotate(45deg);
    }
    .item-22 {
      top: 28px;
      transform: rotate(-45deg);
    }
    .item-40, .item-46 {
      left: 128px;
    }
    .item-40 {
      top: 347px;
      transform: rotate(45deg);
    }
    .item-46 {
      top: -307px;
      transform: rotate(-45deg);
    }
    // 圆环第四组
    .item-17, .item-21 {
      left: -47px;
    }
    .item-17 {
      top: -2px;
      transform: rotate(60deg);
    }
    .item-21 {
      top: 28px;
      transform: rotate(-60deg);
    }
    .item-41, .item-45 {
      left: 87px;
    }
    .item-41 {
      top: 242px;
      transform: rotate(60deg);
    }
    .item-45 {
      top: -213px;
      transform: rotate(-60deg);
    }
    // 圆环第五组
    .item-18, .item-20 {
      left: -29px; // -46px;
    }
    .item-18 {
      top: -6px;
      transform: rotate(75deg);
    }
    .item-20 {
      top: 14px;
      transform: rotate(-75deg);
    }
    .item-42, .item-44 {
      left: 58px;
    }
    .item-42 {
      top: 132px;
      transform: rotate(75deg);
    }
    .item-44 {
      top: -101px;
      transform: rotate(-75deg);
    }
    // 圆环横向
    .item-19 {
      left: -23px;
      top: -1px;
      transform: rotate(90deg);
    }
    .item-43 {
      left: 46px;
      top: 21px;
      transform: rotate(-90deg);
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
      top: 56px;
      left: 868px;
      .left {
        transform: rotate(-26deg);
      }
    }
    .camera-2 {
      position: relative;
      left: 63px;
      top: 81px;
    }
    .icon {
      display: inline-block;
      width: 54px;
      height: 50px;
      background: url('../../assets/camera.png') no-repeat;  // 620 * 583
      background-size: contain;
    }
  }
  // 工包台
  .chute-list {
    position: absolute;
    top: 0;
    .chute {
      display: flex;
      align-items: center;
    }
    .icon {
      width: 150px;
      height: 45px;
      border-top: 2px solid #c3c3c3;
      border-bottom: 2px solid #c3c3c3;
    }
    .chute-1 {
      position: relative;
      left: 360px;
      top: 121px;
      transform: rotate(-30deg);
    }
  }
}
</style>
