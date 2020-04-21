const { src, dest } = require('gulp')
const fs = require('fs')
const sass = require('gulp-sass')
const postcss = require('gulp-postcss')
const cssnano = require('gulp-cssnano')
const babel = require('gulp-babel')
const base64 = require('gulp-base64')
const autoprefixer = require('autoprefixer')
const pipeline = require('readable-stream').pipeline
const rename = require('gulp-rename')
const filter = require('gulp-filter')
const strReplace = require('./utils/gulp-replace')
const preprocess = require('gulp-preprocess')
const chalk = require('chalk')
const PLUGIN_NAME = 'gulp-transform-vapp'

// 平台类型，如果是wx 那么是从京东转微信   如果是jd那么从微信转京东
const platform = process.env.PLATFORM

// html 替换逻辑
const htmlReg = [
  {
    replaceStr: `\\.${platform === 'wx' ? 'jxs' : 'wxs'}`,
    str: `.${platform === 'wx' ? 'wxs' : 'jxs'}`
  }, {
    replaceStr: `<${platform === 'wx' ? 'jxs' : 'wxs'}`,
    str: `<${platform === 'wx' ? 'wxs' : 'jxs'}`
  }, {
    replaceStr: `${platform === 'wx' ? 'jd' : 'wx'}:`,
    str: `${platform === 'wx' ? 'wx' : 'jd'}:`
  }
]

// 文件检测
function fileCheck (entry, dirname, ext) {
  // 不带.
  const dir = `${entry}/${dirname !== '.' ? dirname : ''}`
  const files = fs.readdirSync(dir).filter(f => f.endsWith(ext))
  const err = {
    dir
  }
  let hasBaseFile = false
  let hasPlatFile = false

  files.forEach(file => {
    if (file.indexOf('.jd.' + ext) === -1 && file.indexOf('.wx.' + ext) === -1) {
      hasBaseFile = true
      err.fileName = file
    } else {
      hasPlatFile = true
    }
  })

  if (hasPlatFile && hasBaseFile) {
    console.log(chalk.red(`\n Warning Message - ${PLUGIN_NAME}：\n 检测到当前文件夹 --- ${err.dir}  \n 已经存在 ${err.fileName}!`))
  }
}

/**
 * html Task
 * @param entry 入口文件全路径
 * @param toPath 生成文件全路径
 * @param replaceExt 被解析替换的后缀名
 * @param toExt 生成目标后缀名,若定义该变量，则生成该后缀，若没有定义，按照生成平台判断生成目标后缀
 */
const htmlTransform = (entry, toPath, replaceExt, toExt) => {
  if (!entry || !toPath) {
    throw Error(`\n Error Message - ${PLUGIN_NAME}：\n entry path or dist path can not be empty !`)
  }

  const ext = toExt || (platform === 'wx' ? 'wxml' : 'jxml')
  const pre = `${entry}/**/*.${replaceExt}`
  const srcPath = [pre]
  const platFilter = filter([`${entry}/**`, `!${entry}/**/*.${platform === 'wx' ? 'jd' : 'wx'}.${replaceExt}`])

  const replaceTask = (htmlReg || []).map(item => {
    return strReplace(item.replaceStr, item.str)
  })

  replaceTask.push(rename(path => {
    const { basename, dirname } = path
    fileCheck(entry, dirname, replaceExt)

    if (basename.indexOf('.jd') > -1 || basename.indexOf('.wx') > -1) {
      path.basename = basename.replace(basename.indexOf('.jd') > -1 ? '.jd' : '.wx', '')
    }
    path.extname = `.${ext}`
  }))

  return () => {
    return pipeline(
      src(srcPath),
      platFilter,
      preprocess({
        context: {
          NODE_ENV: process.env.NODE_ENV || 'production',
          PLATFORM: process.env.PLATFORM || 'jd'
        }
      }),
      ...replaceTask,
      dest(toPath)
    )
  }
}

/**
 * JS Task
 * @param entry 入口文件全路径
 * @param toPath 生成文件全路径
 * @param openBabel 是否开启babel
 */
const jsTransform = (entry, toPath, openBabel = false) => {
  if (!entry || !toPath) {
    throw Error(`\n Error Message - ${PLUGIN_NAME}：\n entry path or dist path can not be empty !`)
  }

  const srcPath = [entry + '/**/*.js']
  const replaceStr = platform === 'wx' ? 'jd' : 'wx'
  const str = platform === 'wx' ? 'wx' : 'jd'
  const changeName = rename(path => {
    const { basename, dirname } = path
    // 文件检测
    fileCheck(entry, dirname, 'js')

    if (basename.indexOf('.jd') > -1 || basename.indexOf('.wx') > -1) {
      path.basename = basename.replace(basename.indexOf('.jd') > -1 ? '.jd' : '.wx', '')
    }
  })

  const platFilter = filter([`${entry}/**`, `!${entry}/**/*.${platform === 'wx' ? 'jd' : 'wx'}.js`])
  const replaceTask = []
  openBabel && replaceTask.push(babel({ presets: ['@babel/env'] }))

  return () => {
    return pipeline(
      src(srcPath),
      platFilter,
      preprocess({
        context: {
          NODE_ENV: process.env.NODE_ENV || 'production',
          PLATFORM: process.env.PLATFORM || 'jd'
        }
      }),
      strReplace(replaceStr, str),
      ...replaceTask,
      changeName,
      dest(toPath)
    )
  }
}

/**
 * CSS Task
 * @param entry 入口文件全路径
 * @param toPath 生成文件全路径
 * @param replaceExt 被解析替换的后缀名
 * @param toExt 生成目标后缀名,若定义该变量，则生成该后缀，若没有定义，按照生成平台判断生成目标后缀
 */
const styleTransform = (entry, toPath, replaceExt, toExt) => {
  if (!entry || !toPath) {
    throw Error(`\n Error Message - ${PLUGIN_NAME}：\n entry path or dist path can not be empty !`)
  }

  const srcPath = [`${entry}/**/*.${replaceExt}`]
  const ext = toExt || (platform === 'wx' ? 'wxss' : 'jxss')
  const replaceTask = []
  replaceExt === 'scss' && replaceTask.push(sass().on('error', sass.logError))

  return () => {
    return pipeline(
      src(srcPath),
      ...replaceTask,
      base64({ extensions: ['ttf'] }),
      postcss([autoprefixer()]),
      cssnano({ discardComments: { removeAll: true } }),
      rename(toPath => { toPath.extname = `.${ext}` }),
      dest(toPath)
    )
  }
}

const copyNoChange = (entry, toPath) => {
  return function () {
    return src(entry)
      .pipe(dest(toPath))
  }
}
module.exports = { htmlTransform, jsTransform, styleTransform, copyNoChange }