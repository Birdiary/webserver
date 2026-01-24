import { Card, CardContent, Typography, Button, Divider, IconButton } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import "./Legend.css";
import language from "../../languages/languages";
import { STATION_ICON_IMAGES, ICON_STATE } from "../../helpers/icon";

const getLegendLanguage = (languageKey) => {
  const locale = language[languageKey] || language.en;
  return (locale && locale["legend"]) || language.en["legend"];
};

const LegendIcon = ({ src, alt }) => (
  <span className="legend-icon">
    {src ? <img src={src} width={44} height={44} alt={alt} /> : null}
  </span>
);

export function LegendCard({ open, language: languageKey, onClose }) {
  if (!open) {
    return null;
  }

  const legendLanguage = getLegendLanguage(languageKey);
  const head = legendLanguage["head"];
  const description = legendLanguage["description"];
  const meaning = legendLanguage["meaning"];
  const black = legendLanguage["black"];
  const green = legendLanguage["green"];
  const bird = legendLanguage["bird"];
  const blackBird = legendLanguage["blackBird"];

  const legendRows = [
    {
      key: ICON_STATE.OFFLINE,
      label: black,
    },
    {
      key: ICON_STATE.ENVIRONMENT,
      label: green,
    },
    {
      key: ICON_STATE.ENVIRONMENT_BIRD,
      label: bird,
    },
    {
      key: ICON_STATE.BIRD,
      label: blackBird,
    },
  ];

  return (
    <div className="legend-overlay legend-overlay--right">
      <Card elevation={6} className="legend-card">
        <CardContent>
          <div className="legend-card__header">
            <Typography variant="h6" component="h3" className="legend-card__title">
              {head}
            </Typography>
            {onClose ? (
              <IconButton
                aria-label="close legend"
                size="small"
                className="legend-card__close"
                onClick={onClose}
              >
                <CloseIcon fontSize="small" />
              </IconButton>
            ) : null}
          </div>
          <Typography variant="subtitle2" component="h4" gutterBottom>
            {description}
          </Typography>
          <table className="legend-table">
            <thead>
              <tr>
                <th>{meaning}</th>
                <th colSpan={2}>{legendLanguage["symbol"]}</th>
              </tr>
            </thead>
            <tbody>
              {legendRows.map((row) => (
                <tr key={row.key}>
                  <td>{row.label}</td>
                  <td>
                    <LegendIcon
                      src={STATION_ICON_IMAGES.birdiary[row.key]}
                      alt={`${row.label}`}
                    />
                  </td>
                  <td>
                    <LegendIcon
                      src={STATION_ICON_IMAGES.duisbird[row.key]}
                      alt={`${row.label}`}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}

export function LegendInfoCard({
  open,
  language: languageKey,
  showAllStations,
  hiddenStationCount = 0,
  onToggleShowAll,
  onClose,
}) {
  if (!open) {
    return null;
  }

  const legendLanguage = getLegendLanguage(languageKey);
  const inactiveNotice = legendLanguage["inactiveNotice"];
  const showAllLabel = showAllStations
    ? legendLanguage["hideInactive"]
    : legendLanguage["showAll"];
  const hiddenStationsText = hiddenStationCount > 0 ? ` (${hiddenStationCount})` : "";

  return (
    <div className="legend-overlay legend-overlay--left">
      <Card elevation={6} className="legend-card legend-card--notice">
        <CardContent>
          <div className="legend-card__header legend-card__header--compact">
            <Typography variant="body2" className="legend__inactive-notice">
              {inactiveNotice}
              {hiddenStationsText}
            </Typography>
            {onClose ? (
              <IconButton
                aria-label="close inactive info"
                size="small"
                className="legend-card__close"
                onClick={onClose}
              >
                <CloseIcon fontSize="small" />
              </IconButton>
            ) : null}
          </div>
          <Divider className="legend__notice-divider" />
          <Button
            fullWidth
            variant="contained"
            color="warning"
            onClick={onToggleShowAll}
            className="legend__toggle-btn"
          >
            {showAllLabel}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

export default LegendCard;