import { useState, useEffect } from "react";
import options from '../helpers/labels';
import { Grid, Tab, Box, Button, Autocomplete, TextField } from "@mui/material";


function ValidationForm(props) {
    function handleInputChange(event, value) {
        console.log(value);
        props.setBird(value)
      }

  return <div>

    <Autocomplete
    freeSolo
    id="combo-box-demo"
    options={options}
    value = {props.bird}
    sx={{ width: 300 }}
    onInputChange= {handleInputChange}
    renderInput={(params) => <TextField {...params} label="Correct bird" />}
  />


  </div>


}


export default ValidationForm