const CryptoJS = require('crypto-js')

function decrypt(data) {
    var bytes = CryptoJS.AES.decrypt(data, 'fJ7#yM1(xY6#jR6:');
    var decryptedData = JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
    return decryptedData
}
module.exports = decrypt