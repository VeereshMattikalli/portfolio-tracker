import { NextResponse } from "next/server";
import yahooFinance from 'yahoo-finance2';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const tickers = searchParams.get("tickers");

  if (!tickers) {
    return NextResponse.json({ error: "Tickers parameter is required" }, { status: 400 });
  }

  const tickerArray = tickers.split(",").map(t => t.trim());

  try {
    const results = await Promise.all(
      tickerArray.map(async (ticker) => {
        try {
           const result: any = await yahooFinance.quote(ticker);
           return {
             ticker,
             price: result.regularMarketPrice,
             change: result.regularMarketChange,
             changePercent: result.regularMarketChangePercent,
             currency: result.currency
           };
        } catch (e) {
           console.error(`Failed fetching ${ticker}`, e);
           return { ticker, error: "Not found or invalid" };
        }
      })
    );

    return NextResponse.json(results);
  } catch (error) {
    console.error("Market Data fetch error:", error);
    return NextResponse.json({ error: "Failed to fetch market data" }, { status: 500 });
  }
}
