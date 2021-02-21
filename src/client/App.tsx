import React, { useState, useEffect } from "react";
import HoldingList from "./Components/HoldingList";
import Charts from "./Components/Charts";
import { TextField, IconButton, InputAdornment, Box } from "@material-ui/core";
import AddCircleOutlineIcon from "@material-ui/icons/AddCircleOutline";
import RefreshIcon from "@material-ui/icons/Refresh";
import { Holding, LocalStorageItem } from "../shared/types";
import randomColor from "randomcolor";
import moment from "moment";
import axios from "axios";

const holdingsKey = "PortfolioBuilderHoldings";

const App = () => {
  const [totalValue, setTotalValue] = useState<number>(0);
  const [holdings, setHoldings] = useState<Map<string, Holding>>(new Map());
  const [remainingPercent, setRemainingPercent] = useState<number>(100);
  const [chosenTimePeriod, setTimePeriod] = useState<"y" | "M" | "w">("y");
  const [chosenInterval, setPriceInterval] = useState<"1mo" | "1d" | "1wk">(
    "1wk"
  );
  const [tickerSearch, setTickerSearch] = useState<string>("");

  useEffect(() => {
    if (window.localStorage.getItem(holdingsKey)) {
      let existingHoldings: LocalStorageItem[] = JSON.parse(
        window.localStorage.getItem(holdingsKey) || "[]"
      ) as LocalStorageItem[];
      existingHoldings.map((h) => addQuote(h.ticker, h.portfolioPercentage));
    }
  }, []);

  const insertHolding = (
    ticker: string,
    newHolding: Holding,
    upsert: boolean = false
  ) => {
    if (!upsert && holdings.get(ticker)) {
      alert("You have already added this ticker.");
      return false;
    } else {
      setHoldings((prev) => new Map(prev).set(ticker, newHolding));
      let localStorageHoldings = Array.from(holdings.values())
        .filter((holding) => holding.ticker !== ticker)
        .map((h) => ({
          ticker: h.ticker,
          portfolioPercentage: h.portfolioPercentage,
        }));
      window.localStorage.setItem(
        holdingsKey,
        JSON.stringify([
          ...localStorageHoldings,
          {
            ticker: ticker,
            portfolioPercentage: newHolding.portfolioPercentage,
          },
        ])
      );
      return true;
    }
  };

  const deleteHolding = (ticker: string) => {
    setHoldings((prev) => {
      const ogState = new Map(prev);
      ogState.delete(ticker);
      return ogState;
    });
    refreshAllHistoricalData(moment("2020-01-01"), "1mo", ticker);
  };

  const updateAllQuotes = () => {
    Array.from(holdings.keys()).forEach((ticker) => updateQuote(ticker));
  };

  const addQuote = (ticker: string, portfolioPercentage: number = 0) => {
    axios
      .get(`/quote/${ticker}`)
      .then((response) => {
        // console.log(response);
        if (!response.data) {
          throw Object.assign(new Error("Ticker not found!"), { code: 404 });
        }
        let newHolding: Holding = {
          ticker: ticker,
          name: response.data.longName,
          currency: response.data.financialCurrency,
          exchange: response.data.fullExchangeName,
          currentPrice: parseFloat(response.data.ask),
          portfolioPercentage: portfolioPercentage,
          displayColor: randomColor({ luminosity: "dark" }),
        };
        if (insertHolding(ticker, newHolding)) {
          setTickerSearch("");
          getHistoricalData(
            newHolding,
            moment().subtract(1, chosenTimePeriod),
            chosenInterval
          );
        }
      })
      .catch((error) => {
        console.log(error);
        alert("Ticker not found!");
      });
  };

  const updateQuote = (ticker: string) => {
    axios
      .get(`/quote/${ticker}`)
      .then((response) => {
        let ogHolding = holdings.get(ticker);
        if (ogHolding) {
          ogHolding.currentPrice = parseFloat(response.data.ask);
          insertHolding(ticker, ogHolding, true);
        }
      })
      .catch((error) => {
        console.log(error);
      });
  };

  const refreshAllHistoricalData = (
    startDate: moment.Moment,
    interval: "1d" | "1wk" | "1mo" | undefined,
    deletedTicker?: string
  ) => {
    Array.from(holdings.values()).map((holding) => {
      if (holding.ticker !== deletedTicker) {
        getHistoricalData(holding, startDate, interval, true);
      }
      return null;
    });
  };

  const getHistoricalData = (
    holding: Holding,
    startDate: moment.Moment,
    interval: "1d" | "1wk" | "1mo" | undefined,
    refreshing: boolean = false
  ) => {
    axios
      .get(`/historical/${holding.ticker}`, {
        params: {
          period1: startDate.format("YYYY-MM-DD"),
          interval: interval,
        },
      })
      .then((response) => {
        holding.historicalData = response.data;
        insertHolding(holding.ticker, holding, true);
      })
      .catch((error) => {
        console.log(error);
      });
  };

  const updatePortfolioPercentage = (ticker: string, percent: number) => {
    let ogHolding = holdings.get(ticker);
    if (ogHolding) {
      // setRemainingPercent(
      //   (prev) => prev - (percent + (ogHolding?.portfolioPercentage || 0))
      // );
      ogHolding.portfolioPercentage = percent;
      insertHolding(ticker, ogHolding, true);
    }
  };

  const getAvailablePercentage = (ticker: string) => {
    return Math.max(
      0,
      100 -
        Array.from(holdings.values())
          .map((a) => a.portfolioPercentage)
          .reduce((acc, p) => acc + p, 0) +
        (holdings.get(ticker)?.portfolioPercentage || 0)
    );
  };

  const getEstimatedShares = (ticker: string) => {
    let holdingObj = holdings.get(ticker);
    return Math.floor(
      (totalValue * (holdingObj?.portfolioPercentage || 0)) /
        100 /
        (holdingObj?.currentPrice || 99999999)
    );
  };

  return (
    <Box display="flex" flexDirection="row" flex={1} width={1}>
      <Box width={1}>
        <Box
          display="flex"
          flexDirection="row"
          justifyContent="space-between"
          flex={1}
          width={1}
        >
          <Box flexDirection="row">
            <TextField
              id="standard-number"
              label="Ticker"
              value={tickerSearch}
              onChange={(e) => setTickerSearch(e.target.value.toUpperCase())}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">$</InputAdornment>
                ),
              }}
            />
            <IconButton onClick={() => addQuote(tickerSearch)} edge="start">
              <AddCircleOutlineIcon />
            </IconButton>
          </Box>
          <TextField
            error={isNaN(totalValue) || totalValue < 0}
            label="Total Portfolio Value"
            type="number"
            value={totalValue}
            onChange={(e) => setTotalValue(parseFloat(e.target.value))}
            InputProps={{
              inputProps: { min: 0 },
              startAdornment: (
                <InputAdornment position="start">$</InputAdornment>
              ),
            }}
            helperText={
              isNaN(totalValue) || totalValue < 0 ? "Invalid Value" : ""
            }
          />
          <IconButton onClick={() => updateAllQuotes()}>
            <RefreshIcon />
          </IconButton>
        </Box>

        <HoldingList
          holdings={Array.from(holdings.values())}
          portfolioValue={totalValue}
          insertHolding={insertHolding}
          deleteHolding={deleteHolding}
          updatePortfolioPercentage={updatePortfolioPercentage}
          getAvailablePercentage={getAvailablePercentage}
        />
      </Box>
      <Box width={1}>
        <Charts
          holdings={holdings}
          timePeriod={chosenTimePeriod}
          setTimePeriod={setTimePeriod}
          interval={chosenInterval}
          setPriceInterval={setPriceInterval}
          refreshAllHistoricalData={refreshAllHistoricalData}
        />
      </Box>
    </Box>
  );
};

export default App;
