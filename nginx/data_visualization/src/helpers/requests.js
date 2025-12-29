const { RedoOutlined } = require('@mui/icons-material');
const axios = require('axios');
const _env = {
    api: config.apiUrl // eslint-disable-line
}

function authHeaders(token) {
    if (!token) {
        return {};
    }
    return {
        headers: {
            Authorization: `Bearer ${token}`
        }
    };
}

function buildConfig(token, params) {
    const config = authHeaders(token);
    if (params) {
        config.params = params;
    }
    return config;
}

function normalizeMovementParams(arg) {
    const params = {};
    if (typeof arg === 'number') {
        if (arg > 0) {
            params.movements = arg;
        }
        return params;
    }
    if (arg && typeof arg === 'object') {
        const limit = typeof arg.movements === 'number' ? arg.movements : arg.limit;
        const offset = typeof arg.movementsOffset === 'number' ? arg.movementsOffset : arg.offset;
        if (typeof limit === 'number' && limit > 0) {
            params.movements = limit;
        }
        if (typeof offset === 'number' && offset > 0) {
            params.movementsOffset = offset;
        }
        return params;
    }
    return params;
}

function getStation(id, options, token) {
    let authToken = token;
    let movementOptions = options;
    if (typeof options === 'string' && typeof token === 'undefined') {
        authToken = options;
        movementOptions = undefined;
    }
    const params = normalizeMovementParams(movementOptions);
    const config = buildConfig(authToken, Object.keys(params).length ? params : undefined);
    return axios.get(_env.api + '/station/' + id, config);
}

function getStations() {
    return axios.get(_env.api + '/station');
}

function sendStation(body, token) {
    var _url = _env.api + '/station';
    return axios.post(_url, body, authHeaders(token));
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

function getEnvironment(station_id, months){
    var _url = _env.api + "/environment/" + station_id
    if (months){
        _url += "?months=" + months
    }
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

function registerUser(body){
    var _url = _env.api + '/register';
    return axios.post(_url, body);
}

function login(body){
    var _url = _env.api + '/login';
    return axios.post(_url, body);
}

function logout(token){
    var _url = _env.api + '/logout';
    return axios.post(_url, {}, authHeaders(token));
}

function getCurrentUser(token){
    var _url = _env.api + '/me';
    return axios.get(_url, authHeaders(token));
}

function resetPassword(payload, token){
    var _url = _env.api + '/reset-password';
    return axios.post(_url, payload, authHeaders(token));
}

function getMyStations(token, options){
    const params = normalizeMovementParams(options);
    const config = buildConfig(token, Object.keys(params).length ? params : undefined);
    return axios.get(_env.api + '/my-stations', config);
}

function updateStation(stationId, payload, token){
    var _url = _env.api + `/station/${stationId}`;
    return axios.put(_url, payload, authHeaders(token));
}

function claimStation(payload, token){
    var _url = _env.api + '/claim-station';
    return axios.post(_url, payload, authHeaders(token));
}

function deleteStation(stationId, token, deleteData){
    var _url = _env.api + `/station/${stationId}`;
    const config = buildConfig(token, deleteData ? { deleteData: true } : null);
    return axios.delete(_url, config);
}

function deleteMovement(stationId, movementId, token, deleteData){
    var _url = _env.api + `/movement/${stationId}/${movementId}`;
    const config = buildConfig(token, deleteData ? { deleteData: true } : null);
    return axios.delete(_url, config);
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
    registerUser: registerUser,
    login: login,
    logout: logout,
    getCurrentUser: getCurrentUser,
    resetPassword: resetPassword,
    getMyStations: getMyStations,
    updateStation: updateStation,
    claimStation: claimStation,
    deleteStation: deleteStation,
    deleteMovement: deleteMovement,
};