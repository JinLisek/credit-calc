import { useState } from "react";

import "@/App.css";

import Big from "big.js";
import { Input } from "@/components/ui/input";
import { DataTable } from "@/components/ui/data-table";
import { ColumnDef } from "@tanstack/react-table";

export type Installment = {
  installment: number;
  amount: number;
  principal: number;
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
  {
    accessorKey: "remainingPrincipal",
    header: "Pozostały kapitał",
    cell: ({ cell }) => {
      const originalAmount = cell.getValue<number>();
      const formatter = new Intl.NumberFormat("pl-PL", {
        style: "currency",
        currency: "PLN",
      });
      return <div>{formatter.format(originalAmount)}</div>;
    },
  },
  {
    accessorKey: "principal",
    header: "Kapitał",
    cell: ({ cell }) => {
      const originalAmount = cell.getValue<number>();
      const formatter = new Intl.NumberFormat("pl-PL", {
        style: "currency",
        currency: "PLN",
      });
      return <div>{formatter.format(originalAmount)}</div>;
    },
  },
  {
    accessorKey: "interest",
    header: "Odsetki",
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
  className: string;
}

const MonthlyPaymentTable = ({
  numberOfInstallments,
  loanAmount,
  interestRate,
  className,
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

    let remainingLoanAmount = bigLoanAmount;

    const installments = Array.from(
      { length: numberOfInstallments },
      (_, i) => {
        const principal = totalPayment
          .minus(remainingLoanAmount.times(monthlyInterestRate))
          .toNumber();

        const interest = remainingLoanAmount
          .times(monthlyInterestRate)
          .toNumber();

        const result = {
          installment: i + 1,
          amount: totalPayment.toNumber(),
          remainingPrincipal: remainingLoanAmount.toNumber(),
          principal: principal,
          interest: interest,
        };

        remainingLoanAmount = remainingLoanAmount.minus(principal);

        return result;
      }
    );
    content = <DataTable columns={columns} data={installments} />;
  }

  return <div className={className}>{content}</div>;
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
    <div className="grid grid-cols-2 gap-4">
      <div>
        <p>Dane wejściowe</p>
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
      <div>
        <p>Dane wyjściowe</p>
      </div>
      <MonthlyPaymentTable
        numberOfInstallments={numberOfInstallments}
        loanAmount={loanAmount}
        interestRate={interestRate}
        className="col-span-2"
      />
    </div>
  );
}

export default App;
