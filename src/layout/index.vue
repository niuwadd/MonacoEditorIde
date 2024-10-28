<!--
 * @Author: n915682 guoqing.li@archermind.com
 * @Date: 2023-06-02 14:42:03
 * @LastEditors: n915682 guoqing.li@archermind.com
 * @LastEditTime: 2023-06-05 15:56:46
 * @FilePath: \ide\src\layout\index.vue
 * @Description: 
 * 
 * Copyright (c) 2023 by ${git_name_email}, All Rights Reserved. 
-->
<template>
  <div class="layout">
    <!-- 侧边栏 -->
    <Sidebar class="layout-sidebar" />
    <!-- 标签栏 -->
    <TagsView class="layout-tagsView" />
  </div>
</template>
<script>
import { defineComponent, ref } from "vue";
// 组件
import Sidebar from "./components/Sidebar";
import TagsView from "./components/TagsView";
export default defineComponent({
  components: {
    Sidebar,
    TagsView,
  },
  setup() {
    const activeKey = ref("1");
    return {
      activeKey,
    };
  },
});
</script>

<style lang="scss" scoped>
.layout {
  // margin-top: 10px;
  display: flex;
  height: 100%; 
  &-tagsView {
    background-color: #1e1e1e;
    flex: 1;
  }
}
</style>