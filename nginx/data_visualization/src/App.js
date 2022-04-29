import React from 'react'
import OwnMap from './Map/Map'
import Createstation from './CreateStation/CreateStation';
import StationView from './Station/Stations'
import Button from '@mui/material/Button';
import { Route, Routes, BrowserRouter } from "react-router-dom";
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import './App.css';
import { useNavigate, Link } from 'react-router-dom'; 


const Header = ( props ) => {
  return (
    <AppBar style={{backgroundColor : "orange"}} id="header">
      <Toolbar>
      <a href="/">Logo</a>
       <Typography variant="h4" color="inherit" style={{ flex: 1 }}>
          <Button style={{marginLeft: "120px", fontWeight : "bold"}} color="inherit" component={Link} to="/view" >HOME</Button>
        </Typography>
        <Button rel="noopener" color="inherit" component={Link} to="/view/createstation">
          Erstelle Station
        </Button>
        <Button rel="noopener" color="inherit"  href="/" >
          Erfahre mehr über unser Projekt
        </Button>
        
      </Toolbar>
    </AppBar>
  );
};


  

const Footer = (props) => {


  return(
    <div style={{backgroundColor : "orange"}} className="mui-container mui--text-center" id="footer">
      <div id="links" style={{color: "white"}}>
          <a  id="link" href="/doc">API</a> |&nbsp;
          Version&nbsp;<code>#dev#</code>
      </div>
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
      <BrowserRouter>
      <Header>
      </Header>


      <div>
        <div className="content" id="mainView">
          <Routes>
          <Route exact path="/view" element={<OwnMap ></OwnMap>} />
          <Route exact path="/view/station/:id" element={<StationView />}></Route>
          <Route path="/view/createStation" element={<Createstation/>}></Route>
          </Routes>
        </div>
      </div>
      
      <Footer
      ></Footer>
      </BrowserRouter>
      </div>
     
    )}
}

export default App