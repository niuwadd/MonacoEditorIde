<!--
 * @Author: n915682 guoqing.li@archermind.com
 * @Date: 2023-06-05 15:21:50
 * @LastEditors: n915682 guoqing.li@archermind.com
 * @LastEditTime: 2023-06-16 14:51:46
 * @FilePath: \ide\src\views\TopMenu\index.vue
 * @Description: 
 * 
 * Copyright (c) 2023 by ${git_name_email}, All Rights Reserved. 
-->
<template>
  <div class="topMenu">
    <div class="topMenu-left flexAic">
      <!-- icon -->
      <div class="topMenu-icon">
        <CodepenOutlined />
      </div>
      <!-- 菜单分类 -->
      <div class="topMenu-category">
        <a-dropdown :trigger="['click']" v-for="(item, index) of menuDropdown" :key="index">
          <span class="category-hover">{{ item.title }}</span>
          <template #overlay>
            <a-menu>
              <a-menu-item v-for="(v, i) of item.menuItem" :key="i">
                <span @click="v.click">{{ v.title }}</span>
              </a-menu-item>
            </a-menu>
          </template>
        </a-dropdown>
      </div>
    </div>
    <div class="topMenu-right">
      <!-- 控制按钮 -->
      <div class="topMenu-control">
        <div @click="changeWindow('minimize')">
          <LineOutlined />
        </div>
        <div @click="changeWindow('maximize')">
          <BorderOutlined />
        </div>
        <div @click="changeWindow('close')">
          <CloseOutlined />
        </div>
      </div>
    </div>

  </div>
</template>
<script>
import { ipcRenderer } from 'electron'
import { defineComponent, ref } from 'vue'
import { useStore } from 'vuex'
// icon
import {
  CodepenOutlined,
  LineOutlined,
  BorderOutlined,
  CloseOutlined
} from '@ant-design/icons-vue'
// 方法
export default defineComponent({
  components: {
    CodepenOutlined,
    LineOutlined,
    BorderOutlined,
    CloseOutlined
  },
  setup() {
    const changeWindow = (val) => {
      switch (val) {
        case 'minimize':
          ipcRenderer.send('minimize-window')
          break
        case 'maximize':
          ipcRenderer.send('maximize-window')
          break
        case 'close':
          ipcRenderer.send('close-window')
          break
      }
    }
    const menuDropdown = ref([
      {
        title: '文件',
        menuItem: [
          {
            title: '打开文件',
            click: () => ipcRenderer.send('file-dialog')
          },
          {
            title: '打开文件夹',
            click: () => ipcRenderer.send('file-directory')
          },
          {
            title: '保存',
            // click: openFile('directory')
            click: () => ipcRenderer.send('file-save')
          }
        ]
      },
      {
        title: '终端',
        menuItem: [
          {
            title: '新建终端',
            click: () => ipcRenderer.send('built-terminal')
          }
        ]
      }
    ])
    return {
      menuDropdown,
      changeWindow
    }
  }
})
</script>

<style lang="scss" scoped>
.topMenu {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 40px;
  &-icon {
    color: #fff;
    font-size: 24px;
    margin-left: 16px;
    color: #3eaaf2;
    /* position: absolute;
    left: 10px; */
  }
  &-category {
    color: #fff;
    font-size: 16px;
    margin-left: 12px;
    .category-hover {
      cursor: default;
      padding: 5px 10px;
    }
    .category-hover:hover {
      background-color: #454646;
      border-radius: 5px;
    }
  }
  &-control {
    display: flex;
    color: #fff;
    height: 100%;
    div {
      width: 40px;
      height: 40px;
      display: flex;
      justify-content: center;
      align-items: center;
    }
    div:hover {
      background-color: #565656;
    }
    div:last-child:hover {
      background-color: #e81123;
    }
  }
}
::v-deep(.ant-dropdown-menu) {
  background-color: red;
}
</style>