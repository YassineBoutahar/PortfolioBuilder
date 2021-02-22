# Server documentation

## /quote/:ticker (GET)

Fetch an up to date quote for a specific ticker.

**Route param**

- **ticker** - Ticker symbol for the stock.

**Returns** A JSON object.

**Example query:** `http://localhost:3001/quote/AAPL`

**Example response:**

https://github.com/gadicc/node-yahoo-finance2/blob/16eea3eaf100ce92445e4636ca0e52e383dd88a7/docs/modules/quote.md

## /historical/:ticker (GET)

Retrieve historical price data for a specific ticker.

**Route param**

- **ticker** - Ticker symbol for the stock.

**Query param**

- **period1** - Start date for prices in parsable format.
- **interval** - Price interval between data points.

**Returns** an array of price points in chronological order

**Example query:** `http://localhost:3001/historical/AAPL`

**Example return:**

https://github.com/gadicc/node-yahoo-finance2/blob/16eea3eaf100ce92445e4636ca0e52e383dd88a7/docs/modules/historical.md
