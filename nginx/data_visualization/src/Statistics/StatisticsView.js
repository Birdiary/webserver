import { Grid, Dialog, DialogActions, Button, DialogTitle, DialogContent, DialogContentText, IconButton, TextField, InputAdornment, Autocomplete } from "@mui/material"
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import SearchIcon from '@mui/icons-material/Search';
import { useState, useMemo } from "react"
import MovementCard from "./MovementCard"
import language from "../languages/languages"
import "./statisticsView.css"


function StatisticsView(props) {

  const [text, setText] = useState("");
  const [open, setOpen] = useState(false)
  const [birdQuery, setBirdQuery] = useState("")

  const allBirds = useMemo(() => {
    if (!props.data || !props.data.all) {
      return []
    }
    return Object.values(props.data.all)
  }, [props.data])

  const filteredBirds = useMemo(() => {
    const rawQuery = birdQuery.trim().toLowerCase()
    const normalizedQuery = rawQuery.replace(/\(.*?\)/g, "").trim()
    const activeQuery = normalizedQuery.length >= 2 ? normalizedQuery : rawQuery

    if (activeQuery.length < 2) {
      return []
    }

    const matchesTerm = (bird, term) => {
      if (!term) {
        return false
      }
      const latin = (bird.latinName || "").toLowerCase()
      const german = (bird.germanName || "").toLowerCase()
      return latin.includes(term) || german.includes(term)
    }

    return allBirds
      .filter((bird) => matchesTerm(bird, activeQuery) || matchesTerm(bird, rawQuery))
      .slice(0, 6)
  }, [allBirds, birdQuery])

  const handleClickOpen = (area) => {
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

  const renderEnvironmentColumn = (entries, heading, valueKey, unit) => {
    const safeEntries = Array.isArray(entries) ? entries.slice().reverse() : []

    return (
      <Grid item lg={2} md={4} sm={6}>
        <h5>{heading}</h5>
        {safeEntries.length > 0 ? (
          <ul className="statistics-env-list">
            {safeEntries.map((entry, index) => {
              const measurement = entry && entry[valueKey] !== undefined ? entry[valueKey] : "-"
              const formattedMeasurement = typeof measurement === "number" ? measurement.toFixed(1) : measurement
              const dateText = entry && entry.date ? entry.date.split(".")[0] : ""
              return (
                <li key={`${heading}-${index}`}>
                  <span className="statistics-env-value">{formattedMeasurement} {unit}</span><br />
                  {dateText ? <span>{language[props.language]["statistics"]["measured"]} {dateText} {language[props.language]["statistics"]["time"]}</span> : ""}
                  {entry && entry.station_name ? <div>{language[props.language]["statistics"]["measuredStation"]}<br /> {entry.station_name}</div> : ""}
                </li>
              )
            })}
          </ul>
        ) : (
          <span className="statistics-env-empty">{language[props.language]["statistics"]["envNoData"]}</span>
        )}
      </Grid>
    )
  }

  return <div style={{ paddingLeft: "4vw", paddingRight: "4vw" }}>

    {allBirds.length > 0 && (
      <div className="statistics-search statistics-search--highlight">
        <h3>{language[props.language]["statistics"]["searchTitle"]}</h3>
        <Autocomplete
          freeSolo
          options={allBirds}
          inputValue={birdQuery}
          onInputChange={(_, value) => setBirdQuery(value)}
          onChange={(_, option) => {
            if (!option) {
              setBirdQuery("")
              return
            }
            if (typeof option === "string") {
              setBirdQuery(option)
              return
            }
            setBirdQuery(option.germanName || option.latinName || "")
          }}
          getOptionLabel={(option) => {
            if (typeof option === "string") {
              return option
            }
            if (!option) {
              return ""
            }
            if (option.germanName && option.latinName && option.germanName !== option.latinName) {
              return `${option.germanName} (${option.latinName})`
            }
            return option.germanName || option.latinName || ""
          }}
          isOptionEqualToValue={(option, value) => {
            if (!value || typeof value === "string") {
              return false
            }
            return option.latinName === value.latinName
          }}
          ListboxProps={{ style: { maxHeight: 280 } }}
          renderOption={(props, option) => (
            <li {...props} key={`search-option-${option.latinName}`}>
              <span className="statistics-search-option-primary">{option.germanName || option.latinName}</span>
              {option.germanName && option.latinName && option.germanName !== option.latinName ? (
                <span className="statistics-search-option-secondary">{option.latinName}</span>
              ) : null}
            </li>
          )}
          renderInput={(params) => (
            <TextField
              {...params}
              placeholder={language[props.language]["statistics"]["searchPlaceholder"]}
              fullWidth
              size="small"
              InputProps={{
                ...params.InputProps,
                startAdornment: (
                  <>
                    <InputAdornment position="start">
                      <SearchIcon fontSize="small" />
                    </InputAdornment>
                    {params.InputProps.startAdornment}
                  </>
                )
              }}
            />
          )}
        />
        {birdQuery.trim().length < 2 ? null :
          filteredBirds.length === 0 ?
            <p className="statistics-search-message">{language[props.language]["statistics"]["searchNoResults"]}</p> :
            <>
              <p className="statistics-search-message">{language[props.language]["statistics"]["searchResultCount"].replace("{count}", filteredBirds.length)}</p>
              <Grid container spacing={2} columns={10}>
                {filteredBirds.map((bird) => (
                  <Grid item lg={2} key={`search-${bird.latinName}`}>
                    <h5> {bird.germanName ? bird.germanName : bird.latinName} ({bird.amount})</h5>
                    {bird.movements && bird.movements.length > 0 ? <MovementCard language={props.language} movement={bird.movements}></MovementCard> : ""}
                  </Grid>
                ))}
              </Grid>
            </>
        }
      </div>
    )}

    <h3 >{language[props.language]["statistics"][props.view]["maxSpecies1"]}{props.data.numberOfMovements} {language[props.language]["statistics"]["maxSpecies2"]} {props.data.numberOfDetections}{language[props.language]["statistics"]["maxSpecies3"]}<br />
      {language[props.language]["statistics"]["the"]} {props.data.maxSpecies.length} {language[props.language]["statistics"]["maxSpecies5"]}
      <IconButton color="primary" aria-label="upload picture" component="span" onClick={() => { handleClickOpen("sum") }} >
        <InfoOutlinedIcon />
      </IconButton></h3>

    <Grid container spacing={2} columns={10} >
      {props.data.maxSpecies.slice(0).reverse().map((bird, i) =>
        <Grid item lg={2} key={`${bird.latinName}-max-${i}`}>
          <h5> {language[props.language]["statistics"]["place"]} {i +1}: <br /> {bird.germanName ? bird.germanName : bird.latinName} ({bird.amount})</h5>

          {bird.movements.length > 0 ? <MovementCard language={props.language} movement={bird.movements}></MovementCard> : ""}
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
        <Grid item lg={2} key={`${bird.latinName}-validated-${i}`}>
          <h5> {language[props.language]["statistics"]["place"]} {i+1}: <br /> {bird.germanName ? bird.germanName : bird.latinName} ({bird.sum})</h5>

          {bird.movements.length > 0 ? <MovementCard language={props.language} movement={bird.movements}></MovementCard> : ""}
        </Grid>
      )}
    </Grid> </div>: 
    <h3 >{language[props.language]["statistics"]["noValidated"]}</h3>
    }
    <h3 >{language[props.language]["statistics"]["on"]} {props.data.perDay} {language[props.language]["statistics"][props.view]["maxDay"]} {language[props.language]["statistics"]["the"]} {props.data.maxDay.length} {language[props.language]["statistics"]["maxDay2"]} </h3>
    <Grid container spacing={2} columns={10}>
      {props.data.maxDay.slice(0).reverse().map((bird, i) =>
        <Grid item lg={2} key={`day-${i}`}>
          <h5> {language[props.language]["statistics"]["place"]}  {i+1}: {language[props.language]["statistics"]["day"]}  {bird.day} {language[props.language]["statistics"]["with"]}  {bird.sum} {language[props.language]["statistics"]["birds"]}  <br /> 
          {bird.mostBirds && bird.mostBirds.length > 0 ? <span>{language[props.language]["statistics"]["maxDay3"]}  {bird.mostBirds[bird.mostBirds.length - 1].germanName ? bird.mostBirds[bird.mostBirds.length - 1].germanName : bird.mostBirds[bird.mostBirds.length - 1].latinName} ({bird.mostBirds[bird.mostBirds.length - 1].amount}) </span> : ""}</h5>

          {bird.mostBirds && bird.mostBirds[bird.mostBirds.length - 1].movements.length > 0 ? <MovementCard language={props.language} movement={bird.mostBirds[bird.mostBirds.length - 1].movements}></MovementCard> : ""}
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
      {props.data.specialBirds.map((bird) =>
        <Grid item lg={2} key={bird.latinName}>
          <h5> {bird.germanName} ({props.data.all[bird.latinName].amount})</h5>

          {bird.movements.length > 0 ? <MovementCard language={props.language} movement={bird.movements}></MovementCard> : ""}
        </Grid>
      )}
    </Grid>
    </div> : ""}
    {props.data.sumEnvironment >0 ?
    <div>
    <h3 >{language[props.language]["statistics"][props.view]["env1"]} {props.data.sumEnvironment} {language[props.language]["statistics"]["env2"]} </h3>
    <p className="statistics-env-intro">{language[props.language]["statistics"]["envRecentTitle"]}</p>
    <Grid container spacing={2} columns={12} >
        {renderEnvironmentColumn(props.data.maxTemp, language[props.language]["statistics"]["maxTemp"], "temperature", "°C")}
        {renderEnvironmentColumn(props.data.minTemp, language[props.language]["statistics"]["minTemp"], "temperature", "°C")}
        {renderEnvironmentColumn(props.data.maxHum, language[props.language]["statistics"]["maxHum"], "humidity", "%")}
        {renderEnvironmentColumn(props.data.minHum, language[props.language]["statistics"]["minHum"], "humidity", "%")}
        <Grid item lg={2} md={4} sm={6}>
          <h5> {language[props.language]["statistics"]["averageTemp"]}</h5>
          <span className="statistics-env-value">{typeof props.data.averageTemp === "number" ? props.data.averageTemp.toFixed(2) : "-"} °C</span>
        </Grid>
        <Grid item lg={2} md={4} sm={6}>
          <h5> {language[props.language]["statistics"]["averageHum"]}</h5>
          <span className="statistics-env-value">{typeof props.data.averageHum === "number" ? props.data.averageHum.toFixed(2) : "-"} %</span>
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