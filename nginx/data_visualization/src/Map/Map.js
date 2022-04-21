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
           
            boxes= res.data;            
            console.log(boxes)
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
                    return <Marker  key={"marker" + i}
                        position={[marker.location.lat, marker.location.lng ? marker.location.lng : marker.location.lon]}>                 
                        <Popup minWidth={90}>
                        <span >
                          Name der Station: {marker.name}
                        </span>
                        <br/>
                        <Button component={Link} to={"/view/box/"+ marker.box_id}>Beobachte Box</Button>
                      </Popup> </Marker>
                })}

            </MapContainer>
        );
    }
}

export default OwnMap