import React, { useEffect, useState } from "react";

import Clock from "./Clock";
import DigitalClock from "./DigitalClock";



type Props = {};

const MainClock = (props: Props) => {


  const [step, setStep] = useState(0);
  function renderSwitch() {
    switch (step) {
      case 0:
        return (
          <main
            className="custom-cursor text-center"
            onClick={() => setStep(1)}
          >
            <DigitalClock />
          </main>
        );
      case 1:
        return (
          <main className="custom-cursor" onClick={() => setStep(0)}>
            <Clock />
          </main>
        );
      default:
        return "";
    }
  }

  return (

    <div
      className="text-Slate-100 h-lvh flex flex-col items-center justify-center bg-black"
    >
      <br />





      {renderSwitch()}
    </div>
  );
};

export default MainClock;
