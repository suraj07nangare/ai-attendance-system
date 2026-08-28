export default function JumpstartLogo({ compact = false }) {
  const letters = [
    { ch: "J", color: "#FF5C7A" },
    { ch: "u", color: "#FF8A3D" },
    { ch: "m", color: "#FFB020" },
    { ch: "p", color: "#8DC63F" },
    { ch: "s", color: "#22B8CF" },
    { ch: "t", color: "#3B6EF6" },
    { ch: "a", color: "#8B5CF6" },
    { ch: "r", color: "#D6409F" },
    { ch: "t", color: "#FF5C7A" },
  ];

  return (
    <div className="flex items-center gap-2 select-none">
      <svg width={compact ? 26 : 32} height={compact ? 26 : 32} viewBox="0 0 24 24" className="shrink-0">
        <path
          fill="#FF5C7A"
          d="M12 1l2.4 5.9c.2.5.7.8 1.2.9l6.3.6-4.8 4.2c-.4.4-.6.9-.5 1.4l1.5 6.1-5.4-3.3c-.5-.3-1-.3-1.4 0l-5.4 3.3 1.5-6.1c.1-.5-.1-1-.5-1.4L1.1 8.4l6.3-.6c.5-.1 1-.4 1.2-.9L12 1z"
        />
        <circle cx="12" cy="10.5" r="2.3" fill="#FFFFFF" />
      </svg>
      <div>
        <p className={`font-display font-extrabold leading-none tracking-tight ${compact ? "text-lg" : "text-2xl"}`}>
          {letters.map((l, i) => (
            <span key={i} style={{ color: l.color }}>{l.ch}</span>
          ))}
        </p>
        {!compact && (
          <p className="text-[10px] uppercase tracking-widest text-muted font-semibold mt-0.5">
            Preschool &amp; Learning Center
          </p>
        )}
      </div>
    </div>
  );
}
