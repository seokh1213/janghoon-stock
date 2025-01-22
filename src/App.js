import React, {useState, useEffect, useCallback} from "react";
import styled from "styled-components";
import StockChart from "./components/StockChart";

// 반응형 스타일 적용
const Container = styled.div`
    max-width: 1000px;
    margin: 40px auto;
    padding: 20px;
    border-radius: 12px;
    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
    background: #ffffff;
    font-family: "Inter", sans-serif;

    @media (max-width: 768px) {
        padding: 15px;
        margin: 20px;
    }
`;

const Title = styled.h1`
    text-align: center;
    color: #333;
    font-weight: 700;
    font-size: 2rem;

    @media (max-width: 768px) {
        font-size: 1.4rem;
    }
`;

const Controls = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-wrap: nowrap;
    gap: 10px;
    margin: 15px 0;

    @media (max-width: 768px) {
        flex-wrap: nowrap;
    }
`;

const Label = styled.label`
    font-size: 1rem;
    color: #555;
    font-weight: 600;
    white-space: nowrap;
`;

const DateInput = styled.input`
    padding: 6px 10px;
    font-size: 0.9rem;
    border: 1px solid #ddd;
    border-radius: 8px;
    outline: none;
    transition: all 0.3s ease;
    max-width: 150px;

    &:focus {
        border-color: #007bff;
        box-shadow: 0 0 8px rgba(0, 123, 255, 0.5);
    }
`;

const Button = styled.button`
    padding: 8px 16px;
    background: #007bff;
    color: white;
    font-size: 0.9rem;
    border: none;
    border-radius: 8px;
    cursor: pointer;
    transition: background 0.3s ease;
    max-width: 120px;

    &:hover {
        background: #0056b3;
    }
`;

const Table = styled.table`
    width: 100%;
    border-collapse: collapse;
    margin-top: 20px;
    font-size: 0.9rem;

    th, td {
        border: 1px solid #ddd;
        padding: 10px;
        text-align: center;
    }

    th {
        background: #f4f4f4;
        font-weight: bold;
    }

    @media (max-width: 768px) {
        font-size: 0.8rem;
    }
`;

// 순위별 이모지 설정
const rankEmojis = {
  1: "👑",  // 1등: 왕관
  2: "🥈",  // 2등: 은메달
  3: "🥉",  // 3등: 동메달
  4: "☕",  // 4등: 커피
  5: "🍚",  // 5등: 밥
};

const App = () => {
  const [stockData, setStockData] = useState([]);
  const [stockChartData, setStockChartData] = useState([]);
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

  // 주식 데이터 fetch
  const fetchStockData = useCallback(async () => {
    try {
      const firstBusinessDay = getFirstBusinessDay(startDate);
      const stockPromises = symbols.map((symbol) =>
        fetch(`https://yfinance-server.vercel.app/api/history?symbol=${symbol}&period=30d&interval=1d`)
          .then((response) => response.json())
      );

      const results = await Promise.all(stockPromises);
      const formattedData = formatStockData(results, firstBusinessDay);
      setStockData(formattedData);

      const formattedChartData = formatStockDataForChart(results, firstBusinessDay);
      setStockChartData(formattedChartData);
    } catch (error) {
      console.error("Error fetching stock data:", error);
    }
  }, [startDate]);

  // 데이터를 종목별로 가공
  const formatStockData = (results, firstBusinessDay) => {
    return results.map((data, index) => {
      const prices = data.map((entry) => ({
        date: new Intl.DateTimeFormat("en-CA").format(new Date(entry.t * 1000)),
        close: entry.c,
      }));

      const filteredPrices = prices.filter((entry) => entry.date >= firstBusinessDay);
      const startPrice = filteredPrices[0]?.close || 0;
      const endPrice = filteredPrices[filteredPrices.length - 1]?.close || 0;
      const percentageChange = ((endPrice - startPrice) / startPrice) * 100;

      return {
        symbol: symbols[index],
        startPrice,
        endPrice,
        percentageChange,
      };
    });
  };

  const formatStockDataForChart = (results, firstBusinessDay) => {
    return results.map((data, index) => {
      const prices = data.map((entry) => ({
        date: new Intl.DateTimeFormat("en-CA").format(new Date(entry.t * 1000)),
        close: entry.c,
      }));

      // 기준일 이후 데이터 필터링
      const filteredPrices = prices.filter((entry) => entry.date >= firstBusinessDay);

      // 변화율 추가
      const transformedData = filteredPrices.map((entry, i, arr) => {
        const startPrice = arr[0]?.close || 0;
        const percentageChange = startPrice
          ? ((entry.close - startPrice) / startPrice) * 100
          : 0;

        return {
          date: entry.date,
          close: entry.close,
          percentage: percentageChange,
        };
      });

      return {
        symbol: symbols[index],
        prices: transformedData,
      };
    });
  };

  useEffect(() => {
    fetchStockData();
  }, [fetchStockData]);

  return (
    <Container>
      <Title>장훈고 주식 그래프 📈</Title>
      <Controls>
        <Label>기준일:</Label>
        <DateInput
          type="date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
        />
        <Button onClick={fetchStockData}>업데이트</Button>
      </Controls>

      <Table>
        <thead>
        <tr>
          <th>순위</th>
          <th>종목</th>
          <th>기준일 종가</th>
          <th>마지막 날 종가</th>
          <th>변화율(%)</th>
        </tr>
        </thead>
        <tbody>
        {stockData
          .sort((a, b) => b.percentageChange - a.percentageChange)
          .map((stock, index) => (
            <tr key={stock.symbol}>
              <td>{index + 1}</td>
              <td>{rankEmojis[index + 1]}{stock.symbol}</td>
              <td>${stock.startPrice.toFixed(2)}</td>
              <td>${stock.endPrice.toFixed(2)}</td>
              <td style={{color: stock.percentageChange > 0 ? "green" : "red"}}>
                {stock.percentageChange.toFixed(2)}%
              </td>
            </tr>
          ))}
        </tbody>
      </Table>

      <StockChart data={stockChartData}/>
    </Container>
  );
};

export default App;
