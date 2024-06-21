import { Flowbite } from "flowbite-react";
import { Route, Routes } from "react-router-dom";
import Footer from "./components/layouts/footer";
import Header from "./components/layouts/header";
import SideNav from "./components/layouts/sidenav";
import CreateScript from "./components/pages/create";
import Home from "./components/pages/home";

const App = () => {
  return (
    <>
      <Flowbite>
        <Header />
        <SideNav />
        <main>
          <Routes>
            <Route index element={<Home />} />
            <Route path="/" element={<Home />} />
            <Route path="/create_script" element={<CreateScript />} />
            {/* <Route path="*" element={<NoMatch />} /> */}
          </Routes>
          <Footer />
        </main>
      </Flowbite>
    </>
  );
};

export default App;
