"use client";

import { useEffect, useState } from "react";
import { PuzzleDef } from "@/types/games";
import Link from "next/link";

export default function AdminPage() {
  const [puzzles, setPuzzles] = useState<PuzzleDef[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchPuzzles = async () => {
    const resCorrect = await fetch("http://localhost:8000/admin/puzzles");
    if (resCorrect.ok) {
      const data = await resCorrect.json();
      setPuzzles(data);
    }
  };

  useEffect(() => {
    fetchPuzzles();
  }, []);

  const handleInit = async () => {
    if (!confirm("¿Seguro? Esto borrará la configuración actual de puzzles.")) return;
    setLoading(true);
    await fetch("http://localhost:8000/admin/init-puzzles", { method: "POST" });
    await fetchPuzzles();
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 p-8 font-mono">
      <div className="max-w-4xl mx-auto">
        <header className="flex justify-between items-center mb-10 border-b border-gray-700 pb-4">
          <h1 className="text-3xl font-bold text-yellow-500">🔧 PANEL DE INGENIERÍA</h1>
          <Link
            href="/"
            className="bg-gray-800 hover:bg-gray-700 text-white px-4 py-2 rounded border border-gray-600"
          >
            ← Volver a la Misión
          </Link>
        </header>

        <section className="mb-12">
          <h2 className="text-xl font-bold mb-4 text-gray-400 uppercase tracking-wider">Inventario de Dispositivos</h2>
          <div className="bg-gray-800 rounded-lg overflow-hidden border border-gray-700">
            <table className="w-full text-left border-collapse">
              <thead className="bg-gray-900 text-gray-400 text-sm">
                <tr>
                  <th className="p-4">Key</th>
                  <th className="p-4">Nombre</th>
                  <th className="p-4">Topic MQTT</th>
                  <th className="p-4">Estado</th>
                </tr>
              </thead>
              <tbody>
                {puzzles.length === 0 ? (
                  <tr><td colSpan={4} className="p-8 text-center text-gray-500">No hay puzzles instalados</td></tr>
                ) : (
                  puzzles.map((p) => (
                    <tr key={p.key} className="border-t border-gray-700 hover:bg-gray-750">
                      <td className="p-4 text-yellow-200">{p.key}</td>
                      <td className="p-4 font-bold">{p.display_name}</td>
                      <td className="p-4 text-xs text-gray-400 font-mono">{p.topic}</td>
                      <td className="p-4">
                        <span className={`px-2 py-1 rounded text-xs font-bold ${p.connected ? 'bg-green-900 text-green-300 border border-green-700' : 'bg-red-900 text-red-300 border border-red-700'}`}>
                          {p.connected ? 'ONLINE' : 'OFFLINE'}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>

        <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
            <h3 className="text-lg font-bold mb-2">📥 Inicializar Sistema</h3>
            <p className="text-gray-400 text-sm mb-4">
              Si es la primera vez o has cambiado el código de los puzzles, pulsa aquí para registrar los puzzles en la base de datos.
            </p>
            <button
              onClick={handleInit}
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 px-4 rounded transition-colors disabled:opacity-50"
            >
              RESTAURAR DEFINICIONES
            </button>
          </div>
        </section>
      </div>
    </div>
  );
}