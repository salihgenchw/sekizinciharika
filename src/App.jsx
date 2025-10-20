import { useState } from "react";
import "./App.css";

function App() {
  const [monthlyInvestment, setMonthlyInvestment] = useState(1000);
  const [monthlyReturn, setMonthlyReturn] = useState(2);
  const [yearlyIncrease, setYearlyIncrease] = useState(10);
  const [years, setYears] = useState(10);
  const [isDividendStock, setIsDividendStock] = useState(false);
  const [yearlyDividend, setYearlyDividend] = useState(5);
  const [monthlyStockGrowth, setMonthlyStockGrowth] = useState(1);
  const [reinvestDividend, setReinvestDividend] = useState(true);
  const [withdrawals, setWithdrawals] = useState([]);

  const addWithdrawal = () => {
    setWithdrawals([
      ...withdrawals,
      { startYear: 1, endYear: 1, amount: 0, isMonthly: false },
    ]);
  };

  const removeWithdrawal = (index) => {
    setWithdrawals(withdrawals.filter((_, i) => i !== index));
  };

  const updateWithdrawal = (index, field, value) => {
    const updated = [...withdrawals];
    if (field === "isMonthly") {
      updated[index][field] = value;
    } else {
      updated[index][field] = parseFloat(value) || 0;
    }
    setWithdrawals(updated);
  };

  const calculateCompoundInterest = () => {
    const results = [];
    let totalInvested = 0;
    let currentBalance = 0;
    let currentMonthlyInvestment = monthlyInvestment;

    for (let year = 1; year <= years; year++) {
      let yearInvestment = 0;
      let yearWithdrawal = 0;
      const yearMonthlyInvestment = currentMonthlyInvestment; // Bu yıl için kullanılan aylık yatırım

      // Aylık yatırımlar ve kazançlar
      for (let month = 1; month <= 12; month++) {
        currentBalance += currentMonthlyInvestment;
        yearInvestment += currentMonthlyInvestment;
        totalInvested += currentMonthlyInvestment;

        // Aylık para çekme işlemleri
        withdrawals.forEach((w) => {
          if (w.isMonthly && year >= w.startYear && year <= w.endYear) {
            currentBalance -= w.amount;
            yearWithdrawal += w.amount;
          }
        });

        if (isDividendStock) {
          // Temettü hissesi: aylık hisse değer artışı
          currentBalance *= 1 + monthlyStockGrowth / 100;
        } else {
          // Normal yatırım: aylık kazanç
          currentBalance *= 1 + monthlyReturn / 100;
        }
      }

      // Temettü hesaplaması (yıllık) - sadece temettü hissesi için
      if (isDividendStock) {
        const dividendAmount = currentBalance * (yearlyDividend / 100);
        if (reinvestDividend) {
          currentBalance += dividendAmount;
          // Temettü geri yatırımı totalInvested'a eklenmez
        }
      }

      // Tek seferlik para çekme işlemleri
      withdrawals.forEach((w) => {
        if (!w.isMonthly && year >= w.startYear && year <= w.endYear) {
          currentBalance -= w.amount;
          yearWithdrawal += w.amount;
        }
      });

      // Yıllık artış uygulama
      if (year < years) {
        currentMonthlyInvestment *= 1 + yearlyIncrease / 100;
      }

      const profit = currentBalance - totalInvested;
      const profitPercentage =
        totalInvested > 0 ? (profit / totalInvested) * 100 : 0;

      results.push({
        year,
        invested: yearInvestment,
        totalInvested: totalInvested,
        balance: currentBalance,
        profit: profit,
        profitPercentage: profitPercentage,
        monthlyInvestment: yearMonthlyInvestment, // Bu yılda kullanılan aylık tutar
      });
    }

    return results;
  };

  const results = calculateCompoundInterest();
  const finalResult = results[results.length - 1];

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("tr-TR", {
      style: "currency",
      currency: "TRY",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatPercent = (value) => {
    return value.toFixed(2) + "%";
  };

  return (
    <div className="app">
      <header className="header">
        <h1>🌟 Dünyanın 8. Harikası: Bileşik Faiz</h1>
        <p className="quote">
          "Bileşik faiz dünyanın sekizinci harikasıdır. Onu anlayan kazanır,
          anlamayan öder." - Albert Einstein
        </p>
      </header>

      <div className="container">
        <div className="calculator">
          <h2>Hesaplama Parametreleri</h2>

          <div className="form-group">
            <label>
              Başlangıç Aylık Yatırım Miktarı
              <span className="value">{formatCurrency(monthlyInvestment)}</span>
            </label>
            <input
              type="range"
              min="100"
              max="50000"
              step="100"
              value={monthlyInvestment}
              onChange={(e) => setMonthlyInvestment(parseFloat(e.target.value))}
            />
          </div>

          <div className="form-group">
            <label>
              Yatırım Süresi (Yıl)
              <span className="value">{years}</span>
            </label>
            <input
              type="range"
              min="1"
              max="40"
              value={years}
              onChange={(e) => setYears(parseInt(e.target.value))}
            />
          </div>

          <div className="form-group">
            <label>
              Yıllık Aylık Yatırım Artışı
              <span className="value">{formatPercent(yearlyIncrease)}</span>
            </label>
            <input
              type="range"
              min="0"
              max="50"
              step="0.5"
              value={yearlyIncrease}
              onChange={(e) => setYearlyIncrease(parseFloat(e.target.value))}
            />
          </div>

          <div className="form-group checkbox-group">
            <label>
              <input
                type="checkbox"
                checked={isDividendStock}
                onChange={(e) => setIsDividendStock(e.target.checked)}
              />
              Temettü Hissesi
            </label>
          </div>

          {isDividendStock ? (
            <>
              <div className="form-group">
                <label>
                  Aylık Hisse Değer Artışı
                  <span className="value">
                    {formatPercent(monthlyStockGrowth)}
                  </span>
                </label>
                <input
                  type="range"
                  min="0"
                  max="10"
                  step="0.1"
                  value={monthlyStockGrowth}
                  onChange={(e) =>
                    setMonthlyStockGrowth(parseFloat(e.target.value))
                  }
                />
              </div>

              <div className="form-group">
                <label>
                  Yıllık Temettü Oranı
                  <span className="value">{formatPercent(yearlyDividend)}</span>
                </label>
                <input
                  type="range"
                  min="0"
                  max="20"
                  step="0.1"
                  value={yearlyDividend}
                  onChange={(e) =>
                    setYearlyDividend(parseFloat(e.target.value))
                  }
                />
              </div>

              <div className="form-group checkbox-group">
                <label>
                  <input
                    type="checkbox"
                    checked={reinvestDividend}
                    onChange={(e) => setReinvestDividend(e.target.checked)}
                  />
                  Temettü Geri Yatırımı
                </label>
              </div>
            </>
          ) : (
            <div className="form-group">
              <label>
                Aylık Ortalama Kazanç
                <span className="value">{formatPercent(monthlyReturn)}</span>
              </label>
              <input
                type="range"
                min="0"
                max="10"
                step="0.1"
                value={monthlyReturn}
                onChange={(e) => setMonthlyReturn(parseFloat(e.target.value))}
              />
            </div>
          )}

          <div className="withdrawals-section">
            <h3>Para Çekme İşlemleri</h3>
            {withdrawals.map((withdrawal, index) => (
              <div key={index} className="withdrawal-card">
                <div className="withdrawal-header">
                  <label className="checkbox-inline">
                    <input
                      type="checkbox"
                      checked={withdrawal.isMonthly}
                      onChange={(e) =>
                        updateWithdrawal(index, "isMonthly", e.target.checked)
                      }
                    />
                    Aylık Çekme
                  </label>
                  <button
                    onClick={() => removeWithdrawal(index)}
                    className="btn-remove-small"
                  >
                    ×
                  </button>
                </div>
                <div className="withdrawal-inputs">
                  <div className="input-group">
                    <label>Başlangıç Yılı</label>
                    <input
                      type="number"
                      min="1"
                      max={years}
                      value={withdrawal.startYear}
                      onChange={(e) =>
                        updateWithdrawal(index, "startYear", e.target.value)
                      }
                    />
                  </div>
                  <div className="input-group">
                    <label>Bitiş Yılı</label>
                    <input
                      type="number"
                      min={withdrawal.startYear}
                      max={years}
                      value={withdrawal.endYear}
                      onChange={(e) =>
                        updateWithdrawal(index, "endYear", e.target.value)
                      }
                    />
                  </div>
                  <div className="input-group">
                    <label>{withdrawal.isMonthly ? "Aylık " : ""}Miktar</label>
                    <input
                      type="number"
                      min="0"
                      value={withdrawal.amount}
                      onChange={(e) =>
                        updateWithdrawal(index, "amount", e.target.value)
                      }
                    />
                  </div>
                </div>
                <div className="withdrawal-info">
                  {withdrawal.isMonthly ? (
                    <small>
                      {withdrawal.startYear}. yıldan {withdrawal.endYear}. yıla
                      kadar her ay {formatCurrency(withdrawal.amount)} çekilecek
                    </small>
                  ) : (
                    <small>
                      {withdrawal.startYear === withdrawal.endYear
                        ? `${withdrawal.startYear}. yılda`
                        : `${withdrawal.startYear}. yıldan ${withdrawal.endYear}. yıla kadar her yıl`}{" "}
                      {formatCurrency(withdrawal.amount)} çekilecek
                    </small>
                  )}
                </div>
              </div>
            ))}
            <button onClick={addWithdrawal} className="btn-add">
              + Para Çekme Ekle
            </button>
          </div>
        </div>

        <div className="results">
          <div className="summary">
            <h2>Özet</h2>
            <div className="summary-grid">
              <div className="summary-item">
                <span className="label">Toplam Yatırım</span>
                <span className="amount invested">
                  {formatCurrency(finalResult?.totalInvested || 0)}
                </span>
              </div>
              <div className="summary-item">
                <span className="label">Toplam Değer</span>
                <span className="amount balance">
                  {formatCurrency(finalResult?.balance || 0)}
                </span>
              </div>
              <div className="summary-item">
                <span className="label">Net Kazanç</span>
                <span className="amount profit">
                  {formatCurrency(finalResult?.profit || 0)}
                </span>
              </div>
              <div className="summary-item">
                <span className="label">Kazanç Oranı</span>
                <span className="amount percent">
                  {formatPercent(finalResult?.profitPercentage || 0)}
                </span>
              </div>
            </div>
          </div>

          <div className="yearly-breakdown">
            <h2>Yıllık Detay</h2>
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>Yıl</th>
                    <th>Aylık Yatırım</th>
                    <th>Yıllık Yatırım</th>
                    <th>Toplam Yatırım</th>
                    <th>Bakiye</th>
                    <th>Kazanç</th>
                    <th>Kazanç %</th>
                  </tr>
                </thead>
                <tbody>
                  {results.map((result) => (
                    <tr key={result.year}>
                      <td>{result.year}</td>
                      <td>{formatCurrency(result.monthlyInvestment)}</td>
                      <td>{formatCurrency(result.invested)}</td>
                      <td>{formatCurrency(result.totalInvested)}</td>
                      <td className="highlight">
                        {formatCurrency(result.balance)}
                      </td>
                      <td
                        className={result.profit >= 0 ? "positive" : "negative"}
                      >
                        {formatCurrency(result.profit)}
                      </td>
                      <td>{formatPercent(result.profitPercentage)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
