import { useState, useEffect } from "react";
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

  // FIRE hesaplayıcı için yeni state'ler
  const [enableFIRE, setEnableFIRE] = useState(false);
  const [monthlyExpenses, setMonthlyExpenses] = useState(10000); // Aylık harcama
  const [currentAge, setCurrentAge] = useState(30); // Mevcut yaş
  const [safeWithdrawalRate, setSafeWithdrawalRate] = useState(4); // %4 kuralı

  // Döviz kurları
  const [exchangeRates, setExchangeRates] = useState({
    USD: 34.5,
    EUR: 37.2,
  });
  const [showExchangeRates, setShowExchangeRates] = useState(false);
  const [lastUpdate, setLastUpdate] = useState(null);
  const [isLoadingRates, setIsLoadingRates] = useState(false);

  // API'den döviz kurlarını çek
  const fetchExchangeRates = async () => {
    setIsLoadingRates(true);
    try {
      // exchangerate-api.com - Ücretsiz, API key gerektirmiyor
      const response = await fetch(
        "https://api.exchangerate-api.com/v4/latest/TRY"
      );
      const data = await response.json();

      if (data && data.rates) {
        // TRY bazlı olduğu için, USD ve EUR'nun TRY karşılığını hesaplıyoruz
        const usdRate = 1 / data.rates.USD; // 1 USD = X TRY
        const eurRate = 1 / data.rates.EUR; // 1 EUR = X TRY

        setExchangeRates({
          USD: parseFloat(usdRate.toFixed(2)),
          EUR: parseFloat(eurRate.toFixed(2)),
        });
        setLastUpdate(new Date());
      }
    } catch (error) {
      console.error("Döviz kurları alınamadı:", error);
      // Hata durumunda kullanıcıya bilgi ver
      alert("Döviz kurları güncellenemedi. Varsayılan değerler kullanılıyor.");
    } finally {
      setIsLoadingRates(false);
    }
  };

  // Sayfa yüklendiğinde kurları çek
  useEffect(() => {
    if (currency === "TRY") {
      fetchExchangeRates();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Sadece ilk yüklemede

  // Döviz kurlarını güncelle
  const updateExchangeRate = (currencyCode, rate) => {
    setExchangeRates((prev) => ({
      ...prev,
      [currencyCode]: parseFloat(rate) || 0,
    }));
    setLastUpdate(new Date());
  };

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
        profit: profit,
        profitPercentage: profitPercentage,
        monthlyInvestment: shouldInvest ? yearMonthlyInvestment : 0, // Para çekme başladıysa 0
        monthlyDividendSalary: monthlyDividendSalary, // Aylık temettü maaşı
        realBalance: realBalance, // Enflasyona göre düzeltilmiş bakiye
        realProfit: realProfit, // Enflasyona göre düzeltilmiş kazanç
        realProfitPercentage: realProfitPercentage, // Enflasyona göre düzeltilmiş kazanç yüzdesi
        realMonthlyDividendSalary: realMonthlyDividendSalary, // Enflasyona göre düzeltilmiş temettü
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

  // FIRE hesaplaması
  const calculateFIRE = () => {
    if (!enableFIRE) return null;

    const yearlyExpenses = monthlyExpenses * 12;
    const fireNumber = yearlyExpenses * (100 / safeWithdrawalRate); // 4% kuralı

    // Hangi yıl FIRE sayısına ulaşılıyor?
    const fireYear = results.findIndex((r) => r.balance >= fireNumber);
    const fireAge = fireYear !== -1 ? currentAge + fireYear : null;

    // FIRE'dan sonra aylık pasif gelir
    const monthlyPassiveIncome =
      fireYear !== -1
        ? (results[fireYear].balance * (safeWithdrawalRate / 100)) / 12
        : 0;

    return {
      fireNumber,
      fireYear: fireYear !== -1 ? fireYear : null,
      fireAge,
      monthlyPassiveIncome,
      yearlyExpenses,
    };
  };

  const fireData = calculateFIRE();

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

          {/* Döviz Kurları Bölümü */}
          {currency === "TRY" && (
            <div className="exchange-rates-section">
              <div
                className="exchange-rates-header"
                onClick={() => setShowExchangeRates(!showExchangeRates)}
                style={{ cursor: "pointer", userSelect: "none" }}
              >
                <h3
                  style={{
                    fontSize: "0.9rem",
                    margin: 0,
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                  }}
                >
                  💱 Döviz Kurları {showExchangeRates ? "▼" : "▶"}
                </h3>
                <div
                  style={{ display: "flex", alignItems: "center", gap: "8px" }}
                >
                  {lastUpdate && (
                    <small style={{ fontSize: "0.7rem", color: "#666" }}>
                      {lastUpdate.toLocaleTimeString("tr-TR", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </small>
                  )}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      fetchExchangeRates();
                    }}
                    disabled={isLoadingRates}
                    className="refresh-rates-btn"
                    title="Kurları Yenile"
                  >
                    {isLoadingRates ? "⏳" : "🔄"}
                  </button>
                </div>
              </div>

              {showExchangeRates && (
                <div className="exchange-rates-grid">
                  <div className="exchange-rate-item">
                    <label>
                      <span className="currency-flag">🇺🇸</span>
                      <span>USD/TRY</span>
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={exchangeRates.USD}
                      onChange={(e) =>
                        updateExchangeRate("USD", e.target.value)
                      }
                      className="exchange-input"
                      placeholder="34.50"
                      disabled={isLoadingRates}
                    />
                  </div>

                  <div className="exchange-rate-item">
                    <label>
                      <span className="currency-flag">🇪🇺</span>
                      <span>EUR/TRY</span>
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={exchangeRates.EUR}
                      onChange={(e) =>
                        updateExchangeRate("EUR", e.target.value)
                      }
                      className="exchange-input"
                      placeholder="37.20"
                      disabled={isLoadingRates}
                    />
                  </div>

                  <div className="exchange-rate-info">
                    <div className="info-note" style={{ marginBottom: 0 }}>
                      <span className="info-icon">💡</span>
                      <span style={{ fontSize: "0.75rem" }}>
                        Kurlar otomatik çekilir. Manuel düzenleyebilirsiniz.
                      </span>
                    </div>
                    <div className="exchange-conversions">
                      <div className="conversion-item">
                        <span className="conversion-label">1,000 USD =</span>
                        <span className="conversion-value">
                          {(1000 * exchangeRates.USD).toLocaleString("tr-TR", {
                            minimumFractionDigits: 0,
                            maximumFractionDigits: 0,
                          })}{" "}
                          ₺
                        </span>
                      </div>
                      <div className="conversion-item">
                        <span className="conversion-label">1,000 EUR =</span>
                        <span className="conversion-value">
                          {(1000 * exchangeRates.EUR).toLocaleString("tr-TR", {
                            minimumFractionDigits: 0,
                            maximumFractionDigits: 0,
                          })}{" "}
                          ₺
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

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
            <small
              style={{
                color: "#a78bfa",
                fontSize: "0.75rem",
                marginTop: "3px",
                display: "block",
                fontWeight: "600",
              }}
            >
              📊 TR'de son 10 yılın ortalaması %38
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
            <h3>🔥 FIRE Hesaplayıcı (Financial Independence Retire Early)</h3>
            <div className="form-group">
              <label className="checkbox-group">
                <input
                  type="checkbox"
                  checked={enableFIRE}
                  onChange={(e) => setEnableFIRE(e.target.checked)}
                />
                FIRE Hesaplamasını Aktif Et
              </label>
            </div>

            {enableFIRE && (
              <>
                <div className="form-group">
                  <label>
                    Mevcut Yaşınız
                    <span className="value">{currentAge}</span>
                  </label>
                  <div className="input-with-slider">
                    <input
                      type="number"
                      min="18"
                      max="100"
                      value={currentAge}
                      onChange={(e) =>
                        setCurrentAge(parseFloat(e.target.value) || 18)
                      }
                      className="direct-input"
                    />
                    <input
                      type="range"
                      min="18"
                      max="80"
                      value={currentAge}
                      onChange={(e) =>
                        setCurrentAge(parseFloat(e.target.value))
                      }
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>
                    Aylık Harcamanız
                    <span className="value">
                      {formatCurrency(monthlyExpenses)}
                    </span>
                  </label>
                  <div className="input-with-slider">
                    <input
                      type="number"
                      min="0"
                      step="100"
                      value={monthlyExpenses}
                      onChange={(e) =>
                        setMonthlyExpenses(parseFloat(e.target.value) || 0)
                      }
                      className="direct-input"
                    />
                    <input
                      type="range"
                      min="0"
                      max="100000"
                      step="1000"
                      value={monthlyExpenses}
                      onChange={(e) =>
                        setMonthlyExpenses(parseFloat(e.target.value))
                      }
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>
                    Güvenli Çekme Oranı (%)
                    <span className="value">
                      {formatPercent(safeWithdrawalRate)}
                    </span>
                  </label>
                  <div className="input-with-slider">
                    <input
                      type="number"
                      min="1"
                      max="10"
                      step="0.1"
                      value={safeWithdrawalRate}
                      onChange={(e) =>
                        setSafeWithdrawalRate(parseFloat(e.target.value) || 4)
                      }
                      className="direct-input"
                    />
                    <input
                      type="range"
                      min="2"
                      max="8"
                      step="0.1"
                      value={safeWithdrawalRate}
                      onChange={(e) =>
                        setSafeWithdrawalRate(parseFloat(e.target.value))
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
                    Her yıl portföyünüzden çekebileceğiniz oran
                  </small>
                  <small
                    style={{
                      color: "#a78bfa",
                      fontSize: "0.75rem",
                      marginTop: "3px",
                      display: "block",
                      fontWeight: "600",
                    }}
                  >
                    💡 %4 Kuralı: Portföyünüzün %4'ünü her yıl çekerseniz, 30 yıl boyunca paranız bitmez (Trinity Study)
                  </small>
                </div>

                <div className="info-note">
                  <span className="info-icon">💡</span>
                  <span>
                    FIRE sayınız (Mali bağımsızlık için gereken sermaye):{" "}
                    <strong>{formatCurrency(fireData?.fireNumber || 0)}</strong>
                  </span>
                </div>

                {fireData?.fireYear && (
                  <div
                    className="info-note"
                    style={{
                      borderLeftColor: "#10b981",
                      background: "rgba(16, 185, 129, 0.1)",
                    }}
                  >
                    <span className="info-icon">🎯</span>
                    <span>
                      <strong>{fireData.fireYear}. yılda</strong> FIRE hedefine
                      ulaşacaksınız! ({fireData.fireAge} yaşında emekli
                      olabilirsiniz)
                      <br />
                      Aylık pasif geliriniz:{" "}
                      <strong>
                        {formatCurrency(fireData.monthlyPassiveIncome)}
                      </strong>
                    </span>
                  </div>
                )}

                {fireData && !fireData.fireYear && (
                  <div
                    className="info-note"
                    style={{
                      borderLeftColor: "#ef4444",
                      background: "rgba(239, 68, 68, 0.1)",
                    }}
                  >
                    <span className="info-icon">⚠️</span>
                    <span>
                      Mevcut planla {years} yıl içinde FIRE hedefine
                      ulaşamıyorsunuz. Aylık yatırımı artırın veya
                      harcamalarınızı azaltın.
                    </span>
                  </div>
                )}
              </>
            )}
          </div>

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
              {enableFIRE && fireData?.fireYear && (
                <div
                  className="summary-item"
                  style={{
                    background:
                      "linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(5, 150, 105, 0.1) 100%)",
                    borderColor: "rgba(16, 185, 129, 0.3)",
                  }}
                >
                  <span className="label">🔥 FIRE Yaşı</span>
                  <span className="amount" style={{ color: "#10b981" }}>
                    {fireData.fireAge}
                  </span>
                  <small style={{ opacity: 0.8, fontSize: "0.8rem" }}>
                    {fireData.fireYear}. yılda
                  </small>
                </div>
              )}
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
                    const isFIREYear =
                      enableFIRE && fireData?.fireYear === result.year;
                    return (
                      <tr
                        key={result.year}
                        className={`${
                          isWithdrawalPhase ? "withdrawal-phase" : ""
                        } ${isFIREYear ? "fire-year" : ""}`}
                      >
                        <td>
                          {result.year} {isFIREYear && "🔥"}
                        </td>
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
