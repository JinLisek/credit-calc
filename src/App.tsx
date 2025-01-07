import { useState } from "react";

import "./App.css";

function App() {
  const [rawLoanAmount, setRawLoanAmount] = useState("");
  const [rawInterestRate, setRawInterestRate] = useState("");
  const [loanAmountError, setLoanAmountError] = useState("");
  const [interestRateError, setInterestRateError] = useState("");

  const onChangeLoanAmount = (value: string) => {
    let amount = parseFloat(value);

    if (isNaN(amount)) {
      setLoanAmountError("Kwota kredytu musi być liczbą");
    } else if (amount < 0) {
      setLoanAmountError("Kwota kredytu musi być większa od zera");
    } else {
      setLoanAmountError("");
    }
    setRawLoanAmount(value);
  };

  const onChangeInterestRate = (value: string) => {
    let rate = parseFloat(value);

    console.log(rate);
    if (isNaN(rate)) {
      setInterestRateError("Oprocentowanie musi być liczbą");
    } else if (rate < 0) {
      setInterestRateError("Oprocentowanie musi być większa od zera");
    } else {
      setInterestRateError("");
    }
    setRawInterestRate(value);
  };

  return (
    <div>
      <label>
        Kwota kredytu
        <input
          value={rawLoanAmount}
          onChange={(e) => onChangeLoanAmount(e.target.value)}
        ></input>
        {loanAmountError && <div>{loanAmountError}</div>}
      </label>
      <label>
        Oprocentowanie{" "}
        <input
          value={rawInterestRate}
          onChange={(e) => onChangeInterestRate(e.target.value)}
        ></input>
        {interestRateError && <div>{interestRateError}</div>}
      </label>
    </div>
  );
}

export default App;
