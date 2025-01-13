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
  installments: Installment[];
}

const MonthlyPaymentTable = ({
  className,
  installments,
}: MonthlyPaymentTableProps) => {
  return (
    <div className={className}>
      <DataTable columns={columns} data={installments} />;
    </div>
  );
};

const calculateInstallments = ({
  numberOfInstallments,
  loanAmount,
  interestRate,
  monthlyOverpayment,
}: {
  numberOfInstallments: number;
  loanAmount: number;
  interestRate: number;
  monthlyOverpayment: number;
}) => {
  if (
    isNaN(numberOfInstallments) ||
    isNaN(loanAmount) ||
    isNaN(interestRate) ||
    isNaN(monthlyOverpayment)
  ) {
    return [];
  }

  const bigLoanAmount = new Big(loanAmount);
  const bigInterestRate = new Big(interestRate).div(100);

  const monthlyInterestRate = bigInterestRate.div(12);
  const totalPayment = bigLoanAmount.times(
    monthlyInterestRate
      .times(monthlyInterestRate.add(1).pow(numberOfInstallments))
      .div(monthlyInterestRate.add(1).pow(numberOfInstallments).minus(1))
  );

  let outstandingLoanBalance = bigLoanAmount;

  return Array.from({ length: numberOfInstallments }, (_, i) => {
    if (outstandingLoanBalance.lte(0)) {
      return {
        installment: i + 1,
        remainingPrincipal: 0,
        installmentPayment: 0,
        principalPayment: 0,
        interestPayment: 0,
      };
    }

    const principalPayment = totalPayment
      .minus(outstandingLoanBalance.times(monthlyInterestRate))
      .plus(monthlyOverpayment);

    const interestPayment = outstandingLoanBalance.times(monthlyInterestRate);

    let result = {
      installment: i + 1,
      remainingPrincipal: outstandingLoanBalance.toNumber(),
      installmentPayment: principalPayment.plus(interestPayment).toNumber(),
      principalPayment: principalPayment.toNumber(),
      interestPayment: interestPayment.toNumber(),
    };

    outstandingLoanBalance = outstandingLoanBalance.minus(principalPayment);

    if (outstandingLoanBalance.lt(0)) {
      result.installmentPayment = outstandingLoanBalance
        .add(result.installmentPayment)
        .toNumber();
      result.principalPayment =
        result.principalPayment + outstandingLoanBalance.toNumber();
    }

    return result;
  });
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

  const noOverpaymentInstallments = calculateInstallments({
    numberOfInstallments: parseInt(rawNumberOfInstallments),
    loanAmount: parseFloat(rawLoanAmount),
    interestRate: parseFloat(rawInterestRate),
    monthlyOverpayment: 0,
  });

  const fullRepaymentAmount = noOverpaymentInstallments.reduce(
    (acc, curr) => acc.add(curr.installmentPayment),
    new Big(0)
  );

  const installments = calculateInstallments({
    numberOfInstallments: parseInt(rawNumberOfInstallments),
    loanAmount: parseFloat(rawLoanAmount),
    interestRate: parseFloat(rawInterestRate),
    monthlyOverpayment: parseFloat(rawMonthlyOverpayment),
  });

  const repaymentWithOverpayment = installments.reduce(
    (acc, curr) => acc.add(curr.installmentPayment),
    new Big(0)
  );

  const formatter = new Intl.NumberFormat("pl-PL", {
    style: "currency",
    currency: "PLN",
  });

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
        <label>
          Pierwotna kwota kredytu
          <p>
            <output>{formatter.format(fullRepaymentAmount.toNumber())}</output>
          </p>
        </label>
        <label>
          Kwota kredytu z nadpłatami
          <p>
            <output>
              {formatter.format(repaymentWithOverpayment.toNumber())}
            </output>
          </p>
        </label>
      </div>
      <MonthlyPaymentTable className="col-span-2" installments={installments} />
    </div>
  );
}

export default App;
