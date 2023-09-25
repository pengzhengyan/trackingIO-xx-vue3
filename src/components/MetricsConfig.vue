<script setup lang="ts">
  import { ref, computed, watch } from 'vue'
  import draggable from 'vuedraggable'

  const props = defineProps(['title', 'requestAsaData', 'metrics', 'textKey', 'checkedMetrics'])
  const $emits = defineEmits(['update:checkedMetrics'])

  /**
   * type
   */
  type menuItem = {
    index: string
    text: string
    iconName?: string
    value?: string
    children: submenuItem[]
    checkAll: boolean
    isIndeterminate?: boolean
    checkedList: string[]
  }
  type submenuItem = {
    text: string
    disabled: boolean
    checked: boolean
    key: string
  }

  type textKeyItem = {
    text: string
    key: string
  }

  const dialogVisible = ref(false)
  /** 提供主题颜色：tracking 紫 */
  const activeColor = ref('#6b7aff')
  /** 固定的checkbox内容 */
  const fixedItem = '转化总数'
  const fixedKey = 'actcount'

  watch(
    () => props.checkedMetrics,
    (val, preVal) => {
      if (val !== preVal) {
        initMetricsPage()
      }
    }
  )

  const initMetricsPage = () => {
    let list: menuItem[] = []

    props.metrics.forEach((item: any, index: number) => {
      const checkedList: string[] = []
      // 遍历children
      item.children.forEach((sub: submenuItem) => {
        // 检查子menu的key是否包含于 已经选指标 中
        const isActive = props.checkedMetrics.includes(sub.key)
        // 将检查结果，同步为子menu的checked状态
        sub.checked = isActive
        // 如果检查结果为指标 是 已选指标
        if (isActive) {
          // 将指标的key加入到checkedList中
          checkedList.push(sub.key)
          // 如果指标不在右边的指标条栏中，则将之加入
          if (!selectedItems.value.includes(sub.text)) selectedItems.value.push(sub.text)
        }
      })
      const checkAll: boolean = checkedList.length === item.children.length
      const obj: menuItem = {
        index: String(index + 1),
        text: item.lable,
        iconName: iconList[index],
        value: `leftMenu${index}`,
        checkAll,
        isIndeterminate: false,
        checkedList,
        children: item.children,
      }
      list.push(obj)
    })
    sidebarMenu.value = list
  }

  /** 头部搜索内容 */
  const searchContent = ref('')

  // 因为服务端未存放icon，所以准备iconList，在menu初始始化时调用
  const iconList: string[] = ['Grid', 'Switch', 'Coin', 'Guide', 'TrendCharts']
  /**
   * 指标的menu的内容
   * children放着实际指标内容
   */
  const sidebarMenu = ref<menuItem[]>([])

  /**
   * 根据搜索框的内容，计算实际menu显示情况
   * subMenuStatus存着子menu的显示与否
   * maniMenuStatus存着主menu的显示与否
   */
  const subMenuStatus = computed(() => {
    const listOut: any[] = []

    sidebarMenu.value.forEach((item: menuItem) => {
      const list: boolean[] = []
      item.children.forEach((subitem) => {
        const isShow = subitem.text.includes(searchContent.value.toUpperCase())
        list.push(isShow)
      })
      listOut.push(list)
    })

    return listOut
  })

  const mainMenuStatus = computed(() => {
    const list: boolean[] = []
    sidebarMenu.value.forEach((item, index) => {
      const isShow =
        item.text.includes(searchContent.value.toUpperCase()) ||
        subMenuStatus.value[index].includes(true)
      list.push(isShow)
    })
    return list
  })

  /**
   * 处理左边menu选中项的回调
   * 点击menu定位到目标锚点
   */
  const handleMenuSelect = (index: string) => {
    const found = sidebarMenu.value.find((item: menuItem) => item.index === index)?.value
    const target = document.getElementById(found!)
    // 最上面的div离顶部的距离是79，所以需要减掉
    document.getElementById('targetBox')!.scrollTop = target!.offsetTop - 79
  }

  /**
   * 处理菜单中间checkbox组的回调
   */

  // checkbox-group全选回调
  const handleCheckAllChange = (index: string, isCheckAll: boolean): void => {
    const foundIndex = sidebarMenu.value.findIndex((item) => item.index === index)
    // 全选状态发生变化的一组menu
    const onChangeMenu = sidebarMenu.value[foundIndex]
    // 如果全选，将checkedList内容设置为children中所有元素；
    // 否则checkedList为空
    onChangeMenu.checkedList = isCheckAll ? [...onChangeMenu.children.map((sub) => sub.key)] : []

    // 如果被全不选menu包含fixedItem，则需要将fixedItem重新加回到被全不选的menu的checkedList中
    if (
      onChangeMenu.checkedList.length === 0 &&
      onChangeMenu.children.some((sub) => sub.text === fixedItem)
    ) {
      onChangeMenu.checkedList.push(fixedKey)
    }

    // 将全选和全不选状态，同步到右边指标列表栏
    if (isCheckAll) {
      addItem(onChangeMenu.children.map((sub) => sub.text))
    } else {
      removeItem(onChangeMenu.children.map((sub) => sub.text))
    }
  }

  // checkedList变化时的回调
  const handleCheckedListChange = (index: string) => {
    const foundIndex = sidebarMenu.value.findIndex((item) => item.index === index)
    const onChangeMenu = sidebarMenu.value[foundIndex]
    const checkedCount = onChangeMenu.checkedList.length
    onChangeMenu.checkAll = checkedCount === onChangeMenu.children.length
    onChangeMenu.isIndeterminate = checkedCount > 0 && checkedCount < onChangeMenu.children.length
  }

  // Checkbox状态改变后，增加或者删除右边指标列表内容
  const handleCheckboxChange = (event: boolean, value: string) => {
    if (event) {
      addItem(value)
    } else {
      removeItem(value)
    }
  }

  /**
   * 处理右边所选指标
   * 1.指标内容根据中间check-box所选来定
   * 2.实现关闭按钮从列表中删除指标，并更新checkbox状态
   * 3.实现拖拽功能
   * 4.实现上下排列功能
   */
  // 右边指标栏内的元素。初始状态：被锁定的指标存放于列表中。
  const selectedItems = ref([fixedItem])

  // 清空指标栏（仅保留锁定指标）
  const cleanupSelected = () => {
    selectedItems.value = [fixedItem]
    sidebarMenu.value.forEach((item) => {
      const hasFixedItem = item.children.some((sub) => sub.text === fixedItem)
      item.checkedList = hasFixedItem ? [fixedItem] : []
      item.checkAll = false
      item.isIndeterminate = hasFixedItem ? true : false
    })
  }

  // 移除某个指标的回调
  const handleChooseitemClick = (i: string) => {
    removeItem(i)
    updateCheckboxStatus(i)
  }
  // 工具方法：用于右边指标栏某个指标被移除时，更新中间checkbox区状态
  const updateCheckboxStatus = (changedItem: string) => {
    const changedKey = props.textKey.find((ele: textKeyItem) => ele.text === changedItem).key
    sidebarMenu.value.some((item: menuItem) => {
      const bingo = item.checkedList.includes(changedKey)
      if (bingo) {
        arrayDelElement(item.checkedList, changedKey, fixedKey)
        item.checkAll = false
        item.isIndeterminate = item.checkedList.length === 0 ? false : true
      }
      return bingo
    })
  }

  // 工具方法：移除指标栏里的 一个 或 多个 指标，可通过点击checkbox、或点击指标条上的移除按钮生效
  const removeItem = (v: any) => {
    const type = typeof v
    if (type === 'string') {
      arrayDelElement(selectedItems.value, v, fixedItem)
    } else {
      v.forEach((i: string) => {
        arrayDelElement(selectedItems.value, i, fixedItem)
      })
    }
  }
  // 工具方法：向指标栏中添加 一个 或 多个 指标，仅通过checkbox点击生效
  const addItem = (v: any) => {
    const type = typeof v
    if (type === 'string') {
      if (!selectedItems.value.includes(v)) selectedItems.value.push(v)
    } else {
      v.forEach((i: string) => {
        if (!selectedItems.value.includes(i)) selectedItems.value.push(i)
      })
    }
  }
  // vuedragable库中所用的变量
  const drag = ref(false)
  // const dragOptions = computed(() => {
  //   return {
  //     animation: 200,
  //     group: "description",
  //     disabled: false,
  //     ghostClass: "ghost"
  //   }
  // })

  // 指标顺序排列：可通过点击指标栏中 指标条 左边的 箭头生效
  const resortSelectedItems = (isUp: boolean, item?: string) => {
    // 判断触发的指标是否在指标栏中
    const hasItem = selectedItems.value.includes(item!)
    if (!hasItem) return
    // 如果点击的是up箭头
    if (isUp) {
      const first = arrayDelElement(selectedItems.value, item!)
      selectedItems.value.unshift(first)

      // 如果点击的是down箭头
    } else if (selectedItems.value.length > 1) {
      const first = selectedItems.value.shift()
      selectedItems.value.splice(1, 0, first!)
    }
  }

  // 计算属性：指标栏第一个元素。用于给第一个指标条添加向下箭头
  const firstItem = computed(() => selectedItems.value[0])

  /**
   * dialog底部按钮回调
   */
  const handleSubmit = () => {
    const list = selectedItems.value.map(
      (item) => props.textKey.find((ele: textKeyItem) => ele.text === item).key
    )
    // 将checked指标,回传给父组件。
    $emits('update:checkedMetrics', list)
    props.requestAsaData()
    dialogVisible.value = false
  }
  /**
   * 工具方法: 删除数组中指定元素
   * 数组必须为字符串数组
   * 可选参数为锁定元素，锁定元素不会被删除
   */
  const arrayDelElement = (arr: string[], item: string, fixedItem?: string) => {
    let rst: string = ''
    // 元素是锁定元素，则直接返回
    if (item === fixedItem) return rst
    // 获取删除元素下标
    const index = arr.indexOf(item)
    if (index !== -1) rst = arr.splice(index, 1)[0]
    return rst
  }
</script>

<template>
  <!-- 选择指标按钮 -->
  <el-button
    type="primary"
    style="height: 40px; border-radius: 8px; box-shadow: 0 4px 16px #e5e5ed"
    @click="dialogVisible = true"
  >
    <el-icon>
      <Checked />
    </el-icon>
    {{ title }}
  </el-button>

  <!-- dialog 选择指标窗口 -->
  <div>
    <el-dialog
      v-model="dialogVisible"
      :show-close="false"
      style="margin-top: 8vh; width: 1000px"
    >
      <!-- 头部内容区 -->
      <template #header="{ close }">
        <div class="my-header">
          <div class="dialog-title">
            <span class="title-text">{{ title }}</span>
            <div class="searchbox">
              <el-input
                placeholder="输入指标关键词"
                v-model.trim="searchContent"
              ></el-input>
            </div>
            <el-button
              @click="close"
              class="el-dialog__headerbtn"
            >
              <el-icon class="el-icon--left">
                <CloseBold />
              </el-icon>
            </el-button>
          </div>
        </div>
      </template>

      <!-- 中间内容区 -->
      <div class="custom-target-content">
        <!-- 中间 左边 Menu区 -->
        <div class="custom-left">
          <el-menu
            default-active="1"
            :active-text-color="activeColor"
            class="el-menu-vertical-demo"
            @select="handleMenuSelect"
          >
            <el-menu-item
              v-for="(item, index) in sidebarMenu"
              v-show="mainMenuStatus[index]"
              :key="item.index"
              :index="item.index"
            >
              <div class="bg">
                <el-icon>
                  <component :is="item.iconName"></component>
                </el-icon>
                <span>{{ item.text }}</span>
              </div>
            </el-menu-item>
          </el-menu>
        </div>

        <!-- 中间 中间checkbox区 -->
        <div class="custom-centre">
          <div
            class="bese-target-box"
            id="targetBox"
          >
            <div
              class="bese-target-item"
              v-for="(item, index) in sidebarMenu"
              v-show="mainMenuStatus[index]"
              :key="item.index"
              :id="item.value"
            >
              <el-checkbox
                v-model="item.checkAll"
                :indeterminate="item.isIndeterminate"
                @change="handleCheckAllChange(item.index, $event)"
                class="bese-target-checkbox"
                :disabled="index > 2"
                >{{ item.text }}</el-checkbox
              >
              <el-checkbox-group
                v-model="item.checkedList"
                @change="handleCheckedListChange(item.index)"
                :text-color="activeColor"
              >
                <el-checkbox
                  v-for="(subItem, subIndex) in item.children"
                  v-show="subMenuStatus[index][subIndex]"
                  :key="subItem.key"
                  :label="subItem.key"
                  :disabled="subItem.disabled"
                  :checked="subItem.checked"
                  @change="handleCheckboxChange($event, subItem.text)"
                >
                  {{ subItem.text }}
                </el-checkbox>
              </el-checkbox-group>
            </div>
          </div>
        </div>

        <!-- 中间的右边所选指标区 -->
        <div class="custom-right">
          <div class="custom-title">
            <span class="custom-title-lf">已选指标</span>
            <span
              class="custom-title-rg"
              @click="cleanupSelected"
              >清空全部</span
            >
          </div>
          <div class="choose-box">
            <draggable
              v-model="selectedItems"
              @start="drag = true"
              @end="drag = false"
              item-key="order"
            >
              <template #item="{ element }">
                <div class="choose-item">
                  <span class="choose-item-lf">
                    <el-icon
                      v-if="element === firstItem"
                      @click="resortSelectedItems(false, element)"
                    >
                      <Bottom />
                    </el-icon>
                    <el-icon v-else>
                      <SortUp @click="resortSelectedItems(true, element)" />
                    </el-icon>
                    <span>{{ element }}</span>
                  </span>
                  <span class="choose-item-rg">
                    <el-icon v-if="element === fixedItem">
                      <Lock />
                    </el-icon>
                    <el-icon
                      v-else
                      @click="handleChooseitemClick(element)"
                    >
                      <Close />
                    </el-icon>
                  </span>
                </div>
              </template>
            </draggable>
          </div>
        </div>
      </div>

      <!-- dialog的尾部 -->
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button
            type="primary"
            @click="handleSubmit"
          >
            确认
          </el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<style scoped lang="less">
  .el-dialog {
    .el-dialog__header {
      .my-header {
        padding: 23px 0 0 32px;
        border-bottom: 1px solid #e6e6e6 !important;

        .dialog-title {
          padding-bottom: 15px;
          text-align: center;
          margin-right: 32px;
          overflow: hidden;

          .title-text {
            font-size: 16px;
            font-weight: 700;
            float: left;
            line-height: 40px;
          }

          .searchbox {
            width: 364px;
            display: inline-block;
            margin-left: -64px;
          }

          .el-dialog__headerbtn {
            background: #fff;
            -webkit-box-shadow: 0 8px 16px rgba(55, 66, 152, 0.2);
            box-shadow: 0 8px 16px rgba(55, 66, 152, 0.2);
            border-radius: 8px;
            width: 40px;
            height: 40px;
            top: -12px;
            right: -12px;
          }
        }
      }
    }

    .el-dialog__body {
      padding: 0px;

      .custom-target-content {
        height: 450px;
        background: #f6f6f6;
        overflow: hidden;

        .custom-left {
          width: 20%;
          float: left;
          // border-right: 1px solid #eee;
          min-height: 400px;
          background: #fff;

          .el-menu {
            height: 450px;
            // border-right: solid 1px var(--el-menu-border-color);
            list-style: none;
            position: relative;
            margin: 0;
            padding-left: 0;
            background-color: var(--el-menu-bg-color);
            box-sizing: border-box;

            .el-menu-item {
              font-size: 12px;
              line-height: 48px;
              padding: 0;

              &:hover {
                background: white;
              }

              .bg {
                width: 100%;
                height: 34px;
                line-height: 34px;
                width: 100%;
                padding-left: 32px;
              }

              &.is-active {
                .bg {
                  background-color: #f6f6f6;

                  &::after {
                    position: absolute;
                    content: '';
                    height: 30px;
                    right: 0;
                    width: 3px;
                    color: #6b7aff;
                    background: #6b7aff;
                  }
                }
              }
            }
          }
        }

        .custom-centre {
          width: 46%;
          float: left;
          background: #fff;
          // overflow-y: scroll;
          // height: 450px;

          .bese-target-box {
            border-right: 1px solid #eee;
            overflow-y: auto;
            height: 450px;
          }

          .bese-target-item {
            overflow: hidden;
            padding: 16px 24px;

            .bese-target-checkbox {
              border-bottom: 1px solid #eee;
              display: block;
              margin-bottom: 15px;
              font-weight: 900;
            }
          }
        }

        .custom-right {
          width: 32%;
          float: left;
          background: #f6f6f6;

          .custom-title {
            color: #333;
            margin: 15px 24px;
            display: flex;
            justify-content: space-between;

            .custom-title-rg {
              color: #6b7aff;
              cursor: pointer;
            }
          }

          .choose-box {
            padding: 15px 24px;
            height: 400px;
            overflow-y: auto;

            .choose-item {
              background: #fff;
              -webkit-box-shadow: 0 8px 16px 1px #e5e6ed;
              box-shadow: 0 8px 16px 1px #e5e6ed;
              border-radius: 8px 8px 8px 8px;
              border: 1px solid #fff;
              padding: 8px;
              margin-bottom: 8px;
              cursor: move;
              display: flex;
              justify-content: space-between;

              &:hover {
                border-color: #6b7aff;
              }

              i {
                display: inline-block;
                padding: 0px 25px 0px 3px;
                cursor: pointer;

                &:hover {
                  color: #6b7aff;
                }
              }
            }
          }
        }
      }
    }
  }

  :deep(.el-dialog) {
    border-radius: 8px;

    .el-dialog__header {
      padding: 0;
      width: 100%;
    }

    .el-dialog__body {
      padding: 0;
    }

    .el-dialog__footer {
      padding: 24px !important;
      border-top: 1px solid #e6e6e6;
    }
  }

  :deep(.el-checkbox) {
    --el-checkbox-checked-text-color: #2d2f4e;

    .el-checkbox__input {
      white-space: nowrap;
      cursor: pointer;
      outline: none;
      display: inline-block;
      line-height: 1;
      position: relative;
      vertical-align: middle;
    }

    .el-checkbox__label {
      font-size: 12px;
      color: #2d2f4e;
      line-height: 16px;
      margin-bottom: 15px;
    }
  }

  :deep(.el-checkbox-group) {
    width: 100%;

    .el-checkbox {
      width: 50%;
      margin: 0;
      color: #606266;
      font-weight: 500;
      font-size: 12px;
      position: relative;
      cursor: pointer;
      display: inline-block;
    }
  }
</style>
