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
import language from "../languages/languages";



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
    requests.getStation(id, 3)
      .then((res) => { 
        var data=res.data
        var movementData = []
        var movements= res.data.measurements.movements; 
        movements.map((item, i) => {
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
      setText(language[props.language]["stations"]["infospecies"])
    }
    else if(area == "count"){
      setText(language[props.language]["stations"]["infocount"])
    }
    else if(area == "environment"){
      setText(language[props.language]["stations"]["infoenvironment"])
    }

    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };




  return <div>

    <Button variant="contained" onClick={() => { getStation() }} sx={{ display: { xs: 'none', md: 'block' } }}style={{  margin: "15px", position: "absolute", right: "25px", zIndex : "10000" }}>Refresh</Button>
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
                    <Grid item lg={8}>
                      {data.measurements.movements[0].video == "pending" ? < div><p>{language[props.language]["stations"]["wait1"]}<br/>  </p> <Button variant="contained" onClick={() => { getStation() }} style={{ margin: "15px" }}>Refresh</Button></div>
                      :
                      <ReactPlayer url={data.measurements.movements[0].video} loop={true} controls={true} width={"100%"} height="70vh" /> }
                    </Grid>
                    <Grid item lg={4}>

                      <h4>{language[props.language]["stations"]["audio"]}</h4>
                      <ReactAudioPlayer src={data.measurements.movements[0].audio} controls />
                      <h4>{language[props.language]["stations"]["weight"]}</h4>
                      <p> {data.measurements.movements[0].weight.toFixed(0) + " gramm"} </p>
                      <IconButton color="primary" aria-label="upload picture" component="span" onClick={() => {handleClickOpen("species")}} style={{float : "right"}}>
                      <InfoOutlinedIcon />
                   </IconButton>
                      <h4>{language[props.language]["stations"]["species"]}</h4>
                      <BasicTable birds={data.measurements.movements[0].detections} finished={data.measurements.movements[0].video} getStation={event => getStation(event)} language={props.language}></BasicTable>
                    </Grid>
                  </Grid>
                </TabPanel>
                {data.measurements.movements.length > 1 ? <TabPanel value="2">                  <Grid container spacing={2}>
                  <Grid item lg={8}>
                  {data.measurements.movements[1].video == "pending" ? < div><p>{language[props.language]["stations"]["wait1"]}<br/> {language[props.language]["stations"]["wait2"]} </p> <Button variant="contained" onClick={() => { getStation() }} style={{  margin: "15px" }}>Refresh</Button></div>
                      :
                    <ReactPlayer url={data.measurements.movements[1].video} loop={true} controls={true} width={"100%"} height="70vh" /> }
                  </Grid>
                  <Grid item lg={4}>
                    <h4> {language[props.language]["stations"]["audio"]}</h4>
                    <ReactAudioPlayer src={data.measurements.movements[1].audio} controls />
                    <h4>{language[props.language]["stations"]["weight"]}</h4>
                    <p> {data.measurements.movements[1].weight.toFixed(0) + " gramm"} </p>
                    <IconButton color="primary" aria-label="upload picture" component="span" onClick={() => {handleClickOpen("species")}} style={{float : "right"}}>
                      <InfoOutlinedIcon />
                   </IconButton>
                    <h4>{language[props.language]["stations"]["species"]}</h4> 
                    <BasicTable birds={data.measurements.movements[1].detections} finished={data.measurements.movements[1].video} getStation={event => getStation(event)} language={props.language}></BasicTable>
                  </Grid>
                </Grid></TabPanel> : ""}
                {data.measurements.movements.length > 2 ? <TabPanel value="3">                  <Grid container spacing={2}>
                  <Grid item lg={8}>
                  {data.measurements.movements[2].video == "pending" ? < div><p>{language[props.language]["stations"]["wait1"]}<br/>  {language[props.language]["stations"]["wait2"]} </p> <Button variant="contained" onClick={() => { getStation() }} style={{ margin: "15px" }}>Refresh</Button></div>
                      :
                    <ReactPlayer url={data.measurements.movements[2].video} loop={true} controls={true} width={"100%"} height="70vh" /> }
                  </Grid>
                  <Grid item lg={4}>
                    <h4> {language[props.language]["stations"]["audio"]}</h4>
                    <ReactAudioPlayer src={data.measurements.movements[2].audio} controls />
                    <h4>{language[props.language]["stations"]["weight"]}</h4>
                    <p> {data.measurements.movements[2].weight.toFixed(0) + " gramm"} </p>
                    <IconButton color="primary" aria-label="upload picture" component="span" onClick={() => {handleClickOpen("species")}} style={{float : "right"}}>
                      <InfoOutlinedIcon />
                   </IconButton>
                    <h4>{language[props.language]["stations"]["species"]}</h4>
                    <BasicTable birds={data.measurements.movements[2].detections} finished={data.measurements.movements[2].video} getStation={event => getStation(event)} language={props.language}></BasicTable>
                  </Grid>
                </Grid></TabPanel> : ""}
              </TabContext>
            </Box> </div> : <p>{language[props.language]["stations"]["noData1"]}</p>}
        {data.measurements.environment && data.measurements.environment.length > 0 ?
                      <div>     <h3 style={{"marginBlockEnd" : "0px"}}>{language[props.language]["stations"]["environment"]}
                    <IconButton color="primary" aria-label="upload picture" component="span" onClick={() => {handleClickOpen("environment")}} >
                              <InfoOutlinedIcon />
                    </IconButton></h3>
    <Grid container spacing={2}>
            <Grid item lg={6} md={12}>
              <h4>{language[props.language]["stations"]["temperature"]}</h4><ApexChart series={temperatue} />
            </Grid>
            <Grid item lg={6} md={12}>
              <h4>{language[props.language]["stations"]["humidity"]}</h4><ApexChart series={humidity} />
            </Grid>
          </Grid> </div> : <p>{language[props.language]["stations"]["noData2"]}</p>
        }

        <h3 style={{"marginBlockEnd" : "0px"}}>{language[props.language]["stations"]["birdsCount"]}     
          <IconButton color="primary" aria-label="upload picture" component="span" onClick={() => {handleClickOpen("count")}} >
                      <InfoOutlinedIcon />
        </IconButton></h3>
        {data.count  ?
          <div> <Grid container spacing={2}>
            <Grid item lg={6}>
              <h4>{language[props.language]["stations"]["yesterday"]} </h4>
            <AmountTable birds={data.count[new Date(date.getTime()-1000*60*60*24).toISOString().split('T')[0]]}  date={new Date(date.getTime()-1000*60*60*24).toISOString().split('T')[0]} language={props.language}></AmountTable>
            </Grid>
            <Grid item lg={6}>
              <h4>{language[props.language]["stations"]["today"]}</h4>
            <AmountTable birds={data.count[date.toISOString().split('T')[0]]} date={date.toISOString().split('T')[0]} language={props.language}></AmountTable>
            </Grid>
          </Grid> </div> : <p>{language[props.language]["stations"]["noData2"]}</p>
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
              <Grid item lg={8}>
                <Skeleton variant="rectangular" width={"100%"} height="70vh" />
              </Grid>
              <Grid item lg={4}>

                <h4> {language[props.language]["stations"]["audio"]}</h4>
                <Skeleton variant="rectangular" width={"300px"} height="45px" />
                <h4>{language[props.language]["stations"]["weight"]}</h4>
                <Skeleton variant="text" />
                <h4>{language[props.language]["stations"]["species"]}</h4>
                <Skeleton variant="rectangular" width={"100%"} height="45px" />

              </Grid>
            </Grid>
          </TabPanel>
        </TabContext>
        <div> <Grid container spacing={2}>
          <Grid item lg={6}>
            <h4>{language[props.language]["stations"]["temperature"]}:</h4> <Skeleton variant="rectangular" width={"100%"} height="350px" />
          </Grid>
          <Grid item lg={6}>
            <h4>{language[props.language]["stations"]["humidity"]}</h4><Skeleton variant="rectangular" width={"100%"} height="350px" />
          </Grid>
        </Grid> </div>
        <div> <Grid container spacing={2}>
            <Grid item lg={6}>
              <h4>{language[props.language]["stations"]["yesterday"]}</h4>
              <Skeleton variant="rectangular" width={"100%"} height="45px" />
                          </Grid>
            <Grid item lg={6}>
              <h4>{language[props.language]["stations"]["today"]}</h4>
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