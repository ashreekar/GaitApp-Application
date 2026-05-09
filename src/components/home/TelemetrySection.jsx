export default function TelemetrySection({ data }) {
  const t = data;

  return (
    <div>
      <h2 className="text-sm font-bold text-gray-400 uppercase mb-3">
        Live Index
      </h2>

      <div className="grid grid-cols-2 gap-4">
        <Card label="Symmetry" value={t.symmetry} unit="%" />
        <Card label="Velocity" value={t.velocity} unit="m/s" />
        <Card label="Asymmetry" value={t.asymmetry} unit="%" />
        <Card label="Fall Risk" value={t.fallRisk} />
      </div>
    </div>
  );
}

function Card({ label, value, unit }) {
  return (
    <div className="bg-white p-5 rounded-[24px] border border-gray-100">
      <div className="text-[10px] text-gray-400 font-bold uppercase">
        {label}
      </div>
      <div className="text-xl font-black">
        {value} {unit}
      </div>
    </div>
  );
}