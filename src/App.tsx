import { useState } from "react";

import "@/App.css";

import Big from "big.js";
import { Input } from "@/components/ui/input";
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
    cell: ({ cell }) => {
      const originalAmount = cell.getValue<number>();
      const formatter = new Intl.NumberFormat("pl-PL", {
        style: "currency",
        currency: "PLN",
      });
      return <div>{formatter.format(originalAmount)}</div>;
    },
  },
];

interface MonthlyPaymentTableProps {
  numberOfInstallments: number;
  loanAmount: number;
  interestRate: number;
}

const MonthlyPaymentTable = ({
  numberOfInstallments,
  loanAmount,
  interestRate,
}: MonthlyPaymentTableProps) => {
  let content = <div>Wprowadź poprawne dane</div>;

  if (
    !isNaN(numberOfInstallments) &&
    !isNaN(loanAmount) &&
    !isNaN(interestRate)
  ) {
    const bigLoanAmount = new Big(loanAmount);
    const bigInterestRate = new Big(interestRate).div(100);

    const monthlyInterestRate = bigInterestRate.div(12);
    const totalPayment = bigLoanAmount.times(
      monthlyInterestRate
        .times(monthlyInterestRate.add(1).pow(numberOfInstallments))
        .div(monthlyInterestRate.add(1).pow(numberOfInstallments).minus(1))
    );

    const installments = Array.from(
      { length: numberOfInstallments },
      (_, i) => ({
        installment: i + 1,
        amount: totalPayment.toNumber(),
      })
    );
    content = <DataTable columns={columns} data={installments} />;
  }

  return <div className="container mx-auto py-10">{content}</div>;
};

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
  const loanAmount = parseFloat(rawLoanAmount);
  const interestRate = parseFloat(rawInterestRate);

  return (
    <>
      <div>
        <label>
          Kwota kredytu
          <Input
            value={rawLoanAmount}
            onChange={(e) => onChangeLoanAmount(e.target.value)}
          ></Input>
          {loanAmountError && <div>{loanAmountError}</div>}
        </label>
        <label>
          Oprocentowanie
          <Input
            value={rawInterestRate}
            onChange={(e) => onChangeInterestRate(e.target.value)}
          ></Input>
          {interestRateError && <div>{interestRateError}</div>}
        </label>
        <label>
          Początkowa ilość rat
          <Input
            value={rawNumberOfInstallments}
            onChange={(e) => onChangeNumberOfInstallments(e.target.value)}
          ></Input>
          {numberOfInstallmentsError && <div>{numberOfInstallmentsError}</div>}
        </label>
      </div>
      <MonthlyPaymentTable
        numberOfInstallments={numberOfInstallments}
        loanAmount={loanAmount}
        interestRate={interestRate}
      />
    </>
  );
}

export default App;
