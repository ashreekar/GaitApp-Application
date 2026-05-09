export default function LengthSection({ data }) {
  const l = data;

  return (
    <div>
      <h2 className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] mb-4">
        Step & Stride Engine
      </h2>

      <div className="space-y-4">

        {/* STEP LENGTH */}
        <WideCard
          title="Step Length"
          left={l.stepLeft}
          right={l.stepRight}
          target={l.target}
        />

        {/* STRIDE LENGTH */}
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
  const isBilateral = left !== undefined && right !== undefined;
  const progress = value ? (value / target) * 100 : 0;

  return (
    <div className="bg-white border border-gray-100 rounded-[28px] p-6 shadow-sm">

      <div className="flex justify-between items-center mb-4">
        <div className="text-sm font-bold text-gray-800">
          {title}
        </div>
      </div>

      {isBilateral ? (
        <div className="grid grid-cols-2 gap-6">

          {/* Left */}
          <div>
            <div className="text-[10px] text-gray-400 font-bold uppercase">
              Left
            </div>
            <div className="text-2xl font-black">{left}m</div>
          </div>

          {/* Right */}
          <div className="text-right">
            <div className="text-[10px] text-gray-400 font-bold uppercase">
              Right
            </div>
            <div className="text-2xl font-black">{right}m</div>
          </div>

        </div>
      ) : (
        <div>
          <div className="text-4xl font-black text-gray-900">
            {value}m
          </div>

          <div className="mt-4 h-2 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-blue-600 transition-all duration-700"
              style={{ width: `${Math.min(progress, 100)}%` }}
            />
          </div>

          <div className="flex justify-between mt-2">
            <span className="text-[9px] font-bold text-gray-400 uppercase">
              Current
            </span>
            <span className="text-[9px] font-bold text-gray-400 uppercase">
              Target {target}m
            </span>
          </div>
        </div>
      )}
    </div>
  );
}