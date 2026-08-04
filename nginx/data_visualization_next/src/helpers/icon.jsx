import L from 'leaflet';
import BirdiaryBase from './icons/Birdiary.svg';
import BirdiaryEnvironment from './icons/Birdiary_Environment.svg';
import BirdiaryBird from './icons/Birdiary_Bird.svg';
import BirdiaryEnvironmentBird from './icons/Birdiary_Environment_Bird.svg';
import DuisBirdBase from './icons/DuisBird.svg';
import DuisBirdEnvironment from './icons/DuisBird_Environment.svg';
import DuisBirdBird from './icons/DuisBird_Bird.svg';
import DuisBirdEnvironmentBird from './icons/DuisBird_Environment_Bird.svg';

export const ICON_STATE = Object.freeze({
    OFFLINE: 'offline',
    ENVIRONMENT: 'environment',
    BIRD: 'bird',
    ENVIRONMENT_BIRD: 'environmentBird',
});

const ICON_IMAGE_SOURCES = Object.freeze({
    birdiary: {
        [ICON_STATE.OFFLINE]: BirdiaryBase,
        [ICON_STATE.ENVIRONMENT]: BirdiaryEnvironment,
        [ICON_STATE.BIRD]: BirdiaryBird,
        [ICON_STATE.ENVIRONMENT_BIRD]: BirdiaryEnvironmentBird,
    },
    duisbird: {
        [ICON_STATE.OFFLINE]: DuisBirdBase,
        [ICON_STATE.ENVIRONMENT]: DuisBirdEnvironment,
        [ICON_STATE.BIRD]: DuisBirdBird,
        [ICON_STATE.ENVIRONMENT_BIRD]: DuisBirdEnvironmentBird,
    },
});

export const STATION_ICON_IMAGES = ICON_IMAGE_SOURCES;

const ICON_STATE_VALUES = new Set(Object.values(ICON_STATE));
const DEFAULT_SOFTWARE = 'birdiary';

const createLeafletIcon = (iconUrl) => new L.Icon({
    iconUrl,
    iconRetinaUrl: iconUrl,
    iconAnchor: null,
    popupAnchor: [0, 0],
    shadowUrl: null,
    shadowSize: null,
    shadowAnchor: null,
    iconSize: [54, 74],
});

const ICON_REGISTRY = Object.freeze(
    Object.fromEntries(
        Object.entries(ICON_IMAGE_SOURCES).map(([software, stateMap]) => [
            software,
            Object.fromEntries(
                Object.entries(stateMap).map(([state, src]) => [state, createLeafletIcon(src)])
            ),
        ])
    )
);

export const normalizeStationSoftware = (software) => {
    if (!software) {
        return DEFAULT_SOFTWARE;
    }
    const normalized = software.toString().trim().toLowerCase();
    if (ICON_REGISTRY[normalized]) {
        return normalized;
    }
    return DEFAULT_SOFTWARE;
};

export const getStationIcon = (state = ICON_STATE.OFFLINE, software) => {
    const normalizedSoftware = normalizeStationSoftware(software);
    const icons = ICON_REGISTRY[normalizedSoftware] || ICON_REGISTRY[DEFAULT_SOFTWARE];
    const normalizedState = ICON_STATE_VALUES.has(state) ? state : ICON_STATE.OFFLINE;
    return icons[normalizedState] || icons[ICON_STATE.OFFLINE];
};