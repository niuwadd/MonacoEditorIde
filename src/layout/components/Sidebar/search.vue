<!--
 * @Author: n915682 guoqing.li@archermind.com
 * @Date: 2023-06-05 09:46:29
 * @LastEditors: n915682 guoqing.li@archermind.com
 * @LastEditTime: 2023-06-27 14:27:57
 * @FilePath: \ide\src\layout\components\Sidebar\search.vue
 * @Description: 
 * 
 * Copyright (c) 2023 by ${git_name_email}, All Rights Reserved. 
-->
<template>
  <div class="search">
    <div class="search-title">搜索</div>
    <div class="search-main">
      <input class="search-input" v-model="searchVal" placeholder="search" type="text" @change="onInput">
      <div class="search-results">
        <p v-if="searchResults.length">在{{ searchResults.length }}个文件中出现</p>
        <p v-else-if="store.state.terminalPath.length && !searchResults.length"></p>
        <p v-else>尚未打开或指定文件夹。当前仅搜索打开的文件 - <span @click="openDirectory">打开文件夹</span></p>
        <n-tree v-if="searchResults.length" block-line expand-on-click :data="searchResults"
          :node-props="handleClickTree" :selected-keys="selectedKeys" virtual-scroll
          style="height: calc(100vh - 180px)" />
      </div>
    </div>
  </div>
</template>

<script>
// 内置api
import { ref } from 'vue'
import { useStore } from 'vuex'
import { ipcRenderer } from 'electron'
import { NTree } from 'naive-ui'
// 方法
import { readDir } from '@/utils'
import fs from 'fs'
export default {
  components: {
    NTree
  },
  setup() {
    const store = useStore()
    // 搜索框值
    const searchVal = ref('')
    // 搜索结果
    const searchResults = ref([])
    // 选择节点的key
    const selectedKeys = ref([])
    // 输入查询值
    const onInput = async () => {
      if (!searchVal.value) {
        searchResults.value = []
      } else {
        store.dispatch('settingsSearchVal', searchVal.value)
        for (const item of store.state.terminalPath) {
          const files = await traverseFiles(item)
          searchResults.value = searchFiles(files, searchVal.value)
        }
      }
    }
    // 打开文件夹
    const openDirectory = () => {
      ipcRenderer.send('file-directory')
    }
    // 点击文件
    const handleClickTree = ({ option }) => {
      return {
        onClick() {
          // 选中
          selectedKeys.value[0] = option.key
          if (!option.children && !option.disabled) {
            store.dispatch('settingsFileContent', option)
            store.dispatch('settingsTabPaneData', option)
          } else {
            const { title, content, path } = option
            option.children = []
            option.lineNumbers.forEach((v, index) => {
              option.children.push({
                key: path,
                title,
                content,
                path,
                lineNumber: v,
                label: getCodeSnippet(option.path, v)
              })
            })
          }
        }
      }
    }
    // 异步解析文件(获取文件路径、文件内容等信息)
    const traverseFiles = async (directory) => {
      const files = []
      const traverse = async (dir) => {
        const entries = await fs.promises.readdir(dir, { withFileTypes: true })
        for (const entry of entries) {
          const fullPath = `${dir}\\${entry.name}`
          if (entry.isDirectory()) {
            await traverse(fullPath)
          } else {
            const content = await fs.promises.readFile(fullPath, 'utf8')
            files.push({
              path: fullPath,
              key: fullPath,
              label: entry.name,
              title: entry.name,
              content
            })
          }
        }
      }
      await traverse(directory)
      return files
    }
    // 匹配输入
    const searchFiles = (files, keyword) => {
      const results = []
      files.forEach((file, index) => {
        const lines = file.content.split('\n')
        const lineNumbers = []
        for (let i = 0; i < lines.length; i++) {
          const regex = new RegExp(keyword, 'g')
          if (regex.test(lines[i])) {
            lineNumbers.push(i + 1)
          }
        }
        if (lineNumbers.length > 0) {
          const { path, label, content } = file
          results.push({
            path,
            key: index,
            label,
            title: label,
            content,
            lineNumbers,
            children: []
          })
        }
      })

      return results
    }
    // 获取文件内容显示使用
    const getCodeSnippet = (path, lineNumber) => {
      const content = fs.readFileSync(path, 'utf8')
      const lines = content.split('\n')
      return lines[lineNumber - 1]
    }

    return {
      onInput,
      traverseFiles,
      searchFiles,
      openDirectory,
      getCodeSnippet,
      handleClickTree,
      searchVal,
      searchResults,
      selectedKeys,
      store
    }
  }
}
</script>

<style lang="scss" scoped>
.search {
  &-title {
    padding: 10px;
    color: #ccc;
    font-size: 14px;
  }
  &-main {
    padding: 2px 10px;
  }
  &-input {
    width: 100%;
    height: 30px;
    color: #cccccc;
    border: 1px solid #3c3c3c;
    background-color: #3c3c3c;
    text-indent: 4px;
    border-radius: 2px;
  }
  &-input:focus {
    outline: 0;
    border: 1px solid #007fd4;
  }
  &-results {
    p {
      margin: 10px 0;
      color: #929292;
    }
    ul {
      margin: 0;
      padding: 0;
      height: calc(100vh - 180px);
      overflow: auto;
    }
    ul::-webkit-scrollbar-thumb {
      background-color: #4f4f4f;
      border-radius: 0;
    }
    ul::-webkit-scrollbar-track {
      background-color: #1e1e1e;
    }
    li {
      margin: 0;
      color: #ccccc2;
      cursor: pointer;
    }
    li:hover {
      background-color: #2a2d2e;
    }
    span {
      color: #007fd4;
      cursor: pointer;
    }
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

/* ::-webkit-scrollbar {
} */
</style>