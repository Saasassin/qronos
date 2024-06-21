import { Flowbite } from "flowbite-react";
import Footer from "./components/layouts/footer";
import Header from "./components/layouts/header";
import SideNav from "./components/layouts/sidenav";
import Home from "./components/pages/home";

const App = () => {
  return (
    <>
      <Flowbite>
        <Header />
        <SideNav />
        <main className="p-4 md:ml-64 h-auto pt-20" id="root">
          <Home />
        </main>
        <Footer />
      </Flowbite>
    </>
  );
};

export default App;
