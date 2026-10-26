export default function StatCard({ title, value, note, icon: Icon, tone = "violet" }) {
  const tones = {
    violet: "bg-violet-100 text-violet-600",
    pink: "bg-pink-100 text-pink-600",
  };
  return (
    <div className="bg-white rounded-2xl shadow-sm p-5 flex items-center gap-4">
      <div className={`w-14 h-14 shrink-0 rounded-full flex items-center justify-center ${tones[tone]}`}>
        <Icon size={24} />
      </div>
      <div className="min-w-0">
        <p className="text-sm text-slate-500">{title}</p>
        <p className="text-2xl font-bold text-slate-800 truncate">{value}</p>
        <p className="text-xs text-slate-400">{note}</p>
      </div>
    </div>
  );
}