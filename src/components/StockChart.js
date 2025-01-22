import React from "react";
import { CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import styled from "styled-components";

const NoDataMessage = styled.div`
  text-align: center;
  padding: 20px;
  border-radius: 8px;
  background: #f8f9fa;
  color: #6c757d;
  font-size: 1.2rem;
  font-weight: 600;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  margin: 20px 0;

  @media (max-width: 768px) {
    font-size: 1rem;
    padding: 15px;
  }
`;

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

const StockChart = ({ data }) => {
  if (!data?.length) {
    return <NoDataMessage>📊 데이터 로딩 중...</NoDataMessage>;
  }

  const combinedData = transformData(data);

  return (
    <div>
      <h2>추이</h2>
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
                `종가: $${closePrice?.toFixed(2) || 0}`,
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
