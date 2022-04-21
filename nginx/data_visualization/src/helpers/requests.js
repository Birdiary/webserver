const axios = require('axios');
//const config = require('./config.json');
const _env = {
    api: config.apiUrl // eslint-disable-line
}

function getBox(id) {
    var _url = _env.api + '/box/' + id;
    return axios.get(_url);
}

function getBoxes() {
    return axios.get(_env.api + '/box');
}

function sendBox(body) {
    var _url = _env.api + '/box';
    return axios.post(_url, body);
}



module.exports = {
    getBox : getBox,
    sendBox : sendBox,
    getBoxes : getBoxes
    
};