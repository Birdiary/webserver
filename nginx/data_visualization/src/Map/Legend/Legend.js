import L from "leaflet";
import { useEffect } from "react";
import "./Legend.css"
import language from "../../languages/languages";
import birdHouseGreen from '../../helpers/icons/bird-house-green.svg'
import birdHouseBlack from '../../helpers/icons/bird-house-black.svg'
import birdHouseBird from '../../helpers/icons/bird-house-green-with-bird.svg'
import birdHouseBlackBird from '../../helpers/icons/bird-house-black-with-bird.svg'
let legend = null

const toggleLegend = function(){
  /* use jquery to select your DOM elements that has the class 'legend' */
 document.getElementsByClassName("legend").hide(); 
 
}


function Legend(props) {
  console.log(props.map);
  
  
  useEffect(() => {
    if(props.map && legend){
      props.map.removeControl(legend)
      }
    if (props.map && props.open) {

      legend = L.control({ position: "bottomright" });
      const legendLanguage = language[props.language]["legend"]
      let head = legendLanguage["head"]
      let description = legendLanguage["description"]
      let symbol = legendLanguage["symbol"]
      let meaning = legendLanguage["meaning"]
      let black = legendLanguage["black"]
      let green = legendLanguage["green"]
      let bird = legendLanguage["bird"]
      let blackBird = legendLanguage["blackBird"]
      const inactiveNotice = legendLanguage["inactiveNotice"]
      const showAllLabel = props.showAllStations ? legendLanguage["hideInactive"] : legendLanguage["showAll"]
      const hiddenStations = props.hiddenStationCount || 0
      const hiddenStationsText = hiddenStations > 0 ? ` (${hiddenStations})` : ""

      legend.onAdd = () => {
        const div = L.DomUtil.create("div", "info legend");
        div.innerHTML =
          "<h3>"+ head +"</h3>" +
          "<h4>" + description + "</h4>"  +
          "<table>"+ 
          "<tr>" +
            "<th>"+ symbol + "</th>"+
            "<th>" + meaning +"</th>"+
          "</tr>"+
          "<tr>"+
            "<td><img src='"+ birdHouseBlack + "' width=50 height=50/></td>"+
            "<td>"+ black + "</td>"+
          "</tr>"+
          "<tr>"+
            "<td><img src='"+ birdHouseGreen + "' width=50 height=50/></td>"+
            "<td>"+ green + "</td>"+
          "</tr>"+
          "<tr>"+
          "<td><img src='"+ birdHouseBird + "' width=50 height=50/></td>"+
          "<td>"+ bird + "</td>"+
        "</tr>"+
        "<tr>"+
        "<td><img src='"+ birdHouseBlackBird + "' width=50 height=50/></td>"+
        "<td>"+ blackBird + "</td>"+
      "</tr>"+
        "</table>"+
        `<div class="legend__inactive-notice">${inactiveNotice}${hiddenStationsText}</div>`+
        `<button type="button" class="legend__toggle-btn">${showAllLabel}</button>`;

        L.DomEvent.disableClickPropagation(div);

        const toggleButton = div.querySelector(".legend__toggle-btn");
        if (toggleButton) {
          toggleButton.addEventListener("click", (event) => {
            L.DomEvent.stopPropagation(event);
            event.preventDefault();
            if (props.onToggleShowAll) {
              props.onToggleShowAll();
            }
          });
        }

        return div;
      };

      legend.addTo(props.map);
    }
  }, [props]); //here add map

  return null
 
}

export default Legend;