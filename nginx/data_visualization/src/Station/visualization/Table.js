import * as React from 'react';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import { Button } from '@mui/material';



export default function BasicTable(props) {
    const [rows, setRows] =React.useState([])


    React.useEffect(() => {
        var birdList= props.birds
        let rows2 =[]
        setRows(rows2)
        for (let i = 0; i < birdList.length  && i < 3 ; i++) {
            rows2.push({name: birdList[i].latinName, prop:  (birdList[i].score*100).toFixed(2), germanName: birdList[i].germanName})
            setRows(rows2)
          }
          
      }, [props.birds])


  return (
<div>
    {rows.length == 0 ? < div><p>Das Video wird gerade verabeitet und die Art bestimmt! Bitte warte einen kurzen Moment und klicke dann auf den Refresh Button </p> <Button variant="contained" onClick={() => { props.getStation() }} style={{ float: "right", margin: "15px" }}>Refresh</Button></div>
    :
    <TableContainer component={Paper}>
      <Table  aria-label="simple table">
        <TableHead>
          <TableRow>
            <TableCell>Art</TableCell>
            <TableCell>Deutscher Name</TableCell>
            <TableCell align="right">Wahrscheinlichkeit</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {rows.map((row) => (
            <TableRow
              key={row.latinName}
              sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
            >
              <TableCell component="th" scope="row">
                {row.name}
              </TableCell>
              {row.germanName == "" ?  <TableCell>  </TableCell>: <TableCell><a href={"https://www.nabu.de/tiere-und-pflanzen/voegel/portraets/" + row.germanName} target="_blank">{row.germanName} </a> </TableCell>}
              <TableCell align="right">{row.prop}</TableCell>
              
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>}
    </div>   
  );
}