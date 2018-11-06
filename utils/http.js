const rp = require('request-promise')

module.exports = {
  httpGet(url, body) {
    return rp({
      uri: url,
      qs: body,
      json: true,
      headers: {
        'User-Agent': 'Request-Promise'
      }
    })
  },
  httpPost(url, body) {
    return rp({
      method: 'POST',
      uri: url,
      form: body,
      json: true
    })
  }
}