import Chart from "react-apexcharts";
import ApexCharts from "apexcharts";
import React from "react";

class ApexChart extends React.Component {
    constructor(props) {
      super(props);

      this.state = {
        options: {
          chart: {
            id: 'line-datetime',
            type: 'line',
            height: 350,
            zoom: {
              autoScaleYaxis: true
            }
          },
          dataLabels: {
            enabled: false
          },
          markers: {
            size: 0,
            style: 'hollow',
          },
          xaxis: {
            type: 'datetime',
            labels:{
              datetimeUTC: false
            },
          },
          tooltip: {
            x: {
              format: 'H:mm dd.MMM.yy'
            }
          },
          stroke: {
            curve: 'smooth',
          }
        },      
      };
    }

  
  
  

    render() {
      return (
        

  <div id="chart">

<div id="chart-timeline">
<Chart options={this.state.options} series={this.props.series} type="line" height={350} />
</div>
</div>


      );
    }
  }

export default ApexChart;