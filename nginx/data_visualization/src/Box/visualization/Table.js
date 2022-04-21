import * as React from 'react';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';



export default function BasicTable(birds) {
    const [rows, setRows] =React.useState([])

    function sortByValue(jsObj){
        var sortedArray = [];
        for(var i in jsObj)
        {
            // Push each JSON Object entry in array by [value, key]
            sortedArray.push([jsObj[i], i]);
        }
        return sortedArray.sort().reverse();
    }

    React.useEffect(() => {
        var birdList= birds.birds
        birdList = sortByValue(birdList)
        let rows2 =[]
        for (let i = 0; i < 3; i++) {
            rows2.push({name: birdList[i][1], prop:  (birdList[i][0]*100).toFixed(2)})
            setRows(rows2)
          }
          
      }, [])


  return (
    <TableContainer component={Paper}>
      <Table  aria-label="simple table">
        <TableHead>
          <TableRow>
            <TableCell>Art</TableCell>
            <TableCell align="right">Wahrscheinlichkeit</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {rows.map((row) => (
            <TableRow
              key={row.name}
              sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
            >
              <TableCell component="th" scope="row">
                {row.name}
              </TableCell>
              <TableCell align="right">{row.prop}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}