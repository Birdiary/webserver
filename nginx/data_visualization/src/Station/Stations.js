import { useState, useEffect } from "react";
import { useParams } from 'react-router-dom';
import requests from "../helpers/requests";
import ReactPlayer from 'react-player'
import ReactAudioPlayer from 'react-audio-player';
import ApexChart from "./visualization/Chart"
import { Grid, Tab, Box, Button, Skeleton } from "@mui/material";
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import TabContext from '@mui/lab/TabContext';
import TabList from '@mui/lab/TabList';
import TabPanel from '@mui/lab/TabPanel';
import BasicTable from "./visualization/Table";
import AmountTable from "./visualization/Table2";
import IconButton from '@mui/material/IconButton';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import zIndex from "@mui/material/styles/zIndex";



function StationView(props) {
  const { id } = useParams()
  const [data, setData] = useState("");
  const [temperatue, setTemperature] = useState(
    [{
      name: "temperatue",
      data: [
        [Date.now(), 39.60],
      ]
    }]);
  const [humidity, setHumidity] = useState({
    name: "humidity",
    data: [
      [Date.now(), 39.60],
    ]
  });
  const [value, setValue] = useState('1');
  const [text, setText] = useState("");
  const [open, setOpen] = useState(false)
  const [date, setDate] = useState(new Date(Date.now()))

  useEffect(() => {
    getStation();


  }, [])


  const getStation = () => {
    requests.getStation(id)
      .then((res) => { 
        var data=res.data
        var movementData = []
        var movements= res.data.measurements.movements; 
        movements.slice([0], [3]).map((item, i) => {
        movementData.push(item);
        });

        data.measurements.movements= movementData

      setData(data); 
      //console.log(res); 
      createSeries(res.data) })
  }

  const createSeries = (data) => {

    var tempSeries = [{
      name: "temperature",
      data: [

      ]
    }]
    var humSeries = [{
      name: "humidity",
      data: [
      ]
    }]
    for (var i =0; i < data.measurements.environment.length; i = i+5) {

      var environment = data.measurements.environment[i]

      let date = environment.date;
      const dateArray = date.split(".");
      date = new Date(dateArray[0])
      var hum = environment.humidity
      var temp = environment.temperature
      /**try{
      var lastDate = tempSeries[0].data[tempSeries[0].data.length -1][0]
      var  diffTime = Math.abs(date - lastDate);
      if(diffTime > 1000 * 60 * 240 ){
        var middleDate = new Date(lastDate + 1000*60*120)
        tempSeries[0].data.push([middleDate, null])
        humSeries[0].data.push([middleDate, null])

      }
    }
    catch (e){
      console.log(e)
    }*/
      if (temp > -35){
        tempSeries[0].data.push([date, temp])
        humSeries[0].data.push([date, hum])
      }

    }

    setTemperature(tempSeries)
    setHumidity(humSeries)



  }


  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  const handleClickOpen = (area) => {
    console.log(area)
    if(area == "species"){
      setText("Ein Video besteht aus mehreren Bilder. Für eine Sekunde werden bei uns 30 Bilder gespeichert. Unser Artenerkennungsalgorithmus analysiert jedes 10. Bild aus dem Video. Für das Bild werden die Arten bestimmt z.B. Pyrhulla pyrhulla mit 70% für das Erste analysierte Bild. Für das zweite dann Cardinalis Cardinal mit einer Wahrscheinlichkeit von 60% usw. Am Ende werden die höchsten Wahrscheinlichkeiten für jede Art bestimmt und gespeichert. So kann es vorkommen, wie in diesem Beispiel, dass Insgesamt über 100% angezeigt werden. \n Unsere Datenbank besitzt die Deutschen Namen für die meisten deutschen Vögel. Wenn neben der Bestimmung kein Deutscher Name steht, kann dies ein Indiez dafür sein, dass der Vogel normalerweise nicht in Deutschland vorkommt. Hinter dem Deutschen Namen ist die Website vom NABU verlinkt, welche weitere Informationen über den Vogel liefert. Wir haben nicht alle Links überprüfen können. Daher kann es vorkommen, dass einige Links nicht funktionieren ")
    }
    else if(area == "count"){
      setText("Hier findet Ihr eine Übersicht über die gezählten Vögel gestern und heute. Hierbei wird jeweils der Vogel mit der höchsten Bestimmung gezählt. Unser Algorithmus kann zum jetzigen Zeitpunkt nicht erkennen, ob ein Vogel zum zweiten mal die Station besucht. Der Vogel wird erneut gezählt.\n Unsere Datenbank besitzt die Deutschen Namen für die meisten deutschen Vögel. Wenn neben der Bestimmung kein Deutscher Name steht, kann dies ein Indiez dafür sein, dass der Vogel normalerweise nicht in Deutschland vorkommt. Hinter dem Deutschen Namen ist die Website vom NABU verlinkt, welche weitere Informationen über den Vogel liefert. Wir haben nicht alle Links überprüfen können. Daher kann es vorkommen, dass einige Links nicht funktionieren ")
    }
    else if(area == "environment"){
      setText("Die gemssennen Werte werden von einem DHT Luftfeuchte und Temperatur Sensor gemessen. Wenn der Sensor zum ersten mal ausgelesen wird, kann es vorkommen, dass falsche Werte ausgelesen werden. Daher werden Messungen, bei denen die Temperatur unter -35°C beträgt.")
    }

    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };




  return <div>

    <Button variant="contained" onClick={() => { getStation() }} style={{  margin: "15px", position: "absolute", right: "25px", zIndex : "10000" }}>Refresh</Button>
    <h1 style={{textAlign: "center"}}>Station: {data ? data.name : id}</h1>
    {data ?
      <div>
        {data.measurements.movements && data.measurements.movements.length > 0 ?
          <div>
            <Box sx={{ width: '100%', typography: 'body1' }}>
              <TabContext value={value}>
                <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                  <TabList onChange={handleChange} aria-label="lab API tabs example" centered>
                    <Tab label={data.measurements.movements[0].start_date.split(".")[0]} value="1" />
                    {data.measurements.movements.length > 1 ? <Tab label={data.measurements.movements[1].start_date.split(".")[0]} value="2" /> : ""}
                    {data.measurements.movements.length > 2 ? <Tab label={data.measurements.movements[2].start_date.split(".")[0]} value="3" /> : ""}
                  </TabList>
                </Box>
                <TabPanel value="1">
                  <Grid container spacing={4}>
                    <Grid item xs={8}>
                      {data.measurements.movements[0].video == "pending" ? < div><p>Das Video wird gerade verabeitet und die Art bestimmt! <br/> Bitte warte einen kurzen Moment und klicke dann auf den Refresh Button </p> <Button variant="contained" onClick={() => { getStation() }} style={{ margin: "15px" }}>Refresh</Button></div>
                      :
                      <ReactPlayer url={data.measurements.movements[0].video} loop={true} controls={true} width={"100%"} height="70vh" /> }
                    </Grid>
                    <Grid item xs={4}>

                      <h4> Audio:</h4>
                      <ReactAudioPlayer src={data.measurements.movements[0].audio} controls />
                      <h4>Gewicht:</h4>
                      <p> {data.measurements.movements[0].weight.toFixed(0) + " gramm"} </p>
                      <IconButton color="primary" aria-label="upload picture" component="span" onClick={() => {handleClickOpen("species")}} style={{float : "right"}}>
                      <InfoOutlinedIcon />
                   </IconButton>
                      <h4>Erkannte Arten:</h4>
                      <BasicTable birds={data.measurements.movements[0].detections} finished={data.measurements.movements[0].video} getStation={event => getStation(event)}></BasicTable>
                    </Grid>
                  </Grid>
                </TabPanel>
                {data.measurements.movements.length > 1 ? <TabPanel value="2">                  <Grid container spacing={2}>
                  <Grid item xs={8}>
                  {data.measurements.movements[1].video == "pending" ? < div><p>Das Video wird gerade verabeitet und die Art bestimmt! <br/> Bitte warte einen kurzen Moment und klicke dann auf den Refresh Button </p> <Button variant="contained" onClick={() => { getStation() }} style={{  margin: "15px" }}>Refresh</Button></div>
                      :
                    <ReactPlayer url={data.measurements.movements[1].video} loop={true} controls={true} width={"100%"} height="70vh" /> }
                  </Grid>
                  <Grid item xs={4}>
                    <h4> Audio:</h4>
                    <ReactAudioPlayer src={data.measurements.movements[1].audio} controls />
                    <h4>Gewicht:</h4>
                    <p> {data.measurements.movements[1].weight.toFixed(0) + " gramm"} </p>
                    <IconButton color="primary" aria-label="upload picture" component="span" onClick={() => {handleClickOpen("species")}} style={{float : "right"}}>
                      <InfoOutlinedIcon />
                   </IconButton>
                    <h4>Erkannte Arten:</h4> 
                    <BasicTable birds={data.measurements.movements[1].detections} finished={data.measurements.movements[1].video} getStation={event => getStation(event)}></BasicTable>
                  </Grid>
                </Grid></TabPanel> : ""}
                {data.measurements.movements.length > 2 ? <TabPanel value="3">                  <Grid container spacing={2}>
                  <Grid item xs={8}>
                  {data.measurements.movements[2].video == "pending" ? < div><p>Das Video wird gerade verabeitet und die Art bestimmt! <br/>  Bitte warte einen kurzen Moment und klicke dann auf den Refresh Button </p> <Button variant="contained" onClick={() => { getStation() }} style={{ margin: "15px" }}>Refresh</Button></div>
                      :
                    <ReactPlayer url={data.measurements.movements[2].video} loop={true} controls={true} width={"100%"} height="70vh" /> }
                  </Grid>
                  <Grid item xs={4}>
                    <h4> Audio:</h4>
                    <ReactAudioPlayer src={data.measurements.movements[2].audio} controls />
                    <h4>Gewicht:</h4>
                    <p> {data.measurements.movements[2].weight.toFixed(0) + " gramm"} </p>
                    <IconButton color="primary" aria-label="upload picture" component="span" onClick={() => {handleClickOpen("species")}} style={{float : "right"}}>
                      <InfoOutlinedIcon />
                   </IconButton>
                    <h4>Erkannte Arten:</h4>
                    <BasicTable birds={data.measurements.movements[2].detections} finished={data.measurements.movements[2].video} getStation={event => getStation(event)} ></BasicTable>
                  </Grid>
                </Grid></TabPanel> : ""}
              </TabContext>
            </Box> </div> : <p>No movements yet</p>}
        {data.measurements.environment && data.measurements.environment.length > 0 ?
                      <div>     <h3 style={{"marginBlockEnd" : "0px"}}>Umweltsensoren:
                    <IconButton color="primary" aria-label="upload picture" component="span" onClick={() => {handleClickOpen("environment")}} >
                              <InfoOutlinedIcon />
                    </IconButton></h3>
    <Grid container spacing={2}>
            <Grid item xs={6}>
              <h4>Temperatur in °C:</h4><ApexChart series={temperatue} />
            </Grid>
            <Grid item xs={6}>
              <h4>Luftfeuchte in %:</h4><ApexChart series={humidity} />
            </Grid>
          </Grid> </div> : <p>No measurements yet</p>
        }

        <h3 style={{"marginBlockEnd" : "0px"}}>Gezählte Vögel:         
          <IconButton color="primary" aria-label="upload picture" component="span" onClick={() => {handleClickOpen("count")}} >
                      <InfoOutlinedIcon />
        </IconButton></h3>
        {data.count  ?
          <div> <Grid container spacing={2}>
            <Grid item xs={6}>
              <h4>Gestern</h4>
            <AmountTable birds={data.count[new Date(date.getTime()-1000*60*60*24).toISOString().split('T')[0]]}  date={new Date(date.getTime()-1000*60*60*24).toISOString().split('T')[0]}></AmountTable>
            </Grid>
            <Grid item xs={6}>
              <h4>Heute:</h4>
            <AmountTable birds={data.count[date.toISOString().split('T')[0]]} date={date.toISOString().split('T')[0]}></AmountTable>
            </Grid>
          </Grid> </div> : <p>No measurements yet</p>
        }
         <br></br>
         <br></br>
         </div> :
      <div>
        <TabContext value={value}>
          <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <TabList onChange={handleChange} aria-label="lab API tabs example" centered>
              <Tab label={"Tab1"} value="1" />
            </TabList>
          </Box>
          <TabPanel value="1">
            <Grid container spacing={4}>
              <Grid item xs={8}>
                <Skeleton variant="rectangular" width={"100%"} height="70vh" />
              </Grid>
              <Grid item xs={4}>

                <h4> Audio:</h4>
                <Skeleton variant="rectangular" width={"300px"} height="45px" />
                <h4>Gewicht:</h4>
                <Skeleton variant="text" />
                <h4>Erkannte Arten:</h4>
                <Skeleton variant="rectangular" width={"100%"} height="45px" />

              </Grid>
            </Grid>
          </TabPanel>
        </TabContext>
        <div> <Grid container spacing={2}>
          <Grid item xs={6}>
            <h4>Temperatur in °C:</h4> <Skeleton variant="rectangular" width={"100%"} height="350px" />
          </Grid>
          <Grid item xs={6}>
            <h4>Luftfeuchte in %:</h4><Skeleton variant="rectangular" width={"100%"} height="350px" />
          </Grid>
        </Grid> </div>
        <div> <Grid container spacing={2}>
            <Grid item xs={6}>
              <h4>Gestern</h4>
              <Skeleton variant="rectangular" width={"100%"} height="45px" />
                          </Grid>
            <Grid item xs={6}>
              <h4>Heute:</h4>
              <Skeleton variant="rectangular" width={"100%"} height="45px" /></Grid>
          </Grid> </div>
        <br></br>
       
      </div>}
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
          <DialogContentText id="alert-dialog-description" style={{"padding": "10px"}}>
            {text}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Close</Button>
        </DialogActions>
      </Dialog>

  </div>


}


export default StationView