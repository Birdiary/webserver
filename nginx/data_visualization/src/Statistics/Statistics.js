import { useState, useEffect, useRef } from "react";
import { useParams } from 'react-router-dom';
import requests from "../helpers/requests";
import StatisticsView from "./StatisticsView";

function Statistics(props) {
  // The useParams hook provides access to the URL parameters of the current route.
  // Here, we're extracting the 'id' parameter from the URL path.
  const { id } = useParams()

  // The useState hook returns a stateful value and a function to update it.
  // Here, we're initializing a state variable called 'data' with an empty string.
  const [data, setData] = useState("");

  // The useEffect hook allows you to perform side effects in function components.
  // Here, we're calling the 'getStatistics' function when the component mounts.
  useEffect(() => {
    getStatistics();
  }, []);

  // This function calls the 'getStatistics' API endpoint using the 'requests' helper module.
  // If the request is successful, it updates the 'data' state variable with the response data.
  const getStatistics = () => {
    requests.getStatisitcs("all")
      .then((res) => {
        var data = res.data
        setData(data);
      })
  }

  // This function component returns a div that contains a header and a child component called 'StatisticsView'.
  // The 'StatisticsView' component takes in three props: 'language', 'view', and 'data'.
  return (
    <div>
      <h1 style={{ textAlign: "center",  marginBottom: "3px" }}>Statistiken zu allen Stationen</h1>    
      {data ? 
        <div>
          <span style={{ textAlign: "center", width: "100%", display: "block"}}> Stand: {(() => { const v = data.createdAt; const s = typeof v === "string" && !v.endsWith("Z") && !/[+-]\d{2}:\d{2}$/.test(v) ? v + "Z" : v; const d = new Date(s); return isNaN(d.getTime()) ? v : d.toLocaleString(undefined, { year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", second: "2-digit" }); })()}</span>
          <StatisticsView language={props.language} view={"all"} data={data}></StatisticsView>
        </div>
        : ""
      }
    </div>
  );
}

export default Statistics;
