import { useState } from "react";
import "./App.css";

function App() {
  const [currency, setCurrency] = useState("TRY"); // TRY veya USD
  const [initialCapital, setInitialCapital] = useState(0); // Peşinat/Başlangıç sermayesi
  const [monthlyInvestment, setMonthlyInvestment] = useState(1000);
  const [monthlyReturn, setMonthlyReturn] = useState(2);
  const [yearlyIncrease, setYearlyIncrease] = useState(10);
  const [maxMonthlyInvestment, setMaxMonthlyInvestment] = useState(0); // 0 = sınırsız
  const [years, setYears] = useState(10);
  const [isDividendStock, setIsDividendStock] = useState(false);
  const [yearlyDividend, setYearlyDividend] = useState(5);
  const [monthlyStockGrowth, setMonthlyStockGrowth] = useState(1);
  const [reinvestDividend, setReinvestDividend] = useState(true);
  const [withdrawals, setWithdrawals] = useState([]);
  const [yearlyInflation, setYearlyInflation] = useState(0); // Yıllık enflasyon oranı

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
    let totalInvested = initialCapital;
    let currentBalance = initialCapital;
    let currentMonthlyInvestment = monthlyInvestment;

    // Para çekmenin başladığı en erken yılı bul
    const firstWithdrawalYear =
      withdrawals.length > 0
        ? Math.min(...withdrawals.map((w) => w.startYear))
        : Infinity;

    for (let year = 1; year <= years; year++) {
      let yearInvestment = 0;
      const yearMonthlyInvestment = currentMonthlyInvestment;
      const shouldInvest = year < firstWithdrawalYear;
      const balanceAtYearStart = currentBalance;

      for (let month = 1; month <= 12; month++) {
        // 💰 Önce yatırım yap (ay başında)
        if (shouldInvest) {
          currentBalance += currentMonthlyInvestment;
          yearInvestment += currentMonthlyInvestment;
          totalInvested += currentMonthlyInvestment;
        }

        // 💸 Aylık para çekme işlemleri
        withdrawals.forEach((w) => {
          if (w.isMonthly && year >= w.startYear && year <= w.endYear) {
            currentBalance -= w.amount;
          }
        });

        // 📈 Faizi uygula (yatırımdan sonra)
        if (isDividendStock) {
          currentBalance *= 1 + monthlyStockGrowth / 100;
        } else {
          currentBalance *= 1 + monthlyReturn / 100;
        }
      }

      // 📊 Temettü (yıl sonu)
      let yearlyDividendAmount = 0;
      let monthlyDividendSalary = 0;
      if (isDividendStock) {
        yearlyDividendAmount = balanceAtYearStart * (yearlyDividend / 100);
        monthlyDividendSalary = yearlyDividendAmount / 12;
        if (reinvestDividend) {
          currentBalance += yearlyDividendAmount;
        }
      }

      // 💵 Tek seferlik yıllık çekim
      withdrawals.forEach((w) => {
        if (!w.isMonthly && year >= w.startYear && year <= w.endYear) {
          currentBalance -= w.amount;
        }
      });

      // 🔁 Yıllık yatırım artışı
      if (year < years && shouldInvest) {
        currentMonthlyInvestment *= 1 + yearlyIncrease / 100;
        if (
          maxMonthlyInvestment > 0 &&
          currentMonthlyInvestment > maxMonthlyInvestment
        ) {
          currentMonthlyInvestment = maxMonthlyInvestment;
        }
      }

      const profit = currentBalance - totalInvested;
      const profitPercentage =
        totalInvested > 0 ? (profit / totalInvested) * 100 : 0;

      // Enflasyon etkisiyle düzeltilmiş değerler (bugünkü para değeri)
      const inflationMultiplier = Math.pow(1 + yearlyInflation / 100, year);
      const realBalance = currentBalance / inflationMultiplier;
      const realProfit = realBalance - totalInvested;
      const realProfitPercentage =
        totalInvested > 0 ? (realProfit / totalInvested) * 100 : 0;
      const realMonthlyDividendSalary =
        monthlyDividendSalary / inflationMultiplier;

      results.push({
        year,
        invested: yearInvestment,
        totalInvested,
        balance: currentBalance,
<<<<<<< HEAD
        profit: profit,
        profitPercentage: profitPercentage,
        monthlyInvestment: shouldInvest ? yearMonthlyInvestment : 0, // Para çekme başladıysa 0
        monthlyDividendSalary: monthlyDividendSalary, // Aylık temettü maaşı
        realBalance: realBalance, // Enflasyona göre düzeltilmiş bakiye
        realProfit: realProfit, // Enflasyona göre düzeltilmiş kazanç
        realProfitPercentage: realProfitPercentage, // Enflasyona göre düzeltilmiş kazanç yüzdesi
        realMonthlyDividendSalary: realMonthlyDividendSalary, // Enflasyona göre düzeltilmiş temettü
=======
        profit,
        profitPercentage,
        monthlyInvestment: shouldInvest ? yearMonthlyInvestment : 0,
        monthlyDividendSalary,
>>>>>>> 1b8db8d08a261f7745ddb1ded694a0ef44c5b693
      });
    }

    return results;
  };

  const results = calculateCompoundInterest();
  const finalResult = results[results.length - 1];

  // Para çekmenin başladığı en erken yılı bul (tablo vurgulaması için)
  const firstWithdrawalYear =
    withdrawals.length > 0
      ? Math.min(...withdrawals.map((w) => w.startYear))
      : Infinity;

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat(currency === "TRY" ? "tr-TR" : "en-US", {
      style: "currency",
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatPercent = (value) => {
    return value.toFixed(2) + "%";
  };

  return (
    <div className="app">
      <div className="container">
        <div className="calculator">
          <h2>Hesaplama Parametreleri</h2>

          <div className="form-group">
            <label>
              Para Birimi
              <span className="value">{currency}</span>
            </label>
            <div className="currency-selector">
              <button
                className={`currency-btn ${currency === "TRY" ? "active" : ""}`}
                onClick={() => setCurrency("TRY")}
              >
                TRY (₺)
              </button>
              <button
                className={`currency-btn ${currency === "USD" ? "active" : ""}`}
                onClick={() => setCurrency("USD")}
              >
                USD ($)
              </button>
            </div>
          </div>

          <div className="form-group">
            <label>
              Başlangıç Sermayesi (Peşinat)
              <span className="value">{formatCurrency(initialCapital)}</span>
            </label>
            <div className="input-with-slider">
              <input
                type="number"
                min="0"
                max="10000000"
                step="1000"
                value={initialCapital}
                onChange={(e) =>
                  setInitialCapital(parseFloat(e.target.value) || 0)
                }
                className="direct-input"
              />
              <input
                type="range"
                min="0"
                max="500000"
                step="1000"
                value={initialCapital}
                onChange={(e) => setInitialCapital(parseFloat(e.target.value))}
              />
            </div>
            <small
              style={{
                color: "#666",
                fontSize: "0.85rem",
                marginTop: "5px",
                display: "block",
              }}
            >
              Hali hazırda sahip olduğunuz para
            </small>
          </div>

          <div className="form-group">
            <label>
              Başlangıç Aylık Yatırım Miktarı
              <span className="value">{formatCurrency(monthlyInvestment)}</span>
            </label>
            <div className="input-with-slider">
              <input
                type="number"
                min="100"
                max="10000000"
                step="100"
                value={monthlyInvestment}
                onChange={(e) =>
                  setMonthlyInvestment(parseFloat(e.target.value) || 0)
                }
                className="direct-input"
              />
              <input
                type="range"
                min="100"
                max="50000"
                step="100"
                value={monthlyInvestment}
                onChange={(e) =>
                  setMonthlyInvestment(parseFloat(e.target.value))
                }
              />
            </div>
          </div>

          <div className="form-group">
            <label>
              Yatırım Süresi (Yıl)
              <span className="value">{years}</span>
            </label>
            <div className="input-with-slider">
              <input
                type="number"
                min="1"
                max="100"
                value={years}
                onChange={(e) => setYears(parseInt(e.target.value) || 1)}
                className="direct-input"
              />
              <input
                type="range"
                min="1"
                max="40"
                value={years}
                onChange={(e) => setYears(parseInt(e.target.value))}
              />
            </div>
          </div>

          <div className="form-group">
            <label>
              Yıllık Enflasyon Oranı
              <span className="value">{formatPercent(yearlyInflation)}</span>
            </label>
            <div className="input-with-slider">
              <input
                type="number"
                min="0"
                max="200"
                step="0.5"
                value={yearlyInflation}
                onChange={(e) =>
                  setYearlyInflation(parseFloat(e.target.value) || 0)
                }
                className="direct-input"
              />
              <input
                type="range"
                min="0"
                max="100"
                step="0.5"
                value={yearlyInflation}
                onChange={(e) => setYearlyInflation(parseFloat(e.target.value))}
              />
            </div>
            <small
              style={{
                color: "#666",
                fontSize: "0.85rem",
                marginTop: "5px",
                display: "block",
              }}
            >
              Paranın satın alma gücündeki kayıp
            </small>
          </div>

          <div className="form-group">
            <label>
              Yıllık Aylık Yatırım Artışı
              <span className="value">{formatPercent(yearlyIncrease)}</span>
            </label>
            <div className="input-with-slider">
              <input
                type="number"
                min="0"
                max="200"
                step="0.5"
                value={yearlyIncrease}
                onChange={(e) =>
                  setYearlyIncrease(parseFloat(e.target.value) || 0)
                }
                className="direct-input"
              />
              <input
                type="range"
                min="0"
                max="50"
                step="0.5"
                value={yearlyIncrease}
                onChange={(e) => setYearlyIncrease(parseFloat(e.target.value))}
              />
            </div>
          </div>

          <div className="form-group">
            <label>
              Maksimum Aylık Yatırım
              <span className="value">
                {maxMonthlyInvestment > 0
                  ? formatCurrency(maxMonthlyInvestment)
                  : "Sınırsız"}
              </span>
            </label>
            <div className="input-with-slider">
              <input
                type="number"
                min="0"
                max="10000000"
                step="1000"
                value={maxMonthlyInvestment}
                onChange={(e) =>
                  setMaxMonthlyInvestment(parseFloat(e.target.value) || 0)
                }
                className="direct-input"
              />
              <input
                type="range"
                min="0"
                max="100000"
                step="1000"
                value={maxMonthlyInvestment}
                onChange={(e) =>
                  setMaxMonthlyInvestment(parseFloat(e.target.value))
                }
              />
            </div>
            <small
              style={{
                color: "#666",
                fontSize: "0.85rem",
                marginTop: "5px",
                display: "block",
              }}
            >
              0 = Sınırsız artış
            </small>
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
                <div className="input-with-slider">
                  <input
                    type="number"
                    min="0"
                    max="50"
                    step="0.1"
                    value={monthlyStockGrowth}
                    onChange={(e) =>
                      setMonthlyStockGrowth(parseFloat(e.target.value) || 0)
                    }
                    className="direct-input"
                  />
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
              </div>

              <div className="form-group">
                <label>
                  Yıllık Temettü Oranı
                  <span className="value">{formatPercent(yearlyDividend)}</span>
                </label>
                <div className="input-with-slider">
                  <input
                    type="number"
                    min="0"
                    max="100"
                    step="0.1"
                    value={yearlyDividend}
                    onChange={(e) =>
                      setYearlyDividend(parseFloat(e.target.value) || 0)
                    }
                    className="direct-input"
                  />
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
              <div className="input-with-slider">
                <input
                  type="number"
                  min="0"
                  max="50"
                  step="0.1"
                  value={monthlyReturn}
                  onChange={(e) =>
                    setMonthlyReturn(parseFloat(e.target.value) || 0)
                  }
                  className="direct-input"
                />
                <input
                  type="range"
                  min="0"
                  max="10"
                  step="0.1"
                  value={monthlyReturn}
                  onChange={(e) => setMonthlyReturn(parseFloat(e.target.value))}
                />
              </div>
            </div>
          )}

          <div className="withdrawals-section">
            <h3>Para Çekme İşlemleri</h3>
            <div className="info-note">
              <span className="info-icon">ℹ️</span>
              <span>
                Para çekmeye başladığınız yıldan itibaren aylık yatırımlar
                duracaktır.
              </span>
            </div>
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
              {initialCapital > 0 && (
                <div className="summary-item">
                  <span className="label">Başlangıç Sermayesi</span>
                  <span className="amount initial">
                    {formatCurrency(initialCapital)}
                  </span>
                </div>
              )}
              <div className="summary-item">
                <span className="label">Toplam Yatırım</span>
                <span className="amount invested">
                  {formatCurrency(finalResult?.totalInvested || 0)}
                </span>
              </div>
              <div className="summary-item">
                <span className="label">Toplam Değer (Nominal)</span>
                <span className="amount balance">
                  {formatCurrency(finalResult?.balance || 0)}
                </span>
                {yearlyInflation > 0 && (
                  <small style={{ opacity: 0.8, fontSize: "0.8rem" }}>
                    Reel: {formatCurrency(finalResult?.realBalance || 0)}
                  </small>
                )}
              </div>
              {isDividendStock && (
                <div className="summary-item dividend">
                  <span className="label">Aylık Temettü Maaşı</span>
                  <span className="amount dividend-amount">
                    {formatCurrency(finalResult?.monthlyDividendSalary || 0)}
                  </span>
                  {yearlyInflation > 0 && (
                    <small style={{ opacity: 0.8, fontSize: "0.8rem" }}>
                      Reel:{" "}
                      {formatCurrency(
                        finalResult?.realMonthlyDividendSalary || 0
                      )}
                    </small>
                  )}
                </div>
              )}
              <div className="summary-item">
                <span className="label">Net Kazanç (Nominal)</span>
                <span className="amount profit">
                  {formatCurrency(finalResult?.profit || 0)}
                </span>
                {yearlyInflation > 0 && (
                  <small style={{ opacity: 0.8, fontSize: "0.8rem" }}>
                    Reel: {formatCurrency(finalResult?.realProfit || 0)}
                  </small>
                )}
              </div>
              <div className="summary-item">
                <span className="label">Kazanç Oranı</span>
                <span className="amount percent">
                  {formatPercent(finalResult?.profitPercentage || 0)}
                </span>
                {yearlyInflation > 0 && (
                  <small style={{ opacity: 0.8, fontSize: "0.8rem" }}>
                    Reel:{" "}
                    {formatPercent(finalResult?.realProfitPercentage || 0)}
                  </small>
                )}
              </div>
            </div>
          </div>

          <div className="yearly-breakdown">
            <h2>Yıllık Detay</h2>
            {withdrawals.length > 0 && (
              <div className="table-legend">
                <span className="legend-item">
                  <span className="legend-color withdrawal"></span>
                  <span>Para çekme dönemi (yatırım yapılmıyor)</span>
                </span>
              </div>
            )}
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>Yıl</th>
                    <th>Aylık Yatırım</th>
                    <th>Yıllık Yatırım</th>
                    <th>Toplam Yatırım</th>
                    <th>Bakiye</th>
                    {isDividendStock && <th>Temettü Maaşı</th>}
                    <th>Kazanç</th>
                    <th>Kazanç %</th>
                  </tr>
                </thead>
                <tbody>
                  {results.map((result) => {
                    const isWithdrawalPhase =
                      result.year >= firstWithdrawalYear;
                    return (
                      <tr
                        key={result.year}
                        className={isWithdrawalPhase ? "withdrawal-phase" : ""}
                      >
                        <td>{result.year}</td>
                        <td>{formatCurrency(result.monthlyInvestment)}</td>
                        <td>{formatCurrency(result.invested)}</td>
                        <td>{formatCurrency(result.totalInvested)}</td>
                        <td className="highlight">
                          {formatCurrency(result.balance)}
                        </td>
                        {isDividendStock && (
                          <td className="dividend-salary">
                            {formatCurrency(result.monthlyDividendSalary)}
                          </td>
                        )}
                        <td
                          className={
                            result.profit >= 0 ? "positive" : "negative"
                          }
                        >
                          {formatCurrency(result.profit)}
                        </td>
                        <td>{formatPercent(result.profitPercentage)}</td>
                      </tr>
                    );
                  })}
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
