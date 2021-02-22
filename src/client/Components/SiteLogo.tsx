import React from "react";
import PressChart from "./PressChart";
import { Box, Typography, makeStyles } from "@material-ui/core";

const useStyles = makeStyles({
  logoText: {},
  pressChart: {
    marginLeft: "-0.5rem",
    marginRight: "-0.2rem",
    marginTop: "0.5rem",
  },
});

const SiteLogo = () => {
  const classes = useStyles();

  const remToPixels = (rem: number) => {
    return (
      rem * parseFloat(getComputedStyle(document.documentElement).fontSize)
    );
  };

  return (
    <Box
      display="flex"
      flexDirection="row"
      alignItems="center"
      justifyContent="center"
    >
      <Box className={classes.pressChart}>
        <PressChart height={remToPixels(2.5)} width={remToPixels(3)} />
      </Box>

      <Box display="flex" flexDirection="column">
        <Typography
          className={classes.logoText}
          variant="body1"
          color="textPrimary"
        >
          <b>Portfolio Builder</b>
        </Typography>
        <Typography
          className={classes.logoText}
          variant="body2"
          color="textSecondary"
        >
          Build Wealth, Share Wisdom
        </Typography>
      </Box>
    </Box>
  );
};

export default SiteLogo;
