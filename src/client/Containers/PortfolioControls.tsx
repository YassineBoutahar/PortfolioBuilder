import React, { useEffect, useState } from "react";
import SiteLogo from "../Components/SiteLogo";
import {
  TextField,
  IconButton,
  ButtonGroup,
  InputAdornment,
  Box,
  Snackbar,
  makeStyles,
} from "@material-ui/core";
import Autocomplete from "@material-ui/lab/Autocomplete";
import MuiAlert, { AlertProps } from "@material-ui/lab/Alert";
import AddCircleOutlineIcon from "@material-ui/icons/AddCircleOutline";
import RefreshIcon from "@material-ui/icons/Refresh";
import ShareIcon from "@material-ui/icons/Share";
import { PortfolioControlsProps } from "../../shared/types";
import axios from "axios";
import { v4 as uuidv4 } from "uuid";
import { AutocResult } from "yahoo-finance2/api/modules/autoc";
import { RecommendationsBySymbolResponse } from "yahoo-finance2/api/modules/recommendationsBySymbol";
import { TrendingSymbol } from "yahoo-finance2/api/modules/trendingSymbols";

const backendUrl = "https://portfoliobackend.boutahar.dev";

const useStyles = makeStyles({
  root: {
    marginBottom: "1rem",
  },
  topBarActionButton: {
    paddingLeft: 0,
    paddingRight: 0,
  },
  tickerSearchBar: {
    width: 120,
  },
});

const PortfolioControls = ({
  holdings,
  totalValue,
  setTotalValue,
  addQuote,
  updateAllQuotes,
}: PortfolioControlsProps) => {
  const classes = useStyles();
  const [tickerSearch, setTickerSearch] = useState<string>("");
  const [autocompleteResults, setAutocompleteResults] = useState<string[]>([]);
  const [snackbarOpen, setSnackbarOpen] = useState<boolean>(false);

  useEffect(() => {
    getAutocompleteValues();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const Alert = (props: AlertProps) => {
    return <MuiAlert elevation={6} variant="filled" {...props} />;
  };

  const updateTickerSearch = (updatedTickerSearch: string) => {
    setTickerSearch(updatedTickerSearch);
    getAutoCompleteTickers(updatedTickerSearch);
  };

  const getAutocompleteValues = (empty: boolean = false) => {
    if (tickerSearch.length > 0 && !empty) {
      getAutoCompleteTickers(tickerSearch);
    } else if (holdings.size === 0) {
      getTrendingTickers();
    } else {
      getRecommendedTickers();
    }
  };

  const getAutoCompleteTickers = (currentSearch: string) => {
    axios
      .get(`${backendUrl}/autoc/${currentSearch}`)
      .then((response) => {
        let allQuotes: AutocResult[] = response.data.Result;
        setAutocompleteResults(
          allQuotes
            .slice(0, Math.min(allQuotes.length + 1, 6))
            .map((q) => q.symbol)
        );
      })
      .catch((error) => {
        console.log(error);
      });
  };

  const getTrendingTickers = () => {
    axios
      .get(`${backendUrl}/trending`)
      .then((response) => {
        let allQuotes: TrendingSymbol[] = response.data.quotes;
        setAutocompleteResults(allQuotes.map((q) => q.symbol));
      })
      .catch((error) => {
        console.log(error);
      });
  };

  const getRecommendedTickers = () => {
    axios
      .get(
        `${backendUrl}/recommend/${Array.from(holdings.values()).pop()?.ticker}`
      )
      .then((response) => {
        let allSymbols: RecommendationsBySymbolResponse = response.data;
        setAutocompleteResults(
          allSymbols.recommendedSymbols.map((s) => s.symbol)
        );
      })
      .catch((error) => {
        console.log(error);
      });
  };

  const createShareLink = () => {
    let newUUID = uuidv4();
    axios
      .post(
        `${backendUrl}/share`,
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
    <Box>
      <Box
        className={classes.root}
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
          <Autocomplete
            className={classes.tickerSearchBar}
            freeSolo
            disableClearable
            size="small"
            value={tickerSearch}
            onChange={(event, value) => updateTickerSearch(value.toUpperCase())}
            options={autocompleteResults}
            renderInput={(params) => (
              <TextField
                {...params}
                id="standard-number"
                label="Add a stock"
                placeholder="Ticker"
                onChange={(e) =>
                  updateTickerSearch(e.target.value.toUpperCase())
                }
                onKeyPress={(e) => {
                  if (e.key === "Enter") {
                    addQuote(tickerSearch);
                    e.preventDefault();
                  }
                }}
                InputProps={{
                  ...params.InputProps,
                  startAdornment: (
                    <InputAdornment position="start">$</InputAdornment>
                  ),
                  endAdornment: (
                    <IconButton
                      onClick={() => {
                        addQuote(tickerSearch);
                        setTickerSearch("");
                        getAutocompleteValues(true);
                      }}
                      edge="start"
                      size="small"
                    >
                      <AddCircleOutlineIcon fontSize="small" />
                    </IconButton>
                  ),
                }}
              />
            )}
          />
        </Box>
        <TextField
          error={isNaN(totalValue) || totalValue < 0}
          label="Total Portfolio Value"
          type="number"
          value={totalValue}
          onChange={(e) => setTotalValue(parseFloat(e.target.value))}
          InputProps={{
            inputProps: { min: 0 },
            startAdornment: <InputAdornment position="start">$</InputAdornment>,
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

export default PortfolioControls;
