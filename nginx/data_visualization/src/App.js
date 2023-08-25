import React from 'react'
import OwnMap from './Map/Map'
import Createstation from './CreateStation/CreateStation';
import StationView from './Station/Stations'
import Validation from './Validation/Validation';
import Statistics from './Statistics/Statistics'
import StationStatistics from './Statistics/StationStatistics';

import {
  Routes,
  BrowserRouter,
  Route,
  useLocation,
  useNavigationType,
  createRoutesFromChildren,
  matchRoutes,
} from "react-router-dom";
import Header from './Navbar/Navbar';
import * as Sentry from "@sentry/react";

import './App.css';
import { useNavigate, Link } from 'react-router-dom';
import Movement from './Movement/Movement';

const SentryRoutes = Sentry.withSentryReactRouterV6Routing(Routes)


const Footer = (props) => {


  return (
    <div style={{ backgroundColor: "orange" }} className="mui-container mui--text-center" id="footer">
      <div id="links" style={{ color: "white" }}>
        <a id="link" href="/doc">API</a> |&nbsp;
        Version&nbsp;<code>1.0.2</code>
      </div>
    </div>
  );
}

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      language: "en",
      snow: true
    };
    this.changeLang = this.changeLang.bind(this)
  };

  componentDidMount() {
    if (window.localStorage.getItem("language")) {
      this.setState({ language: window.localStorage.getItem("language") });
    }
    else if (navigator.language === "de-DE") {
      this.setState({ language: "de" });
    }


  }

  changeLang(lang) {
    this.setState({ language: lang })
    window.localStorage.setItem("language", lang);
  }




  render() {
    return (
      <div id="pageContainer">
        <BrowserRouter>
          <Header language={this.state.language}
            changeLang={this.changeLang}>
              
          </Header>


          <div>
            <div className="content" id="mainView" style={{position : "relative"}}>
              <SentryRoutes>
                <Route exact path="/view" element={<OwnMap language={this.state.language} changeLang={this.changeLang} />} />
                <Route exact path="/view/station/:id" element={<StationView language={this.state.language} />}></Route>
                <Route path="/view/station/:id/:mov_id" element={<Movement language={this.state.language} />}></Route>
                <Route path="/view/createStation" element={<Createstation language={this.state.language} />}></Route>
                <Route path="/view/validation" element={<Validation language={this.state.language} />}></Route>
                <Route path="/view/statistics" element={<Statistics language={this.state.language} />}></Route>
                <Route exact path="/view/statistics/:id" element={<StationStatistics language={this.state.language} />}></Route>
              </SentryRoutes>
            </div>
          </div>

          <Footer
          ></Footer>
        </BrowserRouter>
      </div>

    )
  }
}

export default App