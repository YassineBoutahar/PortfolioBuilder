import express from "express";
import yahooFinance from "yahoo-finance2";
import bodyParser from "body-parser";
import AWS, { DynamoDB } from "aws-sdk";
import { HistoricalOptions } from "yahoo-finance2/api/modules/historical";
import { TrendingSymbolsOptions } from "yahoo-finance2/api/modules/trendingSymbols";

AWS.config.update({ region: "us-east-2" });

const app = express();
let dynamodb: DynamoDB;

app.use(bodyParser.json());

app.use(
  bodyParser.urlencoded({
    extended: true,
  })
);

app.get("/quote/:ticker", async (req, res) => {
  let ticker = req.params.ticker;
  const quote = await yahooFinance.quote(
    ticker,
    {},
    {
      validateResult: false,
    }
  );

  res.json(quote);
});

app.get("/historical/:ticker", async (req, res) => {
  let ticker = req.params.ticker;
  let queryOptions: HistoricalOptions = {
    period1: req.query.period1,
    interval: req.query.interval,
  };
  const historicalData = await yahooFinance.historical(ticker, queryOptions, {
    validateResult: false,
  });

  res.json(historicalData);
});

app.get("/autoc/:searchQ", async (req, res) => {
  let searchQuery = req.params.searchQ;

  const results = await yahooFinance.autoc(
    searchQuery,
    {},
    {
      validateResult: false,
    }
  );
  res.json(results);
});

app.get("/recommend/:ticker", async (req, res) => {
  let ticker = req.params.ticker;

  const results = await yahooFinance.recommendationsBySymbol(
    ticker,
    {},
    {
      validateResult: false,
    }
  );
  res.json(results);
});

app.get("/trending", async (req, res) => {
  let queryOptions: TrendingSymbolsOptions = {
    count: req.query.count || 5,
  };
  const results = await yahooFinance.trendingSymbols("US", queryOptions, {
    validateResult: false,
  });

  res.json(results);
});

app.get("/share/:shareHash", async (req, res) => {
  let shareHash = req.params.shareHash;
  let params = {
    TableName: "SharedPortfolios",
    Key: {
      PortfolioId: { S: shareHash },
    },
  };

  dynamodb.getItem(params, (err, data) => {
    if (err) {
      res.status(404).send(`Item could not be found. ${err}`);
    } else {
      res.json(data.Item);
    }
  });
});

app.post("/share/", async (req, res) => {
  let shareHash = req.query.shareHash as string;
  let portfolioObj = JSON.stringify(req.body.portfolio);

  let params = {
    TableName: "SharedPortfolios",
    Item: {
      PortfolioId: { S: shareHash },
      PortfolioObj: { S: portfolioObj },
    },
  };

  dynamodb.putItem(params, (err, data) => {
    if (err) {
      res.status(500).send(`Could not store item. ${err}`);
    } else {
      res.status(200).json(data);
    }
  });
});

const port = 3001;

console.log("checking port", port);

app.listen(port, () => {
  dynamodb = new AWS.DynamoDB();

  console.log(`Server now listening on port: ${port}`);
});
