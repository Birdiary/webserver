import L from 'leaflet';
import birdHouseBlue from './icons/bird-house-green-with-bird.svg'
import birdHouseBlackBird from './icons/bird-house-black-with-bird.svg'
import birdHouseGreen from './icons/bird-house-green.svg'
import birdHouseBlack from './icons/bird-house-black.svg'

const iconGreen = new L.Icon({
    iconUrl: birdHouseGreen,
    iconRetinaUrl: birdHouseGreen,
    iconAnchor: null,
    popupAnchor: [0, 0],
    shadowUrl: null,
    shadowSize: null,
    shadowAnchor: null,
    iconSize: [50,70],
});


const iconBlack = new L.Icon({
    iconUrl: birdHouseBlack,
    iconRetinaUrl: birdHouseBlack,
    iconAnchor: null,
    popupAnchor: [0, 0],
    shadowUrl: null,
    shadowSize: null,
    shadowAnchor: null,
    iconSize: [50,70],
});


const iconWithBird = new L.Icon({
    iconUrl: birdHouseBlue,
    iconRetinaUrl: birdHouseBlue,
    iconAnchor: null,
    popupAnchor: [0, 0],
    shadowUrl: null,
    shadowSize: null,
    shadowAnchor: null,
    iconSize: [50,70],
});

const iconBlackWithBird = new L.Icon({
    iconUrl: birdHouseBlackBird,
    iconRetinaUrl: birdHouseBlackBird,
    iconAnchor: null,
    popupAnchor: [0, 0],
    shadowUrl: null,
    shadowSize: null,
    shadowAnchor: null,
    iconSize: [50,70],
});

export { iconGreen, iconBlack, iconWithBird, iconBlackWithBird };