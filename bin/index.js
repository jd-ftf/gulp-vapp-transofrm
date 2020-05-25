const styleTransform = require('../lib/styleHandler')
const htmlTransform = require('../lib/htmlHandler')
const jsTransform = require('../lib/jsHandler')
const copyNoChange = require('../lib/copy')

module.exports = { htmlTransform, jsTransform, styleTransform, copyNoChange }