/*
 * @Author: n915682 guoqing.li@archermind.com
 * @Date: 2023-06-02 14:23:36
 * @LastEditors: n915682 guoqing.li@archermind.com
 * @LastEditTime: 2023-06-30 10:30:37
 * @FilePath: \ide\src\background.js
 * @Description:
 *
 * Copyright (c) 2023 by ${git_name_email}, All Rights Reserved.
 */
'use strict';

import {
  app,
  protocol,
  BrowserWindow,
  ipcMain,
  Menu,
  dialog,
  screen
} from 'electron';
import { createProtocol } from 'vue-cli-plugin-electron-builder/lib';
import installExtension, { VUEJS3_DEVTOOLS } from 'electron-devtools-installer';
import { readFile } from './utils';
// nodejs fs模块
import fs from 'fs';
// 环境区分
const isDevelopment = process.env.NODE_ENV !== 'production';
// electron窗口
let win = null;

// 将 scheme 注册为标准、安全、绕过资源的内容安全策略、允许注册 ServiceWorker 、支持获取 API 以及视频/音频流式传输
protocol.registerSchemesAsPrivileged([
  { scheme: 'app', privileges: { secure: true, standard: true } }
]);

// 创建窗口
async function createWindow() {
  win = new BrowserWindow({
    width: 1280,
    height: 800,
    frame: false, // 禁用默认的标题栏
    webPreferences: {
      webSecurity: false,
      sandbox: false,
      nodeIntegration: true,
      contextIsolation: false //  把这一项加上错误就会消失
    }
  });

  // 创建菜单
  const menuTemplate = [
    {
      label: '文件',
      submenu: [
        {
          label: '新建',
          accelerator: 'ctrl+n',
          click: () => {
            console.log('Ctrl+N');
          }
        },
        {
          label: '打开文件',
          accelerator: 'ctrl+o',
          click: () => openFileDialog()
        },
        {
          label: '打开文件夹',
          accelerator: 'ctrl+k',
          click: () => openDirectoryDialog()
        },
        {
          type: 'separator'
        },
        {
          label: '保存',
          accelerator: 'ctrl+s',
          click: () => win.webContents.send('save-notification')
        }
      ]
    },
    {
      label: '编辑',
      submenu: [
        {
          label: '复制',
          role: 'copy',
          click: () => {
            console.log('copy');
          }
        },
        {
          label: '黏贴',
          role: 'paste'
        }
      ]
    },
    {
      label: '终端',
      submenu: [
        {
          label: '新建终端',
          accelerator: 'ctrl+`',
          click: () => {
            win.webContents.send('new-terminal');
          }
        },
        {
          label: '拆分终端'
        }
      ]
    },
    {
      label: '工具',
      submenu: [
        {
          label: '打开开发者工具',
          accelerator: 'ctrl+F11',
          click: () => {
            win.webContents.openDevTools();
          }
        },
        {
          label: '关闭开发者工具',
          accelerator: 'ctrl+F12',
          click: () => {
            win.webContents.closeDevTools();
          }
        }
      ]
    }
  ];
  const menuBuilder = Menu.buildFromTemplate(menuTemplate);
  // 设置顶部菜单
  Menu.setApplicationMenu(menuBuilder);

  // 环境配置
  if (process.env.WEBPACK_DEV_SERVER_URL) {
    await win.loadURL(process.env.WEBPACK_DEV_SERVER_URL);
    if (!process.env.IS_TEST) win.webContents.openDevTools();
  } else {
    createProtocol('app');
    win.loadURL('app://./index.html');
  }
}

// 打开对话框选择文件
function openFileDialog() {
  const options = { properties: ['openFile', 'multiSelections'] };
  dialog.showOpenDialog(win, options).then((result) => {
    if (!result.canceled) {
      Promise.all(readFile(result.filePaths))
        .then((results) => {
          win.webContents.send('file-opened', results);
        })
        .catch((err) => {
          console.error(err);
        });
    }
  });
}
// 打开对话框选择文件夹
function openDirectoryDialog() {
  dialog
    .showOpenDialog({
      properties: ['openDirectory', 'multiSelections']
    })
    .then((result) => {
      if (!result.canceled) {
        win.webContents.send('directory-opened', result.filePaths);
      }
    });
}
function windowMove(win) {
  let winStartPosition = { x: 0, y: 0 };
  let mouseStartPosition = { x: 0, y: 0 };
  let movingInterval = null;

  /**
   * 窗口移动事件
   */
  ipcMain.on('window-move-open', (events, canMoving) => {
    if (canMoving) {
      // 读取原位置
      const winPosition = win.getPosition(); // 窗口的位置
      winStartPosition = { x: winPosition[0], y: winPosition[1] };
      mouseStartPosition = screen.getCursorScreenPoint(); // 鼠标的位置
      // 清除
      if (movingInterval) {
        clearInterval(movingInterval);
      }
      // 新开
      movingInterval = setInterval(() => {
        // 实时更新位置
        const cursorPosition = screen.getCursorScreenPoint();
        // 启始的窗口位置+(现在的鼠标位置-启始的鼠标位置)(移动的距离)
        const x = winStartPosition.x + cursorPosition.x - mouseStartPosition.x;
        const y = winStartPosition.y + cursorPosition.y - mouseStartPosition.y;
        win.setPosition(x, y, true);
      }, 20);
    } else {
      clearInterval(movingInterval);
      movingInterval = null;
    }
  });
}
/* ----- ipcMain---- 渲染进程通信 */
// 监听从渲染进程发送的获取文件内容请求
ipcMain.handle('read-file', async (event, filePath) => {
  try {
    const fileContent = await fs.promises.readFile(filePath, 'utf-8');
    return fileContent;
  } catch (error) {
    console.error('Error reading file:', error);
    throw error;
  }
});
// 监听从渲染进程发送的保存请求
ipcMain.on('save-file', (event, savePath, saveCode) => {
  fs.writeFile(savePath, saveCode, (err) => {
    if (err) throw err;
    event.reply('save-file-reply', '文件已保存');
  });
});
// 监听从渲染进程发送的打开文件选择对话框
ipcMain.on('file-dialog', () => {
  openFileDialog();
});
// 监听从渲染进程发送的打开文件夹选择对话框
ipcMain.on('file-directory', () => {
  openDirectoryDialog();
});
// 最小化窗口
ipcMain.on('minimize-window', () => {
  const currentWindow = BrowserWindow.getFocusedWindow();
  currentWindow.minimize();
});
// 最大化窗口
ipcMain.on('maximize-window', () => {
  const currentWindow = BrowserWindow.getFocusedWindow();
  if (currentWindow.isMaximized()) {
    currentWindow.unmaximize();
  } else {
    currentWindow.maximize();
  }
});
// 关闭窗口
ipcMain.on('close-window', () => {
  const currentWindow = BrowserWindow.getFocusedWindow();
  currentWindow.close();
});
// 保存文件
ipcMain.on('file-save', () => {
  win.webContents.send('save-notification');
});
// 新建终端
ipcMain.on('built-terminal', () => {
  win.webContents.send('new-terminal');
});
// 关闭窗口
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});

app.on('ready', async () => {
  /* if (isDevelopment && !process.env.IS_TEST) {
    try {
      await installExtension(VUEJS3_DEVTOOLS);
    } catch (e) {
      console.error('Vue Devtools failed to install:', e.toString());
    }
  } */
  createWindow();
  windowMove(win);
});
