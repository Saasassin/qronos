import QronosLogo from "../../assets/qronos_logo.png";

const Header = () => {
  return (
    <div className="navbar bg-base-100 shadow-md fixed top-0 left-0 right-0 z-50">
      <div className="flex-1 text-2xl">
        {/* <a className="btn btn-ghost normal-case text-xl"> */}
        <img src={QronosLogo} className="mr-2 h-8 ml-5" alt="Qronos Logo" />
        Qronos
        {/* </a> */}
      </div>
      <div className="flex-none">
        <ul className="menu menu-horizontal px-1">
          <li>
            <a>Item 1</a>
          </li>
          <li>
            <a>Item 2</a>
          </li>
          <li>
            <a>Item 3</a>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default Header;
