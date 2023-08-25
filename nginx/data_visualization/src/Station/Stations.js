import { useState, useEffect, useRef } from "react";
import { useParams } from 'react-router-dom';
import requests from "../helpers/requests";
import ReactPlayer from 'react-player'
import ReactAudioPlayer from 'react-audio-player';
import ApexChart from "./visualization/Chart"
import { Grid, Tab, Box, Button, Skeleton, TextField, Autocomplete, Snackbar, Alert, Tabs } from "@mui/material";
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
import TimelineChart from "./visualization/Charts2";
import options from "../helpers/labels";
import ValidationForm from "../Validation/ValidationForm";
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import DropdownShareButton from "./Share";
import 'onsenui/css/onsen-css-components.css';
import { GestureDetector } from 'react-onsenui';
import { useNavigate, Link } from 'react-router-dom';


function StationView(props) {

  const { id } = useParams()
  const [data, setData] = useState("");
  const [temperature, setTemperature] = useState(0);
  const [humidity, setHumidity] = useState(0);
  const [pressure, setPressure] = useState(false);
  const [illuminance, setIlluminance] = useState(false);
  const [value, setValue] = useState(0);
  const [text, setText] = useState("");
  const [open, setOpen] = useState(false)
  const [date, setDate] = useState(new Date(Date.now()))
  const [day, setDay] = useState(null)
  const [searchValue, setSearchValue] = useState("")
  const navigate = useNavigate();
  const [counter, setCounter] = useState(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false)
  const [bird, setBird] = useState("")

  useEffect(() => {
    getStation();


  }, [])

  useEffect(() => {
    counter > 0 && setTimeout(() => changeCounter(counter - 1), 1000);
  }, [counter]);


  const getStation = () => {
    requests.getStation(id, 30)
      .then((res) => {
        //console.log(res)

        var data = res.data
        var movementData = []
        var movements = res.data.measurements.movements;
        movements.map((item, i) => {
          movementData.push(item);
        });

        data.measurements.movements = movementData
        

        setData(data);
        ////console.log(res); 
        getEnvironment()
      }).catch(err => {
        // Handle error
        let text = language[props.language]["stations"]["notFound"]
        setText(text)
        setOpen(true)
        changeCounter(5)
        const myTimeout = setTimeout(routeToHome, 5000)
      })
  }

  function changeCounter(count) {
    setCounter(count)
    //let text = language[props.language]["stations"]["notFound"] 
    //setText(text)
  }


  function routeToHome() {
    navigate("/view")
  }

  const getEnvironment = () => {

    requests.getEnvironment(id)
      .then((res) => {
        var data = res.data
        //console.log(res);
        createSeries(res.data)
      })
  }

  const createSeries = (environment) => {
    //console.log("triggerd")

    var tempSeries = [{
      label: "temperature",
      data: [

      ]
    }]
    var humSeries = [{
      label: "humidity",
      data: [
      ]
    }]

    var pressSeries = [{
      label: "airpressure",
      data: [
      ]
    }]

    var illumanceSeries = [{
      label: "illuminance",
      data: [
      ]
    }]

    if (environment.length === 0) {
      tempSeries.data = false
      humSeries.data = false
      pressSeries.data = false
      illumanceSeries.data = false
      setTemperature(tempSeries)
      setHumidity(humSeries)
      setPressure(pressSeries)
      setIlluminance(illumanceSeries)

    }

    else {
      for (var i = 0; i < environment.length; i = i + 5) {

        var env = environment[i]

        let date = env.date;
        const dateArray = date.split(".");
        date = new Date(dateArray[0].replace(/\s/, 'T'))
        var hum = env.humidity
        var temp = env.temperature
        if(env.airpressure){
          pressSeries[0].data.push({ x: date, y: env.airpressure })
        }
        if(env.illuminance){
          illumanceSeries[0].data.push({ x: date, y: env.illuminance })
        }
        try {
          var lastDate = tempSeries[0].data[tempSeries[0].data.length - 1].x
          var diffTime = Math.abs(date - lastDate);
          if (diffTime > 1000 * 60 * 240) {
            var middleDate = new Date(lastDate + 1000 * 60 * 120)
            tempSeries[0].data.push({ x: middleDate, y: null })
            humSeries[0].data.push({ x: middleDate, y: null })

          }
        }
        catch (e) {
          //console.log(e)
        }
        if (temp > -35) {
          tempSeries[0].data.push({ x: date, y: temp })
          humSeries[0].data.push({ x: date, y: hum })
        }

      }

      setTemperature(tempSeries)
      setHumidity(humSeries)
      if(pressSeries[0].data.length == 0){
        pressSeries[0].data = false
      }
      if(illumanceSeries[0].data.length == 0){
        illumanceSeries[0].data = false
      }
      setPressure(pressSeries)
      setIlluminance(illumanceSeries)


    }



  }


  const handleChange = (event, newValue) => {
    setValue(newValue);
    setBird("")
  };

  const handleClickOpen = (area) => {
    //console.log(area)
    if (area == "species") {
      setText(language[props.language]["stations"]["infospecies"])
    }
    else if (area == "count") {
      setText(language[props.language]["stations"]["infocount"])
    }
    else if (area == "environment") {
      setText(language[props.language]["stations"]["infoenvironment"])
    }

    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const searchForSpecies = (value) => {
    let search = null
    //console.log(value)
    if (!value && searchValue) {
      search = options.saerchOptions[searchValue]["latinName"]
    }
    else if (value) {
      search = value
    }

    let searchDay = null
    if (day) {
      searchDay = day.format("YYYY-MM-DD")
    }

    requests.searchForSpecies(id, search, 30, searchDay)
      .then((res) => {
        data.measurements.movements = res.data
        setData({ ...data })
      })
  }

  function handleInputChange(event, value) {
    ////console.log(value);
    setSearchValue(value)
  }

  function handelSearchChange(value) {

    setSearchValue(value);
    searchForSpecies(value);
  }

  const handleClick = () => {
    setSnackbarOpen(true);
  };

  const handleToClose = (event, reason) => {
    if ("clickaway" == reason) return;
    setSnackbarOpen(false);
  };

  const sendValidation = () => {
    let validation = { validation: {} }
    let valBird = options.validationOptions[bird]
    if (!valBird) {
      valBird = { "latinName": bird, "germanName": "" }
    }
    validation.validation = valBird
    requests.sendValidation(data.station_id, data["measurements"]["movements"][value]["mov_id"], validation)
    valBird.amount=2
    let  newData = data
    let latinName = valBird["latinName"]
    newData["measurements"]["movements"][value]["validation"] = {"summary" : {latinName : valBird}}
    console.log(newData)
    setData(newData)

    handleClick();

  }

  const sendValidationNone = () => {
    let validation = { validation: { "latinName": "None", "germanName": "" } }
    requests.sendValidation(data.station_id, data["measurements"]["movements"][value]["mov_id"], validation)
    handleClick();

  }


  return <div>

    <Button variant="contained" onClick={() => { getStation() }} sx={{ display: { xs: 'none', md: 'block' } }} style={{ margin: "15px", position: "absolute", right: "25px", zIndex: "10000" }}>Refresh</Button>
    <h1 style={{ textAlign: "center" }}>Station: {data ? data.name : id}</h1>
    <Grid container spacing={2} style={{ marginLeft: "20px" }}>
      <Grid item lg={3}>
        <Autocomplete
          id="combo-box-demo"
          options={Object.keys(options.saerchOptions)}
          sx={{ width: 300 }}
          onInputChange={handleInputChange}
          value={searchValue}
          renderInput={(params) => <TextField {...params} label={language[props.language]["stations"]["search"]} />}
        />
      </Grid>
      <Grid item lg={3}>
        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <DatePicker
            disableFuture
            inputFormat="YYYY-MM-DD"
            label={language[props.language]["stations"]["day"]}
            value={day}
            onChange={(newValue) => {
              setDay(newValue);
            }}
            renderInput={(params) => <TextField {...params} />}
          />
        </LocalizationProvider>
      </Grid>
      <Grid item lg={1}>
        <Button disabled={!data} onClick={() => searchForSpecies("")}> {language[props.language]["stations"]["search2"]}</Button>
      </Grid>
      <Grid item lg={3}>
      </Grid>
      <Grid item lg={2}>
      <Button variant="contained" component={Link} to={"/view/statistics/" + id}>{language[props.language]["statistics"]["show"]}</Button>
      </Grid>

    </Grid>


    {data ?
      <div>
        {data.measurements.movements && data.measurements.movements.length > 0 ?
          <div>
            <TabContext value={value}>
              <Box sx={{ bgcolor: 'background.paper' }} style={{ maxWidth: "94vw", marginLeft: "3vw" }}>

                <TabList
                  value={value}
                  onChange={handleChange}
                  variant="scrollable"
                  scrollButtons="auto"
                  aria-label="scrollable auto tabs example"
                >
                  {data.measurements.movements.map((movement) =>
                    <Tab label={movement.start_date.split(".")[0]}></Tab>
                  )}
                </TabList>
              </Box>
              {data.measurements.movements.map((movement, i) =>
                <TabPanel value={i}>
                  <GestureDetector
                onSwipeLeft={() => setValue(Math.min(data.measurements.movements.length, value+1))}
                onSwipeRight={() => setValue(Math.max(0, value-1))}
                onDragLeft={() => setValue(Math.min(data.measurements.movements.length, value+1))}
                onDragRight={() => setValue(Math.max(0, value-1))}
            >
                  <Grid container spacing={4}>
                    <Grid item lg={8}>
                      {movement.video == "pending" ? < div><p>{language[props.language]["stations"]["wait1"]}<br />  </p> <Button variant="contained" onClick={() => { getStation() }} style={{ margin: "15px" }}>Refresh</Button></div>
                        :
                        <ReactPlayer playing={true} playsinline url={movement.video} loop={true} controls={true} width="100%" height="min(95vw, 80vh)" style={{ aspectRatio: 1 }} />}
                    </Grid>
                    <Grid item lg={4}>
                      <DropdownShareButton language={props.language} station_id={id} mov_id={movement.mov_id}></DropdownShareButton>
                      <h4>{language[props.language]["stations"]["audio"]}</h4>
                      <ReactAudioPlayer src={movement.audio} controls />
                      <h4>{language[props.language]["stations"]["weight"]}</h4>
                      <p> {movement.weight.toFixed(0) + " gramm"} </p>
                      <IconButton color="primary" aria-label="upload picture" component="span" onClick={() => { handleClickOpen("species") }} style={{ float: "right" }}>
                        <InfoOutlinedIcon />
                      </IconButton>
                      <h4>{language[props.language]["stations"]["species"]}</h4>

                      <BasicTable birds={movement.detections} finished={movement.video} getStation={event => getStation(event)} language={props.language} setBird={setBird} bird={bird} validation={movement.validation}></BasicTable>
                      <br />
                      <ValidationForm setBird={setBird} bird={bird} language={props.language} />
                      <br></br>
                      <Button variant="contained" onClick={sendValidation} style={{ marginRight: "5px", marginBottom: "5px" }}>{language[props.language]["validation"]["send"]}</Button>
                      <Button variant="contained" onClick={sendValidationNone} style={{ marginRight: "5px", marginBottom: "5px" }}>{language[props.language]["validation"]["noBird"]}</Button>
                    </Grid>
                  </Grid>
                  </GestureDetector>
                </TabPanel>)}
            </TabContext>
          </div>
          : <p>{language[props.language]["stations"]["noData1"]}</p>}
          {
            data.lastFeedStatus? <span> {language[props.language]["map"]["lastFeedStatus"]}
            {data.lastFeedStatus.silolevel+ " %" + " am " + data.lastFeedStatus.date.split(".")[0] }<br/> </span>: ""
          }
        {temperature[0] ?
          (temperature[0].data.length > 0 ?
            <div>     <h3 style={{ "marginBlockEnd": "0px" }}>{language[props.language]["stations"]["environment"]}
              <IconButton color="primary" aria-label="upload picture" component="span" onClick={() => { handleClickOpen("environment") }} >
                <InfoOutlinedIcon />
              </IconButton></h3>
              <Grid container spacing={2}>
                <Grid item lg={6} md={12}>
                  <h4>{language[props.language]["stations"]["temperature"]}</h4><TimelineChart series={temperature} />
                </Grid>
                <Grid item lg={6} md={12}>
                  <h4>{language[props.language]["stations"]["humidity"]}</h4><TimelineChart series={humidity} />
                </Grid>
                {pressure && pressure[0].data ?
                <Grid item lg={6} md={12}>
                  <h4>{language[props.language]["stations"]["pressure"]}</h4><TimelineChart series={pressure} />
                </Grid>: ""}
                {illuminance && illuminance[0].data ? 
                <Grid item lg={6} md={12}>
                  <h4>{language[props.language]["stations"]["illuminance"]}</h4><TimelineChart series={illuminance} />
                </Grid> : ""}
              </Grid> </div> : <p>{language[props.language]["stations"]["noData2"]}</p>) :
          <div> <Grid container spacing={2}>
            <Grid item lg={6}>
              <h4>{language[props.language]["stations"]["temperature"]}:</h4> <Skeleton variant="rectangular" width={"100%"} height="350px" />
            </Grid>
            <Grid item lg={6}>
              <h4>{language[props.language]["stations"]["humidity"]}</h4><Skeleton variant="rectangular" width={"100%"} height="350px" />
            </Grid>
          </Grid> </div>
        }

        <h3 style={{ "marginBlockEnd": "0px" }}>{language[props.language]["stations"]["birdsCount"]}
          <IconButton color="primary" aria-label="upload picture" component="span" onClick={() => { handleClickOpen("count") }} >
            <InfoOutlinedIcon />
          </IconButton></h3>
        {data.count ?
          <div> <Grid container spacing={2}>
            <Grid item lg={6}>
              <h4>{language[props.language]["stations"]["today"]}</h4>
              <AmountTable birds={data.count[date.toISOString().split('T')[0]]} date={date.toISOString().split('T')[0]} language={props.language} handelSearchChange={handelSearchChange}></AmountTable>
            </Grid>
            <Grid item lg={6}>
              <h4>{language[props.language]["stations"]["yesterday"]} </h4>
              <AmountTable birds={data.count[new Date(date.getTime() - 1000 * 60 * 60 * 24).toISOString().split('T')[0]]} date={new Date(date.getTime() - 1000 * 60 * 60 * 24).toISOString().split('T')[0]} language={props.language} handelSearchChange={handelSearchChange}></AmountTable>
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
            <h4>{language[props.language]["stations"]["today"]}</h4>
            <Skeleton variant="rectangular" width={"100%"} height="45px" />
          </Grid>
          <Grid item lg={6}>
            <h4>{language[props.language]["stations"]["yesterday"]}</h4>
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
        <DialogContentText id="alert-dialog-description" style={{ "padding": "10px" }}>
          <p style={{ textAlign: "center" }}>{text}  <br /> <span style={{ textAlign: "center", fontSize: 20, fontWeight: 700 }}>{counter} </span></p>
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Close</Button>
      </DialogActions>
    </Dialog>
    <Snackbar open={snackbarOpen} onClose={handleToClose} autoHideDuration={6000} anchorOrigin={{ vertical: "bottom", horizontal: "right" }} >
      <Alert severity="success" onClose={handleToClose} sx={{ width: '100%' }}>
        Validation send!
      </Alert>
    </Snackbar>

  </div>


}


export default StationView