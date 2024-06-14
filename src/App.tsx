import { useState } from "react";
import "./App.css";
import reactLogo from "./assets/react.svg";
import viteLogo from "/vite.svg";

function App() {
  const [count, setCount] = useState(0);

  return (
    <>
      <div>
        <a href="https://vitejs.dev" target="_blank">
          <img src={viteLogo} className="logo" alt="Vite logo" />
        </a>
        <a href="https://react.dev" target="_blank">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
      </div>
      <h1>Vite + React</h1>
      <div className="card">
        <button onClick={() => setCount((count) => count + 1)}>
          count is {count}
        </button>
        <p>
          Edit <code>src/App.tsx</code> and save to test HMR
        </p>
      </div>
      <h1 className="text-3xl font-bold underline">Hello world!</h1>
      <p className="text-sky-400">The quick brown fox...</p>
      <div className="rounded border-4 border-indigo-500/100">00</div>
      <div className="rounded-md">11</div>
      <div className="rounded-lg">22</div>
      <div className="rounded-full">33</div>
      <button className="... ring-2 ring-blue-500">Create account</button>
    </>
  );
}

export default App;
