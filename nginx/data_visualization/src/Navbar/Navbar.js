import React, { Component } from 'react'
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import { useNavigate, Link } from 'react-router-dom'; 
import language from '../languages/languages';
import "./Navbar.css";

class Header extends Component{

    constructor(props){
        super(props);
    }


      


    render()  {

    return (
      <AppBar style={{backgroundColor : "orange"}} id="header">
        <Toolbar>
        <a href="/">Logo</a>
         <Typography variant="h4" color="inherit" style={{ flex: 1 }}>
            <Button style={{marginLeft: "120px", fontWeight : "bold"}} color="inherit" component={Link} to="/view" >HOME</Button>
          </Typography>
          <Button color="inherit" onClick={() => this.props.changeLang("en")} className={this.props.language == "en" ? 'bold' : null}>English</Button>
          <Button color="inherit" onClick={() => this.props.changeLang("de")} className={this.props.language == "de" ? 'bold' : null}>Deutsch</Button>
          <Button rel="noopener" color="inherit" component={Link} to="/view/createstation">
            {language[this.props.language]["navbar"]["create"]}
          </Button>
          <Button rel="noopener" color="inherit"  href="/" >
            {language[this.props.language]["navbar"]["more"]}
          </Button>
          
        </Toolbar>
      </AppBar>
    );
    }
  };
  

  export default Header