import React from 'react';
 import { useFormik } from 'formik';
 import * as yup from 'yup';
 import Button from '@mui/material/Button';
 import TextField from '@mui/material/TextField';
 import { useCallback, useMemo, useRef, useState } from 'react'
import { MapContainer, Marker, Popup, TileLayer } from 'react-leaflet'
import { width } from '@mui/system';

const center = {
  lat: 51.505,
  lng: -0.09,
}

 const validationSchema = yup.object({
  email: yup
    .string('Enter your email')
    .email('Enter a valid email')
    .required('Email is required'),
  password: yup
    .string('Enter your password')
    .min(8, 'Password should be of minimum 8 characters length')
    .required('Password is required'),
});

  const BoxForm = () => {
  const formik = useFormik({
    initialValues: {
    },
    validationSchema: validationSchema,
    onSubmit: (values) => {
      alert(JSON.stringify(values, null, 2));
    },
  });

  return (
    <div>
      <form onSubmit={formik.handleSubmit}>
        <TextField
          id="name"
          name="name"
          label="Name der Station"
          value={formik.values.name}
          onChange={formik.handleChange}
          error={formik.touched.name && Boolean(formik.errors.name)}
          helperText={formik.touched.name && formik.errors.name}
        />
        <br/>
        <br/>
        <TextField
          id="password"
          name="password"
          label="Password"
          value={formik.values.password}
          onChange={formik.handleChange}
          error={formik.touched.password && Boolean(formik.errors.password)}
          helperText={formik.touched.password && formik.errors.password}
        />
        <br/>
        <br/>
        <Button color="primary" variant="contained" type="submit">
          Submit
        </Button>
      </form>
    </div>
  );
 };

 function DraggableMarker() {
  const [position, setPosition] = useState(center)
  const markerRef = useRef(null)
  const eventHandlers = useMemo(
    () => ({
      dragend() {
        const marker = markerRef.current
        if (marker != null) {
          setPosition(marker.getLatLng())
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
    constructor(props){
      super(props);
      this.state = {
      };
    };
  
    
  
    render() {
      return (
        <div style={{textAlign: "center"}}>
          <h1>Create a Box: </h1>
          <BoxForm></BoxForm>
          <div >
          <MapContainer center={center} zoom={13} style={{ height: "40vh" , width: "40vw"}}>
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <DraggableMarker />
    </MapContainer>
          </div>
          </div>
          

          
       
       
      )}
  }
  
  export default CreateBox