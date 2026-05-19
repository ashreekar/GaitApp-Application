export function mapPressureGrid(
  sensors = {}
) {

  return [

    // TOES
    [
      sensors.T1 ?? 0,
      sensors.T2 ?? 0,
      sensors.T3 ?? 0,
      sensors.T4 ?? 0,
      sensors.T5 ?? 0,
    ],

    // METATARSALS
    [
      sensors.M1 ?? 0,
      sensors.M2 ?? 0,
      sensors.M3 ?? 0,
      sensors.M4 ?? 0,
      sensors.M5 ?? 0,
    ],

    // MIDFOOT
    [
      sensors.MM ?? 0,
      sensors.CM ?? 0,
      sensors.LM ?? 0,
    ],

    // HEEL
    [
      sensors.MH ?? 0,
      sensors.CH ?? 0,
      sensors.LH ?? 0,
    ],
  ];
}