import { Button, CardActions, Card, CardContent, CardMedia, Typography } from '@mui/material';
import ReactPlayer from 'react-player'
import { useNavigate, Link } from 'react-router-dom';

function MovementCard(props) {
  
  
    return <div>
  
  <Card sx={{ maxWidth: 345 }}>
        <CardContent>
        <ReactPlayer playsinline url={props.movement.video} loop={true} controls={true} width="100%" height="56.25%"/>
          <Typography variant="body2" color="text.secondary">
            Vogel aufgenommen am:  <br/>{props.movement.start_date.split(".")[0]} <br/>
            {props.movement.score ? <span>Wahrscheinlickeit: {(props.movement.score*100).toFixed(2)} % <br/> </span> : ""}
            {props.movement.station_name?  <span>Station:  {props.movement.station_name} </span>: ""}
          </Typography>
        </CardContent>
        <CardActions>
            < Button size="small" component={Link} to={"/view/station/" + props.movement.station_id + "/" + props.movement.mov_id}>Gehe zum Movement</Button>
        </CardActions>
    </Card>
      

    </div>
  
  
  }
  
  
  export default MovementCard