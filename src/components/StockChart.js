import React from "react";
import { CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

// 주식별 고정된 색상 설정 함수
const getColor = (symbol) => {
  const colorMap = {
    BBAI: "#FF6F61",   // Coral Red
    TSLL: "#6B8E23",   // Olive Green
    BOTZ: "#1E90FF",   // Dodger Blue
    ISRG: "#FF1493",   // Deep Pink
    XOM: "#32CD32",    // Lime Green
  };

  return colorMap[symbol] || "#000000"; // 기본값은 검정색
};

// 순위별 이모지 설정
const rankEmojis = {
  1: "👑",  // 1등: 왕관
  2: "🥈",  // 2등: 은메달
  3: "🥉",  // 3등: 동메달
  4: "☕",  // 4등: 커피
  5: "🍚",  // 5등: 밥
};

// 데이터 변환 함수
const transformData = (data) => {
  if (!data.length) return [];

  return data[0].prices.map((_, index) => {
    const entry = { date: data[0].prices[index].date };
    data.forEach((stock) => {
      entry[stock.symbol] = stock.prices[index]?.percentage || 0;
      entry[`${stock.symbol}_close`] = stock.prices[index]?.close || 0;
    });
    return entry;
  });
};

// 주식 순위 계산 함수
const getStockRanking = (entry, data) => {
  return data
    .map((stock) => ({
      symbol: stock.symbol,
      percentage: entry[stock.symbol],
    }))
    .sort((a, b) => b.percentage - a.percentage);
};

const StockChart = ({ data }) => {
  const combinedData = transformData(data);
  const latestRanking = getStockRanking(combinedData[combinedData.length - 1] || {}, data);

  return (
    <div>
      <h2>추이</h2>
      <h3>1~5등 주식 순위:</h3>
      <ul style={{ listStyleType: "none", paddingLeft: 0 }}>
        {latestRanking.map((stock, index) => {
          const rank = index + 1;
          const emoji = rankEmojis[rank] || "";
          const isHighlighted = rank === 4 || rank === 5;

          return (
            <li
              key={stock.symbol}
              style={{
                fontWeight: isHighlighted ? "bold" : "normal",
                color: isHighlighted ? "#FF4500" : "inherit", // 강조: 오렌지 색상
              }}
            >
              {emoji} {stock.symbol} ({stock.percentage.toFixed(2)}%)
            </li>
          );
        })}
      </ul>
      <ResponsiveContainer width="100%" height={400}>
        <LineChart data={combinedData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis domain={["auto", "auto"]} tickFormatter={(tick) => `${tick.toFixed(2)}%`} />

          <Tooltip
            formatter={(value, name, props) => {
              const closePrice = props.payload?.[`${name}_close`];
              return [
                `${value.toFixed(2)}%`,
                `Close: $${closePrice?.toFixed(2) || 0}`,
              ];
            }}
          />
          <Legend />

          {data.map((stock) => (
            <Line
              key={stock.symbol}
              type="monotone"
              dataKey={stock.symbol}
              stroke={getColor(stock.symbol)} // 고정된 색상 적용
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default StockChart;
