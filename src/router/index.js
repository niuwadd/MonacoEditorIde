/*
 * @Author: n915682 guoqing.li@archermind.com
 * @Date: 2023-06-02 14:21:24
 * @LastEditors: n915682 guoqing.li@archermind.com
 * @LastEditTime: 2023-06-02 17:45:12
 * @FilePath: \ide\src\router\index.js
 * @Description:
 *
 * Copyright (c) 2023 by ${git_name_email}, All Rights Reserved.
 */
import { createRouter, createWebHashHistory } from 'vue-router';

const routes = [
  {
    path: '/',
    name: 'home',
    component: () => import('@/views/home')
  }
];

const router = createRouter({
  history: createWebHashHistory(),
  routes
});

export default router;
