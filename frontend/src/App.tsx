import { Flowbite } from "flowbite-react";
import Footer from "./components/layouts/footer";
import Header from "./components/layouts/header";
import SideNav from "./components/layouts/sidenav";
import Home from "./components/pages/home";

const App = () => {
  return (
    <Flowbite>
      <Header />
      <SideNav />
      <main>
        <Home />
      </main>
      <Footer />
    </Flowbite>
  );
};

export default App;
