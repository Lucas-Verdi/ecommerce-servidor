const CryptoJS = require('crypto-js')

const key = 'fJ7#yM1(xY6#jR6:'

function decrypt(data) {
    let bytes = CryptoJS.AES.decrypt('U2FsdGVkX18l2LEVXgn369r7eGpUTFUdNL2PGbVebZlpj8wZwVVExvZjX862EDr/WSdRKLSDkexA1xoAhGdBrw', key);
    let originalText = bytes.toString(CryptoJS.enc.Utf8);
    return originalText
}
module.exports = decrypt