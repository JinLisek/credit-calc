import { useState } from "react";

import "@/App.css";

import { DataTable } from "@/components/ui/data-table";
import { ColumnDef } from "@tanstack/react-table";

export type Installment = {
  installment: number;
  amount: number;
};

export const columns: ColumnDef<Installment>[] = [
  {
    accessorKey: "installment",
    header: "Rata",
  },
  {
    accessorKey: "amount",
    header: "Wysokość raty",
  },
];

function App() {
  const [rawLoanAmount, setRawLoanAmount] = useState("");
  const [rawInterestRate, setRawInterestRate] = useState("");
  const [rawNumberOfInstallments, setRawNumberOfInstallments] = useState("");

  const [loanAmountError, setLoanAmountError] = useState("");
  const [interestRateError, setInterestRateError] = useState("");
  const [numberOfInstallmentsError, setNumberOfInstallmentsError] =
    useState("");

  const onChangeLoanAmount = (value: string) => {
    let amount = Number(value);

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
    let rate = Number(value);

    if (isNaN(rate)) {
      setInterestRateError("Oprocentowanie musi być liczbą");
    } else if (rate < 0) {
      setInterestRateError("Oprocentowanie musi być większa od zera");
    } else {
      setInterestRateError("");
    }

    setRawInterestRate(value);
  };

  const onChangeNumberOfInstallments = (value: string) => {
    let installments = Number(value);

    if (
      isNaN(installments) ||
      !Number.isInteger(installments) ||
      value.includes(".")
    ) {
      setNumberOfInstallmentsError(
        "Początkowa ilość rat musi być liczbą całkowitą"
      );
    } else if (installments < 0) {
      setNumberOfInstallmentsError("Kwota kredytu musi być większa od zera");
    } else {
      setNumberOfInstallmentsError("");
    }

    setRawNumberOfInstallments(value);
  };

  const numberOfInstallments = parseInt(rawNumberOfInstallments);
  const installments = Array.from({ length: numberOfInstallments }, (_, i) => ({
    installment: i + 1,
    amount: 100 + i * 25,
  }));

  return (
    <>
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
          Oprocentowanie
          <input
            value={rawInterestRate}
            onChange={(e) => onChangeInterestRate(e.target.value)}
          ></input>
          {interestRateError && <div>{interestRateError}</div>}
        </label>
        <label>
          Początkowa ilość rat
          <input
            value={rawNumberOfInstallments}
            onChange={(e) => onChangeNumberOfInstallments(e.target.value)}
          ></input>
          {numberOfInstallmentsError && <div>{numberOfInstallmentsError}</div>}
        </label>
      </div>
      <div className="container mx-auto py-10">
        <DataTable columns={columns} data={installments} />
      </div>
    </>
  );
}

export default App;
