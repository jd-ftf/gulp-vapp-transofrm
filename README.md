# 小程序互转插件

[gulp-vapp-transform](https://github.com/jd-ftf/gulp-vapp-transofrm) is a gulp plugin for Vapp and Weapp.

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
    styleTransform,
    copyNoChange
} = require('@ftf/gulp-vapp-transform')

// 使用转换方法
const ignoreList = [`!${entry}/ignore/**`] // 屏蔽列表
const styleTask = () => styleTransform({ entry, toPath, ignoreExpressList: ignoreList, replaceExt: 'scss' })()
const jsTask = () => jsTransform({ entry, toPath })()
const htmlTask = () => htmlTransform({ entry, toPath, ignoreExpressList: ignoreList, replaceExt: 'jxml' })()

const entryCopyPath = [
  `${entry}/**`,
  `!${entry}/**/*.js`,
]
const copy = () => copyNoChange(entryCopyPath, toPath)()

    ...otherTask

// 执行task
exports.dev = series(
    parallel(styleTask, jsTask, htmlTask, ...otherTask, copy)
)
```

## API

`@ftf/gulp-vapp-transform` 对外暴露四个个处理方法：

* htmlTransform - html页面处理函数
* jsTransform - js文件处理函数
* styleTransform - css样式处理函数（当前可转预处理语言为scss）
* copyNoChange - 未处理文件直接生成到目标文件夹

注意：*请在在配置中设置当前环境变量 `process.env. PLATFORM` 为 `wx` 或 `jd` 。*

## htmlTransform

*`html页面处理task事件:`*

*htmlTransform({entry, toPath, ignoreExpressList, replaceExt, toExt})*

### 参数

参数以对象形式传入，注意名称如下：

| 参数      |    类型 | 描述  | 是否必需 |
| :--------: | :--------:| :--: | :--: |
| entry  | String |  当前入口文件夹的全(绝对)路径   | 是 |
| toPath  | String |  生成文件夹的全(绝对)路径   | 是 |
| ignoreExpressList | Array | 屏蔽表达式列表 | 否 |
| replaceExt  | String |  需要解析替换的页面文件的后缀名 | 否 |
| toExt | String | 指定生成的文件后缀， 若不设置该值，则走默认规则，即根据 `PLATFORM` 判断 | 否 |

### 示例

一、基本用法

``` javascript
const {
    htmlTransform
} = require('@ftf/gulp-vapp-transform')

const htmlTask = () => htmlTransform({ entry, toPath, replaceExt: 'jxml' })()

```

功能：

匹配 `entry` 下的所有后缀名为 `jxml` 的文件，如果当前环境变量 `process.env.PLATFORM === 'wx(jd)''` ， 将内部的逻辑转换成 `微信小程序(京东小程序)` 的可执行代码，生成到目标文件夹 `toPath` ，后缀名为 `wxml(jxml)` ；

二、配置忽略文件

有时并不需要转化`entry`入口下的所有文件，因此需要一个屏蔽配置。

设置屏蔽列表，列表内部每一项表达式都遵循src匹配原则。

``` JavaScript
const {
    htmlTransform
} = require('@ftf/gulp-vapp-transform')

const ignoreExpressList = [`!${entry}/ignore1/**`, `!${entry}/ignore2/**`]
const htmlTask = () => htmlTransform({ entry, toPath, ignoreExpressList, replaceExt: 'jxml' })()

```

三、手动控制

除此之外也可以设置定向的生成后缀。

``` JavaScript
const {
    htmlTransform
} = require('@ftf/gulp-vapp-transform')

// 不根据PLATFORM值判断生成后缀， entry 下的 jxml 文件  -> toPath 路径下的 wxml
const htmlTask = () => htmlTransform({ entry, toPath, replaceExt: 'jxml', toExt: 'wxml' })()
```

## jsTransform

*`js文件处理task事件:`*

*jsTransform({entry, toPath, ignoreExpressList, openBabel})*

### 参数

参数以对象形式传入，注意名称如下：

| 参数      |    类型 | 描述  | 是否必需 |
| :--------: | :--------:| :--: | :--: |
| entry  | String |  当前入口文件夹的全(绝对)路径   | 是 |
| toPath  | String |  生成文件夹的全(绝对)路径   | 是 |
| ignoreExpressList  | Array | 屏蔽表达式列表 | 否 |
| openBabel  | Boolean |  是否开启babel编译， 默认值为 `false` | 否 |

### 示例

一、基本用法

``` javascript
const {
    jsTransform
} = require('@ftf/gulp-vapp-transform')

const jsTask = () => jsTransform({ entry, toPath })()

```

功能：

匹配 `entry` 下的所有后缀名为 `js` 的文件，如果当前环境变量 `process.env. PLATFORM === 'wx(jd)'` ，将内部的逻辑转换成 `微信小程序(京东小程序)` 的可执行代码，不进行babel编译， 生成到目标文件夹 `toPath` 。

二、配置忽略文件

有时并不需要转化`entry`入口下的所有文件，因此需要一个屏蔽配置。

设置屏蔽列表，列表内部每一项表达式都遵循src匹配原则。

``` JavaScript
const {
    jsTransform
} = require('@ftf/gulp-vapp-transform')

const ignoreList = [`!${entry}/ignore1/**`, `!${entry}/ignore2/**`]
const jsTask = () => jsTransform({ entry, toPath, ignoreExpressList: ignoreList })()

```

## styleTransform

*`样式文件处理task事件:`*

*styleTransform({entry, toPath, ignoreExpressList, replaceExt, toExt})*

### 参数

参数以对象形式传入，注意名称如下：

| 参数      |    类型 | 描述  | 是否必需 |
| :--------: | :--------:| :--: | :--: |
| entry  | String |  当前入口文件夹的全(绝对)路径   | 是 |
| toPath  | String |  生成文件夹的全(绝对)路径   | 是 |
| ignoreExpressList  | Array | 屏蔽表达式列表 | 否 |
| replaceExt  | String|  需要解析替换的页面文件的后缀名， 当前支持 `scss / jxss / wxss` | 否 |
| toExt  | String | 指定生成的文件后缀， 若不设置该值，则走默认规则，即根据 `PLATFORM` 判断 | 否 |

### 示例

一、 基本用法

``` javascript
const {
    styleTransform
} = require('@ftf/gulp-vapp-transform')

const styleTask = () => styleTransform({ entry, toPath, replaceExt: 'scss' })()
```

功能：

匹配 `entry` 下的所有后缀名为 `scss` 的文件，如果当前环境变量 `process.env. PLATFORM === 'wx(jd)'` ，后缀名变更为 `wxss(jxss)` ，生成到目标文件夹 `toPath` 。

二、配置忽略文件

有时并不需要转化`entry`入口下的所有文件，因此需要一个屏蔽配置。

设置屏蔽列表，列表内部每一项表达式都遵循src匹配原则。

``` JavaScript
const {
    styleTransform
} = require('@ftf/gulp-vapp-transform')

const ignoreList = [`!${entry}/ignore1/**`, `!${entry}/ignore2/**`]
const styleTask = () => styleTransform({ entry, toPath, ignoreExpressList: ignoreList, replaceExt: 'scss' })()
```

三、 手动控制

`styleTransform` 也可以设置定向的生成后缀。

``` JavaScript
const {
    styleTransform
} = require('@ftf/gulp-vapp-transform')

// 不根据PLATFORM值判断生成后缀， 根据entry 下的 scss 文件  -> toPath 路径下的 jxss
const styleTask = () => styleTransform({ entry, toPath, replaceExt: 'scss', toExt: 'jxss' })()
```

## copyNoChange

*`无修改文件，直接生成到目录。`*

*copyNoChange(entry, toPath)*

### 参数

| 参数      |    类型 | 描述  | 是否必需 |
| :--------: | :--------:| :--: | :--: |
| entry  | String |  当前入口文件夹的全(绝对)路径，遵循src匹配原则   | 是 |
| toPath  | String |  生成文件夹的全(绝对)路径   | 是 |

### 示例

``` JavaScript
const {
    copyNoChange
} = require('@ftf/gulp-vapp-transform')

/**
 *  !后方的路径都不需要复制，因为前面的task已经将文件生成， 需要原样赋值的为除手动生成之外的文件
 *  更多语法参考gulp匹配规则
 */
const entry = [
  `${entry}/**`,
  `!${entry}/**/*.js`,
]

const jsTask = () => jsTransform({ entry, toPath })()
// copy 文件到路径toPath
const copy = () => copyNoChange(entry, toPath)()
```
