import { useState, useEffect } from "react";
import { Grid, CircularProgress, Alert, Box } from "@mui/material";
import requests from "../helpers/requests";
import { formatLocalDateTime } from "../helpers/dateUtils";
import StatisticsView from "../Statistics/StatisticsView";

const EBSW_FROM = "2026-05-16";
const EBSW_TO   = "2026-05-24";

const LINKS = [
  {
    label: "EU Biodiversity Sampling Week",
    href: "https://biodiversitysampling.eu",
  },
  {
    label: "Museum für Naturkunde Berlin",
    href: "https://www.museumfuernaturkunde.berlin/en/science/european-biodiversity-sampling-week",
  },
  {
    label: "ECSA – European Citizen Science Association",
    href: "https://ecsa.citizen-science.net",
  },
];

const copy = {
  en: {
    title: "We are part of the EU Biodiversity Sampling Week!",
    intro:
      "During the week of 16 to 24 May 2026, citizen science projects across the EU are taking place to highlight the important contribution of citizen science to biodiversity monitoring. Around the International Day for Biological Diversity, the European Biodiversity Sampling Week brings people together to actively observe and document nature. We invite everyone to take part!",
    linksTitle: "More information",
    statsTitle: "Birdiary during the EBSW",
    statsSubtitle: "(16 – 24 May 2026)",
    pageLead: "On this page we collect all Birdiary observations that fall into the official EBSW time window. As soon as data arrives, the full Birdiary statistics view below updates for the campaign week.",
    activeStations: "Active stations",
    movements: "Recorded movements",
    detections: "Bird detections",
    validations: "Validated observations",
    noData:
      "There are no Birdiary records for the EBSW period yet. Check back again during the campaign week.",
    noDataYet:
      "No cached EBSW data is available yet. Statistics are currently being prepared in the background.",
    loading: "Loading EBSW statistics…",
    error: "Could not load EBSW statistics.",
    overviewTitle: "Campaign overview",
    lastSync: "Last sync",
    neverSynced: "not available yet",
    refreshRunning: "Background refresh is running.",
  },
  de: {
    title: "Wir sind Teil der EU Biodiversity Sampling Week!",
    intro:
      "In der Woche vom 16. bis zum 24. Mai 2026 finden EU-weit Citizen-Science-Projekte statt, um den wichtigen Beitrag von Citizen Science zum Monitoring der Biodiversität aufzuzeigen. Rund um den Internationalen Tag der biologischen Vielfalt soll die European Biodiversity Sampling Week Menschen zusammenbringen, um Natur aktiv zu beobachten und zu dokumentieren. Wir laden alle ein mitzumachen!",
    linksTitle: "Weitere Informationen",
    statsTitle: "Birdiary während der EBSW",
    statsSubtitle: "(16. – 24. Mai 2026)",
    pageLead: "Auf dieser Seite sammeln wir alle Birdiary-Beobachtungen, die in das offizielle EBSW-Zeitfenster fallen. Sobald Daten eingehen, aktualisiert sich unten die vollständige Birdiary-Statistikansicht für die Aktionswoche.",
    activeStations: "Aktive Stationen",
    movements: "Aufgezeichnete Bewegungen",
    detections: "Vogelerkennungen",
    validations: "Validierte Beobachtungen",
    noData:
      "Für den EBSW-Zeitraum liegen noch keine Birdiary-Daten vor. Schau während der Aktionswoche noch einmal vorbei.",
    noDataYet:
      "Es liegen noch keine zwischengespeicherten EBSW-Daten vor. Die Statistik wird gerade im Hintergrund erstellt.",
    loading: "EBSW-Statistiken werden geladen…",
    error: "EBSW-Statistiken konnten nicht geladen werden.",
    overviewTitle: "Kampagnenüberblick",
    lastSync: "Letzte Synchronisierung",
    neverSynced: "noch nicht verfügbar",
    refreshRunning: "Hintergrundaktualisierung läuft.",
  },
};

function EBSW(props) {
  const lang = copy[props.language] || copy.de;

  const [stats, setStats]     = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(false);
  const [pending, setPending] = useState(false);

  useEffect(() => {
    let isMounted = true;
    let retryTimer = null;

    const loadStatistics = () => {
      requests
        .getStatisticsRange("all", EBSW_FROM, EBSW_TO)
        .then((res) => {
          if (!isMounted) {
            return;
          }

          const payload = res.data || null;
          const isPending = res.status === 202 || payload?.cacheStatus === "pending";

          setStats(payload);
          setPending(isPending);
          setError(false);
          setLoading(false);

          if (isPending) {
            retryTimer = window.setTimeout(loadStatistics, 15000);
          }
        })
        .catch(() => {
          if (!isMounted) {
            return;
          }
          setError(true);
          setLoading(false);
          setPending(false);
        });
    };

    loadStatistics();

    return () => {
      isMounted = false;
      if (retryTimer) {
        window.clearTimeout(retryTimer);
      }
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const statCards = stats
    ? [
        { label: lang.activeStations, value: stats.activeStations },
        { label: lang.movements,      value: stats.numberOfMovements },
        { label: lang.detections,     value: stats.numberOfDetections },
        { label: lang.validations,    value: stats.numberOfValidatedBirds },
      ]
    : [];

  const lastSyncLabel = formatLocalDateTime(stats?.lastSync || stats?.createdAt) || null;
  const showStatisticsView = Boolean(
    stats &&
    !pending &&
    (stats.numberOfMovements > 0 || stats.sumEnvironment > 0 || stats.numberOfValidatedBirds > 0)
  );

  return (
    <div style={{ padding: "32px 4vw", maxWidth: 960, margin: "0 auto" }}>
      <div style={{ textAlign: "center", marginBottom: 32 }}>
        <img
          src="/static/img/ebsw-logo.png"
          alt="European Biodiversity Sampling Week Logo"
          style={{ maxHeight: 180, maxWidth: "100%", marginBottom: 16 }}
          onError={(e) => { e.target.style.display = "none"; }}
        />
        <h1 style={{ color: "orange" }}>{lang.title}</h1>
        <p style={{ fontSize: "1.1rem", maxWidth: 720, margin: "0 auto 24px" }}>
          {lang.intro}
        </p>
        <p style={{ maxWidth: 760, margin: "0 auto", lineHeight: 1.6 }}>
          {lang.pageLead}
        </p>
      </div>

      <div style={{ marginBottom: 40 }}>
        <h3>{lang.linksTitle}</h3>
        <ul style={{ listStyle: "none", paddingLeft: 0, margin: 0 }}>
          {LINKS.map((link) => (
            <li key={link.href} style={{ marginBottom: 8, fontSize: "1rem" }}>
              <a href={link.href} target="_blank" rel="noopener noreferrer">
                {link.label}
              </a>
            </li>
          ))}
        </ul>
      </div>

      <div>
        <h2>
          {lang.statsTitle}{" "}
          <span style={{ fontSize: "1rem", fontWeight: 400 }}>
            {lang.statsSubtitle}
          </span>
        </h2>

        <p style={{ marginTop: -8, marginBottom: 24, color: "#666" }}>
          {lang.lastSync}: {lastSyncLabel || lang.neverSynced}
        </p>

        {loading ? (
          <div style={{ textAlign: "center", padding: 32 }}>
            <CircularProgress style={{ color: "orange" }} />
            <p>{lang.loading}</p>
          </div>
        ) : error ? (
          <Alert severity="warning">{lang.error}</Alert>
        ) : stats ? (
          <div>
            <Box sx={{ backgroundColor: "#fff7e6", border: "1px solid #ffd08a", borderRadius: 2, p: 3, mb: 4 }}>
              <h3 style={{ marginTop: 0 }}>{lang.overviewTitle}</h3>
              <Grid container spacing={3} style={{ marginBottom: 8 }}>
              {statCards.map((item) => (
                <Grid item xs={6} sm={3} key={item.label}>
                  <div
                    style={{
                      textAlign: "center",
                      padding: "16px 8px",
                      border: "2px solid orange",
                      borderRadius: 8,
                    }}
                  >
                    <div
                      style={{
                        fontSize: "2.2rem",
                        fontWeight: 700,
                        color: "orange",
                      }}
                    >
                      {item.value ?? 0}
                    </div>
                    <div style={{ fontSize: "0.9rem", marginTop: 4 }}>
                      {item.label}
                    </div>
                  </div>
                </Grid>
              ))}
              </Grid>
            </Box>

            {pending ? (
              <Alert severity="info" sx={{ mb: 4 }}>
                {stats?.message || lang.noDataYet}
              </Alert>
            ) : stats.cacheStatus === "stale" || stats.cacheStatus === "refreshing" ? (
              <Alert severity="info" sx={{ mb: 4 }}>
                {stats?.message || lang.refreshRunning}
              </Alert>
            ) : null}

            {!pending && !showStatisticsView ? (
              <Alert severity="info" sx={{ mb: 4 }}>{lang.noData}</Alert>
            ) : (
              showStatisticsView ? <StatisticsView language={props.language} view={"all"} data={stats}></StatisticsView> : null
            )}
          </div>
        ) : null}
      </div>
    </div>
  );
}

export default EBSW;
