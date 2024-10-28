<!--
 * @Author: n915682 guoqing.li@archermind.com
 * @Date: 2023-06-15 10:53:46
 * @LastEditors: n915682 guoqing.li@archermind.com
 * @LastEditTime: 2023-07-06 09:45:26
 * @FilePath: \ide\src\components\MonacoEditor\index.vue
 * @Description: 
 * 
 * Copyright (c) 2023 by ${git_name_email}, All Rights Reserved. 
-->
<template>
  <div class="monaco-editor" ref="monacoRef">
  </div>
</template>

<script>
import { ref, onMounted, toRaw, reactive } from 'vue'
import * as monaco from 'monaco-editor'
import { keyword } from './config'
export default {
  props: {
    // 编辑器显示的内容
    editorVal: {
      type: String,
      default: ''
    },
    // 当前打开文件的后缀 (目前只匹配了java, python, javascript等基础类型, 格外类型需要注册)
    fileType: {
      type: String,
      default: ''
    },
    // 跳转的代码行数(如果通过搜索功能会接收这个值)
    lineNumber: {
      type: Number,
      default: 0
    },
    // 全局搜索的值
    searchVal: {
      type: String,
      default: ''
    }
  },
  setup(props, context) {
    onMounted(() => {
      initMonaco()
    })
    const monacoRef = ref(null)
    const initMonaco = () => {
      // 获取所有已注册的语言ID的数组
      const languages = monaco.languages.getLanguages()
      let languagesId = ''
      for (const item of languages) {
        if (item.extensions?.includes(props.fileType)) {
          languagesId = item.id
        }
      }
      const monacoEditor = monaco.editor.create(monacoRef.value, {
        value: props.editorVal,
        language: languagesId, // 编辑器类型支持
        minimap: { enabled: true }, // 小地图
        automaticLayout: true, // 自动布局,
        codeLens: true,
        colorDecorators: true,
        contextmenu: false,
        readOnly: false, //是否只读
        formatOnPaste: true,
        overviewRulerBorder: false, // 滚动条的边框
        scrollBeyondLastLine: true,
        theme: 'vs-dark', // 主题
        fontSize: 16 // 字体
      })
      // 编辑器内容改变时触发
      monacoEditor.onDidChangeModelContent((e) => {
        context.emit('codeChange', monacoEditor.getValue())
      })
      // 编辑跳转到指定行数
      monacoEditor.revealLineInCenter(props.lineNumber)

      updateDecorations(monacoEditor)
    }
    const updateDecorations = (monacoEditor) => {
      const searchKeyword = props.searchVal
      if (!searchKeyword) return
      const lines = props.editorVal.split('\n')
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i]
        const regex = new RegExp(searchKeyword, 'g')
        let match
        while ((match = regex.exec(line))) {
          monacoEditor.deltaDecorations(
            [],
            [
              {
                range: {
                  startLineNumber: i + 1,
                  startColumn: line.indexOf(searchKeyword) + 1,
                  endLineNumber: i + 1,
                  endColumn:
                    searchKeyword.length + line.indexOf(searchKeyword) + 1
                },
                options: {
                  isWholeLine: true,
                  className: 'my-decoration'
                }
              }
            ]
          )
          monacoEditor.setSelection({
            startLineNumber: i + 1,
            startColumn: line.indexOf(searchKeyword) + 1,
            endLineNumber: i + 1,
            endColumn: searchKeyword.length + line.indexOf(searchKeyword) + 1
          })
        }
      }
    }
    return {
      monacoRef,
      initMonaco,
      updateDecorations
    }
  }
}
</script>

<style lang="scss" scoped>
.monaco-editor {
  width: 100%;
  height: calc(100vh - 80px);
}
.my-decoration {
  background-color: red !important;
}
</style>