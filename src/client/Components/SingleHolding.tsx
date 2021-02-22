import React from "react";
import PriceChange from "./PriceChange";
import {
  Grid,
  Box,
  IconButton,
  ButtonGroup,
  Slider,
  Input,
  InputAdornment,
  ListItem,
  ListItemText,
  ListItemAvatar,
  ListItemSecondaryAction,
  Typography,
  makeStyles,
  createStyles,
  Theme,
  useTheme,
} from "@material-ui/core";
import LaunchIcon from "@material-ui/icons/Launch";
import DeleteOutlineIcon from "@material-ui/icons/DeleteOutline";
import { SingleHoldingProps } from "../../shared/types";
import Avatar from "react-avatar";

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    button: {
      margin: theme.spacing(1),
    },
    percentSlider: {
      color: theme.palette.text.primary,
      width: "15rem",
      marginRight: "1rem",
    },
    percentInput: {
      marginRight: "1rem",
    },
    holdingActionButton: {
      paddingLeft: 0,
      paddingRight: 0,
    },
    holdingActionButtonGroup: {
      marginRight: "0.6rem",
    },
    listItemBody: {
      width: "100%",
      marginLeft: "1.5rem",
    },
    stockName: {},
  })
);

const SingleHolding = ({
  holding,
  portfolioValue,
  insertHolding,
  deleteHolding,
  updatePortfolioPercentage,
  getAvailablePercentage,
}: SingleHoldingProps) => {
  const classes = useStyles();
  const theme = useTheme();

  const getEstimatedShares = () => {
    return Math.floor(
      (portfolioValue * (holding?.portfolioPercentage || 0)) /
        100 /
        (holding?.currentPrice || 99999999)
    );
  };

  return (
    <ListItem key={holding.ticker} button>
      <ListItemAvatar>
        <Avatar
          name={holding.ticker.split("").join(" ")}
          round
          size="60"
          textSizeRatio={1}
          color={holding.displayColor}
          fgColor={theme.palette.text.primary}
        />
      </ListItemAvatar>
      <ListItemText
        onClick={() => {}}
        secondary={
          <Box
            className={classes.listItemBody}
            display="flex"
            flexDirection="row"
            justifyContent="space-between"
            alignItems="center"
          >
            <Box display="flex" flexDirection="row" alignItems="center">
              <Box display="flex" flexDirection="column" alignItems="center">
                <Typography color="textPrimary" className={classes.stockName}>
                  {holding.name}
                </Typography>
                <Slider
                  className={classes.percentSlider}
                  value={
                    typeof holding.portfolioPercentage === "number"
                      ? holding.portfolioPercentage
                      : 0
                  }
                  onChange={(e, val) =>
                    updatePortfolioPercentage(holding.ticker, Number(val))
                  }
                  marks={[
                    {
                      value: getAvailablePercentage(holding.ticker),
                      label: "Max",
                    },
                  ]}
                  step={0.1}
                  aria-labelledby="input-slider"
                />
              </Box>
              <Box>
                <Input
                  className={classes.percentInput}
                  value={holding.portfolioPercentage || 0}
                  margin="dense"
                  endAdornment={
                    <InputAdornment position="end">%</InputAdornment>
                  }
                  onChange={(e) =>
                    updatePortfolioPercentage(
                      holding.ticker,
                      Number(e.target.value)
                    )
                  }
                  onBlur={(e) => {
                    if (Number(e.target.value) < 0) {
                      updatePortfolioPercentage(holding.ticker, 0);
                    } else if (Number(e.target.value) > 100) {
                      updatePortfolioPercentage(holding.ticker, 100);
                    }
                  }}
                  inputProps={{
                    step: 0.1,
                    min: 0,
                    max: 100,
                    type: "number",
                    "aria-labelledby": "input-slider",
                  }}
                />
              </Box>
            </Box>
            <Box>
              <Typography>
                Approximately {getEstimatedShares()} shares
              </Typography>
              <PriceChange
                currentPrice={holding.currentPrice}
                previousPrice={holding.previousClosePrice}
              />
            </Box>
            <Box>
              <ButtonGroup
                className={classes.holdingActionButtonGroup}
                aria-label="holding actions"
              >
                <IconButton
                  className={classes.holdingActionButton}
                  onClick={() => deleteHolding(holding.ticker)}
                >
                  <DeleteOutlineIcon />
                </IconButton>
                <IconButton
                  className={classes.holdingActionButton}
                  target="_blank"
                  rel="noreferrer"
                  href={`https://finance.yahoo.com/quote/${holding.ticker}`}
                >
                  <LaunchIcon />
                </IconButton>
              </ButtonGroup>
            </Box>
          </Box>
        }
      />
    </ListItem>
  );
};

export default SingleHolding;
