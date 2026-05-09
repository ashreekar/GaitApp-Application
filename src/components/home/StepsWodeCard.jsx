export default function StepsWideCard({ data }) {
  const progress = (data.steps / data.goal) * 100;

  return (
    <div className="bg-white border border-gray-100 rounded-[28px] p-6 shadow-sm">
      
      <div className="flex justify-between items-center mb-4">
        <div>
          <h4 className="font-bold text-gray-800">Total Steps</h4>
          <p className="text-[10px] text-gray-400 uppercase font-bold tracking-widest">
            Daily Activity
          </p>
        </div>

        <div className="text-xl">👟</div>
      </div>

      <div className="flex items-baseline gap-2">
        <span className="text-4xl font-black">{data.steps}</span>
        <span className="text-gray-400 text-sm font-bold">
          / {data.goal}
        </span>
      </div>

      <div className="mt-4 h-2 bg-gray-100 rounded-full overflow-hidden">
        <div
          className="h-full bg-orange-500"
          style={{ width: `${progress}%` }}
        />
      </div>

      <div className="flex justify-between mt-2 text-[10px] font-bold text-gray-400 uppercase">
        <span>{progress.toFixed(0)}% complete</span>
        <span>{data.goal - data.steps} left</span>
      </div>
    </div>
  );
}