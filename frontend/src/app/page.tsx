"use client";

import { useGame } from "@/hooks/useGame";
import { CreateGameForm } from "@/components/CreateGameForm";
import { ActiveGame } from "@/components/ActiveGame";

export default function Home() {
  const { game, loading, isConnected, createLobby, startGame, stopGame } = useGame();

  return (
    <main className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-6xl mx-auto">
        {/* Barra de Estado de Conexión */}
        <div className={`fixed top-0 left-0 w-full h-1 ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />

        <header className="mb-8 flex justify-between items-center">
          <h1 className="text-4xl font-extrabold tracking-tight text-gray-900">
            CONTAXIO <span className="text-indigo-600">HQ</span>
          </h1>
          <div className="text-sm text-gray-500">
             Sistema: {isConnected ? 'ONLINE' : 'OFFLINE'}
          </div>
        </header>

        {loading ? (
          <div className="text-center py-20">Cargando sistema...</div>
        ) : (
          <>
            {/* Si NO hay juego O el juego está en LOBBY, mostramos el Formulario */}
            {(!game || game.status === "LOBBY") ? (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                <CreateGameForm
                  game={game}
                  onCreateLobby={createLobby}
                  onStartGame={startGame}
                  onCancel={stopGame}
                />
              </div>
            ) : (
              <div className="animate-in fade-in duration-500">
                <ActiveGame game={game} onStop={stopGame} />
              </div>
            )}
          </>
        )}
      </div>
    </main>
  );
}