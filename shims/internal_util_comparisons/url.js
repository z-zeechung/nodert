
const url = require('url');

module.exports = {
    isURL(o){
        return url.URL && o instanceof url.URL;
    }
}