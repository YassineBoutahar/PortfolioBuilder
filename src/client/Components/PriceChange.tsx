import React from "react";
import { Typography } from "@material-ui/core";
import { PriceChangeProps } from "../../shared/types";
import ArrowUpwardIcon from "@material-ui/icons/ArrowUpward";
import ArrowDownwardIcon from "@material-ui/icons/ArrowDownward";

const green = "#008100";
const red = "#f00";
const grey = "#787878";

const PriceChange = ({ currentPrice, previousPrice }: PriceChangeProps) => {
  const getChangeText = () => {
    let sign: string = currentPrice >= previousPrice ? "+" : "-";

    let difference = Math.abs(currentPrice - previousPrice);
    let percentChange = Math.abs(
      ((currentPrice - previousPrice) / previousPrice) * 100
    );

    if (isNaN(difference) || isNaN(percentChange)) {
      return `Retrieval error`;
    }

    return `$${currentPrice.toFixed(2)} ${sign}${difference.toFixed(
      2
    )} (${sign}${percentChange.toFixed(2)}%)`;
  };

  return (
    <Typography
      style={{
        verticalAlign: "middle",
        display: "inline-flex",
        color:
          currentPrice === previousPrice
            ? grey
            : currentPrice > previousPrice
            ? green
            : red,
      }}
    >
      {getChangeText()}
      {currentPrice >= previousPrice ? (
        <ArrowUpwardIcon fontSize="small" />
      ) : (
        <ArrowDownwardIcon fontSize="small" />
      )}
    </Typography>
  );
};

export default PriceChange;
