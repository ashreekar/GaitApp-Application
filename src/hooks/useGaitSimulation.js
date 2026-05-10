import { useState, useEffect, useRef } from "react";

const SENSOR_WEIGHTS = {
  T1: 0.8, T2: 0.5, T3: 0.4, T4: 0.3, T5: 0.3,
  M1: 0.9, M2: 1.0, M3: 0.8, M4: 0.7, M5: 0.6,
  MM: 0.2, CM: 0.1, LM: 0.2,
  MH: 0.9, CH: 1.0, LH: 0.9
};

export const useGaitSimulation = (isActive = true) => {

  const [data, setData] = useState({
    leftPressure: {},
    rightPressure: {},
    history: [],
    elapsedTime: 0,
    phase: "IDLE",
    battery: { L: 100, R: 100 }
  });

  const ids = Object.keys(SENSOR_WEIGHTS);

  const startRef = useRef(null);

  useEffect(() => {

    if (!isActive) return;

    if (startRef.current === null) {
      startRef.current = Date.now();
    }

    const interval = setInterval(() => {

      const elapsed = Date.now() - startRef.current;

      const cyclePos = ((elapsed / 1000) * 1.2) % 2;

      const generateFoot = (isLeft) => {

        const footPos = (cyclePos + (isLeft ? 0 : 1)) % 2;

        const isStance = footPos < 1.0;

        const zones = {};

        ids.forEach((id) => {

          if (!isStance) {
            zones[id] = Math.floor(Math.random() * 15);
          } else {

            let mult = 1;

            if (id.includes("H")) {
              mult = footPos < 0.3 ? 1.2 : 0.1;
            }
            else if (id.includes("M")) {
              mult = footPos > 0.3 && footPos < 0.7 ? 1.1 : 0.2;
            }
            else if (id.includes("T")) {
              mult = footPos > 0.6 ? 1.3 : 0.1;
            }

            zones[id] = Math.min(
              1024,
              Math.floor(
                800 * SENSOR_WEIGHTS[id] * mult + Math.random() * 20
              )
            );
          }
        });

        return zones;
      };

      const lp = generateFoot(true);
      const rp = generateFoot(false);

      // AVG
      const avgLeft =
        ids.reduce((sum, id) => sum + lp[id], 0) / ids.length;

      const avgRight =
        ids.reduce((sum, id) => sum + rp[id], 0) / ids.length;

      setData((prev) => {

        const historyPoint = {
          displayTime: new Date(elapsed)
            .toISOString()
            .slice(17, 21),

          AVG_L: avgLeft,
          AVG_R: avgRight
        };

        ids.forEach((id) => {
          historyPoint[`${id}_L`] = lp[id];
          historyPoint[`${id}_R`] = rp[id];
        });

        return {
          leftPressure: lp,
          rightPressure: rp,

          history: [...prev.history, historyPoint].slice(-50),

          elapsedTime: elapsed,

          phase:
            cyclePos < 1.0
              ? "LEFT STANCE"
              : "RIGHT STANCE",

          battery: {
            L: Math.max(5, prev.battery.L - 0.005),
            R: Math.max(5, prev.battery.R - 0.005)
          }
        };
      });

    }, 100);

    return () => clearInterval(interval);

  }, [isActive]);

  return data;
};