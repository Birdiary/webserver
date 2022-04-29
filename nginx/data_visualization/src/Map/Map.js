// export default OwnMap
import React from 'react'
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
// icon creation
import L from 'leaflet'
import requests from '../helpers/requests'
import { Button } from '@mui/material';


import { useNavigate, Link } from 'react-router-dom'; 
export let map;


class OwnMap extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            stations :[]
        };
    };

    componentDidMount(){
        map= this.refs.map;
        this.getStations()
    };


    getStations () {
        let self = this;
        let stations = [];
        requests.getStations()
        .then ( ( res ) => {
           
            stations= res.data;            
            console.log(stations)
            this.setState({
                            stations: stations
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
                {this.state.stations.map((marker, i) => {
                    return <Marker  key={"marker" + i}
                        position={[marker.location.lat, marker.location.lng ? marker.location.lng : marker.location.lon]}>                 
                        <Popup minWidth={90}>
                        <span >
                          Name der Station: {marker.name}
                        </span>
                        <br/>
                        <Button component={Link} to={"/view/station/"+ marker.station_id}>Beobachte Station</Button>
                      </Popup> </Marker>
                })}

            </MapContainer>
        );
    }
}

export default OwnMap