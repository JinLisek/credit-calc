import { useState } from "react";

import "@/App.css";

import Big from "big.js";
import { Input } from "@/components/ui/input";
import { DataTable } from "@/components/ui/data-table";
import { ColumnDef } from "@tanstack/react-table";

export type Installment = {
  installment: number;
  remainingPrincipal: number;
  installmentPayment: number;
  principalPayment: number;
  interestPayment: number;
};

export const columns: ColumnDef<Installment>[] = [
  {
    accessorKey: "installment",
    header: "Rata",
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
    accessorKey: "installmentPayment",
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
    accessorKey: "principalPayment",
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
    accessorKey: "interestPayment",
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
  className: string;
  numberOfInstallments: number;
  loanAmount: number;
  interestRate: number;
  monthlyOverpayment: number;
}

const MonthlyPaymentTable = ({
  className,
  numberOfInstallments,
  loanAmount,
  interestRate,
  monthlyOverpayment,
}: MonthlyPaymentTableProps) => {
  let content = <div>Wprowadź poprawne dane</div>;

  if (
    !isNaN(numberOfInstallments) &&
    !isNaN(loanAmount) &&
    !isNaN(interestRate) &&
    !isNaN(monthlyOverpayment)
  ) {
    const bigLoanAmount = new Big(loanAmount);
    const bigInterestRate = new Big(interestRate).div(100);

    const monthlyInterestRate = bigInterestRate.div(12);
    const totalPayment = bigLoanAmount.times(
      monthlyInterestRate
        .times(monthlyInterestRate.add(1).pow(numberOfInstallments))
        .div(monthlyInterestRate.add(1).pow(numberOfInstallments).minus(1))
    );

    let outstandingLoanBalance = bigLoanAmount;

    const installments = Array.from(
      { length: numberOfInstallments },
      (_, i) => {
        const principalPayment = totalPayment
          .minus(outstandingLoanBalance.times(monthlyInterestRate))
          .plus(monthlyOverpayment);

        const interestPayment =
          outstandingLoanBalance.times(monthlyInterestRate);

        const result = {
          installment: i + 1,
          remainingPrincipal: outstandingLoanBalance.toNumber(),
          installmentPayment: principalPayment.plus(interestPayment).toNumber(),
          principalPayment: principalPayment.toNumber(),
          interestPayment: interestPayment.toNumber(),
        };

        outstandingLoanBalance = outstandingLoanBalance.minus(principalPayment);

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
  const [rawMonthlyOverpayment, setMonthlyOverpayment] = useState("0");

  const [loanAmountError, setLoanAmountError] = useState("");
  const [interestRateError, setInterestRateError] = useState("");
  const [numberOfInstallmentsError, setNumberOfInstallmentsError] =
    useState("");
  const [monthlyOverpaymentError, setMonthlyOverpaymentError] = useState("");

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

  const onChangeMonthlyOverpayment = (value: string) => {
    let overpayment = Number(value);

    if (isNaN(overpayment)) {
      setMonthlyOverpaymentError("Nadpłata musi być liczbą");
    } else if (overpayment < 0) {
      setMonthlyOverpaymentError("Nadpłata musi być większa od zera");
    } else {
      setMonthlyOverpaymentError("");
    }

    setMonthlyOverpayment(value);
  };

  const numberOfInstallments = parseInt(rawNumberOfInstallments);
  const loanAmount = parseFloat(rawLoanAmount);
  const interestRate = parseFloat(rawInterestRate);
  const monthlyOverpayment = parseFloat(rawMonthlyOverpayment);

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
        <label>
          Nadpłata miesięczna
          <Input
            value={rawMonthlyOverpayment}
            onChange={(e) => onChangeMonthlyOverpayment(e.target.value)}
          ></Input>
          {monthlyOverpaymentError && <div>{monthlyOverpaymentError}</div>}
        </label>
      </div>
      <div>
        <p>Dane wyjściowe</p>
      </div>
      <MonthlyPaymentTable
        numberOfInstallments={numberOfInstallments}
        loanAmount={loanAmount}
        interestRate={interestRate}
        monthlyOverpayment={monthlyOverpayment}
        className="col-span-2"
      />
    </div>
  );
}

export default App;
