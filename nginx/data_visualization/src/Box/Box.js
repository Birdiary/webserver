import { useState, useEffect } from "react";
import { useParams } from 'react-router-dom';
import requests from "../helpers/requests";
import ReactPlayer from 'react-player'
import ReactAudioPlayer from 'react-audio-player';
import ApexChart from "./visualization/Chart"
import { Grid, Tab, Box, Button } from "@mui/material";
import TabContext from '@mui/lab/TabContext';
import TabList from '@mui/lab/TabList';
import TabPanel from '@mui/lab/TabPanel';
import BasicTable from "./visualization/Table";



function BoxView(props) {
  const { id } = useParams()
  const [data, setData] = useState("");
  const [temperatue, setTemperature] = useState(
   [ {name: "temperatue",
    data: [
      [Date.now(),39.60],
    ]
  }]);
  const [humidity, setHumidity] = useState({
    name: "humidity",
    data: [
      [Date.now(),39.60],
    ]
  });
  const [value, setValue] = useState('1');

  useEffect(() => {
    getBox();
  }, [])


  const getBox = () => {
    requests.getBox(id)
      .then((res) => { setData(res.data); console.log(res); createSeries(res.data) })
  }

  const createSeries = (data)  => {

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
    for( var environment of data.measurements.environment){
      
        let date = environment.date;
        const dateArray = date.split(".");
        date= new Date(dateArray[0])
        var hum = environment.humidity
        var temp = environment.temperature
        tempSeries[0].data.push([date, temp])
        humSeries[0].data.push([date, hum])
    }
    setTemperature(tempSeries)
    setHumidity(humSeries)

  }


  const handleChange = (event, newValue) => {
    setValue(newValue);
  };




  return <div>
    
    <Button variant="contained" onClick={() => {getBox()}} style={{float: "right", margin: "15px"}}>Refresh</Button>
    <h1>Box: {data ? data.name: id}</h1>
    {data ?
      <div>
        {data.measurements.movements && data.measurements.movements.length > 0 ?
          <div>
            <Box sx={{ width: '100%', typography: 'body1' }}>
              <TabContext value={value}>
                <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                  <TabList onChange={handleChange} aria-label="lab API tabs example">
                    <Tab label={data.measurements.movements[0].start_date.split(".")[0]} value="1" />
                    {data.measurements.movements.length > 1 ? <Tab label={data.measurements.movements[1].start_date.split(".")[0]} value="2" /> : ""}
                    {data.measurements.movements.length > 2 ? <Tab label={data.measurements.movements[2].start_date.split(".")[0]} value="3" /> : ""}
                  </TabList>
                </Box>
                <TabPanel value="1">
                  <Grid container spacing={4}>
                  <Grid item xs={8}>
                     <ReactPlayer url={data.measurements.movements[0].video} loop={true} controls={true} width={"100%"} height="70vh"/>
                  </Grid>
                  <Grid item xs={4}>

                    <h4> Audio:</h4>
                     <ReactAudioPlayer src={data.measurements.movements[0].audio} controls />
                     <h4>Gewicht:</h4>
                     <p> {data.measurements.movements[0].weight.toFixed(0) + " gramm"} </p>
                     <h4>Erkannte Arten:</h4>
                     <BasicTable birds={data.measurements.movements[0].detections}></BasicTable>
                  </Grid>
                </Grid>
                </TabPanel>
                {data.measurements.movements.length > 1 ? <TabPanel value="2">                  <Grid container spacing={2}>
                  <Grid item xs={8}>
                     <ReactPlayer url={data.measurements.movements[1].video} loop={true} controls={true}  width={"100%"} height="70vh"/>
                  </Grid>
                  <Grid item xs={4}>
                    <h4> Audio:</h4>
                     <ReactAudioPlayer src={data.measurements.movements[1].audio} controls />
                     <h4>Gewicht:</h4>
                     <p> {data.measurements.movements[1].weight.toFixed(0) + " gramm"} </p>
                     <h4>Erkannte Arten:</h4>
                     <BasicTable birds={data.measurements.movements[1].detections}></BasicTable>
                  </Grid>
                </Grid></TabPanel> : ""}
                {data.measurements.movements.length > 2 ? <TabPanel value="3">                  <Grid container spacing={2}>
                  <Grid item xs={8}>
                     <ReactPlayer url={data.measurements.movements[2].video} loop={true} controls={true} width={"100%"} height="70vh"/>
                  </Grid>
                  <Grid item xs={4}>
                  <h4> Audio:</h4>
                     <ReactAudioPlayer src={data.measurements.movements[2].audio} controls />
                     <h4>Gewicht:</h4>
                     <p> {data.measurements.movements[2].weight.toFixed(0) + " gramm"} </p>
                     <h4>Erkannte Arten:</h4>
                     <BasicTable birds={data.measurements.movements[2].detections}></BasicTable>
                  </Grid>
                </Grid></TabPanel>: ""}
              </TabContext>
            </Box> </div> : <p>No movements yet</p>}
        {data.measurements.environment && data.measurements.environment.length > 0 ?
          <div> <Grid container spacing={2}>
          <Grid item xs={6}>
             <h4>Temperatur in °C:</h4><ApexChart series={temperatue}/> 
          </Grid>
          <Grid item xs={6}>
             <h4>Luftfeuchte in %:</h4><ApexChart series={humidity}/> 
          </Grid>
        </Grid> </div> : <p>No measurements yet</p>
        } </div> : ""}


  </div>;
}


export default BoxView