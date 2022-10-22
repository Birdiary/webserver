const axios = require('axios');
//const config = require('./config.json');
const _env = {
    api: config.apiUrl // eslint-disable-line
}

function getStation(id, movements) {
    var _url = _env.api + '/station/' + id + "?movements=" + movements;
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


function getMovement() {
    return axios.get(_env.api + '/movement');
}

function sendValdation(station_id, movement_id, validation){
    var _url = _env.api + "/validate/" + station_id + "/" + movement_id
    return axios.put(_url, validation);
}

module.exports = {
    getStation : getStation,
    sendStation : sendStation,
    getStations : getStations,
    getMovement : getMovement,
    sendValidation : sendValdation,
    
};