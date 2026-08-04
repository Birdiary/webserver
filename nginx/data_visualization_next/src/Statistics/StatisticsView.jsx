import { Dialog, DialogActions, Button, DialogTitle, DialogContent, DialogContentText, IconButton, TextField, InputAdornment, Autocomplete, Accordion, AccordionSummary, AccordionDetails, Tooltip, ToggleButton, ToggleButtonGroup } from "@mui/material"
import { formatLocalDateTime } from "../helpers/dateUtils"
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import SearchIcon from '@mui/icons-material/Search';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import PlaceOutlinedIcon from '@mui/icons-material/PlaceOutlined';
import VideocamOutlinedIcon from '@mui/icons-material/VideocamOutlined';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import CategoryOutlinedIcon from '@mui/icons-material/CategoryOutlined';
import VerifiedOutlinedIcon from '@mui/icons-material/VerifiedOutlined';
import ThermostatOutlinedIcon from '@mui/icons-material/ThermostatOutlined';
import WaterDropOutlinedIcon from '@mui/icons-material/WaterDropOutlined';
import AcUnitOutlinedIcon from '@mui/icons-material/AcUnitOutlined';
import WbSunnyOutlinedIcon from '@mui/icons-material/WbSunnyOutlined';
import { useState, useMemo } from "react"
import MovementCard from "./MovementCard"
import language from "../languages/languages"
import "./statisticsView.css"


function StatisticsView(props) {

  const [text, setText] = useState("");
  const [open, setOpen] = useState(false)
  const [birdQuery, setBirdQuery] = useState("")
  const [envRange, setEnvRange] = useState("all")
  const [speciesRange, setSpeciesRange] = useState("all")

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

  const showUpdateInfo = props.showUpdateInfo !== false

  const data = props.data
  const stat = language[props.language]["statistics"]
  const dash = stat["dashboard"]

  const numVal = (v) => typeof v === "number" && isFinite(v)
  const collect = (arr, key) => (Array.isArray(arr) ? arr : []).map((e) => (e ? e[key] : null)).filter(numVal)
  const fmt = (v, d = 1) => (numVal(v) ? v.toFixed(d) : "–")

  const speciesCount = data.all ? Object.keys(data.all).length : 0
  const hasEnv = data.sumEnvironment > 0

  const kpis = []
  if (data.activeStations_total !== undefined) {
    kpis.push({ key: "stations", icon: <PlaceOutlinedIcon />, value: data.activeStations_total ?? "–", label: dash.stations })
  }
  kpis.push({ key: "videos", icon: <VideocamOutlinedIcon />, value: data.numberOfMovements ?? "–", label: dash.videos })
  kpis.push({ key: "detections", icon: <VisibilityOutlinedIcon />, value: data.numberOfDetections ?? "–", label: dash.detections })
  kpis.push({ key: "species", icon: <CategoryOutlinedIcon />, value: speciesCount, label: dash.species })
  kpis.push({ key: "validated", icon: <VerifiedOutlinedIcon />, value: data.numberOfValidatedBirds ?? 0, label: dash.validated })

  // Time-bucketed environment extremes come from the API (envExtremes). For
  // older cached docs without it, synthesise an "all" bucket from the extreme
  // arrays so the section still renders.
  const pickExtreme = (arr, key, dir) => {
    const list = (Array.isArray(arr) ? arr : []).filter((e) => e && numVal(e[key]))
    if (!list.length) return null
    return list.reduce((best, e) => ((dir === "max" ? e[key] > best[key] : e[key] < best[key]) ? e : best))
  }
  const hasBuckets = !!(data.envExtremes && typeof data.envExtremes === "object")
  const envSource = hasBuckets ? data.envExtremes : {
    all: {
      warmest: pickExtreme(data.maxTemp, "temperature", "max"),
      coldest: pickExtreme(data.minTemp, "temperature", "min"),
      wettest: pickExtreme(data.maxHum, "humidity", "max"),
      driest: pickExtreme(data.minHum, "humidity", "min"),
    }
  }
  const rangeKeys = hasBuckets ? ["today", "week", "month", "all"] : ["all"]
  const activeRange = rangeKeys.includes(envRange) ? envRange : "all"
  const bucket = envSource[activeRange] || {}
  const rangeLabels = { today: dash.today, week: dash.week, month: dash.month, all: dash.allTime }

  // Time-bucketed species rankings ("videos") — same today/week/month/all idea.
  const hasSpeciesBuckets = !!(data.maxSpeciesByRange && typeof data.maxSpeciesByRange === "object")
  const speciesRangeKeys = hasSpeciesBuckets ? ["today", "week", "month", "all"] : ["all"]
  const activeSpeciesRange = speciesRangeKeys.includes(speciesRange) ? speciesRange : "all"
  const speciesList = activeSpeciesRange === "all"
    ? (data.maxSpecies || [])
    : ((data.maxSpeciesByRange && data.maxSpeciesByRange[activeSpeciesRange]) || [])

  const envValue = (entry, key, unit) => (entry && numVal(entry[key]) ? `${entry[key].toFixed(1)} ${unit}` : "–")
  const envSub = (entry) => (entry && entry.date ? String(entry.date).slice(0, 10) : dash.noEnvData)
  const envTip = (entry) => {
    if (!entry) return ""
    const station = entry.station_name ? `${entry.station_name} · ` : ""
    return `${station}${formatLocalDateTime(entry.date) || entry.date || ""}`
  }
  const envCards = [
    { key: "warmest", icon: <ThermostatOutlinedIcon />, entry: bucket.warmest, k: "temperature", unit: "°C", label: dash.warmest },
    { key: "coldest", icon: <AcUnitOutlinedIcon />, entry: bucket.coldest, k: "temperature", unit: "°C", label: dash.coldest },
    { key: "wettest", icon: <WaterDropOutlinedIcon />, entry: bucket.wettest, k: "humidity", unit: "%", label: dash.mostHumid },
    { key: "driest", icon: <WbSunnyOutlinedIcon />, entry: bucket.driest, k: "humidity", unit: "%", label: dash.driest },
  ]
  const envAverages = [
    { key: "avgTemp", icon: <ThermostatOutlinedIcon />, value: `${fmt(data.averageTemp)} °C`, label: dash.avgTemp },
    { key: "avgHum", icon: <WaterDropOutlinedIcon />, value: `${fmt(data.averageHum)} %`, label: dash.avgHum },
  ]

  const infoBtn = (area) => (
    <IconButton color="primary" aria-label="info" component="span" size="small"
      onClick={(e) => { e.stopPropagation(); handleClickOpen(area) }}>
      <InfoOutlinedIcon fontSize="small" />
    </IconButton>
  )

  return <div className="statistics-view">

    {showUpdateInfo && (
      <div className="stats-updated">
        <span>
          <strong>{stat["lastFullUpdateLabel"]}:</strong>{" "}
          {data.lastFullUpdate ? formatLocalDateTime(data.lastFullUpdate) : stat["neverUpdated"]}
        </span>
        <span>
          <strong>{stat["lastRealtimeUpdateLabel"]}:</strong>{" "}
          {data.lastRealtimeUpdate ? formatLocalDateTime(data.lastRealtimeUpdate) : stat["neverUpdated"]}
        </span>
      </div>
    )}

    {/* At-a-glance metric cards — the headline numbers, always visible. */}
    <div className="stats-metrics">
      {kpis.map((m) => (
        <div className="stats-metric" key={m.key}>
          <span className="stats-metric__icon">{m.icon}</span>
          <div className="stats-metric__body">
            <div className="stats-metric__value">{m.value}</div>
            <div className="stats-metric__label">{m.label}</div>
          </div>
        </div>
      ))}
    </div>

    {hasEnv && (
      <div className="stats-env">
        <div className="stats-env__head">
          <h3 className="stats-section-title">{dash.environment}</h3>
          {hasBuckets && (
            <ToggleButtonGroup
              className="stats-env__range"
              size="small"
              exclusive
              value={activeRange}
              onChange={(_, value) => { if (value) setEnvRange(value) }}
            >
              {rangeKeys.map((rk) => (
                <ToggleButton key={rk} value={rk}>{rangeLabels[rk]}</ToggleButton>
              ))}
            </ToggleButtonGroup>
          )}
        </div>
        <div className="stats-metrics stats-metrics--env">
          {envCards.map((m) => (
            <Tooltip key={m.key} arrow title={envTip(m.entry)} disableHoverListener={!m.entry}>
              <div className="stats-metric stats-metric--env">
                <span className="stats-metric__icon">{m.icon}</span>
                <div className="stats-metric__body">
                  <div className="stats-metric__value">{envValue(m.entry, m.k, m.unit)}</div>
                  <div className="stats-metric__label">{m.label}</div>
                  <div className="stats-metric__sub">{envSub(m.entry)}</div>
                </div>
              </div>
            </Tooltip>
          ))}
          {envAverages.map((m) => (
            <div className="stats-metric stats-metric--env" key={m.key}>
              <span className="stats-metric__icon">{m.icon}</span>
              <div className="stats-metric__body">
                <div className="stats-metric__value">{m.value}</div>
                <div className="stats-metric__label">{m.label}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    )}

    {allBirds.length > 0 && (
      <section className="stats-panel statistics-search statistics-search--highlight">
        <h3 className="stats-panel__title">{stat["searchTitle"]}</h3>
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
          slotProps={{ listbox: { style: { maxHeight: 280 } } }}
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
              slotProps={{
                ...params.slotProps,
                input: {
                  ...params.slotProps.input,
                  startAdornment: (
                    <>
                      <InputAdornment position="start">
                        <SearchIcon fontSize="small" />
                      </InputAdornment>
                      {params.slotProps.input.startAdornment}
                    </>
                  )
                }
              }}
            />
          )}
        />
        {birdQuery.trim().length < 2 ? null :
          filteredBirds.length === 0 ?
            <p className="statistics-search-message">{language[props.language]["statistics"]["searchNoResults"]}</p> :
            <>
              <p className="statistics-search-message">{language[props.language]["statistics"]["searchResultCount"].replace("{count}", filteredBirds.length)}</p>
              <div className="stats-card-grid">
                {filteredBirds.map((bird) => (
                  <div className="stats-rank-item" key={`search-${bird.latinName}`}>
                    <h5 className="stats-rank-label"> {bird.germanName ? bird.germanName : bird.latinName} ({bird.amount})</h5>
                    {bird.movements && bird.movements.length > 0 ? <MovementCard language={props.language} movement={bird.movements}></MovementCard> : ""}
                  </div>
                ))}
              </div>
            </>
        }
      </section>
    )}

    {/* Detail sections behind accordions — the first is open by default. */}
    <div className="stats-accordions">

    <Accordion defaultExpanded disableGutters className="stats-accordion">
      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
        <span className="stats-acc-title">{dash.accSpecies}</span>
      </AccordionSummary>
      <AccordionDetails>
        {hasSpeciesBuckets && (
          <ToggleButtonGroup
            className="stats-acc-range"
            size="small"
            exclusive
            value={activeSpeciesRange}
            onChange={(_, value) => { if (value) setSpeciesRange(value) }}
          >
            {speciesRangeKeys.map((rk) => (
              <ToggleButton key={rk} value={rk}>{rangeLabels[rk]}</ToggleButton>
            ))}
          </ToggleButtonGroup>
        )}
        {activeSpeciesRange === "all" ? (
          <p className="stats-acc-intro">
            {stat[props.view]["maxSpecies1"]}{data.numberOfMovements} {stat["maxSpecies2"]} {data.numberOfDetections}{stat["maxSpecies3"]} {stat["the"]} {data.maxSpecies.length} {stat["maxSpecies5"]}
            {infoBtn("sum")}
          </p>
        ) : (
          <p className="stats-acc-intro">{rangeLabels[activeSpeciesRange]} · {speciesList.length} {dash.species}{infoBtn("sum")}</p>
        )}
        {speciesList.length > 0 ? (
          <div className="stats-card-grid">
            {speciesList.slice(0).reverse().map((bird, i) =>
              <div className="stats-rank-item" key={`sp-${activeSpeciesRange}-${bird.latinName}-${i}`}>
                <h5 className="stats-rank-label"> {stat["place"]} {i + 1}: <br /> {bird.germanName ? bird.germanName : bird.latinName} ({bird.amount})</h5>
                {bird.movements && bird.movements.length > 0 ? <MovementCard language={props.language} movement={bird.movements}></MovementCard> : ""}
              </div>
            )}
          </div>
        ) : (
          <p className="stats-acc-intro">{dash.noEnvData}</p>
        )}
      </AccordionDetails>
    </Accordion>

    <Accordion disableGutters className="stats-accordion">
      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
        <span className="stats-acc-title">{dash.accValidated}</span>
      </AccordionSummary>
      <AccordionDetails>
        {data.numberOfValidatedBirds ?
          <>
            <p className="stats-acc-intro">
              {stat[props.view]["maxValidated"]} {data.numberOfValidatedBirds}. {stat["the"]} {data.maxValidatedBirds.length} {stat["maxValidated2"]}
              {infoBtn("validation")}
            </p>
            <div className="stats-card-grid">
              {data.maxValidatedBirds.slice(0).reverse().map((bird, i) =>
                <div className="stats-rank-item" key={`val-${bird.latinName}-${i}`}>
                  <h5 className="stats-rank-label"> {stat["place"]} {i + 1}: <br /> {bird.germanName ? bird.germanName : bird.latinName} ({bird.sum})</h5>
                  {bird.movements.length > 0 ? <MovementCard language={props.language} movement={bird.movements}></MovementCard> : ""}
                </div>
              )}
            </div>
          </> :
          <p className="stats-acc-intro">{stat["noValidated"]}</p>
        }
      </AccordionDetails>
    </Accordion>

    <Accordion disableGutters className="stats-accordion">
      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
        <span className="stats-acc-title">{dash.accDays}</span>
      </AccordionSummary>
      <AccordionDetails>
        <p className="stats-acc-intro">{stat["on"]} {data.perDay} {stat[props.view]["maxDay"]} {stat["the"]} {data.maxDay.length} {stat["maxDay2"]}</p>
        <div className="stats-card-grid">
          {data.maxDay.slice(0).reverse().map((bird, i) =>
            <div className="stats-rank-item" key={`day-${i}`}>
              <h5 className="stats-rank-label"> {stat["place"]} {i + 1}: {stat["day"]} {bird.day} {stat["with"]} {bird.sum} {stat["birds"]} <br />
              {bird.mostBirds && bird.mostBirds.length > 0 ? <span>{stat["maxDay3"]} {bird.mostBirds[bird.mostBirds.length - 1].germanName ? bird.mostBirds[bird.mostBirds.length - 1].germanName : bird.mostBirds[bird.mostBirds.length - 1].latinName} ({bird.mostBirds[bird.mostBirds.length - 1].amount}) </span> : ""}</h5>
              {bird.mostBirds && bird.mostBirds[bird.mostBirds.length - 1].movements.length > 0 ? <MovementCard language={props.language} movement={bird.mostBirds[bird.mostBirds.length - 1].movements}></MovementCard> : ""}
            </div>
          )}
        </div>
      </AccordionDetails>
    </Accordion>

    {data.specialBirds && data.specialBirds.length > 0 &&
      <Accordion disableGutters className="stats-accordion">
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <span className="stats-acc-title">{dash.accSpecial}</span>
        </AccordionSummary>
        <AccordionDetails>
          <p className="stats-acc-intro">{stat[props.view]["specialBirds"]}{infoBtn("special")}</p>
          <div className="stats-card-grid">
            {data.specialBirds.map((bird) =>
              <div className="stats-rank-item" key={bird.latinName}>
                <h5 className="stats-rank-label"> {bird.germanName} ({data.all[bird.latinName].amount})</h5>
                {bird.movements.length > 0 ? <MovementCard language={props.language} movement={bird.movements}></MovementCard> : ""}
              </div>
            )}
          </div>
        </AccordionDetails>
      </Accordion>
    }

    </div>

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