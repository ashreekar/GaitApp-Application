export default function LengthSection({ data }) {
  const l = data;

  return (
    <div>
      <h2 className="text-sm font-bold text-gray-400 uppercase mb-3">
        Step & Stride Metrics
      </h2>

      <div className="space-y-4">

        <WideCard
          title="Step Length"
          left={l.stepLeft}
          right={l.stepRight}
          target={l.target}
        />

        <WideCard
          title="Stride Length"
          value={l.stride}
          target={l.strideTarget}
        />

      </div>
    </div>
  );
}

function WideCard({ title, left, right, value, target }) {
  return (
    <div className="bg-white p-6 rounded-[28px] border border-gray-100">
      <div className="font-bold text-gray-800 mb-3">{title}</div>

      {left && right ? (
        <div className="flex justify-between text-sm">
          <span>L: {left}m</span>
          <span>R: {right}m</span>
        </div>
      ) : (
        <div className="text-3xl font-black">{value} m</div>
      )}

      <div className="text-[10px] text-gray-400 mt-2">
        Target: {target}m
      </div>
    </div>
  );
}