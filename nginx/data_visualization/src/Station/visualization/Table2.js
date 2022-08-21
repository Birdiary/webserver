import * as React from 'react';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import { Button } from '@mui/material';
import language from '../../languages/languages';



export default function AmountTable(props) {
    const [rows, setRows] =React.useState([])


    React.useEffect(() => {
        var birdList= props.birds
        let rows2 =[]
        setRows(rows2)
        if(birdList){
          for (let i = 0; i < birdList.length; i++) {
            rows2.push({name: birdList[i].latinName, amount:  birdList[i].amount, germanName: birdList[i].germanName})
            rows2.sort((a,b)=> b.amount - a.amount)
            setRows(rows2)
          }
        }
          
      }, [props.birds])


  return (
<div>
    {rows.length == 0? < div><p>{language[props.language]["table"]["noBirdDay"]}</p></div>
    :
    <TableContainer component={Paper}>
      <Table  aria-label="simple table">
        <TableHead>
          <TableRow>
            <TableCell>{language[props.language]["table"]["species"]}</TableCell>
            <TableCell>{language[props.language]["table"]["name"]}</TableCell>
            <TableCell align="right">{language[props.language]["table"]["count"]}</TableCell>
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
              <TableCell align="right">{row.amount}</TableCell>
              
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>}
    </div>   
  );
}