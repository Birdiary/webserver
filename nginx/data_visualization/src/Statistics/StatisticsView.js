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

    <h3 >An deiner Station wurden schon {props.data.numberOfMovements} Viedeos aufgenommen. Davon wurde auf {props.data.numberOfDetections} ein Vogel erkannt.<br />
      Die {props.data.maxSpecies.length} meisten Vögel waren:
      <IconButton color="primary" aria-label="upload picture" component="span" onClick={() => { handleClickOpen("sum") }} >
        <InfoOutlinedIcon />
      </IconButton></h3>

    <Grid container spacing={2} columns={10} >
      {props.data.maxSpecies.map((bird, i) =>
        <Grid item lg={2}>
          <h5> Platz {props.data.maxSpecies.length - i}: <br /> {bird.germanName ? bird.germanName : bird.latinName} ({bird.amount})</h5>

          {bird.movements.length > 0 ? <MovementCard movement={getRandom(bird.movements)}></MovementCard> : ""}
        </Grid>
      )}
    </Grid>
    {props.data.numberOfValidatedBirds ?
    <div>
    <h3 >An deiner Station wurden auch schon einige Vögel validiert und zwar {props.data.numberOfValidatedBirds}. <br /> 
    Die {props.data.maxValidatedBirds.length} meisten validierten Vögel:
    <IconButton color="primary" aria-label="upload picture" component="span" onClick={() => { handleClickOpen("validation") }} >
        <InfoOutlinedIcon />
      </IconButton></h3>
    <Grid container spacing={2} columns={10}>
      {props.data.maxValidatedBirds.map((bird, i) =>
        <Grid item lg={2}>
          <h5> Platz {props.data.maxValidatedBirds.length - i}: <br /> {bird.germanName ? bird.germanName : bird.latinName} ({bird.sum})</h5>

          {bird.movements.length > 0 ? <MovementCard movement={getRandom(bird.movements)}></MovementCard> : ""}
        </Grid>
      )}
    </Grid> </div>: 
    <h3 >An deiner Station wurden noch keine Vögel validiert. Validere Vögel um hier Statistiken darüber zu sehen! </h3>
    }
    <h3 >An {Object.keys(props.data.perDay).length} Tagen hat deine Station mindestens einen Vogel aufgenommen. Die {props.data.maxDay.length} Tage mit den meisten Vögel:</h3>
    <Grid container spacing={2} columns={10}>
      {props.data.maxDay.map((bird, i) =>
        <Grid item lg={2}>
          <h5> Platz {props.data.maxDay.length - i}: Tag {bird.day} mit {bird.sum} Vögeln <br /> {bird.mostBirds.length > 0 ? <span>Meister Vogel an dem Tag {bird.mostBirds[bird.mostBirds.length - 1].germanName ? bird.mostBirds[bird.mostBirds.length - 1].germanName : bird.mostBirds[bird.mostBirds.length - 1].latinName} ({bird.mostBirds[bird.mostBirds.length - 1].amount}) </span> : ""}</h5>

          {bird.mostBirds[bird.mostBirds.length - 1].movements.length > 0 ? <MovementCard movement={getRandom(bird.mostBirds[bird.mostBirds.length - 1].movements)}></MovementCard> : ""}
        </Grid>
      )}
    </Grid>
    {props.data.specialBirds && props.data.specialBirds.length>0 ?
    <div>
    <h3 >Diese besonderen Vögel waren an der Station:
    <IconButton color="primary" aria-label="upload picture" component="span" onClick={() => { handleClickOpen("special") }} >
        <InfoOutlinedIcon />
      </IconButton>
    </h3>
    <Grid container spacing={2} columns={10} >
      {props.data.specialBirds.map((bird, i) =>
        <Grid item lg={2}>
          <h5> {bird.germanName} ({props.data.all[bird.latinName].amount})</h5>

          {bird.movements.length > 0 ? <MovementCard movement={getRandom(bird.movements)}></MovementCard> : ""}
        </Grid>
      )}
    </Grid>
    </div> : ""}
    {props.data.sumEnvironment >0 ?
    <div>
    <h3 >Neben Vögeln hat die Station auch schon viele Umweltdaten gesammelt. Insgesamt wurden {props.data.sumEnvironment} Messungen durchgeführt</h3>
    <Grid container spacing={2} columns={8} >
        <Grid item lg={2}>
          <h5> Die höchste gemessene Temperatur war: {props.data.maxTemp[4].temperature} °C <br></br>
          Gemessen am {props.data.maxTemp[4].date.split(".")[0]}
          </h5>
        </Grid>
        <Grid item lg={2}>
          <h5> Die niedrigste gemessene Temperatur war: {props.data.minTemp[4].temperature} °C <br></br>
          Gemessen am {props.data.minTemp[4].date.split(".")[0]}
          {props.data.minTemp[4].station_name? <div>  <span>Gemessen an der Station <br></br> {props.data.minTemp[4].station_name}</span> </div>: ""}
          </h5>
        </Grid>
        <Grid item lg={2}>
          <h5> Die höchste gemessene Luftfeuchtigkeit war: {props.data.maxHum[4].humidity} % <br></br>
          Gemessen am {props.data.maxHum[4].date.split(".")[0]}
          {props.data.maxHum[4].station_name? <div>  <span>Gemessen an der Station <br></br> {props.data.maxHum[4].station_name}</span> </div>: ""}
          </h5>
        </Grid>
        <Grid item lg={2}>
          <h5> Die niedirgste gemessene Luftfeuchtigkeit war: {props.data.minHum[4].humidity} % <br></br>
          Gemessen am {props.data.minHum[4].date.split(".")[0]}
          {props.data.minHum[4].station_name? <div>  <span>Gemessen an der Station <br></br> {props.data.minHum[4].station_name}</span> </div>: ""}
          </h5>
        </Grid>
        <Grid item lg={2}>
          <h5> Die durchschnittliche gemessene Temperatur ist: {props.data.averageTemp.toFixed(2)} °C 
          </h5> 
        </Grid>
        <Grid item lg={2}>
          <h5> Die durchschnittliche gemessene Luftfeuchtigkeit ist: {props.data.averageHum.toFixed(2)} % 
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