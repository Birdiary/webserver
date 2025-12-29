import React, { Component } from 'react'
import { AppBar, Toolbar, Typography, Button, Container, Box, IconButton, Menu, MenuItem } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import { useNavigate, Link } from 'react-router-dom'; 
import language from '../languages/languages';
import { useAuth } from '../context/AuthContext';
import "./Navbar.css";
//import { ReactComponent as SnowEnable} from '../helpers/icons/snow-enable.svg'
//import { ReactComponent as SnowDisable } from '../helpers/icons/snow-disable.svg'

function Header(props){
  const [anchorElNav, setAnchorElNav] = React.useState(null);
  const { user, logout } = useAuth();
  const navCopy = language[props.language]["navbar"];

  const handleOpenNavMenu = (event) => {
    setAnchorElNav(event.currentTarget);
  };

  const handleCloseNavMenu = () => {
    setAnchorElNav(null);
  };

  const handleLogout = async () => {
    await logout();
    handleCloseNavMenu();
  };

    return (

      <div>
      <AppBar style={{backgroundColor : "orange"}} id="header">
      <Container style={{width: "100%", maxWidth: "none"}}>
        <Toolbar disableGutters >
          <Typography
            variant="h6"
            noWrap
            component="a"
            href="/"
            sx={{
              mr: 2,
              display: { xs: 'none', md: 'flex' },
              fontFamily: 'monospace',
              fontWeight: 700,
              letterSpacing: '.3rem',
              color: 'inherit',
              textDecoration: 'none',
            }}
          >
            Birdiary
          </Typography>

          <Box sx={{ flexGrow: 1, display: { xs: 'flex', md: 'none' } }}>
            <IconButton
              size="large"
              aria-label="account of current user"
              aria-controls="menu-appbar"
              aria-haspopup="true"
              onClick={handleOpenNavMenu}
              color="inherit"
            >
              <MenuIcon />
            </IconButton>
            <Menu
              id="menu-appbar"
              anchorEl={anchorElNav}
              anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'left',
              }}
              keepMounted
              transformOrigin={{
                vertical: 'top',
                horizontal: 'left',
              }}
              open={Boolean(anchorElNav)}
              onClose={handleCloseNavMenu}
              sx={{
                display: { xs: 'block', md: 'none' },
              }}
            >
                <MenuItem key={"home"} onClick={handleCloseNavMenu} component={Link} to="/view" >
                  <Typography textAlign="center">{navCopy["overview"]}</Typography>
                </MenuItem>
                <MenuItem key={"en"} onClick={() => {props.changeLang("en"); handleCloseNavMenu()}}>
                  <Typography textAlign="center" className={props.language == "en" ? 'bold' : null}>English</Typography>
                </MenuItem>
                <MenuItem key={"de"} onClick={() => {props.changeLang("de"); handleCloseNavMenu()}}>
                  <Typography textAlign="center" className={props.language == "de" ? 'bold' : null}>Deutsch</Typography>
                </MenuItem>
                <MenuItem key={"create"} onClick={handleCloseNavMenu} component={Link} to="/view/createstation" >
                  <Typography textAlign="center">{navCopy["create"]}</Typography>
                </MenuItem>
              {user ? (
                <MenuItem key={"own-stations"} onClick={handleCloseNavMenu} component={Link} to="/view/own-stations" >
                  <Typography textAlign="center">{navCopy["ownStations"]}</Typography>
                </MenuItem>
              ) : null}
              <MenuItem key={"more"} onClick={handleCloseNavMenu} component="a" href="/" >
                  <Typography textAlign="center">{navCopy["more"]}</Typography>
                </MenuItem>
              {user ? (
                <MenuItem key={"logout"} onClick={handleLogout}>
                  <Typography textAlign="center">{navCopy["logout"]}</Typography>
                </MenuItem>
              ) : (
                <MenuItem key={"login"} onClick={handleCloseNavMenu} component={Link} to="/view/login" >
                  <Typography textAlign="center">{navCopy["login"]}</Typography>
                </MenuItem>
              )}

              
            </Menu>
          </Box>
          <Typography
            variant="h5"
            noWrap
            component="a"
            href=""
            sx={{
              mr: 2,
              display: { xs: 'flex', md: 'none' },
              flexGrow: 1,
              fontFamily: 'monospace',
              fontWeight: 700,
              letterSpacing: '.3rem',
              color: 'inherit',
              textDecoration: 'none',
            }}
          >
            Birdiary
          </Typography>
          <Box sx={{ flexGrow: 1, display: { xs: 'none', md: 'flex', lg:"flex" } }} >
          <Typography variant="h4" color="inherit" style={{ flex: 1 }}>
            <Button style={{ fontWeight : "bold"}} color="inherit" component={Link} to="/view" >{navCopy["overview"]}</Button>
          </Typography>
          <Button color="inherit" onClick={() => props.changeLang("en")} className={props.language == "en" ? 'bold' : null}>English</Button>
          <Button color="inherit" onClick={() => props.changeLang("de")} className={props.language == "de" ? 'bold' : null}>Deutsch</Button>
          <Button rel="noopener" color="inherit" component={Link} to="/view/createstation">
            {navCopy["create"]}</Button>
          <Button rel="noopener" color="inherit" component={Link} to="/view/statistics">
            {navCopy["statistics"]}
          </Button>
          <Button rel="noopener" color="inherit" component={Link} to="/view/validation">
            {navCopy["validation"]}
          </Button>
          {user ? (
            <Button rel="noopener" color="inherit" component={Link} to="/view/own-stations">
              {navCopy["ownStations"]}
            </Button>
          ) : null}
          <Button rel="noopener" color="inherit"  href="/" >
            {navCopy["more"]}
          </Button>
          {user ? (
            <Button color="inherit" onClick={logout}>
              {navCopy["logout"]}
            </Button>
          ) : (
            <Button color="inherit" component={Link} to="/view/login">
              {navCopy["login"]}
            </Button>
          )}
          </Box>

          
        </Toolbar>
      </Container>
    </AppBar>


      </div>
    );
    
  };
  

  export default Header