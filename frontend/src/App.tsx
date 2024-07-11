import { Route, Routes } from "react-router-dom";
import Footer from "./components/layouts/footer";
import Header from "./components/layouts/header";
import SideNav from "./components/layouts/sidenav";
import BrowseScripts from "./components/pages/browse_scripts";
import CreateScript from "./components/pages/create_scripts";
import ViewHistory from "./components/pages/history";
import Home from "./components/pages/home";
import SystemSettings from "./components/pages/system_settings";
import SystemStatus from "./components/pages/system_status";

const App = () => {
  return (
    <>
      {/* <Flowbite> */}
      <Header />
      <SideNav />
      <main>
        <Routes>
          <Route index element={<Home />} />
          <Route path="/" element={<Home />} />
          <Route path="/create_script" element={<CreateScript />} />
          <Route path="/browse_scripts" element={<BrowseScripts />} />
          <Route path="/view_history" element={<ViewHistory />} />
          <Route path="/system_settings" element={<SystemSettings />} />
          <Route path="/system_status" element={<SystemStatus />} />
          {/* <Route path="*" element={<NoMatch />} /> */}
        </Routes>
        <Footer />
      </main>
      {/* </Flowbite> */}
    </>
  );
};

export default App;
