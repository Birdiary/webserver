// export default OwnMap
import React from 'react'
import { MapContainer, TileLayer, Marker, Polyline } from 'react-leaflet'
// icon creation
import L from 'leaflet'
import requests from '../helpers/requests'
export let map;

var greenIcon = new L.Icon({
    iconUrl: 'https://cdn.rawgit.com/pointhi/leaflet-color-markers/master/img/marker-icon-green.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});


var redIcon = new L.Icon({
    iconUrl: 'https://cdn.rawgit.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});

class OwnMap extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            boxes :[]
        };
    };

    componentDidMount(){
        map= this.refs.map;
        this.getBoxes()
    };


    getBoxes () {
        let self = this;
        let boxes = [];
        requests.getBoxes()
        .then ( ( res ) => {
            boxes= res;
                        this.setState({
                            boxes: boxes
                        })

        })
        .catch ( ( res ) => console.log(res))
    }



    render() {
        const position = [51.9688129, 7.5922197];
        return (
            <MapContainer style={{ height: "90vh" }} center={position} zoom={15} ref="map" >
                <TileLayer
                    attribution='&amp;copy <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                {/* Map markers on the Map,if marker was clicked turn green */}
                {this.state.boxes.map((marker, i) => {
                    return <Marker value={marker.id} onClick={this.handleClickMarker} key={"marker" + i}
                        icon={ // if clause that checks if the marker is selected
                            this.state.selectedMarker === marker.properties.time ? greenIcon : redIcon
                        } position={[marker.location.lat, marker.position.lon]} />
                })}

            </MapContainer>
        );
    }
}

export default OwnMap