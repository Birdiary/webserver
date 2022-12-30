import { Grid, Dialog, DialogActions, Button, Icon, DialogTitle, DialogContent, DialogContentText, IconButton } from "@mui/material"
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import { useState } from "react"
import MovementCard from "./MovementCard"
import language from "../languages/languages"
import "./statisticsView.css"
function getRandom(list) {
  let index = 0
  if (list.length > 20) {
    index = Math.floor((Math.random() * (list.length - 20))) + 20
  }
  else {
    index = Math.floor((Math.random() * list.length))
  }
  return list[index];
}

function StatisticsView(props) {

  const [text, setText] = useState("");
  const [open, setOpen] = useState(false)

  const handleClickOpen = (area) => {
    //console.log(area)
    if (area == "sum") {
      setText(language[props.language]["statistics"]["infoSum"])
    }
    else if (area == "validation") {
      setText(language[props.language]["statistics"]["infoValidation"])
    }
    else if (area == "special") {
      setText(language[props.language]["statistics"]["infoSpecialBirds"])
    }

    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };




  return <div style={{ paddingLeft: "4vw", paddingRight: "4vw" }}>

    <h3 >{language[props.language]["statistics"][props.view]["maxSpecies1"]}{props.data.numberOfMovements} {language[props.language]["statistics"]["maxSpecies2"]} {props.data.numberOfDetections}{language[props.language]["statistics"]["maxSpecies3"]}<br />
      {language[props.language]["statistics"]["the"]} {props.data.maxSpecies.length} {language[props.language]["statistics"]["maxSpecies5"]}
      <IconButton color="primary" aria-label="upload picture" component="span" onClick={() => { handleClickOpen("sum") }} >
        <InfoOutlinedIcon />
      </IconButton></h3>

    <Grid container spacing={2} columns={10} >
      {props.data.maxSpecies.slice(0).reverse().map((bird, i) =>
        <Grid item lg={2}>
          <h5> {language[props.language]["statistics"]["place"]} {i +1}: <br /> {bird.germanName ? bird.germanName : bird.latinName} ({bird.amount})</h5>

          {bird.movements.length > 0 ? <MovementCard language={props.language} movement={getRandom(bird.movements)}></MovementCard> : ""}
        </Grid>
      )}
    </Grid>
    {props.data.numberOfValidatedBirds ?
    <div>
    <h3 >{language[props.language]["statistics"][props.view]["maxValidated"]} {props.data.numberOfValidatedBirds}. <br /> 
    {language[props.language]["statistics"]["the"]} {props.data.maxValidatedBirds.length} {language[props.language]["statistics"]["maxValidated2"]}
    <IconButton color="primary" aria-label="upload picture" component="span" onClick={() => { handleClickOpen("validation") }} >
        <InfoOutlinedIcon />
      </IconButton></h3>
    <Grid container spacing={2} columns={10}>
      {props.data.maxValidatedBirds.slice(0).reverse().map((bird, i) =>
        <Grid item lg={2}>
          <h5> {language[props.language]["statistics"]["place"]} {i+1}: <br /> {bird.germanName ? bird.germanName : bird.latinName} ({bird.sum})</h5>

          {bird.movements.length > 0 ? <MovementCard language={props.language} movement={getRandom(bird.movements)}></MovementCard> : ""}
        </Grid>
      )}
    </Grid> </div>: 
    <h3 >{language[props.language]["statistics"]["noValidated"]}</h3>
    }
    <h3 >{language[props.language]["statistics"]["on"]} {props.data.perDay} {language[props.language]["statistics"][props.view]["maxDay"]} {language[props.language]["statistics"]["the"]} {props.data.maxDay.length} {language[props.language]["statistics"]["maxDay2"]} </h3>
    <Grid container spacing={2} columns={10}>
      {props.data.maxDay.slice(0).reverse().map((bird, i) =>
        <Grid item lg={2}>
          <h5> {language[props.language]["statistics"]["place"]}  {i+1}: {language[props.language]["statistics"]["day"]}  {bird.day} {language[props.language]["statistics"]["with"]}  {bird.sum} {language[props.language]["statistics"]["birds"]}  <br /> 
          {bird.mostBirds.length > 0 ? <span>{language[props.language]["statistics"]["maxDay3"]}  {bird.mostBirds[bird.mostBirds.length - 1].germanName ? bird.mostBirds[bird.mostBirds.length - 1].germanName : bird.mostBirds[bird.mostBirds.length - 1].latinName} ({bird.mostBirds[bird.mostBirds.length - 1].amount}) </span> : ""}</h5>

          {bird.mostBirds[bird.mostBirds.length - 1].movements.length > 0 ? <MovementCard language={props.language} movement={getRandom(bird.mostBirds[bird.mostBirds.length - 1].movements)}></MovementCard> : ""}
        </Grid>
      )}
    </Grid>
    {props.data.specialBirds && props.data.specialBirds.length>0 ?
    <div>
    <h3 >{language[props.language]["statistics"][props.view]["specialBirds"]}
    <IconButton color="primary" aria-label="upload picture" component="span" onClick={() => { handleClickOpen("special") }} >
        <InfoOutlinedIcon />
      </IconButton>
    </h3>
    <Grid container spacing={2} columns={10} >
      {props.data.specialBirds.map((bird, i) =>
        <Grid item lg={2}>
          <h5> {bird.germanName} ({props.data.all[bird.latinName].amount})</h5>

          {bird.movements.length > 0 ? <MovementCard language={props.language} movement={getRandom(bird.movements)}></MovementCard> : ""}
        </Grid>
      )}
    </Grid>
    </div> : ""}
    {props.data.sumEnvironment >0 ?
    <div>
    <h3 >{language[props.language]["statistics"][props.view]["env1"]} {props.data.sumEnvironment} {language[props.language]["statistics"]["env2"]} </h3>
    <Grid container spacing={2} columns={8} >
        <Grid item lg={2}>
          <h5> {language[props.language]["statistics"]["maxTemp"]} {props.data.maxTemp[4].temperature} °C <br></br>
          {language[props.language]["statistics"]["measured"]}  {props.data.maxTemp[4].date.split(".")[0]} {language[props.language]["statistics"]["time"]}
          {props.data.maxTemp[4].station_name? <div>  <span>{language[props.language]["statistics"]["measuredStation"]}<br></br> {props.data.maxTemp[4].station_name}</span> </div>: ""}
          </h5>
        </Grid>
        <Grid item lg={2}>
          <h5>{language[props.language]["statistics"]["minTemp"]} {props.data.minTemp[4].temperature} °C <br></br>
          {language[props.language]["statistics"]["measured"]} {props.data.minTemp[4].date.split(".")[0]} {language[props.language]["statistics"]["time"]}
          {props.data.minTemp[4].station_name? <div>  <span>{language[props.language]["statistics"]["measuredStation"]}<br></br> {props.data.minTemp[4].station_name}</span> </div>: ""}
          </h5>
        </Grid>
        <Grid item lg={2}>
          <h5> {language[props.language]["statistics"]["maxHum"]} {props.data.maxHum[4].humidity} % <br></br>
          {language[props.language]["statistics"]["measured"]} {props.data.maxHum[4].date.split(".")[0]} {language[props.language]["statistics"]["time"]}
          {props.data.maxHum[4].station_name? <div>  <span>{language[props.language]["statistics"]["measuredStation"]}<br></br> {props.data.maxHum[4].station_name}</span> </div>: ""}
          </h5>
        </Grid>
        <Grid item lg={2}>
          <h5> {language[props.language]["statistics"]["minHum"]}{props.data.minHum[4].humidity} % <br></br>
          {language[props.language]["statistics"]["measured"]}  {props.data.minHum[4].date.split(".")[0]} {language[props.language]["statistics"]["time"]}
          {props.data.minHum[4].station_name? <div>  <span>{language[props.language]["statistics"]["measuredStation"]} <br></br> {props.data.minHum[4].station_name}</span> </div>: ""}
          </h5>
        </Grid>
        <Grid item lg={2}>
          <h5> {language[props.language]["statistics"]["averageTemp"]} {props.data.averageTemp.toFixed(2)} °C 
          </h5> 
        </Grid>
        <Grid item lg={2}>
          <h5> {language[props.language]["statistics"]["averageHum"]} {props.data.averageHum.toFixed(2)} % 
          </h5>
        </Grid>
    </Grid>
    </div> : ""}

    <Dialog
      open={open}
      onClose={handleClose}
      aria-labelledby="alert-dialog-title"
      aria-describedby="alert-dialog-description"
    >
      <DialogTitle id="alert-dialog-title">
        {"Information"}
      </DialogTitle>
      <DialogContent>
        <DialogContentText id="alert-dialog-description" style={{ "padding": "10px" }}>
          <p style={{ textAlign: "center" }}>{text}  <br /> <span style={{ textAlign: "center", fontSize: 20, fontWeight: 700 }}></span></p>
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Close</Button>
      </DialogActions>
    </Dialog>


  </div>


}


export default StatisticsView