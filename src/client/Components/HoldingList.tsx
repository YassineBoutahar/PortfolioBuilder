import React from "react";
import SingleHolding from "./SingleHolding";
import { List } from "@material-ui/core";
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
    <List dense>
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
