const { RedoOutlined } = require('@mui/icons-material');
const axios = require('axios');
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


function getSingleMovement(station_id, mov_id) {
    return axios.get(_env.api + '/movement/' + station_id + "/" + mov_id);
}


function sendValdation(station_id, movement_id, validation){
    var _url = _env.api + "/validate/" + station_id + "/" + movement_id
    return axios.put(_url, validation);
}

function searchForSpecies(station_id, species, numberOfMovements, date){
    var query= "?"
    if (species){
            species = species.replace(" ", "_")
        	query += "species=" + species
    }
    if(numberOfMovements){
        if (query.length >1){
            query+= "&"
        }
        query += "movements=" +numberOfMovements
    }
    if(date){
        if (query.length >1){
            query+= "&"
        }
        query += "date=" +date
    }
    var _url = _env.api + "/movement/" + station_id
    if (query.length >1){
        _url+= query
    }
    return axios.get(_url)
    
}

function getEnvironment(station_id){
    var _url = _env.api + "/environment/" + station_id
    return axios.get(_url)
}

function getImage(station_id){
    var _url = _env.api + "/imageStatus/" + station_id
    return axios.get(_url)
}
function createImage(station_id, payload){
    var _url = _env.api + "/image/" + station_id
    return axios.post(_url, payload)
}

function getCount(){
    return axios.get(_env.api +"/count")
}

function getStatisitcs(id){
    return axios.get(_env.api +"/statistics/"+id)
}

function returnImageUrl(id){
    var _url = _env.api + "/image/" + id
    return _url
}

module.exports = {
    getStation : getStation,
    sendStation : sendStation,
    getStations : getStations,
    getMovement : getMovement,
    sendValidation : sendValdation,
    searchForSpecies : searchForSpecies,
    getEnvironment : getEnvironment,
    getSingleMovement : getSingleMovement,
    getCount :getCount,
    getStatisitcs: getStatisitcs,
    getImage: getImage,
    returnImageUrl: returnImageUrl,
    createImage: createImage,
};