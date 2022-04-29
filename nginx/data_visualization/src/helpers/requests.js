const axios = require('axios');
//const config = require('./config.json');
const _env = {
    api: config.apiUrl // eslint-disable-line
}

function getStation(id) {
    var _url = _env.api + '/station/' + id;
    //var _url = "https://wiediversistmeingarten.org/api/station/4a936912-65db-475d-bcd6-9ee292079830"
    return axios.get(_url);
}

function getStations() {
    return axios.get(_env.api + '/station');
}

function sendStation(body) {
    var _url = _env.api + '/station';
    return axios.post(_url, body);
}



module.exports = {
    getStation : getStation,
    sendStation : sendStation,
    getStations : getStations
    
};