import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Alert, Box, Button, Divider, IconButton, Paper, TextField, Tooltip, Typography, FormControl, InputLabel, MenuItem, Select, FormControlLabel, Switch } from '@mui/material';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import RefreshIcon from '@mui/icons-material/Refresh';
import DeleteIcon from '@mui/icons-material/Delete';
import LaunchIcon from '@mui/icons-material/Launch';
import language from '../languages/languages';
import requests from '../helpers/requests';
import { useAuth } from '../context/AuthContext';
import { Link as RouterLink } from 'react-router-dom';
import './OwnStations.css';

const SOFTWARE_VALUES = ['birdiary', 'duisbird'];
const MOVEMENT_INITIAL_LIMIT = 5;
const MOVEMENT_INCREMENT = 20;
const ensureMovementMetaShape = (meta = {}) => {
  const limit = typeof meta.limit === 'number' ? meta.limit : MOVEMENT_INITIAL_LIMIT;
  const offset = typeof meta.offset === 'number' ? meta.offset : 0;
  const returned = typeof meta.returned === 'number' ? meta.returned : 0;
  const total = typeof meta.total === 'number' ? meta.total : Math.max(returned + offset, 0);
  const hasMore = typeof meta.hasMore === 'boolean' ? meta.hasMore : ((offset + returned) < total);
  return {
    limit,
    offset,
    returned,
    total,
    hasMore,
    loading: Boolean(meta.loading),
    loadedAll: meta.loadedAll ?? !hasMore,
  };
};
const normalizeSoftware = (value) => {
  const normalized = (value || '').toLowerCase();
  return SOFTWARE_VALUES.includes(normalized) ? normalized : SOFTWARE_VALUES[0];
};

const createDraftFromStation = (station) => ({
  name: station.name || '',
  lat: station.location?.lat ?? '',
  lng: station.location?.lng ?? '',
  mailAdresses: (station.mail?.adresses || []).join(', '),
  mailNotifications: Boolean(station.mail?.notifications),
  sensebox_id: station.sensebox_id || '',
  type: station.type || 'observer',
  stationSoftware: normalizeSoftware(station.stationSoftware),
  advancedSettingsRaw: JSON.stringify(station.advancedSettings || {}, null, 2),
});

const parseMailAddresses = (value) => (
  value
    .split(',')
    .map((entry) => entry.trim())
    .filter((entry) => entry.length > 0)
);

const formatDateTime = (value) => {
  if (!value) {
    return '';
  }
  try {
    return new Date(value).toLocaleString();
  } catch (err) {
    return value;
  }
};

const OwnStations = ({ language: langKey }) => {
  const copy = language[langKey]?.ownStations || language.en.ownStations;
  const { token, resetPassword, user, resendVerification: resendVerificationEmail, logout } = useAuth();
  const isAdmin = Boolean(user?.isAdmin);
  const [stations, setStations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stationDrafts, setStationDrafts] = useState({});
  const [stationErrors, setStationErrors] = useState({});
  const [statusMessage, setStatusMessage] = useState(null);
  const [passwordForm, setPasswordForm] = useState({ current: '', next: '' });
  const [passwordStatus, setPasswordStatus] = useState(null);
  const [passwordError, setPasswordError] = useState(null);
  const [movementMeta, setMovementMeta] = useState({});
  const [assignForms, setAssignForms] = useState({});
  const [assignFeedback, setAssignFeedback] = useState({});
  const [claimForm, setClaimForm] = useState({ stationId: '' });
  const [claimStatus, setClaimStatus] = useState(null);
  const [claimError, setClaimError] = useState(null);
  const [verificationStatus, setVerificationStatus] = useState(null);
  const [verificationError, setVerificationError] = useState(null);
  const [verificationLoading, setVerificationLoading] = useState(false);
  const [accountDeleteStatus, setAccountDeleteStatus] = useState(null);
  const [accountDeleteError, setAccountDeleteError] = useState(null);
  const [adminUsers, setAdminUsers] = useState([]);
  const [adminUsersLoading, setAdminUsersLoading] = useState(false);
  const [adminUsersError, setAdminUsersError] = useState(null);
  const [adminUserStatus, setAdminUserStatus] = useState(null);
  const [adminUserError, setAdminUserError] = useState(null);
  const userEmail = (user?.email || '').trim();
  const normalizedResendEmail = userEmail.toLowerCase();
  const isEmailVerified = Boolean(user?.emailVerified);
  const serverResendAvailable = stations.some((station) => station?.canResendVerificationEmail);
  const showVerificationInfo = Boolean(userEmail);
  const verificationMessage = isEmailVerified ? copy.emailStatusVerified : copy.emailStatusPending;
  const canResendVerificationEmail = !isEmailVerified && (normalizedResendEmail.length > 0 || serverResendAvailable);
  const softwareOptions = useMemo(() => (
    SOFTWARE_VALUES.map((value) => ({
      value,
      label: copy.softwareOptions?.[value] || value,
    }))
  ), [copy.softwareOptions]);

  const fetchStations = useCallback(async () => {
    if (!token) {
      setStations([]);
      setStationDrafts({});
      setStationErrors({});
      setMovementMeta({});
      setAssignForms({});
      setAssignFeedback({});
      setClaimForm({ stationId: '' });
      setClaimStatus(null);
      setClaimError(null);
      setVerificationStatus(null);
      setVerificationError(null);
      setVerificationLoading(false);
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const response = await requests.getMyStations(token, { movements: MOVEMENT_INITIAL_LIMIT });
      setStations(response.data);
      const drafts = {};
      const meta = {};
      const assignState = {};
      response.data.forEach((station) => {
        drafts[station.station_id] = createDraftFromStation(station);
        const stationMeta = ensureMovementMetaShape({
          ...station.movementsMeta,
          returned: station.movements?.length ?? station.movementsMeta?.returned,
          loading: false,
        });
        meta[station.station_id] = stationMeta;
        assignState[station.station_id] = { userId: '', email: '' };
      });
      setStationDrafts(drafts);
      setStationErrors({});
      setMovementMeta(meta);
      if (isAdmin) {
        setAssignForms(assignState);
      } else {
        setAssignForms({});
      }
      setAssignFeedback({});
    } catch (err) {
      setError(err.response?.data?.message || copy.loadError);
    } finally {
      setLoading(false);
    }
  }, [token, copy.loadError, isAdmin]);

  const fetchAdminUsers = useCallback(async () => {
    if (!token || !isAdmin) {
      setAdminUsers([]);
      setAdminUsersError(null);
      setAdminUsersLoading(false);
      return;
    }
    setAdminUsersLoading(true);
    setAdminUsersError(null);
    try {
      const response = await requests.adminListUsers(token);
      setAdminUsers(response.data || []);
    } catch (err) {
      setAdminUsersError(copy.adminUsersLoadError);
    } finally {
      setAdminUsersLoading(false);
    }
  }, [token, isAdmin, copy.adminUsersLoadError]);

  useEffect(() => {
    fetchStations();
  }, [fetchStations]);

  useEffect(() => {
    if (isAdmin) {
      fetchAdminUsers();
    } else {
      setAdminUsers([]);
    }
  }, [isAdmin, fetchAdminUsers]);

  const handleResendVerification = useCallback(async () => {
    if (!normalizedResendEmail) {
      setVerificationError(copy.resendVerificationError);
      return;
    }
    setVerificationStatus(null);
    setVerificationError(null);
    setVerificationLoading(true);
    try {
      await resendVerificationEmail(normalizedResendEmail);
      setVerificationStatus(copy.resendVerificationSuccess);
    } catch (err) {
      setVerificationError(err.response?.data?.message || copy.resendVerificationError);
    } finally {
      setVerificationLoading(false);
    }
  }, [normalizedResendEmail, resendVerificationEmail, copy.resendVerificationError, copy.resendVerificationSuccess]);

  const handleDeleteAccount = useCallback(async () => {
    if (!token) {
      return;
    }
    const confirmed = window.confirm(copy.accountDeleteConfirm);
    if (!confirmed) {
      return;
    }
    setAccountDeleteStatus(null);
    setAccountDeleteError(null);
    try {
      await requests.deleteCurrentUser(token);
      setAccountDeleteStatus(copy.accountDeleteSuccess);
      if (typeof logout === 'function') {
        await logout();
      }
    } catch (err) {
      setAccountDeleteError(copy.accountDeleteError);
    }
  }, [token, copy.accountDeleteConfirm, copy.accountDeleteSuccess, copy.accountDeleteError, logout]);

  const handleAdminDeleteUser = useCallback(async (targetUser) => {
    if (!isAdmin || !token || !targetUser?.id) {
      return;
    }
    const label = targetUser.email || targetUser.id;
    const confirmed = window.confirm(copy.adminDeleteConfirm.replace('{email}', label));
    if (!confirmed) {
      return;
    }
    setAdminUserStatus(null);
    setAdminUserError(null);
    try {
      await requests.adminDeleteUser(targetUser.id, token);
      setAdminUserStatus(copy.adminDeleteSuccess.replace('{email}', label));
      await fetchAdminUsers();
    } catch (err) {
      setAdminUserError(copy.adminDeleteError);
    }
  }, [isAdmin, token, copy.adminDeleteConfirm, copy.adminDeleteSuccess, copy.adminDeleteError, fetchAdminUsers]);

  const handleAdminSetPassword = useCallback(async (targetUser) => {
    if (!isAdmin || !token || !targetUser?.id) {
      return;
    }
    const label = targetUser.email || targetUser.id;
    const newPassword = window.prompt(copy.adminUserPasswordPrompt.replace('{email}', label));
    if (newPassword === null) {
      return;
    }
    const trimmedPassword = newPassword.trim();
    if (trimmedPassword.length < 8) {
      setAdminUserError(copy.adminPasswordValidationError);
      return;
    }
    setAdminUserStatus(null);
    setAdminUserError(null);
    try {
      await requests.adminSetUserPassword({ userId: targetUser.id, newPassword: trimmedPassword }, token);
      setAdminUserStatus(copy.adminUserPasswordSuccess.replace('{email}', label));
    } catch (err) {
      setAdminUserError(copy.adminUserPasswordError);
    }
  }, [isAdmin, token, copy.adminUserPasswordPrompt, copy.adminPasswordValidationError, copy.adminUserPasswordSuccess, copy.adminUserPasswordError]);

  const updateDraftState = (stationId, updater) => {
    setStationDrafts((prev) => {
      const baseStation = stations.find((station) => station.station_id === stationId) || {};
      const baseDraft = prev[stationId] || createDraftFromStation(baseStation);
      const nextDraft = typeof updater === 'function' ? updater(baseDraft) : { ...baseDraft, ...updater };
      return { ...prev, [stationId]: nextDraft };
    });
  };

  const handleFieldChange = (stationId, field) => (event) => {
    let { value } = event.target;
    if (field === 'stationSoftware') {
      value = normalizeSoftware(value);
    }
    updateDraftState(stationId, (draft) => ({ ...draft, [field]: value }));
    setStationErrors((prev) => ({ ...prev, [stationId]: null }));
  };

  const handleToggleChange = (stationId, field) => (event) => {
    const { checked } = event.target;
    updateDraftState(stationId, (draft) => ({ ...draft, [field]: checked }));
    setStationErrors((prev) => ({ ...prev, [stationId]: null }));
  };

  const handleAssignFieldChange = (stationId, field) => (event) => {
    const { value } = event.target;
    setAssignForms((prev) => {
      const current = prev[stationId] || { userId: '', email: '' };
      return { ...prev, [stationId]: { ...current, [field]: value } };
    });
    setAssignFeedback((prev) => ({ ...prev, [stationId]: null }));
  };

  const requestStationMovements = async (stationId, { limit, offset = 0, mergeMode = 'replace' } = {}) => {
    setMovementMeta((prev) => {
      const base = ensureMovementMetaShape(prev[stationId]);
      return { ...prev, [stationId]: { ...base, loading: true } };
    });
    const params = {};
    if (typeof limit === 'number' && limit > 0) {
      params.movements = limit;
    }
    if (typeof offset === 'number' && offset > 0) {
      params.movementsOffset = offset;
    }
    try {
      const response = await requests.getStation(stationId, params, token);
      const fetchedMovements = response.data?.measurements?.movements
        || response.data?.movements
        || [];
      let updatedCount = 0;
      setStations((prev) => prev.map((station) => {
        if (station.station_id !== stationId) {
          return station;
        }
        const currentMovements = station.movements || [];
        let nextMovements = fetchedMovements;
        if (mergeMode === 'append') {
          const existingIds = new Set(currentMovements.map((movement) => movement.mov_id));
          const deduped = fetchedMovements.filter((movement) => !existingIds.has(movement.mov_id));
          nextMovements = [...currentMovements, ...deduped];
        }
        updatedCount = nextMovements.length;
        return { ...station, movements: nextMovements };
      }));
      const serverMeta = response.data?.movementsMeta || {};
      const totalFromServer = typeof serverMeta.total === 'number' ? serverMeta.total : updatedCount;
      const hasMoreFromServer = typeof serverMeta.hasMore === 'boolean'
        ? serverMeta.hasMore
        : updatedCount < totalFromServer;
      setMovementMeta((prev) => ({
        ...prev,
        [stationId]: ensureMovementMetaShape({
          ...serverMeta,
          offset: mergeMode === 'append'
            ? Math.max(0, updatedCount - fetchedMovements.length)
            : serverMeta.offset,
          returned: serverMeta.returned ?? fetchedMovements.length,
          total: totalFromServer,
          hasMore: hasMoreFromServer,
          loading: false,
          loadedAll: !hasMoreFromServer,
          limit: typeof serverMeta.limit === 'number'
            ? serverMeta.limit
            : (typeof limit === 'number' ? limit : MOVEMENT_INITIAL_LIMIT),
        }),
      }));
    } catch (err) {
      setError(err.response?.data?.message || copy.loadError);
      setMovementMeta((prev) => ({
        ...prev,
        [stationId]: { ...ensureMovementMetaShape(prev[stationId]), loading: false },
      }));
    }
  };

  const handleLoadMoreMovements = (stationId) => {
    const currentStation = stations.find((station) => station.station_id === stationId);
    const currentCount = currentStation?.movements?.length || 0;
    requestStationMovements(stationId, {
      limit: MOVEMENT_INCREMENT,
      offset: currentCount,
      mergeMode: 'append',
    });
  };

  const handleLoadAllMovements = (stationId) => {
    requestStationMovements(stationId, { mergeMode: 'replace' });
  };

  const handleSaveStation = async (stationId) => {
    const draft = stationDrafts[stationId];
    if (!draft) {
      return;
    }
    const lat = parseFloat(draft.lat);
    const lng = parseFloat(draft.lng);
    if (Number.isNaN(lat) || Number.isNaN(lng)) {
      setStationErrors((prev) => ({ ...prev, [stationId]: copy.invalidLocation }));
      return;
    }
    let advancedSettings = {};
    if (draft.advancedSettingsRaw && draft.advancedSettingsRaw.trim().length > 0) {
      try {
        advancedSettings = JSON.parse(draft.advancedSettingsRaw);
      } catch (parseError) {
        setStationErrors((prev) => ({ ...prev, [stationId]: copy.invalidAdvancedSettings }));
        return;
      }
    }
    const stationSoftware = normalizeSoftware(draft.stationSoftware);
    const payload = {
      name: draft.name,
      location: { lat, lng },
      mail: {
        adresses: parseMailAddresses(draft.mailAdresses),
        notifications: Boolean(draft.mailNotifications),
      },
      sensebox_id: draft.sensebox_id,
      type: draft.type,
      stationSoftware,
      advancedSettings,
    };
    setStatusMessage(null);
    try {
      await requests.updateStation(stationId, payload, token);
      setStations((prev) => prev.map((station) => {
        if (station.station_id !== stationId) {
          return station;
        }
        return {
          ...station,
          name: payload.name,
          location: payload.location,
          mail: payload.mail,
          sensebox_id: payload.sensebox_id,
          type: payload.type,
          stationSoftware: payload.stationSoftware,
          advancedSettings: payload.advancedSettings,
        };
      }));
      updateDraftState(stationId, () => ({
        name: payload.name,
        lat,
        lng,
        mailAdresses: (payload.mail.adresses || []).join(', '),
        mailNotifications: payload.mail.notifications,
        sensebox_id: payload.sensebox_id,
        type: payload.type,
        stationSoftware: payload.stationSoftware,
        advancedSettingsRaw: JSON.stringify(payload.advancedSettings || {}, null, 2),
      }));
      setStationErrors((prev) => ({ ...prev, [stationId]: null }));
      setStatusMessage(copy.saveSuccess);
    } catch (err) {
      setError(err.response?.data?.message || copy.saveError);
    }
  };

  const handleDeleteStation = async (station) => {
    const confirmed = window.confirm(copy.deleteConfirm.replace('{name}', station.name));
    if (!confirmed) {
      return;
    }
    setStatusMessage(null);
    try {
      await requests.deleteStation(station.station_id, token, true);
      setStations((prev) => prev.filter((item) => item.station_id !== station.station_id));
      setMovementMeta((prev) => {
        const next = { ...prev };
        delete next[station.station_id];
        return next;
      });
      setStatusMessage(copy.deleteSuccess);
    } catch (err) {
      setError(err.response?.data?.message || copy.deleteError);
    }
  };

  const handleDeleteMovement = async (stationId, movementId) => {
    const confirmed = window.confirm(copy.deleteMovementConfirm);
    if (!confirmed) {
      return;
    }
    try {
      await requests.deleteMovement(stationId, movementId, token, true);
      const targetStation = stations.find((station) => station.station_id === stationId);
      const filteredMovements = (targetStation?.movements || []).filter((movement) => movement.mov_id !== movementId);
      setStations((prev) => prev.map((station) => (
        station.station_id === stationId
          ? { ...station, movements: filteredMovements }
          : station
      )));
      setMovementMeta((prev) => ({
        ...prev,
        [stationId]: {
          ...ensureMovementMetaShape(prev[stationId]),
          limit: filteredMovements.length,
        },
      }));
      setStatusMessage(copy.deleteMovementSuccess);
    } catch (err) {
      setError(err.response?.data?.message || copy.deleteMovementError);
    }
  };

  const handleCopyKey = async (key) => {
    try {
      await navigator.clipboard.writeText(key);
      setStatusMessage(copy.keyCopied);
    } catch (err) {
      setError(copy.keyCopyError);
    }
  };

  const handlePasswordInput = (event) => {
    const { name, value } = event.target;
    setPasswordForm((prev) => ({ ...prev, [name]: value }));
  };

  const handlePasswordSubmit = async (event) => {
    event.preventDefault();
    setPasswordStatus(null);
    setPasswordError(null);
    try {
      await resetPassword(passwordForm.current, passwordForm.next);
      setPasswordStatus(copy.passwordSuccess);
      setPasswordForm({ current: '', next: '' });
    } catch (err) {
      setPasswordError(err.response?.data?.message || copy.passwordError);
    }
  };

  const handleAssignOwner = async (stationId) => {
    if (!isAdmin) {
      return;
    }
    const currentForm = assignForms[stationId] || { userId: '', email: '' };
    const payload = {};
    if (currentForm.userId?.trim()) {
      payload.userId = currentForm.userId.trim();
    }
    if (currentForm.email?.trim()) {
      payload.email = currentForm.email.trim();
    }
    if (!payload.userId && !payload.email) {
      setAssignFeedback((prev) => ({
        ...prev,
        [stationId]: { error: copy.adminAssignMissingFields },
      }));
      return;
    }
    setAssignFeedback((prev) => ({ ...prev, [stationId]: null }));
    try {
      const response = await requests.adminAssignStationOwner(stationId, payload, token);
      if (response.data?.station) {
        setStations((prev) => prev.map((station) => (
          station.station_id === stationId ? response.data.station : station
        )));
      } else {
        await fetchStations();
      }
      setAssignFeedback((prev) => ({
        ...prev,
        [stationId]: { status: copy.adminAssignSuccess },
      }));
      setAssignForms((prev) => ({
        ...prev,
        [stationId]: { userId: '', email: '' },
      }));
    } catch (err) {
      setAssignFeedback((prev) => ({
        ...prev,
        [stationId]: { error: err.response?.data?.message || copy.adminAssignError },
      }));
    }
  };

  const handleClaimInput = (event) => {
    const { name, value } = event.target;
    setClaimForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleClaimStation = async (event) => {
    event.preventDefault();
    setClaimStatus(null);
    setClaimError(null);
    if (!claimForm.stationId.trim()) {
      setClaimError(copy.claimMissingFields);
      return;
    }
    try {
      await requests.claimStation({ stationId: claimForm.stationId.trim() }, token);
      setClaimStatus(copy.claimSuccess);
      setClaimForm({ stationId: '' });
      fetchStations();
    } catch (err) {
      setClaimError(err.response?.data?.message || copy.claimError);
    }
  };

  const stationList = useMemo(() => stations || [], [stations]);

  return (
    <Box className="own-stations-wrapper">
      <Box className="own-stations-header">
        <div>
          <Typography variant="h4" component="h1">
            {copy.title}
          </Typography>
          <Typography variant="body1" color="textSecondary">
            {copy.subtitle}
          </Typography>
        </div>
        <Button variant="outlined" startIcon={<RefreshIcon />} onClick={fetchStations}>
          {copy.refresh}
        </Button>
      </Box>

      {statusMessage && (
        <Alert severity="success" sx={{ mb: 2 }}>
          {statusMessage}
        </Alert>
      )}

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {verificationStatus && (
        <Alert severity="success" sx={{ mb: 2 }}>
          {verificationStatus}
        </Alert>
      )}

      {verificationError && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {verificationError}
        </Alert>
      )}

      {showVerificationInfo && (
        <Alert
          severity={isEmailVerified ? 'success' : 'warning'}
          sx={{ mb: 2 }}
          action={canResendVerificationEmail ? (
            <Button
              color="inherit"
              size="small"
              onClick={handleResendVerification}
              disabled={verificationLoading}
            >
              {verificationLoading ? copy.resendVerificationSending : copy.resendVerification}
            </Button>
          ) : null}
        >
          {verificationMessage}
        </Alert>
      )}

      {loading ? (
        <div className="own-stations-loading">{copy.loading}</div>
      ) : stationList.length === 0 ? (
        <Paper className="own-stations-card">
          <Typography variant="body1">{copy.empty}</Typography>
          <Button component={RouterLink} to="/view/createStation" sx={{ mt: 2 }} variant="contained">
            {copy.createCta}
          </Button>
        </Paper>
      ) : (
        stationList.map((station) => {
          const draft = stationDrafts[station.station_id] || createDraftFromStation(station);
          const stationError = stationErrors[station.station_id];
          const currentMovementCount = station.movements?.length || 0;
          const fallbackHasMore = MOVEMENT_INITIAL_LIMIT > 0 && currentMovementCount === MOVEMENT_INITIAL_LIMIT;
          const movementInfo = movementMeta[station.station_id] || ensureMovementMetaShape({
            returned: currentMovementCount,
            total: currentMovementCount,
            hasMore: fallbackHasMore,
            loadedAll: !fallbackHasMore,
            loading: false,
          });
          const assignForm = assignForms[station.station_id] || { userId: '', email: '' };
          const assignState = assignFeedback[station.station_id];
          const ownerSummary = station.owner;
          const ownerDisplay = ownerSummary
            ? [ownerSummary.name, ownerSummary.email].filter(Boolean).join(' · ')
            : (station.ownerId ? `${copy.ownerIdLabel}: ${station.ownerId}` : copy.ownerNone);
          return (
          <Paper key={station.station_id} className="own-stations-card" elevation={3}>
            <Box className="station-card-header">
              <div>
                <Typography variant="h6">{station.name}</Typography>
                <Typography variant="body2" color="textSecondary">
                  ID: {station.station_id}
                </Typography>
              </div>
              <Box>
                <Button
                  component={RouterLink}
                  to={`/view/station/${station.station_id}`}
                  endIcon={<LaunchIcon />}
                  sx={{ mr: 1 }}
                >
                  {copy.viewStation}
                </Button>
                <Button
                  color="error"
                  variant="text"
                  startIcon={<DeleteIcon />}
                  onClick={() => handleDeleteStation(station)}
                >
                  {copy.deleteStation}
                </Button>
              </Box>
            </Box>

            {station.key && (
              <Box className="station-key-row">
                <Typography variant="body2">{copy.stationKey}: {station.key}</Typography>
                <Tooltip title={copy.copyKey}>
                  <IconButton size="small" onClick={() => handleCopyKey(station.key)}>
                    <ContentCopyIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              </Box>
            )}

            <Divider sx={{ my: 2 }} />

                  <div className="station-field-grid">
                    <TextField
                      label={copy.nameLabel}
                      value={draft.name}
                      onChange={handleFieldChange(station.station_id, 'name')}
                    />
                    <TextField
                      label={copy.locationLat}
                      value={draft.lat}
                      onChange={handleFieldChange(station.station_id, 'lat')}
                      type="number"
                    />
                    <TextField
                      label={copy.locationLng}
                      value={draft.lng}
                      onChange={handleFieldChange(station.station_id, 'lng')}
                      type="number"
                    />
                    <TextField
                      label={copy.mailAddresses}
                      value={draft.mailAdresses}
                      onChange={handleFieldChange(station.station_id, 'mailAdresses')}
                      helperText={copy.mailHelper}
                      multiline
                      minRows={2}
                    />
                    <FormControl fullWidth>
                      <InputLabel>{copy.typeLabel}</InputLabel>
                      <Select
                        value={draft.type}
                        label={copy.typeLabel}
                        onChange={handleFieldChange(station.station_id, 'type')}
                      >
                        {Object.entries(copy.types || {}).map(([value, label]) => (
                          <MenuItem key={value} value={value}>{label}</MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                    <TextField
                      label={copy.senseboxLabel}
                      value={draft.sensebox_id}
                      onChange={handleFieldChange(station.station_id, 'sensebox_id')}
                    />
                    <FormControl fullWidth>
                      <InputLabel>{copy.softwareLabel}</InputLabel>
                      <Select
                        value={draft.stationSoftware}
                        label={copy.softwareLabel}
                        onChange={handleFieldChange(station.station_id, 'stationSoftware')}
                      >
                        {softwareOptions.map((option) => (
                          <MenuItem key={option.value} value={option.value}>
                            {option.label}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </div>
                  <FormControlLabel
                    control={(
                      <Switch
                        checked={draft.mailNotifications}
                        onChange={handleToggleChange(station.station_id, 'mailNotifications')}
                      />
                    )}
                    label={copy.mailNotifications}
                    sx={{ mt: 2 }}
                  />
                  <div className="station-advanced-field">
                    <TextField
                      label={copy.advancedSettings}
                      value={draft.advancedSettingsRaw}
                      onChange={handleFieldChange(station.station_id, 'advancedSettingsRaw')}
                      multiline
                      minRows={4}
                      maxRows={10}
                      fullWidth
                    />
                    <Typography variant="caption" color="textSecondary">
                      {copy.advancedSettingsHelper}
                    </Typography>
                  </div>
                  {stationError && (
                    <Alert severity="warning" sx={{ mt: 2 }}>
                      {stationError}
                    </Alert>
                  )}
                  <Button variant="contained" sx={{ mt: 2 }} onClick={() => handleSaveStation(station.station_id)}>
                    {copy.saveStation}
                  </Button>

            {isAdmin && (
              <>
                <Divider sx={{ my: 2 }} />
                <Typography variant="subtitle1" gutterBottom>
                  {copy.adminAssignTitle}
                </Typography>
                <Typography variant="body2" color="textSecondary" sx={{ mb: 1 }}>
                  {copy.ownerLabel}: {ownerDisplay || copy.ownerNone}
                </Typography>
                <Box className="station-field-grid">
                  <TextField
                    label={copy.adminAssignUserId}
                    value={assignForm.userId}
                    onChange={handleAssignFieldChange(station.station_id, 'userId')}
                  />
                  <TextField
                    label={copy.adminAssignEmail}
                    value={assignForm.email}
                    onChange={handleAssignFieldChange(station.station_id, 'email')}
                  />
                </Box>
                <Typography variant="caption" color="textSecondary" sx={{ display: 'block', mt: 1 }}>
                  {copy.adminAssignHelper}
                </Typography>
                {assignState?.status && (
                  <Alert severity="success" sx={{ mt: 1 }}>
                    {assignState.status}
                  </Alert>
                )}
                {assignState?.error && (
                  <Alert severity="error" sx={{ mt: 1 }}>
                    {assignState.error}
                  </Alert>
                )}
                <Button
                  variant="outlined"
                  sx={{ mt: 2 }}
                  onClick={() => handleAssignOwner(station.station_id)}
                >
                  {copy.adminAssignSubmit}
                </Button>
              </>
            )}

            <Divider sx={{ my: 2 }} />

            <Typography variant="subtitle1" gutterBottom>
              {copy.movements}
            </Typography>
            {(station.movements && station.movements.length > 0) ? (
              <Box className="station-movement-list">
                {station.movements.map((movement) => (
                  <Box key={movement.mov_id} className="movement-row">
                    <div>
                      <Typography variant="body2">{copy.movementDate}: {movement.start_date}</Typography>
                      <Typography variant="caption" color="textSecondary">
                        {copy.movementSpecies}: {movement.detections?.[0]?.germanName || movement.detections?.[0]?.latinName || copy.noSpecies}
                      </Typography>
                    </div>
                    <Button
                      color="error"
                      size="small"
                      startIcon={<DeleteIcon fontSize="small" />}
                      onClick={() => handleDeleteMovement(station.station_id, movement.mov_id)}
                    >
                      {copy.deleteMovement}
                    </Button>
                  </Box>
                ))}
              </Box>
            ) : (
              <Typography variant="body2" color="textSecondary">
                {copy.noMovements}
              </Typography>
            )}
            <Box className="movement-actions">
              {movementInfo.hasMore ? (
                <Button
                  size="small"
                  variant="outlined"
                  onClick={() => handleLoadMoreMovements(station.station_id)}
                  disabled={movementInfo.loading}
                >
                  {movementInfo.loading ? copy.loadingMovements : copy.loadMoreMovements}
                </Button>
              ) : (
                <Typography variant="caption" color="textSecondary">
                  {copy.allMovementsLoaded}
                </Typography>
              )}
              <Button
                size="small"
                variant="text"
                onClick={() => handleLoadAllMovements(station.station_id)}
                disabled={movementInfo.loading || movementInfo.loadedAll}
              >
                {copy.loadAllMovements}
              </Button>
            </Box>
          </Paper>
          );
        })
      )}

      {isAdmin && (
        <Paper className="own-stations-card" elevation={3}>
          <Typography variant="h6" gutterBottom>
            {copy.adminUsersTitle}
          </Typography>
          <Typography variant="body2" color="textSecondary" gutterBottom>
            {copy.adminUsersHelper}
          </Typography>
          {adminUserStatus && (
            <Alert severity="success" sx={{ mb: 2 }}>
              {adminUserStatus}
            </Alert>
          )}
          {adminUserError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {adminUserError}
            </Alert>
          )}
          {adminUsersError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {adminUsersError}
            </Alert>
          )}
          {adminUsersLoading ? (
            <Typography variant="body2" color="textSecondary">
              {copy.adminUsersLoading}
            </Typography>
          ) : adminUsers.length === 0 ? (
            <Typography variant="body2" color="textSecondary">
              {copy.adminUsersEmpty}
            </Typography>
          ) : (
            <Box className="admin-user-list">
              {adminUsers.map((account) => (
                <Box key={account.id} className="admin-user-row">
                  <div className="admin-user-meta">
                    <Typography variant="subtitle2">{account.email || copy.adminUserNoEmail}</Typography>
                    <Typography variant="body2" color="textSecondary">
                      {account.name || copy.ownerNone}
                    </Typography>
                    <Typography variant="caption" color="textSecondary">
                      {copy.adminUserCreatedAt.replace('{date}', formatDateTime(account.createdAt) || copy.adminUserCreatedUnknown)}
                    </Typography>
                    <Typography variant="caption" color="textSecondary">
                      {copy.adminUserStationCount.replace('{count}', account.stationCount ?? 0)}
                    </Typography>
                  </div>
                  <div className="admin-user-actions">
                    <Button
                      size="small"
                      variant="outlined"
                      onClick={() => handleAdminSetPassword(account)}
                    >
                      {copy.adminPasswordSubmit}
                    </Button>
                    <Button
                      size="small"
                      color="error"
                      onClick={() => handleAdminDeleteUser(account)}
                    >
                      {copy.adminDeleteUser}
                    </Button>
                  </div>
                </Box>
              ))}
            </Box>
          )}
        </Paper>
      )}

      <Paper className="own-stations-card" elevation={3}>
        <Typography variant="h6" gutterBottom>
          {copy.passwordTitle}
        </Typography>
        {passwordStatus && (
          <Alert severity="success" sx={{ mb: 2 }}>
            {passwordStatus}
          </Alert>
        )}
        {passwordError && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {passwordError}
          </Alert>
        )}
        <form className="password-form" onSubmit={handlePasswordSubmit}>
          <TextField
            label={copy.currentPassword}
            name="current"
            type="password"
            value={passwordForm.current}
            onChange={handlePasswordInput}
            required
            fullWidth
            margin="normal"
          />
          <TextField
            label={copy.newPassword}
            name="next"
            type="password"
            value={passwordForm.next}
            onChange={handlePasswordInput}
            required
            fullWidth
            margin="normal"
          />
          <Button type="submit" variant="contained" sx={{ mt: 2 }}>
            {copy.passwordAction}
          </Button>
        </form>
      </Paper>

      <Paper className="own-stations-card danger-zone" elevation={3}>
        <Typography variant="h6" gutterBottom>
          {copy.accountDeleteTitle}
        </Typography>
        <Typography variant="body2" color="textSecondary" gutterBottom>
          {copy.accountDeleteDescription}
        </Typography>
        {accountDeleteStatus && (
          <Alert severity="success" sx={{ mb: 2 }}>
            {accountDeleteStatus}
          </Alert>
        )}
        {accountDeleteError && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {accountDeleteError}
          </Alert>
        )}
        <Button
          variant="outlined"
          color="error"
          onClick={handleDeleteAccount}
          disabled={!token}
          sx={{ mt: 2 }}
        >
          {copy.accountDeleteAction}
        </Button>
      </Paper>
    </Box>
  );
};

export default OwnStations;
