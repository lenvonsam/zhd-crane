const rp = require('request-promise')

module.exports = {
  httpGet(url, body) {
    return rp({
      uri: url,
      qs: body,
      json: true,
      timeout: 60000,
      headers: {
        'User-Agent': 'Request-Promise',
        PlatformId: 'ZF'
      }
    })
  },
  httpPost(url, body) {
    return rp({
      method: 'POST',
      uri: url,
      body: body,
      json: true,
      timeout: 60000,
      headers: {
        PlatformId: 'ZF',
        'content-type': 'application/json'
      }
    })
  }
}
