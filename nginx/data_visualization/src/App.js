import React from 'react'
import OwnMap from './Map/Map'
import CreateBox from './CreateBox/CreateBox';
import Box from './Box/Box'
import Button from '@mui/material/Button';
import { Route, Routes, BrowserRouter } from "react-router-dom";
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import './App.css';


const Header = ( props ) => {
  return (
    <AppBar style={{backgroundColor : "orange"}} id="header">
      <Toolbar>
      <a href="/react">Logo</a>
       {!props.ojsView ?<Typography variant="h4" color="inherit" style={{ flex: 1 }}>
          <Button style={{marginLeft: "120px", fontWeight : "bold"}} color="inherit" href={"/react"}>HOME</Button>
        </Typography> : ""}
        <Button rel="noopener" color="inherit" href="/">
          Learn more about our Project
        </Button>
        
      </Toolbar>
    </AppBar>
  );
};


  

const Footer = (props) => {


  return(
    <div style={{backgroundColor : "orange"}} className="mui-container mui--text-center" id="footer">
      <BrowserRouter forceRefresh>
      <div id="links" style={{color: "white"}}>
          <a  id="link" href="/doc">API</a> |&nbsp;
          Version&nbsp;<code>#dev#</code>
      </div>
      </BrowserRouter>
    </div>
  );
}

class App extends React.Component {
  constructor(props){
    super(props);
    this.state = {
    };
  };

  

  render() {
    return (
      <div id="pageContainer">
      <Header>
      </Header>

      <BrowserRouter>
      <div>
        <div className="content" id="mainView">
          <Routes history={history} basename="/webapp">
          <Route exact path="/react" element={<OwnMap ></OwnMap>} />
          <Route exact path="/react/box/:id" element={(props) => <Box {...props}  />}></Route>
          <Route path="/react/createBox" element={<CreateBox/>}></Route>
          </Routes>
        </div>
      </div>
      </BrowserRouter>
      <Footer
      ></Footer>
      </div>
     
    )}
}

export default App