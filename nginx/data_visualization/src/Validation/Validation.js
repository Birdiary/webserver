import { useState, useEffect } from "react";
import { useParams } from 'react-router-dom';
import requests from "../helpers/requests";
import ReactPlayer from 'react-player'
import ReactAudioPlayer from 'react-audio-player';
import { Grid, Tab, Box, Button, Snackbar, Alert } from "@mui/material";
import BasicTable from "../Station/visualization/Table";
import language from "../languages/languages";
import ValidationForm from "./ValidationForm";


function Validation(props) {
  const [data, setData] = useState("");
  const [bird, setBird] = useState("");
  const [open, setOpen] = useState(false);


  useEffect(() => {
    getMovement();


  }, [])

  const handleClick = () => {
    setOpen(true);
  };

  const handleToClose = (event, reason) => {
    if ("clickaway" == reason) return;
    setOpen(false);
  };


  const getMovement = () => {
    requests.getMovement()
      .then((res) => { 
        var data=res.data
      setData(data); 
      //console.log(res); 
      });
    }

  const sendValidation = () => {
    let validation = {validation : {}}
    validation.validation.latinName = bird
    requests.sendValidation(data.station_id, data.mov_id, validation)
    handleClick();
    getMovement();
    setBird("");
    
  }



  return <div>
{data?
    <Grid container spacing={4}>
                    <Grid item lg={8}>
                      {data.video == "pending" ? < div><p>{language[props.language]["stations"]["wait1"]}<br/>  </p> <Button variant="contained" onClick={() => { getMovement() }} style={{ margin: "15px" }}>Refresh</Button></div>
                      :
                      <ReactPlayer url={data.video} loop={true} controls={true} width={"100%"} height="70vh" /> }
                    </Grid>
                    <Grid item lg={4}>

                      <h4>{language[props.language]["stations"]["audio"]}</h4>
                      <ReactAudioPlayer src={data.audio} controls />
                      <h4>{language[props.language]["stations"]["weight"]}</h4>
                      <p> {data.weight.toFixed(0) + " gramm"} </p>
                      <h4>{language[props.language]["stations"]["species"]}</h4>
                      <BasicTable birds={data.detections} finished={data.video} getStation={event => getMovement(event)} language={props.language}></BasicTable>
                     <br></br> 
                      <ValidationForm setBird={setBird} bird={bird}/>
                      <br></br>
                      <Button variant="contained" onClick={sendValidation}>Send Validation</Button>
                    </Grid>
                  </Grid> : ""}
                  <Snackbar open={open} onClose={handleToClose} autoHideDuration={6000} >
  <Alert severity="success" onClose={handleToClose} sx={{ width: '100%' }}>
    Validation send!
  </Alert>
</Snackbar>
  </div>


}


export default Validation