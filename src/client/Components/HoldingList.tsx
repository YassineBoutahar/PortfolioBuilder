import React from "react";
import SingleHolding from "./SingleHolding";
import { List, Box, Typography } from "@material-ui/core";
import { Holding, HoldingListProps } from "../../shared/types";

const HoldingList = ({
  holdings,
  portfolioValue,
  insertHolding,
  deleteHolding,
  updatePortfolioPercentage,
  getAvailablePercentage,
}: HoldingListProps) => {
  return (
    <List
      dense
      subheader={
        <Box textAlign="center" marginBottom="-0.4rem">
          <Typography variant="overline" color="textSecondary">
            {holdings.length > 0 ? "Your stocks" : ""}
          </Typography>
        </Box>
      }
    >
      {holdings.map((holding: Holding) => {
        return (
          <SingleHolding
            holding={holding}
            portfolioValue={portfolioValue}
            insertHolding={insertHolding}
            deleteHolding={deleteHolding}
            updatePortfolioPercentage={updatePortfolioPercentage}
            getAvailablePercentage={getAvailablePercentage}
          />
        );
      })}
    </List>
  );
};

export default HoldingList;
