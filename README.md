# 小程序互转插件

> JD WeChat Mini Program Interchange Utils

京东微信小程序互转工具

## Usage

首先, install `@ftf/gulp-vapp-transform` as a development dependency:

``` shell
npm install --save-dev @ftf/gulp-vapp-transform
```

Then, add it to your `gulpfile.js` .

`@ftf/gulp-vapp-transform` 对外暴露三个处理方法：

* htmlTransform - html页面处理函数
* jsTransform - js文件处理函数
* styleTransform - css样式处理函数（当前预处理语言为scss）

**请在在配置中设置当前环境变量 `process.env.PLATFORM` 为 `wx` 或 `jd` 。**

## 简单示例

``` javascript
const {
    htmlTransform,
    jsTransform,
    styleTransform
} = require('@ftf/gulp-vapp-transform')
// 使用转换方法
const styleTask = styleTransform(entryPath, distPath)
const jsTask = () => jsTransform(entryPath, distPath)()
const htmlTask = () => htmlTransform(entryPath, distPath)()
    ...otherTask

// 执行task
exports.dev = series(
    parallel(styleTask, jsTask, htmlTask, ...otherTask)
)
```

## htmlTransform

htmlTransform(entryPath, OutputPath)

从入口文件读取后缀名名为 `jxml` ，如果当前运行的平台是 `微信小程序` 即（process.env. PLATFORM = 'wx'），那么生成微信小程序可执行的后缀名未 `wxml` 的文件。

## jsTransform

jsTransform(entryPath, OutputPath)

## styleTransform

styleTransform(entryPath, OutputPath)
