/*
 * @Author: n915682 guoqing.li@archermind.com
 * @Date: 2023-06-02 14:21:24
 * @LastEditors: n915682 guoqing.li@archermind.com
 * @LastEditTime: 2023-06-08 15:58:44
 * @FilePath: \ide\src\store\index.js
 * @Description:
 *
 * Copyright (c) 2023 by ${git_name_email}, All Rights Reserved.
 */
import { createStore } from 'vuex';

export default createStore({
  state: {
    catalogTreeData: [],
    // 文件内容
    fileContent: {},
    // tab的所有数据
    tabPaneData: [],
    // 当前tab的key
    newTabKey: '',
    // 终端需要的path
    terminalPath: [],
    // 当前全局搜索的值
    searchVal: ""
  },
  getters: {},
  mutations: {
    SET_CATALOGTREE_DATA: (state, array) => {
      state.catalogTreeData = array;
    },
    SET_FILE_CONTENT: (state, value) => {
      state.fileContent = value;
    },
    SET_TABPANE_DATA: (state, value) => {
      const isExist = state.tabPaneData.some((item) => item.key === value.key);
      if (!isExist) {
        state.tabPaneData.push(value);
      }
    },
    DELETE_TABPANE_DATA: (state, value) => {
      state.tabPaneData.splice(value, 1);
    },
    SET_NEWTAB_KEY: (state, value) => {
      state.newTabKey = value;
    },
    SET_TERMINAL_PATH: (state, value) => {
      state.terminalPath = value;
    },
    SET_SEARCH_VAL: (state, value) => {
      state.searchVal = value;
    },
  },
  actions: {
    settingsCatalogTreeData({ commit }, array) {
      commit('SET_CATALOGTREE_DATA', array);
    },
    settingsFileContent({ commit }, value) {
      commit('SET_FILE_CONTENT', value);
    },
    settingsTabPaneData({ commit }, value) {
      if (typeof value === 'number') {
        commit('DELETE_TABPANE_DATA', value);
      } else {
        commit('SET_TABPANE_DATA', value);
      }
    },
    settingsNewTabKey({ commit }, value) {
      commit('SET_NEWTAB_KEY', value);
    },
    settingsTerminalPath({ commit }, value) {
      commit('SET_TERMINAL_PATH', value);
    },
    settingsSearchVal({ commit }, value) {
      commit('SET_SEARCH_VAL', value);
    }
  },
  modules: {}
});
