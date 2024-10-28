<!--
 * @Author: n915682 guoqing.li@archermind.com
 * @Date: 2023-06-05 10:22:26
 * @LastEditors: n915682 guoqing.li@archermind.com
 * @LastEditTime: 2023-06-29 17:38:39
 * @FilePath: \ide\src\layout\components\TagsView\index.vue
 * @Description: tab栏
 * 
 * Copyright (c) 2023 by ${git_name_email}, All Rights Reserved. 
-->
<template>
  <div class="tagsView">
    <a-tabs class="tagsView-editor" hide-add v-model:activeKey="activeKey" type="editable-card" @edit="onEdit"
      @change="onTabsChange" :tabBarGutter="0">
      <a-tab-pane v-for="pane in panes" :key="pane.key" :tab="pane.title" :closable="true">
        <MonacoEditor :editorVal="pane.content"
          :fileType="pane.title.slice(pane.title.lastIndexOf('.'), pane.title.length)" :lineNumber="pane.lineNumber"
          :searchVal="searchVal" @codeChange="codeChange" />
      </a-tab-pane>
    </a-tabs>
    <!-- 终端 -->
    <Terminal class="tagsView-terminal" v-if="isTerminal" />
  </div>
</template>
<script>
import { message } from 'ant-design-vue'
import { defineComponent, ref, watch, computed, onMounted } from 'vue'
import { useStore } from 'vuex'
// 组件
import MonacoEditor from '@/components/MonacoEditor'
import Terminal from '@/views/Terminal'
// electronApi
import { ipcRenderer } from 'electron'
export default defineComponent({
  components: {
    message,
    MonacoEditor,
    Terminal
  },
  setup() {
    onMounted(() => {
      // 打开单个文件
      ipcRenderer.on('file-opened', (event, fileContents) => {
        activeKey.value = fileContents[0].key
        panes.value = fileContents
      })
      // 在接收到主进程保存时发送一个另一个请求去保存文件;参数为文件路径和修改后的文件内容
      ipcRenderer.on('save-notification', (event) => {
        /* for (const item of store.state.tabPaneData) {
        if (item.key === activeKey.value) {
          console.log(item)
        }
      } */
        ipcRenderer.send(
          'save-file',
          store.state.fileContent.path,
          aceChangeEditorVal.value
        )
      })
      // 保存成功后主进程的通知
      ipcRenderer.on('save-file-reply', (event, mess) => {
        message.success(mess)
      })
      // 打开终端
      ipcRenderer.on('new-terminal', (event) => {
        isTerminal.value = !isTerminal.value
      })
    })
    // store
    const store = useStore()
    // 修改后的代码
    const aceChangeEditorVal = ref('')
    // 所有打开的文件tabs
    const panes = ref([])
    const activeKey = ref(null)
    // 是否显示终端
    const isTerminal = ref(false)
    // 终端tabs的key
    const terminalActiveKey = ref('2')
    const searchVal = computed(() => {
      return store.state.searchVal
    })
    // 监听Ace代码修改
    const codeChange = (data) => {
      aceChangeEditorVal.value = data
    }
    // 切换tab
    const onTabsChange = (key) => {
      store.dispatch('settingsNewTabKey', key)
    }
    // 关闭tab
    const onEdit = (targetKey) => {
      panes.value.forEach((pane, i) => {
        if (pane.key === targetKey) {
          if (panes.value[i - 1]) {
            activeKey.value = panes.value[i - 1].key
          } else if (panes.value[i + 1]) {
            activeKey.value = panes.value[i + 1].key
          }
          store.dispatch('settingsTabPaneData', i)
        }
      })
    }
    // 监听vuex state
    watch(
      () => store.state.fileContent,
      (value) => {
        activeKey.value = value.key
      }
    )
    watch(
      () => store.state.tabPaneData,
      (value) => {
        panes.value = value
        /* panes.value.forEach((item) => {
          if (item.key !== activeKey.value) {
            console.log('wu')
          }
        }) */
      },
      { deep: true }
    )

    return {
      panes,
      activeKey,
      aceChangeEditorVal,
      isTerminal,
      terminalActiveKey,
      searchVal,
      onEdit,
      onTabsChange,
      codeChange
    }
  }
})
</script>
<style lang="scss" scoped>
.tagsView {
  width: 100%;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  &-editor {
    // height: 800px;
  }
  &-terminal {
    width: 100%;
    height: 300px;
    /* position: absolute;
    bottom: 0;
    z-index: 99; */
  }
}
// 修改tabs未激活样式
::v-deep(
    .ant-tabs-card > .ant-tabs-nav .ant-tabs-tab,
    .ant-tabs-card > div > .ant-tabs-nav .ant-tabs-tab
  ) {
  background: #2d2d2d;
  color: #888888;
  border: none;
}

// 修改tabs激活样式
::v-deep(
    .ant-tabs-card > .ant-tabs-nav .ant-tabs-tab-active,
    .ant-tabs-card > div > .ant-tabs-nav .ant-tabs-tab-active
  ) {
  background: #1e1e1e;
  color: #fff;
}
// 其他
::v-deep(.ant-tabs-tab.ant-tabs-tab-active .ant-tabs-tab-btn) {
  color: #fff;
}

::v-deep(.ant-tabs > .ant-tabs-nav, .ant-tabs > div > .ant-tabs-nav) {
  margin: 0;
}
::v-deep(
    .ant-tabs-top > .ant-tabs-nav::before,
    .ant-tabs-bottom > .ant-tabs-nav::before,
    .ant-tabs-top > div > .ant-tabs-nav::before,
    .ant-tabs-bottom > div > .ant-tabs-nav::before
  ) {
  border: none;
}
::v-deep(.ant-tabs-tab-remove) {
  color: #fff;
}
::v-deep(.ant-tabs-tab-remove:hover) {
  background-color: #3b3c3c;
  border-radius: 6px;
}
::v-deep(.ant-tabs-nav-operations) {
  display: none !important;
}
</style>