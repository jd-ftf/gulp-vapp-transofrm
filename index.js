const { src, dest } = require('gulp')
const path = require('path')
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
const preprocess = require("gulp-preprocess")

const PLUGIN_NAME = 'gulp-transform-vapp'

// 平台类型，如果是wx 那么是从京东转微信   如果是jd那么从微信转京东
const platform = process.env.PLATFORM
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
function fileCheck (entry, dirname, ext) {
  const dir = `${entry}/${dirname !== '.' ? dirname : ''}`
  const files = fs.readdirSync(dir).filter(f => f.endsWith(ext))

  let err = {
    dir
  }
  let hasBaseFile = false
  let hasPlatFile = false

  files.forEach(file => {
    if (file.indexOf('.jd' + ext) === -1 && file.indexOf('.wx' + ext) === -1) {
      hasBaseFile = true
      err.fileName = file
    } else {
      hasPlatFile = true
    }
  })

  if (hasPlatFile && hasBaseFile) {
    console.log(`\n Warning Message - ${PLUGIN_NAME}：\n 检测到当前文件夹 --- ${err.dir}  \n 已经存在 ${err.fileName}!`)
  }
}
const htmlTransform = (entry, toPath) => {
  if (!entry || !toPath) {
    throw Error(`\n Error Message - ${PLUGIN_NAME}：\n entry path or dist path can not be empty !`)
  }

  const ext = platform === 'wx' ? 'wxml' : 'jxml'
  const pre = entry + '/**/*.jxml'
  const srcPath = [pre]

  const platFilter = filter([`${entry}/**`, `!${entry}/**/*.${platform === 'wx' ? 'jd' : 'wx'}.jxml`])

  const replaceTask = (htmlReg || []).map(item => {
    return strReplace(item.replaceStr, item.str)
  })

  replaceTask.push(rename(path => {
    const { basename, dirname, extname } = path
    fileCheck(entry, dirname, '.jxml')

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

const jsTransform = (entry, toPath) => {
  if (!entry || !toPath) {
    throw Error(`\n Error Message - ${PLUGIN_NAME}：\n entry path or dist path can not be empty !`)
  }

  const srcPath = [entry + '/**/*.js']
  const replaceStr = platform === 'wx' ? 'jd' : 'wx'
  const str = platform === 'wx' ? 'wx' : 'jd'
  const babelConfig = {
    presets: ['@babel/env']
  }

  const changeName = rename(path => {
    const { basename, dirname, extname } = path
    // 文件检测
    fileCheck(entry, dirname, '.js')

    if (basename.indexOf('.jd') > -1 || basename.indexOf('.wx') > -1) {
      path.basename = basename.replace(basename.indexOf('.jd') > -1 ? '.jd' : '.wx', '')
    }
  })

  const platFilter = filter([`${entry}/**`, `!${entry}/**/*.${platform === 'wx' ? 'jd' : 'wx'}.js`])

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
      babel(babelConfig),
      changeName,
      dest(toPath)
    )
  }
}

const styleTransform = (entry, toPath) => {
  if (!entry || !toPath) {
    throw Error(`\n Error Message - ${PLUGIN_NAME}：\n entry path or dist path can not be empty !`)
  }

  const srcPath = [entry + '/**/*.scss']
  const ext = platform === 'wx' ? 'wxss' : 'jxss'

  return () => {
    return src(srcPath)
      .pipe(sass().on('error', sass.logError))
      .pipe(base64({
        extensions: ['ttf']
      }))
      .pipe(postcss([autoprefixer()]))
      .pipe(cssnano({
        discardComments: { removeAll: true }
      }))
      .pipe(rename(toPath => {
        toPath.extname = `.${ext}`
      }))
      .pipe(dest(toPath))
  }
}

module.exports = { htmlTransform, jsTransform, styleTransform }