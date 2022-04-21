import React from 'react';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Autocomplete from '@mui/material/Autocomplete';
import requests from '../helpers/requests'
import { useCallback, useMemo, useRef, useState } from 'react'
import { MapContainer, Marker, Popup, TileLayer } from 'react-leaflet'
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
import './CreateBox.css';
import { Link } from 'react-router-dom'; 

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
          handler( marker.getLatLng())
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

class CreateBox extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      position: center,
      mail:[],
      open: false,
      finished:false,
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
    this.setState({ name : value});
  };

  handlePositionChange = (event) => {
    var value = JSON.parse(event.target.value)
    this.setState({ position : value});
  };

  handleMailChange = (event, value) => {
    this.setState({ mail : value});
  };

  sendData = () => {
    const self=this;
    self.setState({ open: true })

    var payload= {
      "name" : this.state.name,
      "location" : this.state.position,
      "mail": {"adresses": this.state.mail}
  }
  requests.sendBox(payload)
    .then(function (res) {
      var id =res.data.id
      console.log(res)
      console.log(id)
      self.setState({ id: id, finished:true })
  })

  }

  render() {
    return (
      <div style={{ textAlign: "center" }}>
        <h1>Create a Box: </h1>
        <TextField style={{width:"50vw"}}
          id="name"
          name="name"
          label="Name der Station"
          value={this.state.name}
          onChange={this.handleChange}
        />
        <br />
        <br />
        <Autocomplete style={{width:"50vw", display: "inline-block"}}
          onChange={this.handleMailChange}
          multiple
          id="multiple-limit-tags"
          freeSolo={true}
          options={[]}
          renderInput={(params) => (
            <TextField {...params} variant="outlined"  label="Zu Benarichtigende Mail Adressen" placeholder='Mail Adresse mit Enter bestätigen'/>
          )}
        />
                <br />
        <br />
        <TextField style={{width:"50vw"}}
          id="postion"
          name="position"
          label="Standort der Station (Gib die Koordinaten ein oder bewege den Marker in der Karte)"
          value={JSON.stringify(this.state.position)}
          onChange={this.handlePositionChange}
        />
        <br />
        <br />

        <div >
          <MapContainer center={center} zoom={13} style={{ height: "50vh", width: "50vw", display: "inline-block" }}>
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <DraggableMarker position={this.state.position} handler={this.handler} />
          </MapContainer>


        </div>
        <br/>
        <br/>
        <Button color="primary" variant="contained" type="submit" onClick={this.sendData}>
          Submit
        </Button>
        <br />
        <br />
        <Dialog
        open={this.state.open}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">
          {"Erstellen einer Box"}
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
        {this.state.finished? <DialogContentText id="alert-dialog-description">
            Die Box wurde erfolgreich erstellt und hat die ID: {this.state.id} 
          </DialogContentText> :
          <DialogContentText id="alert-dialog-description">
          Die Box wird gerade erstellt
        </DialogContentText> }
        </DialogContent>
        <DialogActions>
          <Button component={Link} to="/view" >Go to overview</Button>
          <Button component={Link} to={"/view/box/" + this.state.id}>
            Inspect Box
          </Button>
        </DialogActions>
      </Dialog>
      </div>





    )
  }
}

export default CreateBox