import { Editor } from './components/Editor';

export function App() {
  return (
    <div className="min-h-screen bg-gray-100 py-10">
      <header className="text-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Editor SPA - Núcleo Funcional & Casca Imperativa</h1>
        <p className="text-sm text-gray-500">Testando a engine pura de blocos e spans no navegador</p>
      </header>

      <main>
        <Editor />
      </main>
    </div>
  );
}

export default App;