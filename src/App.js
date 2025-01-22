import React, { useState, useEffect } from "react";
import StockChart from "./components/StockChart";

const App = () => {
  const [stockData, setStockData] = useState([]);
  const [startDate, setStartDate] = useState("2025-01-03"); // 기본 시작 날짜
  const symbols = ["ISRG", "TSLL", "BOTZ", "XOM", "BBAI"]; // 5개 종목

  // 미국 주식시장 공휴일 (예시: 2025년 공휴일)
  const marketHolidays = [
    "2025-01-01", "2025-01-20", "2025-02-17", "2025-04-18",
    "2025-05-26", "2025-07-04", "2025-09-01", "2025-11-27", "2025-12-25",
  ];

  // 주말 및 공휴일 제외한 첫 번째 영업일 찾기
  const getFirstBusinessDay = (startDate) => {
    let date = new Date(startDate);
    while (date.getDay() === 0 || date.getDay() === 6 || marketHolidays.includes(date.toISOString().split("T")[0])) {
      date.setDate(date.getDate() + 1);
    }
    return date.toISOString().split("T")[0]; // yyyy-MM-dd 형식
  };

  // 미국 주식시장 영업일 계산
  const calculateBusinessDays = (startDate) => {
    const start = new Date(startDate);
    const today = new Date();
    let businessDays = 0;
    while (start <= today) {
      const dayOfWeek = start.getDay();
      const formattedDate = start.toISOString().split("T")[0];
      if (dayOfWeek !== 0 && dayOfWeek !== 6 && !marketHolidays.includes(formattedDate)) {
        businessDays++;
      }
      start.setDate(start.getDate() + 1);
    }
    return businessDays;
  };

  // 주식 데이터 fetch
  const fetchStockData = async () => {
    try {
      const firstBusinessDay = getFirstBusinessDay(startDate);
      const businessDays = calculateBusinessDays(firstBusinessDay);

      const stockPromises = symbols.map((symbol) =>
        fetch(`https://yfinance-server.vercel.app/api/history?symbol=${symbol}&period=${businessDays}d&interval=1d`)
          .then((response) => response.json())
      );

      const results = await Promise.all(stockPromises);
      const formattedData = formatStockData(results, firstBusinessDay);
      setStockData(formattedData);
    } catch (error) {
      console.error("Error fetching stock data:", error);
    }
  };

  // 데이터를 종목별로 가공
  const formatStockData = (results, firstBusinessDay) => {
    return results.map((data, index) => {
      const prices = data.map((entry) => ({
        date: new Intl.DateTimeFormat("en-CA").format(new Date(entry.t * 1000)),
        close: entry.c,
      }));

      const filteredPrices = prices.filter((entry) => entry.date >= firstBusinessDay);
      const startPrice = filteredPrices[0]?.close || 0;
      const percentagePrices = filteredPrices.map((entry) => ({
        date: entry.date,
        close: entry.close,
        percentage: ((entry.close - startPrice) / startPrice) * 100,
      }));

      return {
        symbol: symbols[index],
        prices: percentagePrices,
      };
    });
  };

  useEffect(() => {
    fetchStockData();
  }, [startDate]);

  return (
    <div>
      <h1>장훈고 주식 그래프</h1>
      <label>
        기준 일:{" "}
        <input
          type="date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
        />
      </label>
      <StockChart data={stockData} />
    </div>
  );
};

export default App;
