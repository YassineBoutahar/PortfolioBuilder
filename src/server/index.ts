import express from "express";
import yahooFinance from 'yahoo-finance2';
import bodyParser from "body-parser";
import moment from "moment";
import { HistoricalOptions } from "yahoo-finance2/api/modules/historical";

const app = express();

app.use(bodyParser.json());

app.use(
  bodyParser.urlencoded({
    extended: true,
  })
);

app.get("/quote/:ticker", async (req, res) => {
  let ticker = req.params.ticker;
  const quote = await yahooFinance.quote(ticker);

  res.json(quote);
});

app.get("/historical/:ticker", async (req, res) => {
  let ticker = req.params.ticker;
  let queryOptions: HistoricalOptions = {period1: req.query.period1, interval: req.query.interval}
  const historicalData = await yahooFinance.historical(ticker, queryOptions);

  res.json(historicalData);
});

const port = 3001;

console.log("checking port", port);

app.listen(port, () => {

  console.log(`Server now listening on port: ${port}`);
});
