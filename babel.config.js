/*
 * @Author: n915682 guoqing.li@archermind.com
 * @Date: 2023-06-02 14:21:24
 * @LastEditors: n915682 guoqing.li@archermind.com
 * @LastEditTime: 2023-06-02 16:13:02
 * @FilePath: \ide\babel.config.js
 * @Description: 
 * 
 * Copyright (c) 2023 by ${git_name_email}, All Rights Reserved. 
 */
module.exports = {
  presets: ['@vue/cli-plugin-babel/preset'],
  env: {
    development: {
      plugins: ['dynamic-import-node']
    }
  }
};
