## demo

### 文档介绍

* 此模板可将src下的代码转换成微信小程序，通过微信小程序IDE进行调试。也可将src下的代码转换成京东小程序（此处主要是转scss类预编译语言），通过京东小程序IDE进行调试。
* 最低兼容到小程序基础库 v1.9.91

### 目录结构

``` bash
|-- vapp2weapp
    |-- README.md
    |-- build
    |   |-- gulpfile.js                  // gulp小程序互转配置
    |   |-- mockServer.js                // mock配置文件
    |-- example                          // 编码源码
    |-- dist-wx                          // 转换成的微信小程序
    |-- dist-jd                          // 转换成的京东小程序
    |-- mock                             // mock数据示例
        |-- img
        |-- apis
```

## 支持

* gulp ☑️
* scss 预处理语言 ☑️️
* Mock ☑️
* babel ES6转ES5 ☑️
* 开启监听 ☑️
* 京东小程序 --> 微信小程序 ☑️
* 微信小程序 --> 京东小程序 ☑️
* 环境变量注入 ☑️

### Mock

使用 Mock 功能，在 `/build/gulpfile.js` 中的 `devServer` 函数进行配置。

`devServer` 中引入 `/mock/mock.js` 中会拦截mock的请求将对应的请求打到对应目录或地址下，对返回数组的每个成员
的 route 进行拦截，将请求打到 `/mock` 同请求路径的 js 文件或者 json 文件上。请求的地址后缀名依旧可以是 `.action` 等。

其中mock对应的 `data` 支持 mockjs的语法。

``` JavaScript
'list|1-10': [{
    'id|+1': 1
}]
```

### wx.request 拦截

模板 `example/utils/request.js` 对 `wx.request` 进行简单的拦截操作，实现host抽取，用户可根据自己的需要进行修改。

### 开发流程

``` bash
npm install
```

开发模式，生成京东小程序开发代码，生成/dist-jd/

``` bash
npm run dev
```

开发模式，生成微信小程序开发代码，生成/dist-wx/

``` bash
npm run dev:wx
```

下载（更新） wot design 组件库到 /src/wot-design/ 路径，默认下载最新版本，在命令后面带版本号可以下载指定版本

```bash
npm run wot-design

## 下载指定版本
npm run wot-design 1.3.0
```

生产模式，生成京东小程序代码，生成/dist-jd/

``` bash
npm run build
```

生产模式，生成微信小程序代码，生成/dist-wx/

``` bash
npm run build:wx
```

## 基本用法

在 `src` 文件夹下开发，可用微信小程序语法进行开发，也可用京东小程序语法进行开发，项目支持转换的后缀文件：

* css
  * .jxss
  * .wxss
  * .scss
* html
  * .jxml
  * .wxml
* js
* json

src文件夹下样式后缀转换标表：

| 样式后缀      | 运行环境 |    生成目标后缀 |
| :--------: | :--------:| :--: |
| .jxss | npm run [dev/build] | .jxss |
| .jxss | npm run [dev/build]:wx | .wxss |
| .scss | npm run [dev/build] | .jxss |
| .scss | npm run [dev/build]:wx | .wxss |
| .wxss | npm run [dev/build] | .jxss |
| .wxss | npm run [dev/build]:wx | .wxss |

src文件夹下HTML后缀转换标表：

| src下html后缀      | 运行环境 |    生成目标后缀 |
| :--------: | :--------:| :--: |
| .jxml | npm run [dev/build] | .jxml |
| .jxml | npm run [dev/build]:wx | .wxml |
| .wxml | npm run [dev/build] | .jxml |
| .wxml | npm run [dev/build]:wx | .wxml |

src文件夹下JS后缀转换标表：

| src下js后缀      | 运行环境 |    生成目标后缀 |
| :--------: | :--------:| :--: |
| .js | wx/jd | .js |

src文件夹下JSON后缀转换标表：

| src下json后缀      | 运行环境 |    生成目标后缀 |
| :--------: | :--------:| :--: |
| .json | wx/jd | .json |

通过上方的转换，生成到对应的`dist-jd/dist-wx`目录相同位置。通过`微信小程序IDE/京东小程序IDE`进行调试。

### 环境区分

项目引用插件 [@ftf/gulp-vapp-transform](https://www.npmjs.com/package/@ftf/gulp-vapp-transform) 可以对环境进行区分。

配置项目需要提前定义两个环境变量： `NODE_ENV` & `PLATFORM` 。项目可以根据这两个变量进行区分，判断当前处于哪种状态。

详细信息如下表：

| 环境变量名      | 环境变量名描述 |    可能的值 | 值描述 |
| :--------: | :--------:| :--: | :--: |
| `NODE_ENV` |  环境变量描述：判断当前环境是开发环境还是生产环境   | `development` / `production` | `development` ：开发环境（配置判断 `NODE_ENV` 是否是 `development` ， 若是则为开发环境）； `production` : 生产环境（线上） |
| `PLATFORM` |平台类型：当前开发的是京东小程序还是微信小程序  | `wx` / `jd` | `wx` 开发转为微信小程序； `jd` 开发转为京东小程序 |

#### 方式一：preprocess (注解式)环境变量注入

当用户逻辑不是非常复杂时，可以采用页面内部环境变量区分的方法，在一个文件内区分两个环境下的代码。

在js文件中可以使用 `// @if NODE_ENV = 'development'` 和 `// @endif` 判断注释包裹住需要区分的文件，运行转换时，过滤掉不符合的代码，使用方法如下：

``` JavaScript
// 具体使用方法见文件 src/components/demo/index.js

const envs = {
    // @if NODE_ENV = 'development'
    env: '开发测试环境',
    // @endif
    // @if NODE_ENV = 'production'
    env: '正式环境',
    // @endif
    // @if NODE_ENV = 'uat'
    env: '客户验收测试环境'
    // @endif
}
const plats = {
    // @if PLATFORM='jd'
    plat: 'jd',
    // @endif
    // @if PLATFORM='wx'
    plat: 'wx'
    // @endif
}
```

若当前运行的是 `npm run dev` 最终生成文件内容:

``` JavaScript
// 具体生成代码见文件 dist-jd/components/demo/index.js
var envs = {
    env: '开发测试环境'
};
var plats = {
    plat: 'jd'
};
```

若当前运行的是 `npm run build:wx` 最终生成文件内容:

``` JavaScript
// 具体生成代码见文件 dist-wx/components/demo/index.js
var envs = {
    env: '正式环境'
};
var plats = {
    plat: 'wx'
};
```

#### 方式二：后缀文件名区分

页面逻辑过于复杂，用上一种方法在一个页面区分，显然是不现实的。因此我们提供了另外一种方法，在不同环境下使用不同的后缀文件， `[filename].[jd|wx].[fileExtname]` ， 根据当前运行的目标平台过滤掉其他后缀文件，生成 `[filename].[fileExtname]` 。

* [fileExtname] -- 小程序支持转换的后缀文件名 `jxml` / `wxml` / `js` 

使用方法如下，以 'src/components/hello' 文件夹为例：

``` bash
# src/components/hello 文件夹目录结构
|-- vapp2weapp
    |-- build
    |-- src                          // 编码源码
        |-- components
            |-- hello
                |-- index.jd.js      // 京东小程序运行的js文件
                |-- index.wx.js      // 微信小程序运行的js文件
```

``` JavaScript
// index.jd.js
Component({
    data: {
        message: '您好，当前您使用的是京东小程序！'
    }
})
// index.wx.js
Component({
    data: {
        message: '您好，当前您使用的是微信小程序！'
    }
})
```

若当前运行的是 `npm run dev` 最终生成文件内容:

``` bash
# dist-jd/components/hello 文件夹目录结构
|-- vapp2weapp
    |-- dist-jd                   // 生成的jd小程序目标文件
        |-- components
            |-- hello
                |-- index.js      // 过滤后jd小程序运行的js文件
```

``` JavaScript
// 生成的index.js
Component({
    data: {
        message: '您好，当前您使用的是京东小程序！'
    }
})
```

若当前运行的是 `npm run dev:wx` 最终生成文件内容:

``` bash
# dist-wx/components/hello 文件夹目录结构
|-- vapp2weapp
    |-- dist-wx                   // 生成的wx小程序目标文件
        |-- components
            |-- hello
                |-- index.js      // 过滤后wx小程序运行的js文件
```

``` JavaScript
// 生成的index.js
Component({
    data: {
        message: '您好，当前您使用的是微信小程序！'
    }
})
```

**注意： 使用 `后缀文件名区分` 的方法时，同名文件 `[filename].jd.js / [filename].wx.js` 和 `[filename].js` 不能出现在统一文件夹下！！！！**

