import React from 'react';

export default function RecoverySection({ data }) {
  // Determine color based on score for that gadget "Status" feel
  const getStatusColor = (score) => {
    if (score >= 80) return 'text-emerald-500';
    if (score >= 50) return 'text-blue-600';
    return 'text-orange-500';
  };

  const statusColor = getStatusColor(data.score);

  return (
    <div className="relative overflow-hidden bg-white p-6 rounded-[32px] border border-slate-50">
      {/* Background Decorative Element (Subtle Tech Grid or Pulse) */}
      <div className="absolute top-0 right-0 -mt-4 -mr-4 w-32 h-32 bg-blue-50/50 rounded-full blur-3xl" />

      <div className="relative z-10 flex justify-between items-end">
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <div className={`w-2 h-2 rounded-full animate-pulse ${statusColor.replace('text', 'bg')}`} />
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.15em]">
              Gait Recovery
            </span>
          </div>
          
          <div className="flex items-baseline space-x-1">
            <span className={`text-7xl font-black tracking-tighter ${statusColor}`}>
              {Math.round(data.score)}
            </span>
            <span className="text-xl font-bold text-slate-300">/100</span>
          </div>
        </div>

        <div className="flex flex-col items-end space-y-2">
          {/* Trend Badge */}
          <div className="bg-emerald-50 px-3 py-1 rounded-full flex items-center space-x-1 border border-emerald-100">
            <span className="text-emerald-600 text-xs font-bold">
              {data.trend > 0 ? '↑' : '↓'} {Math.abs(data.trend)}%
            </span>
          </div>
          
          <p className="text-[10px] font-medium text-slate-400 text-right uppercase leading-tight">
            Vs. Last<br/>Session
          </p>
        </div>
      </div>

      {/* Progress Bar (The "Gadget" Detail) */}
      <div className="mt-8">
        <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
          <div 
            className={`h-full transition-all duration-1000 ease-out rounded-full ${statusColor.replace('text', 'bg')}`}
            style={{ width: `${data.score}%` }}
          />
        </div>
        <div className="flex justify-between mt-2">
          <span className="text-[9px] font-bold text-slate-300 uppercase">Rest</span>
          <span className="text-[9px] font-bold text-slate-300 uppercase">Optimal</span>
        </div>
      </div>
    </div>
  );
}