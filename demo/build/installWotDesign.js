const download = require('download')
const axios = require('axios')
const chalk = require('chalk')
const path = require('path')
const rimraf = require('rimraf')
const fs = require('fs')

const version = process.argv.slice(2)[0]
const outputPath = path.resolve(__dirname, '../src/wot-design')
let downloadUrl

function getLastestVersion () {
  return new Promise((resolve, reject) => {
    axios.get('https://ftf.jd.com/wot-design-mini/static/public/versions.json').then(res => {
      let data = res.data

      resolve(data[0])
    }).catch(err => {
      reject(err)
    })
  })
}
/**
 * 下载并解压
 * @param {string} url 下载地址
 */
function downloadWotDesign (url) {
  return download(url, outputPath, {
    extract: true,
    strip: 1,
    mode: '666',
    headers: {
      accept: 'application/zip'
    }
  })
}

function downloadVersion () {
  if (version && /\d\.\d.\d/.test(version)) {
    console.log(chalk.cyan(`> 开始下载 Wot Design ${version} 版本（如果不存在该版本，则下载失败）`))
    
    downloadUrl = `https://github.com/jd-ftf/wot-design-mini/releases/download/v${version}/wot-design-v${version}-jd.zip`
    downloadWotDesign(downloadUrl).then(() => {
      console.log(chalk.green(`> Wot Design ${version} 版本下载成功`))
    })
  } else {
    console.log(chalk.cyan(`> 开始获取 Wot Design 最新版`))

    getLastestVersion().then(res => {
      console.log(chalk.cyan(`> 地址获取成功，开始下载最新版本`))
      downloadUrl = `https://github.com/jd-ftf/wot-design-mini/releases/download/v${res}/wot-design-v${res}-jd.zip`

      downloadWotDesign(downloadUrl).then(() => {
        console.log(chalk.green(`> Wot Design 最新版下载成功`))
      }).catch(err => { 
        console.log(chalk.red('Wot Design 小程序组件库下载失败，请重试或者访问 https://ftf.jd.com/wot-design-mini/ 手动下载'))
      })
    }).catch(err => {
      console.log(chalk.red(err))
    })
  }
}

if (fs.existsSync(outputPath)) {
  console.log(chalk.cyan('> 开始删除旧版 Wot Design 小程序组件库'))
  rimraf(outputPath, (err) => {
    if (err) throw err

    console.log(chalk.green('> 旧版 Wot Design 小程序组件库删除成功'))

    downloadVersion()
  })
} else {
  downloadVersion()
}
