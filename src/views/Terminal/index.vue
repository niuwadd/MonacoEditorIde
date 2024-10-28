<!--
 * @Author: n915682 guoqing.li@archermind.com
 * @Date: 2023-06-13 14:06:41
 * @LastEditors: n915682 guoqing.li@archermind.com
 * @LastEditTime: 2023-06-15 17:57:18
 * @FilePath: \fusion-frontendd:\code\ide\src\views\Terminal\index.vue
 * @Description: 
 * 
 * Copyright (c) 2023 by ${git_name_email}, All Rights Reserved. 
-->
<template>
  <a-tabs class="terminal" style="border-top: 1px solid #414141;" v-model:activeKey="terminalActiveKey">
    <a-tab-pane key="1" tab="输出">
      <div id="terminal"></div>
    </a-tab-pane>
    <a-tab-pane key="2" tab="终端">
      <div id="terminal"></div>
    </a-tab-pane>
  </a-tabs>
</template>

<script>
import { onMounted, ref } from 'vue'
import { useStore } from 'vuex'
import 'xterm/css/xterm.css'
import { Terminal } from 'xterm'
import { FitAddon } from 'xterm-addon-fit'
import { AttachAddon } from 'xterm-addon-attach'
export default {
  name: 'WebShell',
  setup() {
    onMounted(() => {
      initTerm()
    })
    const terminalActiveKey = ref('2')
    const store = useStore()
    const initTerm = () => {
      const termDom = document.getElementById('terminal')
      const TERMINAL_PORT = 4000
      const terminal = new Terminal({
        cursorBlink: false, // 关标闪烁
        cursorStyle: 'block', // 光标样式 'block' | 'underline' | 'bar'
        fontFamily: 'Menlo, Monaco, Consolas, "Courier New", monospace',
        // scrollback: 100, // 当行的滚动超过初始值时保留的行视窗，越大回滚能看的内容越多，
        fontSize: 18,
        theme: {
          background: '#1e1e1e',
          selectionBackground: '#264f78',
          selectionInactiveBackground: '#3a3d41'
        }
      })

      let pid, socketURL
      // Clean terminal
      while (termDom.children.length) {
        termDom.removeChild(termDom.children[0])
      }
      const fitAddon = new FitAddon()
      terminal.loadAddon(fitAddon)
      fitAddon.fit()
      terminal.open(termDom)
      terminal.write('Hello from \x1B[1;3;31mxterm.js\x1B[0m $ ')

      socketURL = 'ws://127.0.0.1:' + TERMINAL_PORT + '/terminals/'
      //向node服务发送初始化请求，返回processId
      const newPath = store.state.terminalPath[0]?.replace(/\\/g, '/') || 'D:/backup/n915682'
      fetch(
        `http://127.0.0.1:${TERMINAL_PORT}/terminals?cols=${terminal.cols}&rows=${terminal.rows}&filePath=${newPath}`,
        { method: 'POST' }
      ).then((res) => {
        res.text().then((processId) => {
          pid = processId
          socketURL += processId
          // 建立WebSocket连接
          const webSocket = new WebSocket(socketURL)
          // 手动写入并使用webSocket传输
          /* terminal.onData((data) => {
            webSocket.send(data)
          }) */
          // 接收webSocket信息
          webSocket.onmessage = function (event) {
            // terminal.write(event.data)
          }
          /* webSocket连接成功 */
          webSocket.onopen = function (event) {
            /* const newPath = store.state.terminalPath[0].replace(/\\/g, '/')
            webSocket.send(newPath) */
          }
          /* webSocket连接断开 */
          // webSocket.onclose = onSocketClose
          /* webSocket连接失败 */
          // webSocket.onerror = onSocketError
          //此段代码必须要有，通过插件，来接收渲染node服务返回的数据,自动写入和接收消息
          const attachAddon = new AttachAddon(webSocket)
          terminal.loadAddon(attachAddon)
        })
      })

      //当terminal的大小发生变化时，重新resize
      terminal.onResize((size) => {
        //pid不存在或rows小于3的，不做处理
        if (!pid || size.rows < 3) {
          return
        }
        const cols = size.cols
        const rows = size.rows
        const url = `http://127.0.0.1:${TERMINAL_PORT}/terminals/${pid}/size?cols=${cols}&rows=${rows}`
        fetch(url, { method: 'POST' })
      })
    }
    return {
      terminalActiveKey,
      initTerm
    }
  }
}
</script>

<style lang="scss" scoped>
.terminal {
  background-color: #1e1e1e;
  color: #888;
}

::v-deep(.ant-tabs-nav) {
  padding: 0 10px;
}
::v-deep(.ant-tabs-tab) {
  padding: 6px 0;
}
</style>