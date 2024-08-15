"use client";

import Image from "next/image";
import { useState } from "react";
export default function Home() {
  const [flatPrice, setFlatPrice] = useState(0);
  const [ownContribution, setOwnContribution] = useState(0);
  const [creditPeriod, setCreditPeriod] = useState(0);
  const [interestRate, setInterestRate] = useState(0);

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <div className="z-10 w-full max-w-5xl items-center justify-between font-mono text-sm lg:flex">
        <form>
          <div>
            <label className="text-gray-500">Cena mieszkania</label>
            <input
              type="text"
              name="flatPrice"
              onChange={(event) => setFlatPrice(parseFloat(event.target.value))}
            ></input>
          </div>

          <div>
            <label className="text-gray-500">Wkład własny</label>
            <input
              type="text"
              name="ownContribution"
              onChange={(event) =>
                setOwnContribution(parseFloat(event.target.value))
              }
            ></input>
          </div>

          <div>
            <label className="text-gray-500">
              Okres kredytowania w miesiącach
            </label>
            <input
              type="text"
              name="creditPeriod"
              onChange={(event) =>
                setCreditPeriod(parseFloat(event.target.value))
              }
            ></input>
          </div>

          <div>
            <label className="text-gray-500">Oprocentowanie</label>
            <input
              type="text"
              name="interestRate"
              onChange={(event) =>
                setInterestRate(parseFloat(event.target.value))
              }
            ></input>
          </div>
        </form>

        <div>
          <div>
            <label className="text-gray-500 mr-5">Miesięczna rata</label>
            <label className="text-gray-500">
              {((flatPrice - ownContribution) * interestRate) /
                (1 - (1 + interestRate) ** -creditPeriod)}
            </label>
          </div>
        </div>
      </div>
    </main>
  );
}
