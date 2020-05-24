<template>
  <div class="dashboard-container">
    <div class="turntable-container">
      <div class="bg"></div>
      <div class="content">
        <!-- 下货口 -->
        <ul class="chute-group">
          <li
            v-for="(u, i) in chuteList"
            :key="`chute-group-${i}`"
            :class="['group-item', `group-${i + 1}`]"
          >
            <ul class="chute-list">
              <li
                v-for="(chu, j) in u"
                :key="`chute-${j}`"
                :class="['item', chu.statusClass]"
              >
                <!-- {{ chu.id }} -->
                {{ chu.exitport }}
              </li>
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
                :class="['item', `item-${car.index}`, car.circleClass]"
                :title="`${car.title}`"
              >
                <div class="icon-con">
                  <i
                    v-show="car.topArrow && car.exitPort"
                    class="el-icon-top"
                  />
                </div>
                <span :class="['cart', car.statusClass]">{{ car.id }}</span>
                <div class="icon-con">
                  <i
                    v-show="!car.topArrow && car.exitPort"
                    class="el-icon-bottom"
                    style="position: relative; top: -3px;"
                  />
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
        <ul class="upload-list">
          <li
            v-for="(c, i) in uploadList"
            :key="`upload-${i}`"
            :class="['upload', `upload-${i + 1}`]"
          >
            <div class="count">包裹数量：<br />{{ c.parcelCount }}</div>
            <div class="icon"></div>
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script>
import {
  getChuteList,
  getCartList
} from '@/api/turntable'

export default {
  name: 'Test',
  data() {
    // 设计图内径：宽、高 726 * 388
    // 背景图尺寸： 1809 * 537   1100 / 326  (x-50*2) / (326-50*2) = 726/388
    // statusClass: error - 红色闪烁 yellow - 黄色 blue - 蓝色 green - 绿色
    const chuteList = [[
      { id: 1, status: 0 },
      { id: 2, status: 1 },
      { id: 3, status: 2 },
      { id: 4, status: 3 },
      { id: 5, status: 1 }
    ], [
      { id: 6, status: 0 },
      { id: 7, status: 1 },
      { id: 8, status: 2 },
      { id: 9, status: 3 },
      { id: 10, status: 0 },
      { id: 11, status: 1 }
    ]]
    // 小车列表 - 同下货口数组，直线轨道8个，半圆轨道16个
    let index = 48
    const len = [8, 16, 8, 16]
    const cartList = Array.from({ length: 4 }, (v, i) => {
      const cirClass1 = i === 1 ? 'right-' : i === 3 ? 'left-' : ''

      return Array.from({ length: len[i] }, (s, j) => {
        let circleClass = cirClass1
        if (i === 1 || i === 3) {
          circleClass +=
            (i === 1 && j < 8) || (i === 3 && j > 7) ? 'up-' : 'down-'
          circleClass += j < 8 ? j : j - 8
        }

        const car = {
          index,
          id: index,
          circleClass
        }
        index--
        return car
      })
    })
    return {
      cartGroup: [8, 16, 8, 16],
      speed: 1.5, // 流水线速度
      notification: '', // 文本显示，和speed放在一起就好了
      cartList,
      cart: {
        id: 10, // 小车编号
        status: '', // 不同状态显示不同颜色
        exitPort: 888, // 格口
        exitPortDirection: 0 // 0或者1
      },
      uploadList: [{
        status: '', // 不同状态显示不同颜色
        parcelCount: 10 // 包裹数量,文本显示
      }],
      upload: {
        status: '', // 不同状态显示不同颜色
        parcelCount: 10 // 包裹数量,文本显示
      },
      cameraList: [
        {
          status: '', // 相机状态
          cartId: null, // 小车编号
          trackNum: '' // 包裹编号
        }
      ],
      camera: {
        status: '', // 相机状态
        cartId: 10, // 小车编号
        trackNum: '77777' // 包裹编号
      },
      chuteList,
      chute: {
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
    this.cartinterval = setInterval(() => {
      this.updateCartSatus()
    }, 100000)
    this.chuteinterval = setInterval(() => {
      this.updateChuteStatus()
    }, 3000)
  },
  beforeDestroy() {
    clearInterval(this.cartinterval)
    clearInterval(this.chuteinterval)
  },
  methods: {
    updateCartSatus() {
      getCartList().then(res => {
        //   // 修改小车状态
        const cartData = res.data.data
        // console.log("req: ", res.data);
        const cameraData = res.data.cameraInfo
        this.cameraList[0].trackNum = cameraData.barcode
        this.cameraList[0].cartId = cameraData.cartId
        console.log(this.cameraList[0])
        const anchor = res.data.cameraInfo.anchor
        console.log('anchor: ', anchor)
        const realList = this.adjustCartList(cartData.reverse(), anchor);
        this.fillCartGroup(realList)
      })
    },
    adjustCartList(cartList, anchor) {
      if (anchor < 0 || anchor > 47) return
      let dist = 48 - anchor
      if (dist === 48) dist = 0
      const stuffixList = cartList.slice(0, dist)
      const prefixList = cartList.slice(dist)
      const tempList = prefixList.concat(stuffixList)
      return tempList
    },
    fillCartGroup(infoList) {
      this.cartList[0].forEach((item, index) => {
        const info = this.updateCartInfo(infoList, index)
        const cart = Object.assign(item, info)
        // 计算小车箭头隐藏、显示
        const topArrow =
          (cart.index > 8 && cart.index < 33 && !cart.exitPortDirection) ||
          ((cart.index < 9 || cart.index > 32) && cart.exitPortDirection);
        cart.topArrow = topArrow
        return cart
      })
      this.cartList[1].forEach((item, index) => {
        const info = this.updateCartInfo(infoList, 8 + index)
        const cart = Object.assign(item, info)
        // 计算小车箭头隐藏、显示
        const topArrow =
          (cart.index > 8 && cart.index < 33 && !cart.exitPortDirection) ||
          ((cart.index < 9 || cart.index > 32) && cart.exitPortDirection)
        cart.topArrow = topArrow
        return cart
      })
      this.cartList[2].forEach((item, index) => {
        const info = this.updateCartInfo(infoList, 24 + index)
        const cart = Object.assign(item, info)
        // 计算小车箭头隐藏、显示
        const topArrow =
          (cart.index > 8 && cart.index < 33 && !cart.exitPortDirection) ||
          ((cart.index < 9 || cart.index > 32) && cart.exitPortDirection)
        cart.topArrow = topArrow
        return cart
      })
      this.cartList[3].forEach((item, index) => {
        const info = this.updateCartInfo(infoList, 32 + index)
        const cart = Object.assign(item, info)
        // 计算小车箭头隐藏、显示
        const topArrow =
          (cart.index > 8 && cart.index < 33 && !cart.exitPortDirection) ||
          ((cart.index < 9 || cart.index > 32) && cart.exitPortDirection)
        cart.topArrow = topArrow
        return cart
      })
      // console.log("fill: ", this.cartList);
    },
    updateCartInfo(cartList, i) {
      let cart = {}

      cart.id = cartList[i].id
      cart.status =
        parseInt(cartList[i].send * 2) + parseInt(cartList[i].receive)
      cart.exitPort = cartList[i].exitport
      cart.exitPortDirection = parseInt(cartList[i].direction)
      cart.chutecode = cartList[i].chutecode
      cart.barcode = cartList[i].barcode
      cart.circleCount = cartList[i].circlecount
      cart.title = '小车号: ' + `${cart.id}`
      cart.title += '\n下货口: ' + `${cart.exitPort}`
      cart.title += '\n方向: ' + `${cart.exitPortDirection}`
      cart.title += '\n逻辑口: ' + `${cart.chutecode}`
      cart.title += '\n条码: ' + `${cart.barcode}`
      cart.title += '\n圈数: ' + `${cart.circleCount}`
      cart.statusClass = ''
      if (cart.circleCount != '' && parseInt(cart.circleCount) > 5) {
        cart.statusClass = 'blue'
      }
      if (cart.status === 0) {
        cart.statusClass = 'error'
      } else if (cart.status === 1) {
        cart.statusClass = 'error'
      } else if (cart.status === 2) {
        cart.statusClass = 'warn'
      }
      // car.statusClass = car.status === 3 ? "error" : ""
      return cart
    },
    updateChuteStatus() {
      getChuteList().then(res => {
        const chuteData = res.data.data
        console.log('chuteData: ', chuteData)
        this.chuteList = this.chuteList.map(zone => {
          return zone.map(item => {
            item.exitport = chuteData[item.id].exitport
            item.direction = chuteData[item.id].direction
            item.chutecode = chuteData[item.id].chutecode
            item.funcStatus = chuteData[item.id].funcStatus
            item.buttonStatus = chuteData[item.id].buttonStatus
            item.portStatus = chuteData[item.id].portStatus
            item.statusClass = ''
            if (item.funcStatus === 0) {
              item.statusClass = 'red'
            } else if (item.funcStatus === 2) {
              item.statusClass = 'yellow'
            }
            return item
          })
        })

        console.log('deal data:', this.chuteList)
      })
    }
  }
}
</script>

<style lang="scss" scoped>
$turntable-width: 740px;
$turntable-height: 460px;
$turn-width: 50px;    // 轨道宽度
$cart-width: 35px;    // 小车所占宽度
$inner-radius: 180px; // 内径半径

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
    background: url('../../assets/test_bg.png') no-repeat;
    background-size: contain;
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
  .warn {
    background-color: #e6b843;
    animation: blink 1s linear infinite;
  }
  /* 定义keyframe动画，命名为blink */
  @keyframes blink{
    0%{opacity: 1;}
    100%{opacity: 0;}
  }
  .red {
    background-color: #ef8886;
  }
  .yellow {
    background-color: #e6b843;
  }
  .blue {
    background-color: #619ed8;
  }
  .green {
    background-color: #67c343;
  }
  .chute-group {
    height: 0;
    .group-item {
      position: relative;
      height: 35px;
      &.group-1 {
        left: $turntable-height/2;
        top: 372px;
      }
      &.group-2 {
        left: 191px;
        top: 428px;
      }
    }
  }
  .chute-list {
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
      .cart-list {
        display: flex;
      }
    }
    .group-2 {
      position: absolute;
      right: 0;
      top: 0;
      width: $turn-width;
    }
    .group-3 {
      right: 228px;
      top: 362px;
      .cart-list {
        // display: flex;
        font-size: 0;
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
      margin-top: 3px;
      margin-right: 10px;
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
    .right-up-0 {
      left: -178px;
      top: 0px;
      transform: rotate(4deg);
    }
    .right-down-7 {
      left: -173px;
      top: -312px;
      transform: rotate(-7.25deg);
    }
    .left-down-0 {
      left: 195px;
      top: 408px;
      transform: rotate(4deg);
    }
    .left-up-7 {
      left: 192px;
      top: -718px;
      transform: rotate(-7.25deg);
    }
    // 圆环第二组
    .right-up-1{
      left: -139px;
      top: -41px;
      transform: rotate(15.25deg);
    }
    .right-down-6 {
      left: -133px;
      top: -271px;
      transform: rotate(-18.5deg);
    }
    .left-down-1 {
      left: 157px;
      top: 352px;
      transform: rotate(15.25deg);
    }
    .left-up-6 {
      left: 153px;
      top: -661px;
      transform: rotate(-18.5deg);
    }
    // 圆环第三组
    .right-up-2 {
      left: -100px;
      top: -74px;
      transform: rotate(26.5deg);
    }
    .right-down-5 {
      left: -94px;
      top: -240px;
      transform: rotate(-29.75deg);
    }
    .left-down-2 {
      left: 119px;
      top: 288px;
      transform: rotate(26.5deg);
    }
    .left-up-5 {
      left: 118px;
      top: -598px;
      transform: rotate(-29.75deg);
    }
    // 圆环第四组
    .right-up-3 {
      left: -68px;
      top: -102px;
      transform: rotate(37.75deg);
    }
    .right-down-4 {
      left: -60px;
      top: -215px;
      transform: rotate(-41deg);
    }
    .left-down-3 {
      left: 88px;
      top: 219px;
      transform: rotate(37.75deg);
    }
    .left-up-4 {
      left: 85px;
      top: -527px;
      transform: rotate(-41deg);
    }
    // 圆环第五组
    .right-up-4 {
      left: -41px;
      top: -124px;
      transform: rotate(49deg);
    }
    .right-down-3 {
      left: -31px;
      top: -197px;
      transform: rotate(-52.25deg);
    }
    .left-down-4 {
      left: 60px;
      top: 143px;
      transform: rotate(49deg);
    }
    .left-up-3 {
      left: 58px;
      top: -451px;
      transform: rotate(-52.25deg);
    }
    // 圆环第六组
    .right-up-5 {
      left: -18px;
      top: -141px;
      transform: rotate(60.25deg);
    }
    .right-down-2 {
      left: -8px;
      top: -185px;
      transform: rotate(-63.5deg);
    }
    .left-down-5 {
      left: 37px;
      top: 62px;
      transform: rotate(60.25deg);
    }
    .left-up-2 {
      left: 36px;
      top: -371px;
      transform: rotate(-63.5deg);
    }
    // 圆环第七组
    .right-up-6 {
      left: 0px;
      top: -154px;
      transform: rotate(71.5deg);
    }
    .right-down-1 {
      left: 6px;
      top: -175px;
      transform: rotate(-74.75deg);
    }
    .left-down-6 {
      left: 21px;
      top: -24px;
      transform: rotate(71.5deg);
    }
    .left-up-1 {
      left: 21px;
      top: -285px;
      transform: rotate(-74.75deg);
    }
    // 圆环第八组
    .right-up-7 {
      left: 10px;
      top: -162px;
      transform: rotate(82.75deg);
    }
    .right-down-0 {
      left: 12px;
      top: -166px;
      transform: rotate(-86deg);
    }
    .left-down-7 {
      left: 14px;
      top: -110px;
      transform: rotate(82.75deg);
    }
    .left-up-0 {
      left: 14px;
      top: -199px;
      transform: rotate(-86deg);
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
      left: 698px;
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
      background: url('../../assets/camera.png') no-repeat; // 620 * 583
      background-size: contain;
    }
  }
  // 工包台
  .upload-list {
    position: absolute;
    top: 0;
    .upload {
      display: flex;
      align-items: center;
    }
    .icon {
      width: 150px;
      height: 45px;
      border-top: 2px solid #c3c3c3;
      border-bottom: 2px solid #c3c3c3;
    }
    .upload-1 {
      position: relative;
      left: 220px;
      top: 68px;
      transform: rotate(-30deg);
    }
  }
}
</style>
