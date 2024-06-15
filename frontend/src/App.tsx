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
      <div className="grid grid-cols-4 gap-4">
        <div className="border-solid border-2 border-sky-500 ">1111</div>
        <div className="border-dashed border-2 border-sky-500">222</div>
        <div className="border-dotted border-2 border-sky-500">333</div>
        <div className="border-double border-4 border-sky-500 ">444</div>
      </div>
      <div className="flex justify-center space-x-4">&nbsp;</div>
      <button className="... ring-2 ring-blue-500">Create account</button>
    </>
  );
}

export default App;
