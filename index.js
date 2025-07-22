import express from "express";
import axios from "axios";
import cors from "cors";
import dns from "dns";
import http from "http";
import https from "https";
import { Server } from "socket.io";
import WebSocket from "ws";

dns.setDefaultResultOrder("ipv4first");

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
// Optimized agents
const httpAgent = new http.Agent({
  keepAlive: true,
  keepAliveMsecs: 1000,
  maxSockets: 50,
  maxFreeSockets: 10,
});

const httpsAgent = new https.Agent({
  keepAlive: true,
  keepAliveMsecs: 1000,
  maxSockets: 50,
  maxFreeSockets: 10,
});

const axiosInstance = axios.create({
  timeout: 5000,
  httpAgent,
  httpsAgent,
});

const safeRequest = async (url, res, label) => {
  try {
    const response = await axiosInstance.get(url);
    res.json(response.data);
  } catch (err) {
    console.error(`❌ [${label}] Error:`, err.message);
    res.status(500).json({ error: "Failed to fetch data" });
  }
};

app.get("/binance-ticker", (req, res) => {
  const symbol = req.query.url;
  safeRequest(
    `https://api.binance.com/api/v3/ticker/24hr?symbol=${symbol}`,
    res,
    "Ticker"
  );
});

app.get("/binance-exchange", (req, res) =>
  safeRequest("https://cache.bitzup.com/exchageinfoall.php", res, "Exchange")
);

app.get("/binance-order", (req, res) => {
  const symbol = req.query.url;
  safeRequest(
    `https://api.binance.com/api/v3/depth?symbol=${symbol}`,
    res,
    "Order"
  );
});

app.get("/binance-Trades", (req, res) => {
  const symbol = req.query.url;
  safeRequest(
    `https://api.binance.com/api/v3/aggTrades?symbol=${symbol}&limit=20`,
    res,
    "Trades"
  );
});
app.get("/binance-Movers", (req, res) => {
  safeRequest(`https://test.bitzup.com/market/exchangeinfo`, res, "Movers");
});
app.get("/binance-allMovers", (req, res) => {
  safeRequest(`https://test.bitzup.com/market/exchangeinfoall`, res, "Movers");
});
app.listen(PORT, () => {
  console.log(`🚀 Proxy server running on http://localhost:${PORT}`);
});
