import { IconContext } from "react-icons";
import { FaRegChartBar } from "react-icons/fa";
import { IoCreateOutline, IoList, IoSettingsOutline } from "react-icons/io5";
import { RxDashboard } from "react-icons/rx";
import { Link } from "react-router-dom";

const SideNav = () => {
  return (
    <>
      <div className="fixed top-16 left-0 w-64 h-full bg-base-200 shadow-md">
        <ul className="menu p-4">
          <li>
            <Link to="/">
              <IconContext.Provider value={{ className: "react-icon-button" }}>
                <RxDashboard />
              </IconContext.Provider>
              Dashboard
            </Link>
          </li>
          <li>
            <Link to="/create_script">
              <IconContext.Provider value={{ className: "react-icon-button" }}>
                <IoCreateOutline />
              </IconContext.Provider>
              Create
            </Link>
          </li>
          <li>
            <Link to="/">
              <IconContext.Provider value={{ className: "react-icon-button" }}>
                <IoList />
              </IconContext.Provider>
              Browse
            </Link>
          </li>
          <li>
            <Link to="/view_history">
              <IconContext.Provider value={{ className: "react-icon-button" }}>
                <FaRegChartBar />
              </IconContext.Provider>
              Logs
            </Link>
          </li>
          <li>
            <Link to="/system_settings">
              <IconContext.Provider value={{ className: "react-icon-button" }}>
                <IoSettingsOutline />
              </IconContext.Provider>
              Settings
            </Link>
          </li>
        </ul>

        {/* <div>
          <a
            data-tooltip-target="tooltip-status"
            href="/system_status"
            className="inline-flex justify-center p-2 text-gray-500 rounded cursor-pointer dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-600"
          >
            <svg
              aria-hidden="true"
              className="w-6 h-6"
              fill="currentColor"
              viewBox="0 0 20 20"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M5 4a1 1 0 00-2 0v7.268a2 2 0 000 3.464V16a1 1 0 102 0v-1.268a2 2 0 000-3.464V4zM11 4a1 1 0 10-2 0v1.268a2 2 0 000 3.464V16a1 1 0 102 0V8.732a2 2 0 000-3.464V4zM16 3a1 1 0 011 1v7.268a2 2 0 010 3.464V16a1 1 0 11-2 0v-1.268a2 2 0 010-3.464V4a1 1 0 011-1z"></path>
            </svg>{" "}
            <div
              id="tooltip-status"
              role="tooltip"
              className="inline-block absolute invisible z-10 py-2 px-3 text-sm font-medium text-white bg-gray-900 rounded-lg shadow-sm opacity-0 transition-opacity duration-300 tooltip"
            >
              System Status
              <div className="tooltip-arrow" data-popper-arrow></div>
            </div>
          </a>
          <a
            href="/system_settings"
            data-tooltip-target="tooltip-settings"
            className="inline-flex justify-center p-2 text-gray-500 rounded cursor-pointer dark:text-gray-400 dark:hover:text-white hover:text-gray-900 hover:bg-gray-100 dark:hover:bg-gray-600"
          >
            <svg
              aria-hidden="true"
              className="w-6 h-6"
              fill="currentColor"
              viewBox="0 0 20 20"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                fillRule="evenodd"
                d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z"
                clipRule="evenodd"
              ></path>
            </svg>
          </a>
          <div
            id="tooltip-settings"
            role="tooltip"
            className="inline-block absolute invisible z-10 py-2 px-3 text-sm font-medium text-white bg-gray-900 rounded-lg shadow-sm opacity-0 transition-opacity duration-300 tooltip"
          >
            System Settings
            <div className="tooltip-arrow" data-popper-arrow></div>
          </div>
        </div> */}
      </div>
    </>
  );
};

export default SideNav;
