import { useState, useEffect } from "react";
import options from '../helpers/labels';
import { Grid, Tab, Box, Button, Autocomplete, TextField } from "@mui/material";
import language from "../languages/languages";


function ValidationForm(props) {
    function handleInputChange(event, value) {
        //console.log(value);
        props.setBird(value)
      }

  return <div>

    <Autocomplete
    freeSolo
    id="combo-box-demo"
    options={Object.keys(options)}
    sx={{ width: 300 }}
    onInputChange= {handleInputChange}
    value={props.bird}
    renderInput={(params) => <TextField {...params} label={language[props.language]["validation"]["form"]}/>}
  />


  </div>


}


export default ValidationForm