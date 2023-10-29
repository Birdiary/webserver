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
import Checkbox from '@mui/material/Checkbox';
import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormControl from '@mui/material/FormControl';
import FormLabel from '@mui/material/FormLabel';
import './CreateStation.css';
import { Link } from 'react-router-dom';
import language from '../languages/languages';
import L from "leaflet";
import CryptoJS from 'crypto-js';

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
      mail: "",
      mailChecked: false,
      open: false,
      finished: false,
      checked: false,
      senseboxChecked: false,
      senseboxCreated: false,
      SSID: "",
      pwd: "",
      type: "observer",
      name: "",
      downloadReady: false,
      DialogText: language[props.language]["createStation"]["creating"],
      rotation: 90,
      time: 5,
      id: "",
      numberVisualExamples: 6,
      detectionThreshold: 0.3,
      deleteMinutes: 20,
      creatingImage : false
    };
    this.handler = this.handler.bind(this)
    this.secretKey = process.env.REACT_APP_SECRET_KEY;
    this.secretIV = process.env.REACT_APP_SECRET_IV;
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
    var value = event.target.value
    this.setState({ mail: value });
  };

  handleSSIDChange = (event, value) => {
    var value = event.target.value
    this.setState({ SSID: value });
  };

  handleRotationChange = (event, value) => {
    var value = event.target.value
    this.setState({ rotation: value });
  };

  handleTimeChange = (event, value) => {
    var value = event.target.value
    this.setState({ time: value });
  };

  handleTypeChange = (event, value) => {
    var value = event.target.value
    this.setState({ type: value });
  };

  handlePwdChange = (event, value) => {
    var value = event.target.value
    this.setState({ pwd: value });
  };

  handledeleteMinutesChange = (event, value) => {
    var value = event.target.value
    this.setState({ deleteMinutes: value });
  };

  handledetectionThresholdChange = (event, value) => {
    var value = event.target.value
    this.setState({ detectionThreshold: value });
  };

  handlenumberVisualExamplesChange = (event, value) => {
    var value = event.target.value
    this.setState({ numberVisualExamples: value });
  };

  handleChecked = (event) => {
    ////console.log(event.target.checked)
    this.setState({ checked: event.target.checked });
  };

  handleSenseboxChecked = (event) => {
    ////console.log(event.target.checked)
    this.setState({ senseboxChecked: event.target.checked });
  };

  handleNotficationsChecked = (event) => {
    //console.log(event.target.checked)
    this.setState({ mailChecked: event.target.checked });
  };

  checkDownload = () => {
    const id = this.state.id;
    const self =this;
    self.setState({ finished: false, downloadReady: false, DialogText: language[this.props.language]["createStation"]["creatingImage"] })
    requests.getImage(id)
    .then(function (res) {
      self.setState({ finished: true, downloadReady: true })
    })
    .catch(function (error) {
      if (error.response) {
        if (error.response.status=404)
        setTimeout(() => {
          self.checkDownload()
        }, 15000);
      }
    });
  }

  startImageAndCheckImage= () =>{
    if(!this.state.creatingImage){
      this.startImageCreation()
      this.setState({creatingImage: true})
    }
    this.checkDownload()
  }

  startImageCreation = () =>{
    //var key = CryptoJS.enc.Hex.parse(this.secretKey)
    //var iv = CryptoJS.enc.Hex.parse(this.secretIV);
    //const SSID = CryptoJS.AES.encrypt(this.state.SSID, key, {iv:iv});
    //const password = CryptoJS.AES.encrypt(this.state.pwd, key, {iv:iv});
    const payload = {
    "wlanCredentials": {
      "SSID": this.state.SSID,
      "password": this.state.pwd
    },
    "rotation": this.state.rotation,
    "time": this.state.time
  }
  console.log(payload)
  requests.createImage(this.state.id, payload)
}

  startDownload = () => {
    const id = this.state.id;
    window.open(requests.returnImageUrl(id), "_blank")
  }

  sendData = () => {
    const self = this;
    self.setState({ open: true })

    var payload = {
      "name": this.state.name,
      "location": this.state.position,
      "type": this.state.type,
      "mail": {
        "adresses": [this.state.mail],
        "notifications": this.state.mailChecked
      },
      // "createSensebox": this.state.senseboxChecked,
    }

    if(this.state.type != "observer"){
      payload.advancedSettings ={deleteMinutes: parseInt(this.state.deleteMinutes), detectionThreshold: parseFloat(this.state.detectionThreshold)}
      if(this.state.type == "exhibit"){
        payload.advancedSettings.numberVisualExamples = parseInt(this.state.numberVisualExamples)
      }
    }

    requests.sendStation(payload)
      .then(function (res) {
        var id = res.data.id
        if (res.data.sensebox_id != '') {
          var createdSensebox = true;
        }
        self.setState({ id: id, finished: true, senseboxCreated: false }) //TODO Change if sensevox Creation works
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
        <TextField style={{ width: "50vw" }}
          id="mail"
          name="mail"
          label={language[this.props.language]["createStation"]["mail"]}
          value={this.state.mail}
          onChange={this.handleMailChange}
        />
        <br />
        <br />
        <FormControlLabel
          style={{ "max-width": "45vw", textAlign: "left" }}
          control={<Checkbox
            notificationsChecked={this.state.checked}
            onChange={this.handleNotficationsChecked} />}
          label={language[this.props.language]["createStation"]["notifications"]} />
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
        <FormControl style={{ width: "50vw" }}>
      <FormLabel id="demo-row-radio-buttons-group-label">{language[this.props.language]["createStation"]["type"]}</FormLabel>
      <span style={{textAlign: 'justify'}}>{language[this.props.language]["createStation"]["typeHelper"]}</span> <br/>
      <RadioGroup
      style={{alignSelf: "center"}} 
        row
        aria-labelledby="demo-row-radio-buttons-group-label"
        name="row-radio-buttons-group"
        value={this.state.type}
      onChange={this.handleTypeChange}
      >
        <FormControlLabel value="observer" control={<Radio />} label="Observer" />
        <FormControlLabel value="test" control={<Radio />} label="Test" />
        <FormControlLabel value="exhibit" control={<Radio />} label="Exhibit" />
      </RadioGroup>
    </FormControl>
    <br/>
    <br/>
        <FormControlLabel style={{ "max-width": "45vw", textAlign: "left" }} control={<Checkbox checked={this.state.checked} onChange={this.handleChecked} />} label={language[this.props.language]["createStation"]["dataPrivacyText"]} />
        <br></br>
        <br />
                {
        /** 
        <FormControlLabel
          style={{ "max-width": "45vw", textAlign: "left" }}
          control={<Checkbox
            senseboxChecked={this.state.checked}
            onChange={this.handleSenseboxChecked} />}
          label={language[this.props.language]["createStation"]["opensensemapText"]} />
        <br></br>
        <br/>
          */}
        <h4>{language[this.props.language]["createStation"]["stationConfig"]}</h4>
        <p style={{ width: "50vw", display: "inline-block" }}>{language[this.props.language]["createStation"]["stationConfigText"]}</p>
        <br></br>
        <TextField style={{ width: "50vw" }}
          id="SSID"
          name="SSID"
          label={language[this.props.language]["createStation"]["ssid"]}
          value={this.state.SSID}
          onChange={this.handleSSIDChange}
        />
        <br />
        <br />
        <TextField style={{ width: "50vw" }}
          id="pwd"
          name="pwd"
          label={language[this.props.language]["createStation"]["pwd"]}
          type="password"
          autoComplete="current-password"
          value={this.state.pwd}
          onChange={this.handlePwdChange}
        />
        <br />
        <br/>
        <TextField style={{ width: "50vw" }}
          id="rotation"
          name="rotation"
          type= "number"
          label={language[this.props.language]["createStation"]["rotation"]}
          value={this.state.rotation}
          onChange={this.handleRotationChange}
        />
        <br />
        <br />
        <TextField style={{ width: "50vw" }}
          id="time"
          name="time"
          type= "number"
          label={language[this.props.language]["createStation"]["time"]}
          value={this.state.time}
          onChange={this.handleTimeChange}
        />
        <br />
        <br />
        {
          this.state.type != "observer" ?
          <div>
          <TextField style={{ width: "50vw" }}
          type= "number"
          id="deleteMinutes"
          name="deleteMinutes"
          label={language[this.props.language]["createStation"]["deleteMinutes"]}
          value={this.state.deleteMinutes}
          onChange={this.handledeleteMinutesChange}
        />
        <br />
        <br />
        <TextField style={{ width: "50vw" }}
          id="detectionThreshold"
          name="detectionThreshold"
          label={language[this.props.language]["createStation"]["detectionThreshold"]}
          value={this.state.detectionThreshold}
          onChange={this.handledetectionThresholdChange}
          helperText={language[this.props.language]["createStation"]["detectionThresholdHelper"]}
          ></TextField>
                  <br />
        <br />
          </div>
          : ""
        }{
          this.state.type == "exhibit" ? 
          <div>
          <TextField style={{ width: "50vw" }}
          type= "number"
          id="numberVisualExamples"
          name="numberVisualExamples"
          label={language[this.props.language]["createStation"]["numberVisualExamples"]}
          value={this.state.numberVisualExamples}
          onChange={this.handlenumberVisualExamplesChange}
          ></TextField>         
          <br />
          <br />
          </div>: ""
        }
        <Button color="primary" variant="contained" type="submit" onClick={this.sendData} disabled={!this.state.checked}>
        {language[this.props.language]["createStation"]["submit"]}
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
                {this.state.DialogText} <a href="https://wiediversistmeingarten.org/api/image" target="_blank">https://wiediversistmeingarten.org/api/image</a>
              </DialogContentText>}
          </DialogContent>
          <DialogActions>
            <Button component={Link} to="/view" >{language[this.props.language]["createStation"]["overview"]}</Button>
            <Button disabled={!this.state.id} onClick={this.startImageAndCheckImage}>{language[this.props.language]["createStation"]["createImage"]}</Button>
            <Button disabled={!this.state.downloadReady} onClick={this.startDownload}>{language[this.props.language]["createStation"]["download"]}</Button>
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