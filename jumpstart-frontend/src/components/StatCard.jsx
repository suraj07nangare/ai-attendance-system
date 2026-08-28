const ACCENTS = {
  primary: { bg: "bg-primary-light", text: "text-primary", ring: "ring-primary/10" },
  mint: { bg: "bg-mint/10", text: "text-mint", ring: "ring-mint/10" },
  coral: { bg: "bg-coral/10", text: "text-coral", ring: "ring-coral/10" },
  sun: { bg: "bg-sun/10", text: "text-sun", ring: "ring-sun/10" },
  grape: { bg: "bg-grape/10", text: "text-grape", ring: "ring-grape/10" },
};

export default function StatCard({ label, value, icon, accent = "primary" }) {
  const c = ACCENTS[accent] || ACCENTS.primary;
  return (
    <div className="bg-surface border border-border rounded-xl2 p-5 shadow-card">
      <div className="flex items-center justify-between mb-4">
        <p className="text-xs uppercase tracking-widest text-muted font-bold">{label}</p>
        <div className={`w-9 h-9 rounded-full flex items-center justify-center ${c.bg} ${c.text}`}>
          {icon}
        </div>
      </div>
      <p className="text-3xl font-display font-extrabold text-ink">{value}</p>
    </div>
  );
}
