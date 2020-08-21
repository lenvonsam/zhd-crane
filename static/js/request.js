function request(url, params, method = 'post') {
  return new Promise((resolve, reject) => {
    $.ajax({
      method: 'post',
      data: {
        url,
        params,
        method
      },
      url: '/api/proxy',
      success(data) {
        resolve(data)
      },
      error(err) {
        reject(err)
      }
    })
  })
}

function logout() {
  $.ajax({
    method: 'post',
    url: '/api/logout'
  })
}

function getWarehouseName() {
  return new Promise((resolve, reject) => {
    $.ajax({
      method: 'get',
      url: '/api/warehouseName',
      success(data) {
        resolve(data)
      },
      error(err) {
        reject(err)
      }
    })
  })
}
