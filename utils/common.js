module.exports = {
  hexstring2btye(str) {
    let pos = 0;
    let len = str.length;
    if (len % 2 != 0) {
      return null;
    }
    len /= 2;
    let hexA = new Array();
    for (let i = 0; i < len; i++) {
      let s = str.substr(pos, 2);
      let v = parseInt(s, 16);
      hexA.push(v);
      pos += 2;
    }
    return hexA;
  },
  decodeCraneHexstring(bytes) {
    if (bytes.length < 7) {
      return "0";
    } else {
      const datas = bytes.splice(1, 6);
      const startIdx = datas.findIndex(itm => itm != 10);
      if (startIdx >= 0) {
        let result = "";
        for (var i = startIdx; i < datas.length; i++) {
          let d = datas[i];
          if (d == 11) {
            result += "-";
          } else if (d > 127) {
            result += d - 128 + ".";
          } else {
            result += "" + d;
          }
        }
        return result.toString();
      } else {
        return "0";
      }
    }
  }
};
