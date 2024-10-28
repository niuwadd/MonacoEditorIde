<!--
 * @Author: n915682 guoqing.li@archermind.com
 * @Date: 2023-06-05 09:46:17
 * @LastEditors: n915682 guoqing.li@archermind.com
 * @LastEditTime: 2023-06-26 15:43:33
 * @FilePath: \ide\src\layout\components\Sidebar\resource.vue
 * @Description: 树结构目录
 * 
 * Copyright (c) 2023 by ${git_name_email}, All Rights Reserved. 
-->
<template>
  <div class="resource">
    <div class="resource-title">
      <span>资源管理器</span>
      <div class="flex">
        <span class="resource-toolsHover" @click="isShowSearch = !isShowSearch"><search-outlined class="f20" /></span>
      </div>
    </div>
    <div class="pl10 pr10" v-if="isShowSearch">
      <!-- <a-input v-model:value="searchValue" placeholder="Search" /> -->
      <n-input v-model:value="searchValue" style="margin-bottom: 8px" placeholder="Search" />
    </div>
    <n-tree class="resource-tree" v-if="treeData.length" block-line expand-on-click :data="treeData" :node-props="handleClickTree" :selected-keys="selectedKeys" :pattern="searchValue" virtual-scroll style="height: calc(100vh - 140px)" />
    <div class="resource-empty" v-else>
      <div class="mb15">尚未打开文件夹。</div>
      <a-button type="primary" @click="openDirectory">打开文件夹</a-button>
    </div>
    <!-- 右键弹窗 -->
    <n-dropdown placement="bottom-start" trigger="manual" :x="xDropdown" :y="yDropdown" :options="optionsDropdown" :show="showDropdown" @select="handleSelect" @clickoutside="handleClickoutside" />
  </div>
</template>
<script>
// 内置api
import { defineComponent, ref, watch, onMounted, reactive } from 'vue'
import { useStore } from 'vuex'
import { NIcon, NTree, NDropdown, NInput } from 'naive-ui'
import { message } from 'ant-design-vue'
import { SearchOutlined } from '@ant-design/icons-vue'
import fs from 'fs'
// 方法
import { readDir } from '@/utils'
// electronApi
import { ipcRenderer } from 'electron'
export default defineComponent({
  props: {
    treeData: {
      type: Array,
      default: () => []
    }
  },
  components: {
    NTree,
    NDropdown,
    NInput,
    SearchOutlined,
    message
  },
  setup(props, context) {
    onMounted(() => {
      // menuDrag()
      // 监听点击重命名之外的地方(判读修改文件名称)
      document.addEventListener('mousedown', (e) => globalEvent(e))
      document.addEventListener('keydown', (e) => globalEvent(e))
    })
    const store = useStore()
    // 选择打开目录的key
    const expandedKeys = ref([])
    // 选择节点的key
    const selectedKeys = ref([])
    const showDropdown = ref(false)
    const xDropdown = ref(0)
    const yDropdown = ref(0)
    // 搜索值
    const searchValue = ref(null)
    //
    const isShowSearch = ref(false)
    const optionsDropdown = [{ label: '重命名', key: 'rename' }]
    // 当前点击的文件数据
    let currentTreeData = reactive({})
    // 当前需要修改的节点
    let currentTreeDom = ref([])
    // 当前需要修改的input-Dom
    let currentInputDom = ref(null)
    // 点击文件
    const handleClickTree = ({ option }) => {
      return {
        onClick() {
          // 选中
          selectedKeys.value[0] = option.key
          if (!option.children && !option.disabled) {
            // 判断如果点击的是文件,就读取文件内容
            ipcRenderer.invoke('read-file', option.path).then((res) => {
              const data = {
                ...option,
                content: res
              }
              store.dispatch('settingsFileContent', data)
              store.dispatch('settingsTabPaneData', data)
            })
          } else {
            // 判断如果点击的是文件夹,就将文件夹内容添加到children里面
            // option.children = readDir(option.path)
          }
        },
        // 右键点击
        onContextmenu(e) {
          currentTreeData = option
          currentTreeDom.value = e.path
          e.path[3].style.border = '1px solid #007fd4'
          showDropdown.value = true
          xDropdown.value = e.clientX
          yDropdown.value = e.clientY
          e.preventDefault()
        }
      }
    }
    // 打开文件夹
    const openDirectory = () => {
      ipcRenderer.send('file-directory')
    }
    // 取消右键的选中高亮
    const cancelSelected = () => {
      const wrapper = document.querySelectorAll('.n-tree-node-wrapper')
      for (const item of wrapper) {
        item.style.border = 'none'
      }
      showDropdown.value = false
    }
    // 全局事件判断
    const globalEvent = (e) => {
      if (
        e.target.nodeName !== 'INPUT' &&
        e.key === 'Enter' &&
        currentInputDom.value
      ) {
        // 修改input样式
        if (currentInputDom.value) {
          currentTreeDom.value[0].style.display = 'block'
          currentInputDom.value.remove()
        }
        // 获取新的路径名称和以前的路径名称
        const newPath = currentTreeData.path.replace(/\\/g, '/')
        const oldPath =
          newPath.substring(0, newPath.lastIndexOf('/') + 1) +
          currentInputDom.value['value']
        if (newPath != oldPath) {
          fs.rename(newPath, oldPath, function (err) {
            if (!err) {
              context.emit(
                'rename',
                currentInputDom.value['value'],
                currentTreeData
              )
              message.success('重命名成功！')
            }
          })
        }
      }
    }
    // 菜单栏宽度修改
    const menuDrag = () => {
      const leftTreeContent = document.querySelector('.ant-tabs-content-holder')
      let contentWidth = leftTreeContent.clientWidth
      const arr = []
      for (let i = -20; i <= 5; i++) {
        arr.push(i)
      }
      // 鼠标移动
      let onMousemove = (e) => {
        leftTreeContent.style.borderRight = '1px solid rgb(0, 127, 212)'
        leftTreeContent.style.width = e.clientX - 50 + 'px'
        if (e.clientX - 50 <= 200) {
          console.log('hidden')
          // context.emit('hiddenMuen')
        }
      }
      // 鼠标抬起
      let onMouseup = (e) => {
        contentWidth = e.clientX - 50
        leftTreeContent.style.borderRight = 'none'
        // 删除事件
        document.removeEventListener('mousemove', onMousemove)
        document.removeEventListener('mouseup', onMouseup)
      }
      // 鼠标按下
      let onMousedown = () => {
        document.addEventListener('mousemove', onMousemove)
        document.addEventListener('mouseup', onMouseup)
      }
      // 在菜单中鼠标移入
      leftTreeContent.addEventListener('mousemove', (e) => {
        // 判断是否在菜单边上
        if (arr.includes(contentWidth + 50 - e.clientX)) {
          leftTreeContent.style.cursor = 'ew-resize'
          leftTreeContent.addEventListener('mousedown', onMousedown)
        } else {
          leftTreeContent.style.cursor = 'default'
          leftTreeContent.removeEventListener('mousedown', onMousedown)
        }
      })
    }
    // 监听
    watch(
      () => store.state.newTabKey,
      (value) => {
        selectedKeys.value[0] = value
      }
    )

    return {
      expandedKeys,
      selectedKeys,
      showDropdown,
      xDropdown,
      yDropdown,
      optionsDropdown,
      currentTreeDom,
      currentInputDom,
      searchValue,
      isShowSearch,
      handleClickTree,
      openDirectory,
      cancelSelected,
      handleSelect: (key) => {
        switch (key) {
          case 'rename':
            // 创建需要显示的input框和其样式
            currentInputDom.value = document.createElement('input')
            currentInputDom.value.style.border = '1px solid #007fd4'
            currentInputDom.value.style.backgroundColor = '#3c3c3c'
            currentInputDom.value.style.color = '#ffffff'
            // 为创建的input框添加value
            currentInputDom.value['value'] = currentTreeDom.value[0].textContent
            // 将tree上的节点隐藏
            currentTreeDom.value[0].style.display = 'none'
            // 将创建的input添加到节点上
            currentTreeDom.value[1].appendChild(currentInputDom.value)
            cancelSelected()
            break

          default:
            break
        }
      },
      handleClickoutside: () => {
        cancelSelected()
      },
      globalEvent,
      menuDrag
    }
  }
})
</script>
<style lang="scss" scoped>
.resource {
  &-title {
    padding: 10px 10px 0 10px;
    color: #ccc;
    font-size: 14px;
    display: flex;
    justify-content: space-between;
  }
  &-tree :deep(.anticon) {
    color: red;
  }
  &-empty {
    display: flex;
    flex-direction: column;
    color: #fff;
    padding: 10px 20px;
  }
  &-toolsHover {
    padding: 4px;
  }
  &-toolsHover:hover {
    background-color: #333333;
    border-radius: 10px;
  }
}

::v-deep(.n-tree .n-tree-node-content .n-tree-node-content__text) {
  color: #fff;
}
::v-deep(
    .n-tree.n-tree--block-line .n-tree-node:not(.n-tree-node--disabled):hover
  ) {
  background-color: #2a2d2e;
}

::v-deep(
    .n-tree.n-tree--block-line
      .n-tree-node:not(.n-tree-node--disabled).n-tree-node--selected
  ) {
  background-color: #37373d;
}

::v-deep(.n-input) {
  background-color: #3c3c3c;
}

::v-deep(.n-input .n-input__input-el) {
  color: #fff;
}

::v-deep(.n-input__border) {
  border: none;
}
::v-deep(.n-input:not(.n-input--disabled).n-input--focus) {
  background-color: #3c3c3c;
}
::v-deep(
    .n-input:not(.n-input--disabled).n-input--focus .n-input_state-border
  ) {
  background-color: red;
  border: 1px solid #007fd4;
}
::v-deep(.ant-tabs-tab-remove:active) {
  color: #37373d;
}
</style>