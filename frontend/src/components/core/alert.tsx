import { IconContext } from "react-icons";
import { FaRegCheckCircle } from "react-icons/fa";
import { IoInformationCircleOutline, IoWarningOutline } from "react-icons/io5";
import { VscError } from "react-icons/vsc";

export enum AlertType {
  INFO = "info",
  SUCCESS = "success",
  WARNING = "warning",
  ERROR = "error",
}

const AlertComponent = ({
  message,
  message_type,
  visible,
  onClose,
}: {
  message: string;
  message_type: AlertType;
  visible: boolean;
  onClose: () => void;
}) => {
  if (!visible) return null;

  return message_type === AlertType.INFO ? (
    <div role="alert" className="alert alert-info">
      <IconContext.Provider value={{ className: "react-icon-button" }}>
        <IoInformationCircleOutline />
      </IconContext.Provider>
      <span>{message}</span>
    </div>
  ) : message_type === AlertType.ERROR ? (
    <div role="alert" className="alert alert-error">
      <IconContext.Provider value={{ className: "react-icon-button" }}>
        <VscError />
      </IconContext.Provider>
      <span>{message}</span>{" "}
    </div>
  ) : message_type === AlertType.WARNING ? (
    <div role="alert" className="alert alert-warning">
      <IconContext.Provider value={{ className: "react-icon-button" }}>
        <IoWarningOutline />
      </IconContext.Provider>
      <span>{message}</span>{" "}
    </div>
  ) : (
    <div role="alert" className="alert alert-success">
      <IconContext.Provider value={{ className: "react-icon-button" }}>
        <FaRegCheckCircle />
      </IconContext.Provider>
      <span>{message}</span>{" "}
    </div>
  );
};

export default AlertComponent;
