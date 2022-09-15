import React from 'react';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Autocomplete from '@mui/material/Autocomplete';
import requests from '../helpers/requests'
import { useCallback, useMemo, useRef, useState } from 'react'
import { MapContainer, Marker, Popup, TileLayer, useMapEvents, } from 'react-leaflet'
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import { blue } from '@mui/material/colors';
import Fab from '@mui/material/Fab';
import CheckIcon from '@mui/icons-material/Check';
import HourglassTopIcon from '@mui/icons-material/HourglassTop';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';
import './CreateStation.css';
import { Link } from 'react-router-dom';
import language from '../languages/languages';
import L from "leaflet";

const center = {
  lat: 51.9606649,
  lng: 7.6261347,
}








function DraggableMarker({ position, handler }) {
  const markerRef = useRef(null)
  const eventHandlers = useMemo(
    () => ({
      dragend() {
        const marker = markerRef.current
        if (marker != null) {
          handler(marker.getLatLng())
        }
      },
    }),
    [],
  )


  return (
    <Marker
      draggable={true}
      eventHandlers={eventHandlers}
      position={position}
      ref={markerRef}>
      <Popup minWidth={90}>
        <span >
          {JSON.stringify(position)}
        </span>
      </Popup>
    </Marker>
  )
}

class CreateStation extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      position: center,
      mail: [],
      open: false,
      finished: false,
      checked: false,
      senseboxChecked: false,
      senseboxCreated: false,
      name: ""
    };
    this.handler = this.handler.bind(this)
  }



  handler(value) {
    this.setState({
      position: value,
    })
  }

  handleChange = (event) => {
    var value = event.target.value
    this.setState({ name: value });
  };

  handlePositionChange = (event) => {
    var value = JSON.parse(event.target.value)
    this.setState({ position: value });
  };

  handleMailChange = (event, value) => {
    this.setState({ mail: value });
  };

  handleChecked = (event) => {
    console.log(event.target.checked)
    this.setState({ checked: event.target.checked });
  };

  handleSenseboxChecked = (event) => {
    console.log(event.target.checked)
    this.setState({ senseboxChecked: event.target.checked });
  };

  sendData = () => {
    const self = this;
    self.setState({ open: true })

    var payload = {
      "name": this.state.name,
      "location": this.state.position,
      "mail": { "adresses": this.state.mail },
      "createSensebox": this.state.senseboxChecked
    }
    console.log(payload)
    requests.sendStation(payload)
      .then(function (res) {
        var id = res.data.id
        console.log(res)
        console.log(id)
        if (res.data.sensebox_id != '') {
          var createdSensebox = true;
        }
        self.setState({ id: id, finished: true, senseboxCreated: createdSensebox })
      })

  }



  render() {
    const self = this
    return (
      <div style={{ textAlign: "center" }}>
        <h1>{language[this.props.language]["createStation"]["title"]} </h1>
        <TextField style={{ width: "50vw" }}
          id="name"
          name="name"
          label={language[this.props.language]["createStation"]["name"]}
          value={this.state.name}
          onChange={this.handleChange}
        />
        <br />
        <br />
        <Autocomplete style={{ width: "50vw", display: "inline-block" }}
          onChange={this.handleMailChange}
          multiple
          id="multiple-limit-tags"
          freeSolo={true}
          options={[]}
          renderInput={(params) => (
            <TextField {...params} variant="outlined" label={language[this.props.language]["createStation"]["mail"]} placeholder={language[this.props.language]["createStation"]["mailHelper"]} />
          )}
        />
        <br />
        <br />
        <TextField style={{ width: "50vw" }}
          id="postion"
          name="position"
          label={language[this.props.language]["createStation"]["position"]}
          value={JSON.stringify(this.state.position)}
          onChange={this.handlePositionChange}
        />
        <br />
        <br />


        <div >
          <MapContainer center={center} zoom={13} style={{ height: "50vh", width: "50vw", display: "inline-block" }}
            whenReady={(map) => {
              console.log(map);
              map.target.on("click", function (e) {
                const { lat, lng } = e.latlng;
                const pos = { lat: lat, lng: lng }
                self.setState({ position: pos })
              });
            }}>
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <DraggableMarker position={this.state.position} handler={this.handler} />
          </MapContainer>


        </div>
        <br />
        <br />
        <FormControlLabel style={{ "max-width": "45vw", textAlign: "left" }} control={<Checkbox checked={this.state.checked} onChange={this.handleChecked} />} label={language[this.props.language]["createStation"]["dataPrivacyText"]} />
        <br></br>
        <br />
        <FormControlLabel
          style={{ "max-width": "45vw", textAlign: "left" }}
          control={<Checkbox
            senseboxChecked={this.state.checked}
            onChange={this.handleSenseboxChecked} />}
          label={language[this.props.language]["createStation"]["opensensemapText"]} />
        <br></br>
        <br />
        <Button color="primary" variant="contained" type="submit" onClick={this.sendData} disabled={!this.state.checked}>
          Submit
        </Button>
        <br></br>
        {this.state.checked ? "" : <p>{language[this.props.language]["createStation"]["dataPrivacy"]}</p>}

        <br />
        <br />
        <Dialog
          open={this.state.open}
          aria-labelledby="alert-dialog-title"
          aria-describedby="alert-dialog-description"
        >
          <DialogTitle id="alert-dialog-title">
            {"Erstellen einer Station"}
          </DialogTitle>
          <DialogContent>
            <Box sx={{ m: 1, position: 'relative' }} >
              <Fab
                aria-label="save"
                color="primary"
              >
                {this.state.finished ? <CheckIcon /> : <HourglassTopIcon />}
              </Fab>
              {!this.state.finished && (
                <CircularProgress
                  size={68}
                  sx={{
                    color: blue[500],
                    position: 'absolute',
                    top: -6,
                    left: -6,
                    zIndex: 1,
                  }}
                />
              )}
            </Box>
            {this.state.finished ?
              (this.state.senseboxCreated ?
                <DialogContentText id="alert-dialog-description" style={{ "padding": "10px" }}>
                  {language[this.props.language]["createStation"]["finished"]} <br></br>{this.state.id}<br></br>
                  {language[this.props.language]["createStation"]["senseboxCreated"]}
                </DialogContentText> :
                <DialogContentText id="alert-dialog-description" style={{ "padding": "10px" }}>
                  {language[this.props.language]["createStation"]["finished"]} <br></br>{this.state.id}<br></br>
                  {language[this.props.language]["createStation"]["senseboxNotCreated"]}
                </DialogContentText>) :
              <DialogContentText id="alert-dialog-description" style={{ "padding": "10px" }}>
                {language[this.props.language]["createStation"]["creating"]}
              </DialogContentText>}
          </DialogContent>
          <DialogActions>
            <Button component={Link} to="/view" >{language[this.props.language]["createStation"]["overview"]}</Button>
            <Button component={Link} to={"/view/station/" + this.state.id}>
              {language[this.props.language]["createStation"]["viewStation"]}
            </Button>
          </DialogActions>
        </Dialog>
      </div>





    )
  }
}

export default CreateStation