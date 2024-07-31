import { Divider, Input } from "antd";
import { Dispatch, useReducer, useState } from "react";
import Cron, { CronError } from "react-js-cron";

/**
 * Custom hook to update cron value and input value.
 *
 * Cannot use InputRef to update the value because of a change in antd 4.19.0.
 *
 * @param defaultValue - The default value of the input and cron component.
 * @returns - The cron and input values with the dispatch function.
 */
export function useCronReducer(defaultValue: string): [
  {
    inputValue: string;
    cronValue: string;
  },
  Dispatch<{
    type: "set_cron_value" | "set_input_value" | "set_values";
    value: string;
  }>
] {
  const [values, dispatchValues] = useReducer(
    (
      prevValues: {
        inputValue: string;
        cronValue: string;
      },
      action: {
        type: "set_cron_value" | "set_input_value" | "set_values";
        value: string;
      }
    ) => {
      switch (action.type) {
        case "set_cron_value":
          return {
            inputValue: prevValues.inputValue,
            cronValue: action.value,
          };
        case "set_input_value":
          return {
            inputValue: action.value,
            cronValue: prevValues.cronValue,
          };
        case "set_values":
          return {
            inputValue: action.value,
            cronValue: action.value,
          };
      }
    },
    {
      inputValue: defaultValue,
      cronValue: defaultValue,
    }
  );

  return [values, dispatchValues];
}

export const CronDiv = () => {
  const defaultValue = "30 5 * * 1,6";
  const [values, dispatchValues] = useCronReducer(defaultValue);
  const [error, onError] = useState<CronError>();

  return (
    <>
      <h3 className="font-bold text-lg">Schedule Script Run</h3>
      <div className="w-full">
        <Input
          value={values.inputValue}
          onChange={(event: { target: { value: any } }) => {
            dispatchValues({
              type: "set_input_value",
              value: event.target.value,
            });
          }}
          onBlur={() => {
            dispatchValues({
              type: "set_cron_value",
              value: values.inputValue,
            });
          }}
          onPressEnter={() => {
            dispatchValues({
              type: "set_cron_value",
              value: values.inputValue,
            });
          }}
        />

        <Divider>OR</Divider>

        <Cron
          //className="my-project-cron"
          value={values.cronValue}
          setValue={(newValue: string) => {
            dispatchValues({
              type: "set_values",
              value: newValue,
            });
          }}
          onError={onError}
        />

        <div>
          <span style={{ fontSize: 12 }}>
            Double click on a dropdown option to automatically select / unselect
            a periodicity
          </span>
        </div>

        <p style={{ marginTop: 20 }}>
          Error: {error ? error.description : "No Errors"}
        </p>
      </div>{" "}
    </>
  );
};
