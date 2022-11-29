// export default OwnMap
import React from 'react'
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
// icon creation
import L, { icon } from 'leaflet'
import requests from '../helpers/requests'
import { Button, Grid, Dialog, AppBar, IconButton, Toolbar, Divider } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import language from '../languages/languages';
import ApexChart from './PieChart';
import ReactPlayer from 'react-player';
import {  iconBlack, iconGreen, iconWithBird  } from '../helpers/icon';

import { useNavigate, Link } from 'react-router-dom';
import Legend from './Legend/Legend';


class OwnMap extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      stations: [],
      open: false,
      map: null,
      legendOpen : true
    };
  };


  componentDidMount() {
    this.getStations()
  };


  getStations() {
    let self = this;
    let stations = [];
    requests.getStations()
      .then((res) => {

        stations = res.data;
        //console.log(stations)
        this.setState({
          stations: stations
        })

      })
      .catch((res) => console.log(res))
  }

  handleClickOpen = () => {
    this.setState({ open: true });
  };

  handleClose = () => {
    this.setState({ open: false });
  };

  handleCloseLegend = () => {
    this.setState({ legendOpen: false });
  };


  setMap =(map) =>{
    this.setState({ map });
  }



  render() {
    const bounds = [[
      48.87194147722911,
      5.943603515625

    ],
    [52.415822612378776,
      9.810791015625,

    ]]
    return (
      <Grid container>
        <Grid item xs={this.state.open ? 0:12} md ={this.state.open? 0:12}  lg={this.state.open? 8: 12} style={{position:"relative"}}>
        {this.state.open ? "":
        <Button variant="contained" style={{top: 10, right:10, position:"absolute", zIndex:"5000", backgroundColor: "orange"}} onClick={this.handleClickOpen} >
            {language[this.props.language]["map"]["statistics"]}
        </Button> }
        <MapContainer style={{ height: "calc(100vh - (2.5rem + 64px))" }} bounds={bounds} zoom={15}  whenCreated={this.setMap} >

          <TileLayer
            attribution='&amp;copy <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {/* Map markers on the Map,if marker was clicked turn green*/}
          {this.state.stations.map((marker, i) => {
            let environment = false
            let movement = false
            if(marker.lastEnvironment){
              environment = true
            }
            let birdName= ""
            if(marker.lastMovement){
              movement = true
              let detections= marker.lastMovement.detections
              if(detections.length>0){
                if(detections[0].germanName){
                  birdName= detections[0].germanName
                }
                else{
                  birdName= detections[0].latinName
                }
              }
            }
            let now = new Date(Date.now())
            let icon = null
            if (environment && (now - new Date(marker.lastEnvironment.date)) < 86400000 ){
                if (movement &&(now - new Date(marker.lastMovement.start_date)) < 86400000 ){
                    icon = iconWithBird
                }
                else{
                  icon = iconGreen
                }
            }
            else{
              icon = iconBlack
            }

            return <Marker key={"marker" + i}
              position={[marker.location.lat, marker.location.lng ? marker.location.lng : marker.location.lon]} 
              icon={ icon}>
              <Popup minWidth={90}>
                <div style={{textAlign: "center"}}>
                <span >
                  Station: <b>{marker.name}</b>
                </span>
                </div>
                <br />

                {environment? <span> {language[this.props.language]["map"]["lastEnvironment"]}{marker.lastEnvironment.date.split(".")[0]} <br></br>
                {language[this.props.language]["stations"]["temperature"]}{marker.lastEnvironment.temperature} <br/>
                {language[this.props.language]["stations"]["humidity"]}{marker.lastEnvironment.humidity}
                </span>
                :""} 
                <Divider />
                {movement? 
                <span> {language[this.props.language]["map"]["lastMovement"]}{marker.lastMovement.start_date.split(".")[0]} <br></br>
                {marker.lastMovement.video != "pending" ? <ReactPlayer playsinline url={marker.lastMovement.video} loop={true} controls={true} width="100" height="100" style={{ aspectRatio: 1 }} playing={true} />: ""}
                {language[this.props.language]["stations"]["species"]}{birdName != "" ? birdName : language[this.props.language]["table"]["noBird"]}
                </span>
                :""}
                <br />
                <div style={{textAlign: "center"}}>
                <Button component={Link} to={"/view/station/" + marker.station_id}>{language[this.props.language]["map"]["inspect"]}</Button>
                </div>
              </Popup> </Marker>
          })}
          <Legend map={this.state.map} language={this.props.language} open ={this.state.legendOpen}/>
        </MapContainer>
        {this.state.legendOpen?
        <IconButton
                color="inherit"
                onClick={this.handleCloseLegend}
                aria-label="close"
                style={{position: "absolute",right: "10px", bottom: "280px", zIndex: 2000}}
              >
                <CloseIcon />
              </IconButton>: ""}
        </Grid>
        {this.state.open? 
        <Grid item xs={this.state.open ? 12:0} md ={this.state.open? 12:0} lg={this.state.open? 4: 0} style={{maxHeight: "calc(100vh - (2.5rem + 64px))"}}>
        <AppBar sx={{ position: 'relative' }} style={{backgroundColor : "orange"}} >
            <Toolbar>
              <IconButton
                edge="start"
                color="inherit"
                onClick={this.handleClose}
                aria-label="close"
              >
                <CloseIcon />
              </IconButton>
            </Toolbar>
          </AppBar>
          <h1 style={{ textAlign: "center", color: "darkorange", fontFamily: "Helvetica" }}> {language[this.props.language]["dashboard"]["header"]}</h1>

          <ApexChart language={this.props.language}/>

        </Grid> : ""}
      </Grid>


    );
  }
}

export default OwnMap