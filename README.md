# 小程序互转插件

> A gulp plugin for Vapp and Weapp.

京东微信小程序互转工具

## Usage

首先, install `@ftf/gulp-vapp-transform` as a development dependency:

``` bash
npm install --save-dev @ftf/gulp-vapp-transform
```

然后添加到 `gulpfile.js` .

## 简单示例

``` javascript
const {
    htmlTransform,
    jsTransform,
    styleTransform
} = require('@ftf/gulp-vapp-transform')

// 使用转换方法
const styleTask = () => styleTransform(entryPath, distPath, '.scss')()
const jsTask = () => jsTransform(entryPath, distPath)()
const htmlTask = () => htmlTransform(entryPath, distPath, '.jxml')()
...otherTask

// 执行task
exports.dev = series(
  parallel(styleTask, jsTask, htmlTask, ...otherTask)
)
```

## API

`@ftf/gulp-vapp-transform` 对外暴露三个处理方法：

* htmlTransform - html页面处理函数
* jsTransform - js文件处理函数
* styleTransform - css样式处理函数（当前预处理语言为scss）

**请在在配置中设置当前环境变量 `process.env.PLATFORM` 为 `wx` 或 `jd` 。**

### htmlTransform

> html页面处理task事件:
> htmlTransform(entryPath, outputPath, replaceExa)

#### 参数

| 参数      |    类型 | 描述  |
| :--------: | :--------:| :--: |
| entryPath  | String |  当前入口文件夹的全(绝对)路径   |
| outputPath  | String |  生成文件夹的全(绝对)路径   |
| replaceExa  | String |  需要解析替换的页面文件的后缀名 | 

#### 返回值

#### 示例

``` javascript
const { htmlTransform } = require('@ftf/gulp-vapp-transform')

const htmlTask = () => htmlTransform(entryPath, distPath, '.jxml')()
```

功能：

匹配 `entryPath`  下的所有后缀名为 `jxml` 的文件，如果当前环境变量 `process.env.PLATFORM === 'wx(jd)''` ， 将内部的逻辑转换成 `微信小程序(京东小程序)`的可执行代码，生成到目标文件夹 `distPath` ，后缀名为 `wxml(jxml)`；

### jsTransform

> js文件处理task事件:
> jsTransform(entryPath, outputPath, openBabel)

#### 参数

| 参数      |    类型 | 描述  |
| :--------: | :--------:| :--: |
| entryPath  | String |  当前入口文件夹的全(绝对)路径   |
| outputPath  | String |  生成文件夹的全(绝对)路径   |
| openBabel  | Boolean |  是否开启babel编译， 默认值为 `true` | 

#### 返回值

#### 示例

``` javascript
const { jsTransform } = require('@ftf/gulp-vapp-transform')

const jsTask = () => jsTransform(entryPath, distPath, false)()
```

功能：

匹配 `entryPath`  下的所有后缀名为 `js` 的文件，如果当前环境变量 `process.env.PLATFORM === 'wx(jd)'` ，将内部的逻辑转换成 `微信小程序(京东小程序)`的可执行代码，不进行babel编译， 生成到目标文件夹 `distPath` 。

### styleTransform

> 样式文件处理task事件:
> styleTransform(entryPath, outputPath, replaceExa)

#### 参数

| 参数      |    类型 | 描述  |
| :--------: | :--------:| :--: |
| entryPath  | String |  当前入口文件夹的全(绝对)路径   |
| outputPath  | String |  生成文件夹的全(绝对)路径   |
| replaceExa  | String|  需要解析替换的页面文件的后缀名， 当前支持 `scss / jxss / wxss` | 

#### 返回值

#### 示例

``` javascript
const { styleTransform } = require('@ftf/gulp-vapp-transform')

const styleTask = () => styleTransform(entryPath, distPath, 'scss')()
```

功能：

匹配 `entryPath`  下的所有后缀名为 `scss` 的文件，如果当前环境变量 `process.env.PLATFORM === 'wx(jd)'` ，后缀名变更为`wxss(jxss)`，生成到目标文件夹 `distPath` 。