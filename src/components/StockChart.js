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

const StockChart = ({ data }) => {
  const combinedData = data.length
    ? data[0].prices.map((_, index) => {
      const entry = { date: data[0].prices[index].date };
      data.forEach((stock) => {
        entry[stock.symbol] = stock.prices[index]?.percentage || 0;
        entry[`${stock.symbol}_close`] = stock.prices[index]?.close || 0;
      });
      return entry;
    })
    : [];

  // 1등 주식 찾기
  const getTopStock = (entry) => {
    const percentageEntries = data.map((stock) => entry[stock.symbol]);
    const maxPercentage = Math.max(...percentageEntries);
    const topStockIndex = percentageEntries.indexOf(maxPercentage);
    return {
      symbol: data[topStockIndex]?.symbol,
      percentage: maxPercentage,
    };
  };

  const topStock = getTopStock(combinedData[combinedData.length - 1]);

  return (
    <div>
      <h2>추이</h2>
      <h3>
        1등 주식: {topStock.symbol} ({topStock.percentage.toFixed(2)}%)
      </h3>
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
                `Close: $${closePrice.toFixed(2)}`,
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
