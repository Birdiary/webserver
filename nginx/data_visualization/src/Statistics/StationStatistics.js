import { useState, useEffect, useRef } from "react";
import { useParams } from 'react-router-dom';
import requests from "../helpers/requests";
import ReactPlayer from 'react-player'
import ReactAudioPlayer from 'react-audio-player';
import { Grid, Tab, Box, Button, Skeleton, TextField, Autocomplete, Snackbar, Alert, Tabs } from "@mui/material";
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import language from "../languages/languages";
import { useNavigate } from "react-router-dom";
import StatisticsView from "./StatisticsView";



function StationStatistics(props) {

  const { id } = useParams()
  const [data, setData] = useState("");
  const navigate = useNavigate();
  const [counter, setCounter] = useState(null);
  const [open, setOpen] = useState(false);
  const [text, setText] = useState("")


  useEffect(() => {
    getStatistics();


  }, [])

  useEffect(() => {
    counter > 0 && setTimeout(() => changeCounter(counter - 1), 1000);
  }, [counter]);


  const getStatistics = () => {
    requests.getStatisitcs(id)
      .then((res) => {
        //console.log(res)

        var data = res.data
        setData(data);
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

  const handleClose = () => {
    setOpen(false);
  };

  
  


  return <div>

     <h1 style={{ textAlign: "center", marginBottom: "3px" }}>Statistiken zur Station: {data ? data.name : id}</h1>   
      
     {data ? <div><span style={{ textAlign: "center", width: "100%", display: "block"}}> Stand: {data.createdAt.split(".")[0]}</span> <StatisticsView language={props.language} data={data}></StatisticsView>  </div>: ""}
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

  </div>


}


export default StationStatistics