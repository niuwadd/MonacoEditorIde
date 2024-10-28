<!--
 * @Author: n915682 guoqing.li@archermind.com
 * @Date: 2023-06-02 17:19:57
 * @LastEditors: n915682 guoqing.li@archermind.com
 * @LastEditTime: 2023-07-06 18:30:19
 * @FilePath: \ide\src\layout\components\Sidebar\index.vue
 * @Description: 
 * 
 * Copyright (c) 2023 by ${git_name_email}, All Rights Reserved. 
-->
<template>
  <div class="sidebar">
    <!-- 侧边栏 -->
    <a-tabs v-model:activeKey="activeKey" tab-position="left" class="sidebar-main" @tabClick="tabClick" animated>
      <!-- 资源管理器 -->
      <a-tab-pane key="1">
        <template #tab>
          <!-- hover提示 -->
          <a-tooltip placement="right">
            <template #title>
              <span>资源管理器</span>
            </template>
            <FormOutlined class="f28 sidebar-icon" />
          </a-tooltip>
        </template>
        <div class="sidebar-tab">
          <Resource v-if="activeKey" :treeData="treeData" @rename="onRename" @hiddenMuen='onHiddenMuen' class="sidebar-resource" />
        </div>
      </a-tab-pane>
      <!-- 搜索 -->
      <!-- <a-tab-pane key="2">
        <template #tab>
          <a-tooltip placement="right">
            <template #title>
              <span>搜索</span>
            </template>
            <SearchOutlined class="f28 sidebar-icon" />
          </a-tooltip>
        </template>
        <div class="sidebar-tab">
          <Search class="sidebar-resource" />
        </div>
      </a-tab-pane> -->
    </a-tabs>
  </div>
</template>
<script>
// 内置API
import { defineComponent, ref, watch, onMounted, h, nextTick } from 'vue'
import { useStore } from 'vuex'
import {
  SearchOutlined,
  FormOutlined,
  BugOutlined,
  CloseOutlined
} from '@ant-design/icons-vue'
import { NIcon } from 'naive-ui'
import { ipcRenderer } from 'electron'
// 组件
import Resource from './resource'
import Search from './search'
// 方法
import { sendDirectoryArr, readFile } from '@/utils'
export default defineComponent({
  components: {
    FormOutlined,
    SearchOutlined,
    BugOutlined,
    CloseOutlined,
    Resource,
    Search
  },

  setup() {
    const store = useStore()
    // 激活tab的key
    const activeKey = ref(null)
    const treeData = ref([])
    onMounted(() => {
      // 监听主进程打开文件夹指令
      ipcRenderer.on('directory-opened', async (event, filePaths) => {
        const fileContent = await sendDirectoryArr(filePaths)
        fileContent.forEach((item) => {
          item.suffix = () =>
            h(
              NIcon,
              {
                onClick: (e) => {
                  const i = treeData.value.findIndex((v) => v.key === item.key)
                  treeData.value.splice(i, 1)
                  e.stopPropagation()
                }
              },
              {
                default: () => h(CloseOutlined)
              }
            )
          treeData.value.push(item)
        })
        activeKey.value = '1'
      })
    })
    const tabClick = (val) => {
      /* nextTick(() => {
        menuDrag()
      }) */
      if (val === activeKey.value) {
        activeKey.value = null
      }
    }
    const updateTreeData = (data, val, treeVal) => {
      data.forEach((item) => {
        if (item.key === treeVal.key) {
          const oldStr = item.path.slice(
            item.path.lastIndexOf('\\') + 1,
            item.path.length
          )
          item.path = item.path.replace(oldStr, val)
          item.key = item.path.replace(oldStr, val)
          item.label = val
          item.title = val
        }
        if (item.children) {
          updateTreeData(item.children, val, treeVal)
        }
      })
    }
    const onRename = (val, treeVal) => {
      updateTreeData(treeData.value, val, treeVal)
    }
    // 树结构关闭时
    const onHiddenMuen = () => {
      activeKey.value = null
    }
    // 菜单栏宽度修改
    const menuDrag = () => {
      const leftTreeContent = document.querySelector('.sidebar-tab')
      if (!leftTreeContent) return
      console.log(leftTreeContent);
      let contentWidth = leftTreeContent.clientWidth
      const arr = []
      for (let i = -20; i <= 5; i++) {
        arr.push(i)
      }
      // 鼠标移动
      let onMousemove = (e) => {
        console.log(123);
        leftTreeContent.style.borderRight = '1px solid rgb(0, 127, 212)'
        leftTreeContent.style.width = e.clientX - 50 + 'px'
        if (e.clientX - 50 <= 200) {
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
    watch(
      () => treeData.value,
      (value) => {
        // 终端路径
        const terminalPath = value.map((v) => {
          return v.path
        })
        store.dispatch('settingsTerminalPath', terminalPath)
      },
      { deep: true }
    )
    return {
      activeKey,
      treeData,
      tabClick,
      onRename,
      onHiddenMuen,
      menuDrag
    }
  }
})
</script>

<style lang="scss" scoped>
.sidebar {
  &-main {
    height: 100%;
    // width: 60px;
  }
  &-resource {
    height: 100%;
    width: 100%;
  }
  &-tab {
    width: 300px;
    height: 100%;
    background-color: #252526;
  }

  &-icon:hover {
    color: #fff;
  }
}

// 修改tabs未活样式的文字
::v-deep(.ant-tabs-tab) {
  color: #858585;
}

// 修改tabs激活样式的线
::v-deep(.ant-tabs-ink-bar) {
  background-color: #ffffff;
  width: 2px !important;
  left: 0;
}

// 修改tabs激活样式的文字
::v-deep(.ant-tabs-tab.ant-tabs-tab-active .ant-tabs-tab-btn) {
  color: #ffffff;
}
//
::v-deep(.ant-tabs-nav-list) {
  width: 60px;
}
::v-deep(.ant-tabs-tab) {
  padding: 16px 16px !important;
  margin: 0 !important;
}
// 修改tabs内容部分
::v-deep(.ant-tabs-content-holder) {
  border-left: none;
}

::v-deep(.ant-tabs-content) {
  height: 100%;
}
::v-deep(.ant-tabs-tabpane) {
  padding-left: 0px !important;
}
</style>