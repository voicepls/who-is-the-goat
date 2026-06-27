const stats = [
  { label: "Club goals", ronaldo: "739", messi: "727" },
  { label: "International goals", ronaldo: "137", messi: "112" },
  { label: "Ballon d'Or", ronaldo: "5", messi: "8" },
  { label: "World Cup titles", ronaldo: "0", messi: "1" },
  { label: "Estimated 2024 earnings", ronaldo: "$260M", messi: "$150M" },
];

export default function StatsPanel() {
  return (
    <section className="grid gap-4 border-t border-white/10 pt-5 lg:grid-cols-[0.78fr_1fr]">
      <div>
        <p className="text-xs font-black uppercase tracking-[0.22em] text-slate-400">Career receipts</p>
        <h2 className="mt-1 text-2xl font-black text-white">Numbers for the group chat</h2>
      </div>

      <div className="overflow-hidden rounded-lg border border-white/10 bg-white/[0.04]">
        <div className="grid grid-cols-[1.25fr_0.85fr_0.85fr] border-b border-white/10 bg-white/[0.045] px-3 py-3 text-xs font-black uppercase tracking-[0.16em] text-slate-400 sm:px-4">
          <span>Stat</span>
          <span className="text-right text-blue-200">Ronaldo</span>
          <span className="text-right text-emerald-200">Messi</span>
        </div>

        {stats.map((stat) => (
          <div
            key={stat.label}
            className="grid grid-cols-[1.25fr_0.85fr_0.85fr] items-center border-b border-white/10 px-3 py-3 last:border-0 sm:px-4"
          >
            <span className="text-sm font-bold text-slate-300">{stat.label}</span>
            <span className="text-right text-lg font-black text-white">{stat.ronaldo}</span>
            <span className="text-right text-lg font-black text-white">{stat.messi}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
