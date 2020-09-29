import debounce from './lodash/debounce';
/**
 * @description 对num自动填充px
 * @param {Number} num
 * @return {string} num+px
 */

export function addUnit(num) {
  return Number.isNaN(Number(num)) ? num : `${num}px`;
}
/**
 * @description 获取当前页面栈顶(当前显示的页面)
 * @return {wx.Page}
 */

export function getContext() {
  const pages = getCurrentPages();
  return pages[pages.length - 1];
}
/**
 * @description 判断target是否对象
 * @param obj
 * @return {boolean}
 */

export function isObj(obj) {
  // Object.prototype.toString.call(obj).match(/\[object (\w+)\]/)[1].toLowerCase() === 'object'
  return typeof obj === 'object';
}
/**
 * @description 获取目标原始类型
 * @param target 任意类型
 * @returns {string} type 数据类型
 */

export function getType(target) {
  // 得到原生类型
  const typeStr = Object.prototype.toString.call(target); // 拿到类型值

  const type = typeStr.match(/\[object (\w+)\]/)[1]; // 类型值转小写并返回

  return type.toLowerCase();
}
/**
 * @description 默认的外部格式化函数 - picker组件
 * @param items
 * @param labelKey
 * @return {*}
 */

export const defaultDisplayFormat = function (items, {
  labelKey = 'value'
}) {
  // 在props中，this被指向了全局data
  if (items instanceof Array) {
    return items.map(item => item[labelKey]).toString();
  } else {
    return items[labelKey];
  }
};
/**
 * @description 默认函数占位符 - pickerView组件
 * @param value
 * @return value
 */

export const defaultFunction = value => value;
/**
 * @description 是否不为空
 * @param value
 * @return {Boolean}
 */

export const isDef = value => value !== undefined && value !== null;
export { debounce };
/**
 * @description 防止数字小于零
 * @param {Number} num
 * @param {String} label 标签
 */

export const checkNumRange = (num, label = 'value') => {
  if (num < 0) {
    throw Error(`${label} shouldn't be less than zero`);
  }
};
/**
 * @description 防止pixel无意义
 * @param {Number} num
 * @param {String} label 标签
 */

export const checkPixelRange = (num, label = 'value') => {
  if (num <= 0) {
    throw Error(`${label} should be greater than zero`);
  }
};
/**
 * @default 渲染视图
 * @param {this} node 节点
 * @param {Object} data 需要渲染的数据
 * @param {Number} delay 延迟多久
 */

export const renderData = (node, data, delay = 0) => {
  const diff = Object.keys(data).reduce((prev, key) => {
    if (data[key] !== node.data[key]) {
      prev[key] = data[key];
    }

    return prev;
  }, {});
  if (Object.keys(diff).length === 0) return;

  const render = () => node.setData(diff);

  delay ? setTimeout(render, delay) : render();
};

function rgbToHex(r, g, b) {
  const hex = (r << 16 | g << 8 | b).toString(16);
  return '#' + new Array(Math.abs(hex.length - 7)).join('0') + hex;
}

function hexToRgb(hex) {
  const rgb = [];

  for (let i = 1; i < 7; i += 2) {
    rgb.push(parseInt('0x' + hex.slice(i, i + 2)));
  }

  return rgb;
}
/**
 * @default 计算渐变色的中间变量
 * @param {String} startColor 开始颜色
 * @param {String} endColor 结束颜色
 * @param {Number} step 获取渲染位置，默认为中间位置
 * @return {String} 渐变色中间颜色变量
 */


export const gradient = (startColor, endColor, step = 2) => {
  // 将hex转换为rgb
  const sColor = hexToRgb(startColor);
  const eColor = hexToRgb(endColor); // 计算R\G\B每一步的差值

  const rStep = (eColor[0] - sColor[0]) / step;
  const gStep = (eColor[1] - sColor[1]) / step;
  const bStep = (eColor[2] - sColor[2]) / step;
  const gradientColorArr = [];

  for (let i = 0; i < step; i++) {
    // 计算每一步的hex值
    gradientColorArr.push(rgbToHex(parseInt(rStep * i + sColor[0]), parseInt(gStep * i + sColor[1]), parseInt(bStep * i + sColor[2])));
  }

  return gradientColorArr;
};
/** @description 保证num不超出min和max的范围 */

export const range = (num, min, max) => Math.min(Math.max(num, min), max);
/** @description 比较数值是否相等 */

export const isEqual = (value1, value2) => {
  if (value1 === value2) return true;
  if (!(value1 instanceof Array)) return false;
  if (!(value2 instanceof Array)) return false;
  if (value1.length !== value2.length) return false;

  for (let i = 0; i !== value1.length; ++i) {
    if (value1[i] !== value2[i]) return false;
  }

  return true;
};
/** @description 不满10补0 */

export const padZero = (number, length = 2) => {
  number = number + '';

  while (number.length < length) {
    number = '0' + number;
  }

  return number;
};
/** @description 全局变量id */

export const context = {
  id: 1000
};