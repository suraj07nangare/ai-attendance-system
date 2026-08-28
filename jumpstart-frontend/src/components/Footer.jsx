export default function Footer() {
  return (
    <footer className="border-t border-border mt-16">
      <div className="max-w-7xl mx-auto px-6 py-6 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-muted">
        <p>© {new Date().getFullYear()} Jumpstart International Preschool and Learning Center</p>
        <p>Face data is processed for attendance only and is never stored as images.</p>
      </div>
    </footer>
  );
}
