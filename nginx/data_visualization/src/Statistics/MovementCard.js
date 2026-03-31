import { Button, CardActions, Card, CardContent, Typography, IconButton } from '@mui/material';
import ReactPlayer from 'react-player'
import { Link } from 'react-router-dom';
import language from '../languages/languages';
import { useState, useEffect } from 'react';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';

function MovementCard(props) {

  const [movements, setMovements] = useState([])
  const [movementIndex, setMovementIndex] = useState(0)

  useEffect(() => {
    if (Array.isArray(props.movement) && props.movement.length > 0) {
      const sortedMovements = props.movement
        .filter(item => item && item.video)
        .sort((a, b) => (b.start_date || '').localeCompare(a.start_date || ''))
      setMovements(sortedMovements)
      setMovementIndex(0)
    } else {
      setMovements([])
      setMovementIndex(0)
    }
  }, [props.movement]);

  const currentMovement = movements[movementIndex] || null

  const handlePrev = () => {
    setMovementIndex(prev => Math.max(prev - 1, 0))
  }

  const handleNext = () => {
    setMovementIndex(prev => Math.min(prev + 1, movements.length - 1))
  }

  const clipIndicatorTemplate = language[props.language]?.movementCard?.clipIndicator || "Recording {current}/{total}"
  const clipIndicator = clipIndicatorTemplate
    .replace('{current}', movements.length ? movementIndex + 1 : 0)
    .replace('{total}', movements.length)
  const prevLabel = language[props.language]?.movementCard?.previous || 'Previous'
  const nextLabel = language[props.language]?.movementCard?.next || 'Next'


  
    return <div>
  { currentMovement ?
  <Card sx={{ maxWidth: 345 }}>
        <CardContent>
        <ReactPlayer playsinline url={currentMovement.video} loop={true} controls={true} width="100%" height="56.25%"/>
          <Typography variant="body2" color="text.secondary">
          {language[props.language]["movementCard"]["capturedOn"]}<br/>{currentMovement.start_date.split(".")[0]} {language[props.language]["statistics"]["time"]}<br/>
            {currentMovement.score ? <span>{language[props.language]["movementCard"]["propability"]}{(currentMovement.score*100).toFixed(2)} % <br/> </span> : ""}
            {currentMovement.station_name?  <span>Station:  {currentMovement.station_name} </span>: ""}
          </Typography>
        </CardContent>
        <CardActions sx={{ justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 1 }}>
          {movements.length > 1 ?
          <div>
            <IconButton aria-label={prevLabel} onClick={handlePrev} disabled={movementIndex === 0}>
              <ChevronLeftIcon />
            </IconButton>
            <IconButton aria-label={nextLabel} onClick={handleNext} disabled={movementIndex === movements.length -1}>
              <ChevronRightIcon />
            </IconButton>
          </div> : null}
          {movements.length > 0 ? <Typography variant="caption">{clipIndicator}</Typography> : ""}
            < Button size="small" component={Link} to={"/view/station/" + currentMovement.station_id + "/" + currentMovement.mov_id}>{language[props.language]["movementCard"]["goMov"]}</Button>
        </CardActions>
    </Card> : ""}
      

    </div>
  
  
  }
  
  
  export default MovementCard