import { useState, useEffect } from "react";
import { useParams } from 'react-router-dom';
import requests from "../helpers/requests";
import ReactPlayer from 'react-player'
import ReactAudioPlayer from 'react-audio-player';
import { Grid, Tab, Box, Button, Snackbar, Alert, Dialog, DialogActions, DialogTitle, DialogContent, DialogContentText } from "@mui/material";
import BasicTable from "../Station/visualization/Table";
import language from "../languages/languages";
import ValidationForm from "../Validation/ValidationForm";
import options from "../helpers/labels";
import { useNavigate } from "react-router-dom";


function Movement(props) {
  const { id, mov_id } = useParams()
  const [data, setData] = useState("");
  const [bird, setBird] = useState("");
  const [open, setOpen] = useState(false);
  const [text, setText] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false)
  const [counter, setCounter] = useState(5);
  const navigate = useNavigate();

  useEffect(() => {
    counter > 0 && setTimeout(() => changeCounter(counter - 1), 1000);
  }, [counter]);

  useEffect(() => {
    getSingleMovement(id,mov_id);


  }, [])

  const handleClick = () => {
    setOpen(true);
  };

  const handleToClose = (event, reason) => {
    if ("clickaway" == reason) return;
    setOpen(false);
  };
  const handleClose = () => {
    setDialogOpen(false);
  };


  const getSingleMovement = () => {
    requests.getSingleMovement(id, mov_id)
      .then((res) => { 
        var data=res.data
      setData(data); 
      //console.log(res); 
      }).catch(err => {
        // Handle error
        let text = language[props.language]["stations"]["notFound"] + counter
        setText(text)
        setDialogOpen(true)
        changeCounter(counter - 1)
        const myTimeout = setTimeout(routeToHome, 5000)
      })
  }

  function changeCounter(count) {
    setCounter(count)
    let text = language[props.language]["stations"]["notFound"] + counter
    setText(text)
  }


  function routeToHome() {
    navigate("/view")
  }

  const sendValidation = () => {
    let validation = {validation : {}}
    let valBird =  options.validationOptions[bird]
    if (!valBird){
        valBird= {"latinName" : bird, "germanName":""}
    }
    validation.validation = valBird
    requests.sendValidation(data.station_id, data.mov_id, validation)
    valBird.amount=2
    let  newData = data
    let latinName = valBird["latinName"]
    newData["validation"] = {"summary" : {latinName : valBird}}
    setData(newData)

    handleClick();
    
  }

  const sendValidationNone = () => {
    let validation = {validation : {"latinName": "None", "germanName": ""}}
    requests.sendValidation(data.station_id, data.mov_id, validation)
    handleClick();
    
  }



  return <div>
{data?
    <Grid container spacing={4}>
                    <Grid item lg={8}>
                      {data.video == "pending" ? < div><p>{language[props.language]["stations"]["wait1"]}<br/>  </p> <Button variant="contained" onClick={() => { getSingleMovement() }} style={{ margin: "15px" }}>Refresh</Button></div>
                      :
                      <ReactPlayer url={data.video} loop={true} controls={true} width={"100%"} height="70vh" /> }
                    </Grid>
                    <Grid item lg={4}>

                      <h4>{language[props.language]["stations"]["audio"]}</h4>
                      <ReactAudioPlayer src={data.audio} controls />
                      <h4>{language[props.language]["stations"]["weight"]}</h4>
                      <p> {data.weight.toFixed(0) + " gramm"} </p>
                      <h4>{language[props.language]["stations"]["species"]}</h4>
                      <BasicTable birds={data.detections} finished={data.video} getStation={event => getSingleMovement(event)} language={props.language} setBird={setBird} bird={bird} validation={data.validation}></BasicTable>
                     <br></br> 
                      <ValidationForm setBird={setBird} bird={bird} language={props.language}/>
                      <br></br>
                      <Button variant="contained" onClick={sendValidation} style={{marginRight: "5px", marginBottom :"5px"}}>{language[props.language]["validation"]["send"]}</Button>
                      <Button variant="contained" onClick={sendValidationNone} style={{marginRight: "5px", marginBottom :"5px"}}>{language[props.language]["validation"]["noBird"]}</Button>
                    </Grid>
                  </Grid> : ""}
                  <Snackbar open={open} onClose={handleToClose} autoHideDuration={6000} >
  <Alert severity="success" onClose={handleToClose} sx={{ width: '100%' }}>
    Validation send!
  </Alert>
</Snackbar>
<Dialog
      open={dialogOpen}
      onClose={handleClose}
      aria-labelledby="alert-dialog-title"
      aria-describedby="alert-dialog-description"
    >
      <DialogTitle id="alert-dialog-title">
        {"Information"}
      </DialogTitle>
      <DialogContent>
        <DialogContentText id="alert-dialog-description" style={{ "padding": "10px" }}>
          {text}
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Close</Button>
      </DialogActions>
    </Dialog>
  </div>


}


export default Movement