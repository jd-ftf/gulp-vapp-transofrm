const Mock = require('mockjs')

module.exports = query => {
  return Mock.mock({
    'list|1-10': [{
      'id|+1': 1
    }],
    'imgUrl': 'http://localhost:3009/mock/img/book-cli.png'
  })
}