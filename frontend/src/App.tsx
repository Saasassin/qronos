import { useState } from "react";
import Footer from "./components/layouts/footer";
import Header from "./components/layouts/header";
import SideNav from "./components/layouts/sidenav";
import Home from "./components/pages/home";

// import reactLogo from "./assets/react.svg";
// import viteLogo from "/vite.svg";

const App = () => {
  const [count, setCount] = useState(0);

  return (
    <>
      <div className="antialiased bg-gray-50 dark:bg-gray-900">
        <Header />
        <SideNav />
        <main className="p-4 md:ml-64 h-auto pt-20">
          <Home />
        </main>

        <Footer />
      </div>
    </>
  );
};

export default App;
