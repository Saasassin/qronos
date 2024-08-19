import { Input } from "antd";
import { Dispatch, useEffect, useReducer, useState } from "react";
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
  // reset prevValues to "" when defaultValue changes
  const [prevValues, setPrevValues] = useState<{
    inputValue: string;
    cronValue: string;
  }>({
    inputValue: defaultValue,
    cronValue: defaultValue,
  });

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

  useEffect(() => {
    if (prevValues.inputValue !== defaultValue) {
      dispatchValues({
        type: "set_values",
        value: defaultValue,
      });
      dispatchValues({
        type: "set_input_value",
        value: defaultValue,
      });
      dispatchValues({
        type: "set_cron_value",
        value: defaultValue,
      });
      setPrevValues({
        inputValue: defaultValue,
        cronValue: defaultValue,
      });
    }
  }, [defaultValue]);

  return [values, dispatchValues];
}

export const CronDiv = ({
  saveCronFn,
  deleteCronFn,
  script_name,
  defaultValue,
}: {
  saveCronFn: (new_cron_expression: string) => void;
  deleteCronFn: () => void;
  script_name: string;
  defaultValue: string | undefined;
}) => {
  const [cronValue, setCronValue] = useState<string | undefined>(defaultValue);
  const [values, dispatchValues] = useCronReducer(cronValue || "");
  const [error, onError] = useState<CronError>();

  useEffect(() => {
    setCronValue(defaultValue);
    dispatchValues({
      type: "set_values",
      value: defaultValue || "",
    });
    dispatchValues({
      type: "set_input_value",
      value: defaultValue || "",
    });
    dispatchValues({
      type: "set_cron_value",
      value: defaultValue || "",
    });
  }, [defaultValue]);

  const doCronSave = (new_cron_expression: string) => {
    defaultValue = "";
    saveCronFn(new_cron_expression);
  };

  const doCronDelete = () => {
    defaultValue = "";
    dispatchValues({
      type: "set_values",
      value: defaultValue,
    });
    dispatchValues({
      type: "set_input_value",
      value: defaultValue,
    });
    dispatchValues({
      type: "set_cron_value",
      value: defaultValue,
    });
    deleteCronFn();
    setCronValue(undefined);

    // need to change the prevValues to "" in the useCronReducer
    //
    values.cronValue = "";
    values.inputValue = "";
    console.log("doCronDeleteOut: ", defaultValue);
  };

  return (
    <>
      <h3 className="font-bold text-lg">
        Schedule Script: <b>'{script_name}'</b>
      </h3>
      <div className="w-full">
        <Input
          placeholder="Enter Cron Expression, then Tab or Enter"
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

        <div className="mt-5 mb-5">... Or select a schedule ...</div>
        {/* Failed attempt to do dark mode in antd. */}
        {/* <ConfigProvider
          theme={{
            // 1. Use dark algorithm
            algorithm: theme.darkAlgorithm,

            // 2. Combine dark algorithm and compact algorithm
            // algorithm: [theme.darkAlgorithm, theme.compactAlgorithm],
          }}
        > */}
        <Cron
          clearButton={true}
          clearButtonAction="empty"
          value={values.cronValue}
          setValue={(newValue: string) => {
            dispatchValues({
              type: "set_values",
              value: newValue,
            });
          }}
          onError={onError}
        />
        {/* </ConfigProvider> */}

        <div>
          <span style={{ fontSize: 12 }}>
            Double click on a dropdown option to automatically select / unselect
            a periodicity
          </span>
        </div>

        {error && (
          <div className="text-error mt-5">
            Error: {error ? error.description : "No Errors"}
          </div>
        )}
      </div>{" "}
      <div className="flex justify-center mt-8">
        {(!error && (
          <button
            className="btn btn-primary content-center"
            onClick={() => doCronSave(values.cronValue)}
          >
            Save Schedule
          </button>
        )) || (
          <button className="btn btn-primary btn-disabled content-center">
            Save Schedule
          </button>
        )}
        {(defaultValue != "" && (
          <button
            className="btn btn-secondary ml-5"
            onClick={() => doCronDelete()}
          >
            Remove Schedule
          </button>
        )) || (
          <button className="btn btn-secondary btn-disabled ml-5">
            Remove Schedule
          </button>
        )}
      </div>
    </>
  );
};
