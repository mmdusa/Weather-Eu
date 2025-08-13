export default function Footer() {
  return (
    <footer className="bg-gray-100 border-t border-gray-300 py-4 mt-6">
      <div className="max-w-7xl mx-auto px-4 text-center text-gray-600 text-sm">
        © {new Date().getFullYear()} EU Weather — Dati forniti da Open-Meteo &
        RainViewer
      </div>
    </footer>
  );
}
