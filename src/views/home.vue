<!--
 * @Author: n915682 guoqing.li@archermind.com
 * @Date: 2023-06-05 15:56:02
 * @LastEditors: n915682 guoqing.li@archermind.com
 * @LastEditTime: 2023-07-06 18:21:31
 * @FilePath: \ide\src\views\home.vue
 * @Description: 
 * 
 * Copyright (c) 2023 by ${git_name_email}, All Rights Reserved. 
-->

<template>
  <div class="home">
    <!-- 头部菜单 -->
    <div class="home-top" ref="homeTop">
      <TopMenu />
    </div>
    <!-- layout（侧边栏和选项卡） -->
    <div class="home-layout">
      <layout />
    </div>
  </div>
</template>

<script>
import { ipcRenderer } from 'electron'
import { onMounted, ref } from 'vue'
import * as monaco from 'monaco-editor'
import { keyword } from '@/components/MonacoEditor/config'
// 组件
import layout from '@/layout'
import TopMenu from './TopMenu'
export default {
  components: {
    layout,
    TopMenu
  },
  setup() {
    onMounted(() => {
      makeDraggable('.home-top')
      initMonaco()
    })

    const makeDraggable = (el) => {
      if (typeof el === 'string') {
        el = document.querySelector(el)
      }
      makeDraggableFallback(el)
    }

    const makeDraggableFallback = (el) => {
      el.addEventListener('mousedown', (e) => {
        ipcRenderer.send('window-move-open', true)
      })
      window.addEventListener('mouseup', () => {
        ipcRenderer.send('window-move-open', false)
      })
    }
    // monaco的全局配置
    const initMonaco = () => {
      // 定义要注册的语言的扩展点对象
      const language = {
        id: 'robotframework',
        extensions: ['.robot'],
        aliases: ['robot'],
        mimetypes: ['text/mylang'],
        loader: () => Promise.resolve({})
      }
      // 注册新语言
      monaco.languages.register(language)
      // 给.robot文件添加自定义关键字提示
      monaco.languages.registerCompletionItemProvider('robotframework', {
        provideCompletionItems: function (model, position, item, token) {
          console.log(model, position, item, token);
          const textUntilPosition = model.getValueInRange({
            startLineNumber: position.lineNumber,
            startColumn: 1,
            endLineNumber: position.lineNumber,
            endColumn: position.column
          })
          for (const key in keyword) {
            if (textUntilPosition.includes(key)) {
              const suggestions = keyword[key].map((v) => {
                return {
                  label: v.label,
                  kind: monaco.languages.CompletionItemKind.Keyword,
                  insertText: v.label,
                  documentation: ''
                }
              })
              return {
                suggestions,
                incomplete: true
              }
            }
          }
        }
      })
      monaco.languages.setMonarchTokensProvider('robotframework', {
        tokenizer: {
          root: [
            [/^\*\*\*.*$/gm, 'keyword'],
            [/^\s+[^\s].*$/gm, 'string']
          ]
        }
      })
    }
    return {
      makeDraggable,
      makeDraggableFallback,
      initMonaco
    }
  }
}
</script>

<style lang="scss" scoped>
.home {
  height: 100%;
  display: flex;
  flex-direction: column;
  &-top {
  }
  &-layout {
    // flex: 1;
    height: 100%;
  }
}
</style>