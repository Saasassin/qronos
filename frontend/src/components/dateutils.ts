import parser from "cron-parser";

const convertUTCDateToLocalDate = (date: any) => {
  return new Date(date.getTime() - date.getTimezoneOffset() * 60 * 1000);
};

export const formatDateAndTime = (date: any) => {
  let dateObj = new Date(convertUTCDateToLocalDate(new Date(date)));
  return dateObj.toLocaleDateString() + " " + dateObj.toLocaleTimeString();
};

export const getNextScheduledDate = (cronExpression: string) => {
  if (cronExpression === undefined || cronExpression === "") {
    return "No schedule set";
  }

  let options = {
    currentDate: new Date(),
    iterator: false,
  };

  let interval = parser.parseExpression(cronExpression, options);
  let nextDate = interval.next().toString();
  console.log("Next scheduled date: ", nextDate);
  return formatDateAndTime(nextDate);
};

export const getPreviousScheduledDate = (cronExpression: string) => {
  if (cronExpression === undefined || cronExpression === "") {
    return "No schedule set";
  }

  let options = {
    currentDate: new Date(),
    iterator: false,
  };

  let interval = parser.parseExpression(cronExpression, options);
  let previousDate = interval.prev().toString();
  return formatDateAndTime(previousDate);
};
