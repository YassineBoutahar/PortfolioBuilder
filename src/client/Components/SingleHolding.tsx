import React from "react";
import {
  Grid,
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
  makeStyles
} from "@material-ui/core";
import LaunchIcon from "@material-ui/icons/Launch";
import DeleteOutlineIcon from "@material-ui/icons/DeleteOutline";
import { SingleHoldingProps } from "../../shared/types";
import Avatar from "react-avatar";

const useStyles = makeStyles({
  holdingActionButton: {
    paddingLeft: 0,
    paddingRight: 0,
  },
});

const SingleHolding = ({
  holding,
  portfolioValue,
  insertHolding,
  deleteHolding,
  updatePortfolioPercentage,
  getAvailablePercentage,
}: SingleHoldingProps) => {
  const classes = useStyles();

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
          size="50"
          textSizeRatio={1}
          color={holding.displayColor}
        />
      </ListItemAvatar>
      <ListItemText
        primary={holding.name}
        secondary={
          <Grid container spacing={2}>
            <Grid item xs>
              <Slider
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
            </Grid>
            <Grid item>
              <Input
                value={holding.portfolioPercentage || 0}
                margin="dense"
                endAdornment={<InputAdornment position="end">%</InputAdornment>}
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
            </Grid>
            <Grid item xs>
              <Typography>
                ~ {getEstimatedShares()} shares @ ${holding.currentPrice}/share
              </Typography>
            </Grid>
          </Grid>
        }
      />
      <ListItemSecondaryAction>
        <ButtonGroup aria-label="holding actions">
          <IconButton className={classes.holdingActionButton} onClick={() => deleteHolding(holding.ticker)}>
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
      </ListItemSecondaryAction>
    </ListItem>
  );
};

export default SingleHolding;
