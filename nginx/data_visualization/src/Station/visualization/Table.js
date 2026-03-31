import * as React from 'react';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import { Button, Checkbox } from '@mui/material';
import language from '../../languages/languages';
import VerifiedIcon from '@mui/icons-material/Verified';


export default function BasicTable(props) {
  const [rows, setRows] = React.useState([]);
  const [validated, setValidated] = React.useState(null);
  const [validatedInList, setValidatedInList] = React.useState(true);
  const lang = language[props.language] || language.en;
  const tableCopy = lang.table || language.en.table;
  const stationCopy = lang.stations || language.en.stations;

  React.useEffect(() => {
    const birdList = Array.isArray(props.birds) ? props.birds : [];
    const limited = [];
    for (let i = 0; i < birdList.length && i < 3; i += 1) {
      const entry = birdList[i];
      if (!entry || typeof entry.score !== 'number') {
        continue;
      }
      limited.push({
        name: entry.latinName || '',
        latinName: entry.latinName || '',
        prop: (entry.score * 100).toFixed(2),
        germanName: entry.germanName || ''
      });
    }
    setRows(limited);
  }, [props.birds]);

  React.useEffect(() => {
    const summary = props.validation && props.validation.summary;
    if (!summary || typeof summary !== 'object') {
      setValidated(null);
      setValidatedInList(true);
      return;
    }

    let max = null;
    for (const key in summary) {
      if (!Object.prototype.hasOwnProperty.call(summary, key)) {
        continue;
      }
      const entry = summary[key];
      if (!entry) {
        continue;
      }
      if (!max || (entry.amount || 0) > (max.amount || 0)) {
        max = entry;
      }
    }

    if (!max) {
      setValidated(null);
      setValidatedInList(true);
      return;
    }

    setValidated(max);
    const birdList = Array.isArray(props.birds) ? props.birds : [];
    const inList = birdList.slice(0, 3).some((bird) => bird && bird.latinName === max.latinName);
    setValidatedInList(inList);
  }, [props.validation, props.birds]);

  const renderTable = () => {
    if (rows.length === 0 && props.finished === 'pending') {
      return (
        <div>
          <p>
            {stationCopy.wait1} {stationCopy.wait2}
          </p>
          <Button
            variant="contained"
            onClick={() => props.getStation && props.getStation()}
            style={{ float: 'right', margin: '15px' }}
          >
            Refresh
          </Button>
        </div>
      );
    }

    if (rows.length === 0) {
      return <p>{tableCopy.noBird}</p>;
    }

    return (
      <TableContainer component={Paper}>
        <Table aria-label="simple table" style={{ maxWidth: '100%', tableLayout: 'fixed' }}>
          <TableHead>
            <TableRow>
              <TableCell>{tableCopy.species}</TableCell>
              <TableCell>{tableCopy.name}</TableCell>
              <TableCell align="right">{tableCopy.propability}</TableCell>
              <TableCell>{tableCopy.validation}</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.map((row, index) => (
              <TableRow key={row.latinName || row.name || index} sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                <TableCell component="th" scope="row">
                  <span style={{ display: 'flex' }}>
                    {row.name} {validated && row.latinName === validated.latinName ? <VerifiedIcon color="success" /> : null}
                  </span>
                </TableCell>
                {row.germanName ? (
                  <TableCell>
                    <a href={`https://www.nabu.de/tiere-und-pflanzen/voegel/portraets/${row.germanName}`} target="_blank" rel="noreferrer">
                      {row.germanName}
                    </a>
                  </TableCell>
                ) : (
                  <TableCell />
                )}
                <TableCell align="right">{row.prop}</TableCell>
                <TableCell padding="checkbox">
                  <Checkbox checked={row.name === props.bird} onChange={() => props.setBird && props.setBird(row.name)} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    );
  };

  return (
    <div>
      {renderTable()}
      {!validatedInList && validated ? (
        <span>
          Validierter Vogel: {validated.germanName && validated.germanName !== '' ? validated.germanName : validated.latinName}
        </span>
      ) : null}
    </div>
  );
}