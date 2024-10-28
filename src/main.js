import { createApp } from 'vue';
import App from './App';
import router from './router';
import store from './store';
import "@/styles/index.scss"; // global css
// ace代码编辑
import ace from 'ace-builds';
// antDesign
import Antd from 'ant-design-vue';
import 'ant-design-vue/dist/antd.css';

const app = createApp(App);

app.use(Antd).use(store).use(router).use(ace).mount('#app');
