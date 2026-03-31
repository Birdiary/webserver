import React, { useCallback, useMemo, useState } from 'react';
import { Autocomplete, Box, CircularProgress, TextField, Typography, InputAdornment } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import { useNavigate } from 'react-router-dom';
import requests from '../helpers/requests';
import language from '../languages/languages';

const sortStationsByName = (stations = []) => (
  [...stations].sort((a, b) => a.name.localeCompare(b.name, undefined, { sensitivity: 'base' }))
);

const StationSearch = ({ languageKey = 'en', fullWidth = false }) => {
  const navigate = useNavigate();
  const copy = language[languageKey]?.navbar || language.en.navbar;
  const [options, setOptions] = useState([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [fetched, setFetched] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [error, setError] = useState(null);

  const noOptionsText = useMemo(() => {
    if (loading) {
      return copy.searchLoading || 'Loading stations...';
    }
    if (error) {
      return error;
    }
    return copy.searchNoResults || 'No stations found';
  }, [copy.searchLoading, copy.searchNoResults, error, loading]);

  const loadStations = useCallback(async () => {
    if (loading || fetched) {
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const response = await requests.getStations();
      const stationList = Array.isArray(response.data) ? response.data : [];
      const normalized = stationList
        .map((station) => ({
          station_id: station.station_id,
          name: station.name || station.station_id || 'Unknown station',
        }))
        .filter((station) => station.station_id && station.name);
      setOptions(sortStationsByName(normalized));
      setFetched(true);
    } catch (err) {
      const fallback = copy.searchError || 'Unable to load stations right now.';
      setError(err.response?.data?.message || fallback);
    } finally {
      setLoading(false);
    }
  }, [copy.searchError, fetched, loading]);

  const handleOpen = () => {
    setOpen(true);
    if (!fetched) {
      loadStations();
    }
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleSelect = useCallback((event, value) => {
    if (value?.station_id) {
      navigate(`/view/station/${value.station_id}`);
      setInputValue('');
      setOpen(false);
    }
  }, [navigate]);

  return (
    <Autocomplete
      size="small"
      fullWidth={fullWidth}
      open={open}
      onOpen={handleOpen}
      onClose={handleClose}
      options={options}
      loading={loading}
      value={null}
      inputValue={inputValue}
      onInputChange={(event, newValue) => setInputValue(newValue)}
      onChange={handleSelect}
      getOptionLabel={(option) => option?.name || ''}
      isOptionEqualToValue={(option, value) => option?.station_id === value?.station_id}
      noOptionsText={noOptionsText}
      renderOption={(props, option) => (
        <li {...props} key={option.station_id}>
          <Box sx={{ display: 'flex', flexDirection: 'column' }}>
            <Typography variant="body2">{option.name}</Typography>
            <Typography variant="caption" color="text.secondary">
              {option.station_id}
            </Typography>
          </Box>
        </li>
      )}
      renderInput={(params) => (
        <TextField
          {...params}
          placeholder={copy.searchPlaceholder || 'Search stations'}
          aria-label={copy.searchLabel || 'Search stations'}
          sx={{
            '& .MuiInputBase-root': {
              backgroundColor: '#fff',
              borderRadius: 1,
            },
          }}
          InputProps={{
            ...params.InputProps,
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon fontSize="small" />
              </InputAdornment>
            ),
            endAdornment: (
              <>
                {loading ? <CircularProgress color="inherit" size={16} /> : null}
                {params.InputProps.endAdornment}
              </>
            ),
          }}
        />
      )}
      sx={{
        minWidth: fullWidth ? undefined : 240,
        maxWidth: fullWidth ? '100%' : 360,
      }}
    />
  );
};

export default StationSearch;
