import Chart from "react-apexcharts";
import React from "react";
import { Skeleton, TextField } from "@mui/material";
import requests from "../helpers/requests";
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import language from "../languages/languages";
import dayjs from "dayjs";
import "./PieChart.css";
/* In dieser Klasse wird das Diagramm mit seinen Eigenschaften definiert
(Typ, Farben, Winkel, Höhe, Größe usw.) */

class ApexChart extends React.Component {
  constructor(props) {

    super(props);

    this.state = {
      date: dayjs(new Date(Date.now())),
      data: null,
      series: [],
      options: {
        colors: ["#F9CE1D", "#FF9800", "#F46036", "#EA3546", "#eb34b4", "#A300D6", "#775DD0", "#008FFB", "#43BCCD", "#13D8AA", "#4CAF50" ],
        plotOptions: {
          pie: {
            startAngle: 0,
            endAngle: 360,
            expandOnClick: true,
            offsetX: 10,
            offsetY: 10,
            customScale: 1,
            dataLabels: {
              offset: 0,
              minAngleToShowLabel: 15
            }
          }
          },
         
          chart: {
            type: 'pie'
          },

          stroke: {
            colors: ["#F9CE1D", "#FF9800", "#F46036", "#EA3546", "#eb34b4", "#A300D6", "#775DD0", "#008FFB", "#43BCCD", "#13D8AA", "#4CAF50" ],
          },

          labels: [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],

          legend: {
            show: true,
            showForSingleSeries: false,
            showForNullSeries: true,
            showForZeroSeries: true,
            position: 'right',
            horizontalAlign: 'left',
            floating: false,
            fontSize: '13px',
            fontFamily: 'Helvetica',
            fontWeight: 100,
            formatter: undefined,
            inverseOrder: false,
            width: 200,
            height: 500,
            tooltipHoverFormatter: undefined,
            customLegendItems: [],
            offsetX: 10,
            offsetY: 10,
          
            markers: {
              width: 12,
              height: 12,
              radius: 12 
            },
          }

        },
      };
    }


    componentDidMount() {

      // Datum von heute abfragen

     requests.getCount()
          .then((res) => {
            let count = res.data;
            //console.log(stations)
            this.setState({
              data: count
            },() => this.prepareData(dayjs(new Date(Date.now())),))
    
          })
          .catch((res) => console.log(res))
      }

    /*Zugriff auf API mit fetch. Daten für den aktuellen Tag werden abgefragt
    Gegebenfalls müsste sowohl hier als auch an der nächsten Funktion der Fall für 
    einen Fehler abgefangen werden */

    prepareData =  (newDate) => {

      var selectedDate = newDate.format("YYYY-MM-DD")
      var data = this.state.data[selectedDate]

      if ( !data || data === '{}' ){
        this.setState({series: []})
      } else{
      this.createData(data)
      }
  }

  
     
    /* Name und Anzahl in einem Array speichern, der Größe nach sortieren und 
    Top 10 Vögel mit der größten Anzahl herausfiltern */

    createData = (feature) => {
      let birds = [];
      for (var i = 0; i < feature.length; i++) {
        birds.push({ name: feature[i].latinName, amount: feature[i].amount, germanName: feature[i].germanName })
      }
      let sorted = birds.sort((a, b) => b.amount - a.amount)
      let topTen = sorted.slice(0, 10);
      this.prepareChart(topTen, sorted);
    }
    


    /* Anzahl der Vögel in einem Array speichern, Anzahl der Vögel außerhalb der Top 10 addieren
    um diese als sonstige zusammenfassen zu können */

    prepareChart = (feature, feature1) => {
      let amount = [];
      for (var i = 0; i < feature.length; i++) {
        amount.push(feature[i].amount);
      }

      let sonstige = [];
      for (var i = 10; i < feature1.length; i++) {
        sonstige.push({ name: feature1[i].latinName, amount: feature1[i].amount, germanName: feature1[i].germanName })

      }
      let sonstigeAmount = 0;
      for (var i = 0; i < sonstige.length; i++) {
        sonstigeAmount = sonstigeAmount + sonstige[i].amount;
      }
      if (sonstigeAmount > 0){
      amount.push(sonstigeAmount)
      }

      /* Abfrage nach dem deutschen und lateinischen Namen.
      Wenn kein deutscher Name vorhanden, wird der lateinische verwendet*/

      let label = [];
      for (var i = 0; i < feature.length; i++) {
        if (feature[i].germanName == "") {
          label.push(feature[i].name)
        }
        else {
          label.push(feature[i].germanName)
        }
      }
      if (sonstigeAmount > 0){
      label.push('sonstige');
      }
      this.setState({
        series: amount, options: {
          ...this.state.options,
          labels: label
        }
      })
    
    }

    // Aktivität der Buttons verändern
    handleAlignment = (event, newAlignment) => {
      this.setState({ alignment: newAlignment });
    };

    handelDateChange = (newValue) => {
      this.setState({ date: newValue }, this.prepareData(newValue));
    };
  

    



    render() {
      return (
        <div style={{textAlign: "center", padding :"10px"}}>
          <div style={{ justifyContent: "flex-start", textAlign: "center"}}>
          <LocalizationProvider dateAdapter={AdapterDayjs}>
          <DatePicker
            disableFuture
            inputFormat="YYYY-MM-DD"
            label={language[this.props.language]["stations"]["day"]}
            value={this.state.date}
            onChange={(newValue) => this.handelDateChange(newValue)}
            renderInput={(params) => <TextField {...params} />}
          />
        </LocalizationProvider>
        </div>
          {this.state.data ? (this.state.series.length >0 ?
          <div id="chartPie">
            <Chart options={this.state.options} series={this.state.series} type="pie"  />
          </div>
          : <p>{language[this.props.language]["table"]["noBirdDay"]}</p> ) : 
          <Skeleton width={"100%"} height={"20vh"}>
            
          </Skeleton>}

          <br/>
          <br/>


        
        </div>
        
        );

    }
  }


export default ApexChart;