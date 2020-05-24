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
  name: 'Large',
  data() {
    // statusClass: red - 红色闪烁 yellow - 黄色 blue - 蓝色 green - 绿色
    const chuteList = [0, 1, 2, 3].map(item => {
      const chute = []
      for (let i = 0; i < 40; i++) {
        chute.push({
          id: item * 8 + i + 1,
          status: 0
        })
      }
      return chute
    })

    // 小车列表 - 同下货口数组，直线轨道21个，半圆轨道16个
    // 8+6+8+59+8+6+8+59=162
    const len = [59, 22, 59, 22]
    let index = 0
    len.forEach(item => {
      index += item
    })
    const cartList = Array.from({ length: 4 }, (v, i) => {
      const cirClass1 = i === 1 ? 'right-' : i === 3 ? 'left-' : ''

      return Array.from({ length: len[i] }, (s, j) => {
        let circleClass = cirClass1

        // 弯道item添加class
        if ((i === 1 || i === 3) && (j < 8 || j > 13)) {
          circleClass +=
            (i === 1 && j < 8) || (i === 3 && j > 13) ? 'up-' : 'down-'
          circleClass += j < 8 ? j : j - 14
        } else if (i === 1) {
          circleClass += 'middle-' + (j - 8)
        } else if (i === 3) {
          circleClass += 'middle-' + (j - 8)
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
      carCount: 162,
      cartLen: [59, 22, 59, 22],
      speed: 1.5, // 流水线速度
      notification: '', // 文本显示，和speed放在一起就好了
      cartList,
      cart: {
        id: 10, // 小车编号
        status: '', // 不同状态显示不同颜色
        exitPort: 888, // 格口
        exitPortDirection: 0 // 0或者1
      },
      uploadList: [],
      upload: {
        status: '', // 不同状态显示不同颜色
        parcelCount: 10 // 包裹数量,文本显示
      },
      cameraList: [
        {
          id: 1,
          status: '', // 相机状态
          cartId: null, // 小车编号
          trackNum: '' // 包裹编号
        },
        {
          id: 2,
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
        const realList = this.adjustCartList(cartData.reverse(), anchor)
        this.fillCartGroup(realList)
      })
    },
    adjustCartList(cartList, anchor) {
      if (anchor < 0 || anchor > (this.carCount - 1)) return
      let dist = this.carCount - anchor
      if (dist === this.carCount) dist = 0
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
        cart.topArrow = this.calcArrowDir(cart.index, cart.exitPortDirection)
        return cart
      })
      this.cartList[1].forEach((item, index) => {
        const info = this.updateCartInfo(infoList, this.cartLen[0] + index)
        const cart = Object.assign(item, info)
        // 计算小车箭头隐藏、显示
        cart.topArrow = this.calcArrowDir(cart.index, cart.exitPortDirection)
        return cart
      })
      this.cartList[2].forEach((item, index) => {
        const info = this.updateCartInfo(
          infoList,
          this.cartLen[0] + this.cartLen[1] + index
        )
        const cart = Object.assign(item, info)
        // 计算小车箭头隐藏、显示
        cart.topArrow = this.calcArrowDir(cart.index, cart.exitPortDirection)
        return cart
      })
      this.cartList[3].forEach((item, index) => {
        const info = this.updateCartInfo(
          infoList,
          this.cartLen[0] + this.cartLen[1] + this.cartLen[2] + index
        )
        const cart = Object.assign(item, info)
        // 计算小车箭头隐藏、显示
        cart.topArrow = this.calcArrowDir(cart.index, cart.exitPortDirection)
        return cart
      })
      // console.log("fill: ", this.cartList);
    },
    calcArrowDir(index, port) {
      const min = this.cartLen[3] / 2
      const max = this.cartLen[3] + this.cartLen[2] + (this.cartLen[1] / 2)
      const direction =
        (index > min && index <= max && !port) ||
          ((index <= min || index > max) && port)
      return direction
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
      if (cart.circleCount !== '' && parseInt(cart.circleCount) > 5) {
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
$turntable-width: 2170px;
$turntable-height: 580px;
$turn-width: 50px;    // 轨道宽度
$cart-width: 30px;    // 小车所占宽度
$inner-radius: 150px; // 内径半径

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
    overflow: auto;
  }
}
.turntable-container {
  overflow: scroll;
  position: relative;
  width: 2470px;
  height: $turntable-height + 80;
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
    background: url('../../assets/large.png') no-repeat;
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
        left: 200px;
        top: -40px;
      }
      &.group-2 {
        left: 200px;
        top: 20px;
      }
      &.group-3 {
        top: 420px;
        left: 372px;
      }
      &.group-4 {
        top: 480px;
        left: 372px;
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
      left: 200px;
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
      right: 200px;
      top: 482px;
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
    .right-up-0 {
      left: -149px;
      top: 0px;
      transform: rotate(4deg);
    }
    .right-down-7 {
      left: -143px;
      top: -480px;
      transform: rotate(-7.25deg);
    }
    .left-down-0 {
      left: 168px;
      top: 526px;
      transform: rotate(4deg);
    }
    .left-up-7 {
      left: 167px;
      top: -1007px;   // -719px;
      transform: rotate(-7.25deg);
    }
    // 圆环第二组
    .right-up-1{
      left: -117px;
      top: -42px;
      transform: rotate(15.25deg);
    }
    .right-down-6 {
      left: -112px;
      top: -438px;
      transform: rotate(-18.5deg);
    }
    .left-down-1 {
      left: 137px;
      top: 472px;
      transform: rotate(15.25deg);
    }
    .left-up-6 {
      left: 135px;
      top: -952px;
      transform: rotate(-18.5deg);
    }
    // 圆环第三组
    .right-up-2 {
      left: -87px;
      top: -79px;
      transform: rotate(26.5deg);
    }
    .right-down-5 {
      left: -81px;
      top: -403px;
      transform: rotate(-29.75deg);
    }
    .left-down-2 {
      left: 107px;
      top: 411px;
      transform: rotate(26.5deg);
    }
    .left-up-5 {
      left: 103px;
      top: -891px;
      transform: rotate(-29.75deg);
    }
    // 圆环第四组
    .right-up-3 {
      left: -58px;
      top: -109px;
      transform: rotate(37.75deg);
    }
    .right-down-4 {
      left: -50px;
      top: -375px;
      transform: rotate(-41deg);
    }
    .left-down-3 {
      left: 78px;
      top: 344px;
      transform: rotate(37.75deg);
    }
    .left-up-4 {
      left: 75px;
      top: -823px;
      transform: rotate(-41deg);
    }
    // 圆环第五组
    .right-up-4 {
      left: -33px;
      top: -134px;
      transform: rotate(49deg);
    }
    .right-down-3 {
      left: -27px;
      top: -351px;
      transform: rotate(-52.25deg);
    }
    .left-down-4 {
      left: 54px;
      top: 273px;
      transform: rotate(49deg);
    }
    .left-up-3 {
      left: 52px;
      top: -751px;
      transform: rotate(-52.25deg);
    }
    // 圆环第六组
    .right-up-5 {
      left: -12px;
      top: -154px;
      transform: rotate(60.25deg);
    }
    .right-down-2 {
      left: -8px;
      top: -332px;
      transform: rotate(-63.5deg);
    }
    .left-down-5 {
      left: 35px;
      top: 196px;
      transform: rotate(60.25deg);
    }
    .left-up-2 {
      left: 32px;
      top: -674px;
      transform: rotate(-63.5deg);
    }
    // 圆环第七组
    .right-up-6 {
      left: 4px;
      top: -167px;
      transform: rotate(71.5deg);
    }
    .right-down-1 {
      left: 6px;
      top: -317px;
      transform: rotate(-74.75deg);
    }
    .left-down-6 {
      left: 21px;
      top: 117px;
      transform: rotate(71.5deg);
    }
    .left-up-1 {
      left: 20px;
      top: -594px;
      transform: rotate(-74.75deg);
    }
    // 圆环第八组
    .right-up-7 {
      left: 12px;
      top: -181px;
      transform: rotate(82.75deg);
    }
    .right-down-0 {
      left: 12px;
      top: -304px;
      transform: rotate(-86deg);
    }
    .left-down-7 {
      left: 14px;
      top: 35px; // -143px;
      transform: rotate(82.75deg);
    }
    .left-up-0 {
      left: 13px;
      top: -513px;
      transform: rotate(-86deg);
    }
    .right-middle-0, .right-middle-1, .right-middle-2 {
      left: 12px;
      transform: rotate(90deg);
    }
    .right-middle-0 {
      top: -197px;
    }
    .right-middle-1 {
      top: -215px;
    }
    .right-middle-2 {
      top: -232px;
    }
    .right-middle-3, .right-middle-4, .right-middle-5 {
      left: 12px;
      transform: rotate(-90deg);
    }
    .right-middle-3 {
      top: -250px;
    }
    .right-middle-4 {
      top: -268px;
    }
    .right-middle-5 {
      top: -287px;
    }
    .left-middle-0, .left-middle-1, .left-middle-2 {
      left: 12px;
      transform: rotate(90deg);
    }
    .left-middle-0 {
      top: -46px;
    }
    .left-middle-1 {
      top: -125px;
    }
    .left-middle-2 {
      top: -204px;
    }
    .left-middle-3, .left-middle-4, .left-middle-5 {
      left: 12px;
      transform: rotate(-90deg);
    }
    .left-middle-3 {
      top: -282px;
    }
    .left-middle-4 {
      top: -359px;
    }
    .left-middle-5 {
      top: -436px;
    }
  }
  // 顶拍相机
  .camera-list {
    position: absolute;
    top: 0;
    // width: 100%;
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
      top: 215px;
      left: 2180px;
      width: 300px;
      // .left {
      //   transform: rotate(-26deg);
      // }
    }
    .camera-2 {
      position: relative;
      left: 63px;
      top: 236px;
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
