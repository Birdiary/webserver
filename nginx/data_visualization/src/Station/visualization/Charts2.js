import React from 'react';
import { Line } from 'react-chartjs-2';

import {
    Chart as ChartJS,
    TimeScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend
  } from "chart.js";
import 'chartjs-adapter-date-fns';
import zoomPlugin from 'chartjs-plugin-zoom';


ChartJS.register(
    TimeScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    zoomPlugin
  );


export default function TimelineChart(props) {
    console.log(props.series)

    const values = [
        {
          x: new Date("2020-01-01"),
          y: 100.2
        },
        {
          x: new Date("2020-01-02"),
          y: 102.2
        },
        {
          x: new Date("2020-01-03"),
          y: 105.3
        },
        {
          x: new Date("2020-01-11"),
          y: 104.4
        }
      ];

    const lineChart = props.series[0] ? (
        <Line
            data={{
                datasets: [ {label: props.series[0].label, data: props.series[0].data, borderColor: 'rgb(53, 162, 235)', backgroundColor: 'rgba(53, 162, 235, 0.5)', pointRadius: 0, cubicInterpolationMode: 'monotone',}],
            }}
            options={{
                response: true,
                plugins:{
                    zoom : {
                    zoom: {
                        wheel: {
                        enabled: true,
                        },
                        drag: true,
                        mode: 'x',
                    },
                    pan: {
                        enabled: true,
                        mode: 'x',
                    },
                }
                },
                scales: {
                    x: {
                        type: "time",
                        
                    }
                },

            }}
        />
    ) : null;

    return <div>{lineChart}</div>;
}