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
                :title="car.title">
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
              <i class="icon"></i>
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

export default {
  name: 'Dashboard',
  data() {
    // 下货口列表
    const uploadList = Array.from({ length: 4 }, (v, i) => (
      Array.from({ length: 8 }, (s, j) => ({
        id: (i * 8 + j + 1),
        status: (j % 3 + 1)
      }))
    ))

    // 小车列表
    let index = 1
    const cartList = Array.from({ length: 4 }, (v, i) => {
      // 横向 26个 竖向 11个
      // 横向
      const len = i % 2 === 0 ? 26 : 11

      return Array.from({ length: len }, (s, j) => {
        const car = {
          index,
          id: index,
          status: (j % 3 + 1),
          exitPort: index,
          exitPortDirection: j % 2,
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

    console.log('cartList')
    console.log(cartList)

    return {
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
  }
}

</script>

<style lang="scss" scoped>
$turntable-width: 1100px;    // 1809 * 537
$turntable-height: 326px;
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
  border: 1px solid greenyellow;
  width: $turntable-width;
  height: 500px;
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
    background: url('../../assets/turntable.png') no-repeat;
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
    color: #333;
  }
  .upload-group {
    height: 0;
    .group-item {
      position: relative;
      height: 35px;
      &.group-1 {
        left: $turntable-height/2 + 2;
        top: -36px;
      }
      &.group-2 {
        left: $turntable-height/2 + 2;
        top: 24px;
      }
      &.group-3 {
        top: 160px;
        left: $turntable-width/2 + 80;
      }
      &.group-4 {
        top: 222px;
        left: $turntable-width/2 + 80;
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
    .status-3 {
      background-color: #ef8886;
    }
    .status-4 {
      background-color: #e6b843;
    }
  }
  .cart-group {
    font-size: 0;
    .group-item {
      position: relative;
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
      left: $turntable-width - $turn-width;
      top: 0;
      width: $turn-width;
    }
    .group-3 {
      left: $turntable-height/2;
      top: 217px;
      .cart-list {
        display: flex;
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
    .item-27, .item-37 {
      left: -100px;
    }
    .item-27 {
      top: 3px;
      transform: rotate(15deg);
    }
    .item-37 {
      top: -245px;
      transform: rotate(-15deg);
    }
    .item-64, .item-74 {
      left: 126px;
    }
    .item-64 {
      top: 265px;
      transform: rotate(15deg);
    }
    .item-74 {
      top: -507px;
      transform: rotate(-15deg);
    }
    // 圆环第二组
    .item-28, .item-36 {
      left: -66px;
    }
    .item-28 {
      top: -36px;
      transform: rotate(30deg);
    }
    .item-36 {
      top: -206px;
      transform: rotate(-30deg);
    }
    .item-65, .item-73 {
      left: 91px;
    }
    .item-65 {
      top: 203px;
      transform: rotate(30deg);
    }
    .item-73 {
      top: -444px;
      transform: rotate(-30deg);
    }
    // 圆环第三组
    .item-29, .item-35 {
      left: -37px;
    }
    .item-29 {
      top: -67px;
      transform: rotate(45deg);
    }
    .item-35 {
      top: -175px;
      transform: rotate(-45deg);
    }
    .item-66, .item-72 {
      left: 61px;
    }
    .item-66 {
      top: 131px;
      transform: rotate(45deg);
    }
    .item-72 {
      top: -373px;
      transform: rotate(-45deg);
    }
    // 圆环第四组
    .item-30, .item-34 {
      left: -14px;
    }
    .item-30 {
      top: -91px;
      transform: rotate(60deg);
    }
    .item-34 {
      top: -152px;
      transform: rotate(-60deg);
    }
    .item-67, .item-71 {
      left: 38px;
    }
    .item-67 {
      top: 53px;
      transform: rotate(60deg);
    }
    .item-71 {
      top: -295px;
      transform: rotate(-60deg);
    }
    // 圆环第五组
    .item-31, .item-33 {
      left: 1px; // -46px;
    }
    .item-31 {
      top: -108px;
      transform: rotate(75deg);
    }
    .item-33 {
      top: -136px;
      transform: rotate(-75deg);
    }
    .item-68, .item-70 {
      left: 22px;
    }
    .item-68 {
      top: -34px;
      transform: rotate(75deg);
    }
    .item-70 {
      top: -211px;
      transform: rotate(-75deg);
    }
    // 圆环横向
    .item-32 {
      left: 7px;
      top: -122px;
      transform: rotate(90deg);
    }
    .item-69 {
      left: 17px;
      top: -122px;
      transform: rotate(-90deg);
    }
    // 下方直线轨道，左右位置对调
    .item-38 {
      left: $cart-width * 30;
    }
    .item-63 {
      left: - $cart-width * 30;
    }
    .item-39 {
      left: $cart-width * 28 - 5 * 2;
    }
    .item-62 {
      left: - $cart-width * 28 + 5 * 2;
    }
    .item-40 {
      left: $cart-width * 26 - 5 * 4;
    }
    .item-61 {
      left: - $cart-width * 26 + 5 * 4;
    }
    .item-41 {
      left: $cart-width * 24 - 5 * 6;
    }
    .item-60 {
      left: - $cart-width * 24 + 5 * 6;
    }
    .item-42 {
      left: $cart-width * 22 - 5 * 8;
    }
    .item-59 {
      left: - $cart-width * 22 + 5 * 8;
    }
    .item-43 {
      left: $cart-width * 20 - 5 * 10;
    }
    .item-58 {
      left: - $cart-width * 20 + 5 * 10;
    }
    .item-44 {
      left: $cart-width * 18 - 5 * 12;
    }
    .item-57 {
      left: - $cart-width * 18 + 5 * 12;
    }
    .item-45 {
      left: $cart-width * 16 - 5 * 14;
    }
    .item-56 {
      left: - $cart-width * 16 + 5 * 14;
    }
    .item-46 {
      left: $cart-width * 14 - 5 * 16;
    }
    .item-55 {
      left: - $cart-width * 14 + 5 * 16;
    }
    .item-47 {
      left: $cart-width * 12 - 5 * 18;
    }
    .item-54 {
      left: - $cart-width * 12 + 5 * 18;
    }
    .item-48 {
      left: $cart-width * 10 - 5 * 20;
    }
    .item-53 {
      left: - $cart-width * 10 + 5 * 20;
    }
    .item-49 {
      left: $cart-width * 8 - 5 * 22;
    }
    .item-52 {
      left: - $cart-width * 8 + 5 * 22;
    }
    .item-50 {
      left: $cart-width * 6 - 5 * 24;
    }
    .item-51 {
      left: - $cart-width * 6 + 5 * 24;
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
      left: 1082px;
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
}
</style>
