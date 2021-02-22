//Inspired by https://github.com/TaskSquirrel/stonk-ticker/blob/master/examples/src/Chart.tsx
import React, { useState, useEffect } from "react";
import { Box, useTheme } from "@material-ui/core";
import { Line } from "react-chartjs-2";
import { ChartPoint } from "chart.js";
import { PressChartProps } from "../../shared/types";

const allPrices = [
  1000,
  1015,
  1020,
  1017,
  1023,
  1027,
  1035,
  1032,
  1034,
  1040,
  1047,
  1055,
  1052,
  1053,
  1057,
  1063,
  1068,
  1075,
  1083,
  1080,
  1077,
  1081,
  1086,
  1090,
  1096,
  1093,
  1098,
];

const PressChart = ({ height, width }: PressChartProps) => {
  const theme = useTheme();

  const [currentIndex, setCurrentIndex] = useState<number>(0);

  useEffect(() => {
    let timeout = setTimeout(() => setCurrentIndex((prev) => prev + 1), 10000);

    return () => {
      clearTimeout(timeout);
    };
  }, [currentIndex]);

  const getPricesDataset = () => {
    const newDataset: ChartPoint[] = [];
    const startAt = currentIndex % allPrices.length;

    for (let i = 0; i < 5; i++) {
      const curr = (startAt + i) % allPrices.length;
      newDataset.push({ x: i, y: allPrices[curr] });
    }

    return newDataset;
  };

  return (
    <Box
      onClick={() => setCurrentIndex((prev) => prev + 1)}
      position="relative"
    >
      <Line
        height={height}
        width={width}
        data={{
          datasets: [
            {
              data: getPricesDataset(),
              type: "line",
              borderColor: theme.palette.text.secondary,
              fill: false,
              pointRadius: 0,
            },
          ],
        }}
        options={{
          maintainAspectRatio: false,
          responsive: true,
          legend: {
            display: false,
          },
          tooltips: {
            enabled: false,
          },
          scales: {
            xAxes: [
              {
                type: "linear",
                gridLines: {
                  display: false,
                },
                ticks: {
                  display: false,
                },
              },
            ],
            yAxes: [
              {
                gridLines: {
                  display: false,
                },
                ticks: {
                  display: false,
                },
              },
            ],
          },
        }}
      />
    </Box>
  );
};

export default PressChart;
