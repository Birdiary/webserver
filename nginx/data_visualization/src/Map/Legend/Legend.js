import L, { map } from "leaflet";
import { useEffect, useState } from "react";
import "./Legend.css"
import language from "../../languages/languages";
import birdHouseGreen from '../../helpers/icons/bird-house-green.svg'
import birdHouseBlack from '../../helpers/icons/bird-house-black.svg'
import birdHouseBird from '../../helpers/icons/bird-house-green-with-bird.svg'
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
      let head = language[props.language]["legend"]["head"]
      let description = language[props.language]["legend"]["description"]
      let symbol = language[props.language]["legend"]["symbol"]
      let meaning = language[props.language]["legend"]["meaning"]
      let black = language[props.language]["legend"]["black"]
      let green = language[props.language]["legend"]["green"]
      let bird = language[props.language]["legend"]["bird"]

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
        "</table>"
        return div;
      };

      legend.addTo(props.map);
    }
  }, [props]); //here add map

  return null
 
}

export default Legend;