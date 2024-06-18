import { useState } from "react";
// import reactLogo from "./assets/react.svg";
// import viteLogo from "/vite.svg";

function App() {
  const [count, setCount] = useState(0);

  return (
    <>
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
      <div className="bg-white dark:bg-slate-800 rounded-lg px-6 py-8 ring-1 ring-slate-900/5 shadow-xl">
        <div>
          <span className="inline-flex items-center justify-center p-2 bg-indigo-500 rounded-md shadow-lg">
            <svg
              className="h-6 w-6 text-white"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              aria-hidden="true"
            ></svg>
          </span>
        </div>
        <h3 className="text-slate-900 dark:text-white mt-5 text-base font-medium tracking-tight">
          Writes Upside-Down
        </h3>
        <p className="text-slate-500 dark:text-slate-400 mt-2 text-sm">
          The Zero Gravity Pen can be used to write in any orientation,
          including upside-down. It even works in outer space.
        </p>
      </div>
    </>
  );
}

export default App;
