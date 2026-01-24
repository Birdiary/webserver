// export default OwnMap
import React from 'react'
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
// icon creation
import requests from '../helpers/requests'
import { Button, Grid, Dialog, AppBar, IconButton, Toolbar, Divider } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import language from '../languages/languages';
import ApexChart from './PieChart';
import ReactPlayer from 'react-player';
import { getStationIcon, ICON_STATE } from '../helpers/icon';

import { useNavigate, Link } from 'react-router-dom';
import { LegendCard, LegendInfoCard } from './Legend/Legend';


class OwnMap extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      stations: [],
      open: false,
      legendCardOpen: true,
      infoCardOpen: true,
      showAllStations: false
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

  handleCloseLegendCard = () => {
    this.setState({ legendCardOpen: false });
  };

  handleCloseInfoCard = () => {
    this.setState({ infoCardOpen: false });
  };


  parseDate = (value) => {
    const timestamp = Date.parse(value);
    return Number.isNaN(timestamp) ? null : timestamp;
  };


  getStationLastDataTime = (station) => {
    const timestamps = [];
    if (station.lastEnvironment && station.lastEnvironment.date) {
      const parsed = this.parseDate(station.lastEnvironment.date);
      if (parsed !== null) {
        timestamps.push(parsed);
      }
    }
    if (station.lastMovement && station.lastMovement.start_date) {
      const parsed = this.parseDate(station.lastMovement.start_date);
      if (parsed !== null) {
        timestamps.push(parsed);
      }
    }
    if (station.lastFeedStatus && station.lastFeedStatus.date) {
      const parsed = this.parseDate(station.lastFeedStatus.date);
      if (parsed !== null) {
        timestamps.push(parsed);
      }
    }
    if (timestamps.length === 0) {
      return null;
    }
    return Math.max(...timestamps);
  };


  isStationActive = (station) => {
    const lastDataTime = this.getStationLastDataTime(station);
    if (!lastDataTime) {
      return false;
    }
    const threshold = new Date();
    threshold.setMonth(threshold.getMonth() - 3);
    return lastDataTime >= threshold.getTime();
  };


  toggleShowAllStations = () => {
    this.setState((prevState) => ({ showAllStations: !prevState.showAllStations }));
  };



  render() {
    const stationsToDisplay = this.state.showAllStations ? this.state.stations : this.state.stations.filter(this.isStationActive);
    const hiddenStationCount = this.state.stations.length - stationsToDisplay.length;
    const bounds = [[
      48.87194147722911,
      5.943603515625

    ],
    [52.415822612378776,
      9.810791015625,

    ]]
    return (
      <Grid container>
        <Grid item xs={this.state.open ? 0 : 12} md={this.state.open ? 0 : 12} lg={this.state.open ? 8 : 12} style={{ position: "relative" }}>
          {this.state.open ? "" :
            <Button variant="contained" style={{ top: 10, right: 10, position: "absolute", zIndex: "5000", backgroundColor: "orange" }} onClick={this.handleClickOpen} >
              {language[this.props.language]["map"]["statistics"]}
            </Button>}
          <div className="map-with-overlays">
          <MapContainer className="map-with-overlays__map" bounds={bounds} zoom={15}>

            <TileLayer
              attribution='&amp;copy <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            {/* Map markers on the Map,if marker was clicked turn green*/}
            {stationsToDisplay.map((marker, i) => {
              let environment = false
              let movement = false
              let feed = false
              if (marker.lastEnvironment) {
                environment = true
              }
              let birdName = ""
              if (marker.lastMovement) {
                movement = true
                let detections = marker.lastMovement.detections
                if (detections.length > 0) {
                  if (detections[0].germanName) {
                    birdName = detections[0].germanName
                  }
                  else {
                    birdName = detections[0].latinName
                  }
                }
              }
              if (marker.lastFeedStatus) {
                feed = true;
              }
              let now = new Date(Date.now())
              const envRecent = environment && (now - new Date(marker.lastEnvironment.date)) < 86400000
              const movementRecent = movement && (now - new Date(marker.lastMovement.start_date)) < 259200000
              let iconState = ICON_STATE.OFFLINE
              if (envRecent && movementRecent) {
                iconState = ICON_STATE.ENVIRONMENT_BIRD
              } else if (envRecent) {
                iconState = ICON_STATE.ENVIRONMENT
              } else if (movementRecent) {
                iconState = ICON_STATE.BIRD
              }
              const icon = getStationIcon(iconState, marker.stationSoftware || marker.software)

              return <Marker key={"marker" + i}
                position={[marker.location.lat, marker.location.lng ? marker.location.lng : marker.location.lon]}
                icon={icon}>
                <Popup minWidth={90}>
                  <div style={{ textAlign: "center" }}>
                    <span >
                      Station: <b>{marker.name}</b>
                    </span>
                  </div>
                  <br />

                  {environment ?
                    <div> {marker.lastEnvironment.date ? <span> {language[this.props.language]["map"]["lastEnvironment"]}{marker.lastEnvironment.date.split(".")[0]} <br></br> </span> : ""}
                      <span>
                        {language[this.props.language]["stations"]["temperature"]}{marker.lastEnvironment.temperature} <br />
                        {language[this.props.language]["stations"]["humidity"]}{marker.lastEnvironment.humidity}
                        {marker.lastEnvironment.airpressure ? <span><br />{language[this.props.language]["stations"]["pressure"]}{marker.lastEnvironment.airpressure} </span> : ""}
                        {marker.lastEnvironment.illuminance ? <span> <br />{language[this.props.language]["stations"]["illuminance"]}{marker.lastEnvironment.illuminance} </span> : ""}
                      </span>
                    </div>
                    : ""}
                  <Divider />
                  {movement ?
                    <span> {language[this.props.language]["map"]["lastMovement"]}{marker.lastMovement.start_date.split(".")[0]} <br></br>
                      {marker.lastMovement.video != "pending" ? <ReactPlayer playsinline url={marker.lastMovement.video} loop={true} controls={true} width="100" height="100" style={{ aspectRatio: 1 }} playing={true} /> : ""}
                      {language[this.props.language]["stations"]["species"]}{birdName != "" ? birdName : language[this.props.language]["table"]["noBird"]}
                    </span>
                    : ""}
                  {feed ?
                    <div>
                      <Divider />
                      {marker.lastFeedStatus.date ? <span> {language[this.props.language]["map"]["lastFeedStatus"]}{marker.lastFeedStatus.date.split(".")[0]} <br></br> </span> : ""}
                      {<span> {language[this.props.language]["map"]["level"]}{marker.lastFeedStatus.silolevel + " %"} <br /> </span>}
                    </div> : ""
                  }
                  <br />
                  <div style={{ textAlign: "center" }}>
                    <Button component={Link} to={"/view/station/" + marker.station_id}>{language[this.props.language]["map"]["inspect"]}</Button>
                  </div>
                </Popup> </Marker>
            })}
          </MapContainer>
            <LegendCard
              language={this.props.language}
              open={this.state.legendCardOpen}
              onClose={this.handleCloseLegendCard}
            />
            <LegendInfoCard
              language={this.props.language}
              open={this.state.infoCardOpen}
              showAllStations={this.state.showAllStations}
              hiddenStationCount={hiddenStationCount}
              onToggleShowAll={this.toggleShowAllStations}
              onClose={this.handleCloseInfoCard}
            />
          </div>
        </Grid>
        {this.state.open ?
          <Grid item xs={this.state.open ? 12 : 0} md={this.state.open ? 12 : 0} lg={this.state.open ? 4 : 0} style={{ maxHeight: "calc(100vh - (5.25rem + 64px))" }}>
            <AppBar sx={{ position: 'relative' }} style={{ backgroundColor: "orange" }} >
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

            <ApexChart language={this.props.language} />

          </Grid> : ""}
      </Grid>


    );
  }
}

export default OwnMap