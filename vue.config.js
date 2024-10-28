/*
 * @Author: n915682 guoqing.li@archermind.com
 * @Date: 2023-06-02 14:21:24
 * @LastEditors: n915682 guoqing.li@archermind.com
 * @LastEditTime: 2023-07-06 16:06:42
 * @FilePath: \ide\vue.config.js
 * @Description:
 *
 * Copyright (c) 2023 by ${git_name_email}, All Rights Reserved.
 */
const { defineConfig } = require('@vue/cli-service');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const MonacoWebpackPlugin = require('monaco-editor-webpack-plugin');

module.exports = defineConfig({
  transpileDependencies: true,
  // 添加此行代码
  lintOnSave: false,
  configureWebpack: {
    plugins: [
      new CopyWebpackPlugin({
        patterns: [
          {
            from: 'node_modules/ace-builds/src-noconflict/worker-javascript.js',
            to: 'js/worker-javascript.js'
          }
        ]
      }),
      new MonacoWebpackPlugin()
    ],
    module: {
      rules: [
        {
          test: /.node$/,
          use: [
            {
              loader: 'raw-loader'
            }
          ]
        }
      ]
    }
  },
  pluginOptions: {
    electronBuilder: {
      nodeIntegration: true,
      builderOptions: {
        appId: 'com.example.app',
        productName: 'IDE', //项目名，也是生成的安装文件名
        copyright: 'Copyright © 2019', //版权信息
        directories: {
          output: './dist_electron' //输出文件路径
        },
        //win相关配置
        win: {
          // icon: './public/favicon.ico', //图标，当前图标在根目录下，注意这里有两个坑
          target: [
            {
              target: 'nsis', //利用nsis制作安装程序
              arch: [
                'x64' //64位
              ]
            }
          ]
        },
        // nsis安装，生成安装包
        nsis: {
          oneClick: false, // 是否一键安装
          allowElevation: true, // 允许请求提升。 如果为false，则用户必须使用提升的权限重新启动安装程序。
          allowToChangeInstallationDirectory: true, // 允许修改安装目录
          installerIcon: './public/favicon.ico', // 安装图标
          uninstallerIcon: './public/favicon.ico', //卸载图标
          installerHeaderIcon: './public/favicon.ico', // 安装时头部图标
          createDesktopShortcut: true, // 创建桌面图标
          createStartMenuShortcut: true, // 创建开始菜单图标
          shortcutName: 'IDE' // 图标名称
        }
      }
    }
  }
});
