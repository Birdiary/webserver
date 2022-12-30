import { useState, useEffect, useRef } from "react";
import { useParams } from 'react-router-dom';
import requests from "../helpers/requests";
import StatisticsView from "./StatisticsView";


function Statistics(props) {

  const { id } = useParams()
  const [data, setData] = useState("");



  useEffect(() => {
    getStatistics();
  }, []);

  const getStatistics = () => {
    requests.getStatisitcs("all")
      .then((res) => {
        //console.log(res)

        var data = res.data
        setData(data);
      })
  }



  
  


  return <div>

     <h1 style={{ textAlign: "center",  marginBottom: "3px" }}>Statistiken zu allen Stationen</h1>    
     {data ? <div><span style={{ textAlign: "center", width: "100%", display: "block"}}> Stand: {data.createdAt.split(".")[0]} Uhr</span> <StatisticsView language={props.language} view={"all"} data={data}></StatisticsView>  </div>: ""}
   

  </div>


}


export default Statistics