import React, { useState, useEffect } from "react";
import HoldingList from "./Components/HoldingList";
import Charts from "./Components/Charts";
import SiteLogo from "./Components/SiteLogo";
import {
  TextField,
  IconButton,
  ButtonGroup,
  InputAdornment,
  Box,
  Typography,
  Snackbar,
  makeStyles,
} from "@material-ui/core";
import MuiAlert, { AlertProps } from "@material-ui/lab/Alert";
import AddCircleOutlineIcon from "@material-ui/icons/AddCircleOutline";
import RefreshIcon from "@material-ui/icons/Refresh";
import ShareIcon from "@material-ui/icons/Share";
import { Holding, LocalStorageItem, AppProps } from "../shared/types";
import randomColor from "randomcolor";
import moment from "moment";
import axios from "axios";
import { v4 as uuidv4 } from "uuid";

const holdingsKey = "PortfolioBuilderHoldings";

const useStyles = makeStyles({
  body: {
    marginTop: "0.25rem",
    height: "100%",
  },
  portfolioSection: {
    marginRight: "0.75rem",
  },
  portfolioBar: {
    marginBottom: "1rem",
  },
  chartSection: {
    marginLeft: "0.75rem",
  },
  topBarActionButton: {
    paddingLeft: 0,
    paddingRight: 0,
  },
  buttonGroupOverline: {
    lineHeight: 1.75,
    fontSize: "0.7rem",
  },
});

const App = ({ urlShareHash }: AppProps) => {
  const classes = useStyles();
  function Alert(props: AlertProps) {
    return <MuiAlert elevation={6} variant="filled" {...props} />;
  }

  const [totalValue, setTotalValue] = useState<number>(0);
  const [holdings, setHoldings] = useState<Map<string, Holding>>(new Map());
  const [remainingPercent, setRemainingPercent] = useState<number>(100);
  const [chosenTimePeriod, setTimePeriod] = useState<"y" | "M" | "w">("y");
  const [chosenInterval, setPriceInterval] = useState<"1mo" | "1d" | "1wk">(
    "1wk"
  );
  const [tickerSearch, setTickerSearch] = useState<string>("");
  const [snackbarOpen, setSnackbarOpen] = useState<boolean>(false);

  useEffect(() => {
    if (urlShareHash) {
      fetchFromShareLink(urlShareHash);
    } else {
      if (window.localStorage.getItem(holdingsKey)) {
        let existingHoldings: LocalStorageItem[] = JSON.parse(
          window.localStorage.getItem(holdingsKey) || "[]"
        ) as LocalStorageItem[];
        existingHoldings.map((h) =>
          addQuote(h.ticker, h.portfolioPercentage, true)
        );
      }
    }
  }, []);

  const fetchFromShareLink = (shareHash: string) => {
    axios
      .get(`/share/${shareHash}`)
      .then((response) => {
        let sharedHoldings = JSON.parse(
          response.data.PortfolioObj.S
        ) as LocalStorageItem[];
        sharedHoldings.map((h) =>
          addQuote(h.ticker, h.portfolioPercentage, true)
        );
      })
      .catch((err) => alert(err));
  };

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
    let localStorageHoldings = Array.from(holdings.values())
      .filter((holding) => holding.ticker !== ticker)
      .map((h) => ({
        ticker: h.ticker,
        portfolioPercentage: h.portfolioPercentage,
      }));
    window.localStorage.setItem(
      holdingsKey,
      JSON.stringify(localStorageHoldings)
    );
    setHoldings((prev) => {
      const ogState = new Map(prev);
      ogState.delete(ticker);
      return ogState;
    });
  };

  const updateAllQuotes = () => {
    Array.from(holdings.keys()).forEach((ticker) => updateQuote(ticker));
  };

  const addQuote = (
    ticker: string,
    portfolioPercentage: number = 0,
    forRefresh: boolean = false
  ) => {
    axios
      .get(`/quote/${ticker}`)
      .then((response) => {
        if (!response.data) {
          throw Object.assign(new Error("Ticker not found!"), { code: 404 });
        }
        let newHolding: Holding = {
          ticker: ticker,
          name: response.data.longName,
          currency: response.data.financialCurrency,
          exchange: response.data.fullExchangeName,
          currentPrice: parseFloat(response.data.regularMarketPrice),
          previousClosePrice: parseFloat(
            response.data.regularMarketPreviousClose ||
              response.data.regularMarketOpen
          ),
          portfolioPercentage: portfolioPercentage,
          displayColor: randomColor({ luminosity: "bright" }),
        };
        if (insertHolding(ticker, newHolding, forRefresh)) {
          setTickerSearch("");
          getHistoricalData(
            newHolding,
            moment().subtract(1, chosenTimePeriod),
            chosenInterval
          );
        }
      })
      .catch((error) => {
        alert("Ticker not found!");
      });
  };

  const updateQuote = (ticker: string) => {
    axios
      .get(`/quote/${ticker}`)
      .then((response) => {
        let ogHolding = holdings.get(ticker);
        if (ogHolding) {
          ogHolding.currentPrice = parseFloat(response.data.regularMarketPrice);
          ogHolding.previousClosePrice = parseFloat(
            response.data.regularMarketPreviousClose ||
              response.data.regularMarketOpen
          );
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

  const createShareLink = () => {
    let newUUID = uuidv4();
    axios
      .post(
        "/share",
        {
          portfolio: Array.from(holdings.values()).map((h) => ({
            ticker: h.ticker,
            portfolioPercentage: h.portfolioPercentage,
          })),
        },
        { params: { shareHash: newUUID } }
      )
      .then((response) => {
        let shareUrl = `${window.location.host}/share/${newUUID}`;
        navigator.clipboard
          .writeText(shareUrl)
          .then(() => setSnackbarOpen(true));
      })
      .catch((err) => alert(`Could not fetch portfolio from DynamoDB. ${err}`));
  };

  return (
    <Box
      className={classes.body}
      display="flex"
      flexDirection="row"
      flex={1}
      width={1}
    >
      <Box width={1} className={classes.portfolioSection}>
        <Box display="flex" flexDirection="column" width={1}>
          <Box textAlign="center">
            <Typography
              className={classes.buttonGroupOverline}
              variant="overline"
              color="textSecondary"
              align="center"
            >
              Portfolio Controls
            </Typography>
          </Box>
          <Box>
            <Box
              className={classes.portfolioBar}
              display="flex"
              flexDirection="row"
              justifyContent="space-between"
              flex={1}
              width={1}
            >
              <Box>
                <SiteLogo />
              </Box>
              <Box flexDirection="row">
                <TextField
                  id="standard-number"
                  label="Add a stock"
                  placeholder="Ticker"
                  value={tickerSearch}
                  onChange={(e) =>
                    setTickerSearch(e.target.value.toUpperCase())
                  }
                  onKeyPress={(e) => {
                    if (e.key === "Enter") {
                      addQuote(tickerSearch);
                      e.preventDefault();
                    }
                  }}
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
              <ButtonGroup aria-label="top bar actions">
                <IconButton
                  className={classes.topBarActionButton}
                  onClick={() => createShareLink()}
                >
                  <ShareIcon />
                </IconButton>
                <IconButton
                  className={classes.topBarActionButton}
                  onClick={() => updateAllQuotes()}
                >
                  <RefreshIcon />
                </IconButton>
              </ButtonGroup>
            </Box>
          </Box>
        </Box>
        <Box>
          <HoldingList
            holdings={Array.from(holdings.values())}
            portfolioValue={totalValue}
            insertHolding={insertHolding}
            deleteHolding={deleteHolding}
            updatePortfolioPercentage={updatePortfolioPercentage}
            getAvailablePercentage={getAvailablePercentage}
          />
        </Box>
      </Box>
      <Box className={classes.chartSection} width={1}>
        <Charts
          holdings={holdings}
          timePeriod={chosenTimePeriod}
          setTimePeriod={setTimePeriod}
          interval={chosenInterval}
          setPriceInterval={setPriceInterval}
          refreshAllHistoricalData={refreshAllHistoricalData}
        />
      </Box>
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={4000}
        onClose={() => setSnackbarOpen(false)}
      >
        <Alert onClose={() => setSnackbarOpen(false)} severity="success">
          Share link copied to clipboard!
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default App;
