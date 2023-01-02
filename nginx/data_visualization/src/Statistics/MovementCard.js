import { Button, CardActions, Card, CardContent, CardMedia, Typography } from '@mui/material';
import ReactPlayer from 'react-player'
import { useNavigate, Link } from 'react-router-dom';
import language from '../languages/languages';
import { useState, useEffect } from 'react';

function MovementCard(props) {

  const [movement, setMovement] = useState(null)

  useEffect(() => {
    let movement = getRandom(props.movement);
    setMovement(movement)
  }, []);
  
  const getRandom= (list) => {
    let index = 0
    if (list.length > 20) {
      index = Math.floor((Math.random() * (list.length - 20))) + 20
    }
    else {
      index = Math.floor((Math.random() * list.length))
    }
    return list[index];
  }


  
    return <div>
  { movement ?
  <Card sx={{ maxWidth: 345 }}>
        <CardContent>
        <ReactPlayer playsinline url={movement.video} loop={true} controls={true} width="100%" height="56.25%"/>
          <Typography variant="body2" color="text.secondary">
          {language[props.language]["movementCard"]["capturedOn"]}<br/>{movement.start_date.split(".")[0]} {language[props.language]["statistics"]["time"]}<br/>
            {movement.score ? <span>{language[props.language]["movementCard"]["propability"]}{(movement.score*100).toFixed(2)} % <br/> </span> : ""}
            {movement.station_name?  <span>Station:  {movement.station_name} </span>: ""}
          </Typography>
        </CardContent>
        <CardActions>
            < Button size="small" component={Link} to={"/view/station/" + movement.station_id + "/" + movement.mov_id}>{language[props.language]["movementCard"]["goMov"]}</Button>
        </CardActions>
    </Card> : ""}
      

    </div>
  
  
  }
  
  
  export default MovementCard