// nodejs fs模块
import fs from 'fs';
// nodejs path模块
import path from 'path';
/**
 * blob转file
 * @param {Object} blob
 * @param {string} filename
 * @returns {Object}
 */
export function createObjectFile(blob, filename, type = 'text/plain') {
  return new File([blob], filename, { type });
}

/**
 * file转blob
 * @param {Object} file
 * @returns {Object}
 */
export function createObjectBlob(file) {
  return new Blob([file], { type: file.type });
}

/**
 * 防抖
 * @param {Function} func
 * @param {number} wait
 * @param {boolean} immediate
 * @return {*}
 */
export function debounce(func, wait, immediate) {
  let timeout, args, context, timestamp, result;
  const later = function () {
    // 据上一次触发时间间隔
    const last = +new Date() - timestamp;
    // 上次被包装函数被调用时间间隔 last 小于设定时间间隔 wait
    if (last < wait && last > 0) {
      timeout = setTimeout(later, wait - last);
    } else {
      timeout = null;
      // 如果设定为immediate===true，因为开始边界已经调用过了此处无需调用
      if (!immediate) {
        result = func.apply(context, args);
        if (!timeout) context = args = null;
      }
    }
  };
}

/**
 * 选择文件夹后使用递归转化为树结构的目录
 * @param {String} dirPath
 * @return {*}
 */
export function readDir(dirPath) {
  return new Promise((resolve, reject) => {
    fs.readdir(dirPath, async (err, files) => {
      if (err) {
        reject(err);
        return;
      }
      const result = await Promise.all(
        files.map(async (file) => {
          const filePath = path.join(dirPath, file);
          try {
            const stats = await fs.promises.stat(filePath);
            if (stats.isDirectory()) {
              const children = await readDir(filePath);
              return {
                type: 'directory',
                label: file,
                title: file,
                children,
                key: filePath,
                path: filePath,
                isLeaf: false
              };
            } else {
              return {
                type: 'file',
                isLeaf: true,
                label: file,
                title: file,
                key: filePath,
                path: filePath
              };
            }
          } catch (err) {
            reject(err);
          }
        })
      );
      result.sort((a, b) => {
        const typeA = a.type.toUpperCase(); // 忽略大小写
        const typeB = b.type.toUpperCase(); // 忽略大小写
        if (typeA < typeB) {
          return -1;
        }
        if (typeA > typeB) {
          return 1;
        }
        // name 必须相等
        return 0;
      });
      resolve(result);
    });
  });
}

/**
 * 处理文件夹
 * @param {Array} filePaths
 * @return {*}
 */
export async function sendDirectoryArr(filePaths) {
  const directoryArr = [];
  for (const path of filePaths) {
    const children = await readDir(path);
    const catalogName = path.split('\\')[path.split('\\').length - 1];
    directoryArr.push({
      type: 'directory',
      label: catalogName,
      title: catalogName,
      // children: [],
      children,
      key: path,
      path,
      isLeaf: false
    });
  }
  return directoryArr;
}

/**
 * 选择文件后转化为文件信息(多选)
 * @param {Array} filePath
 * @return {*}
 */
export function readFile(filePath) {
  let promises = [];
  for (const v of filePath) {
    const catalogName = v.split('\\')[v.split('\\').length - 1];
    let promise = new Promise((resolve, reject) => {
      fs.readFile(v, 'utf-8', function (err, dataStr) {
        if (err) {
          reject(err);
        } else {
          resolve({
            content: dataStr,
            label: catalogName,
            title: catalogName,
            type: 'file',
            isLeaf: true,
            path: v,
            key: v
          });
        }
      });
    });
    promises.push(promise);
  }
  return promises;
}

/**
 * 获取选择文件夹里面的所有文件内容和路径(全局搜索使用)
 * @param {Array} filePath
 * @return {*}
 */
