const convertUTCDateToLocalDate = (date: any) => {
  return new Date(date.getTime() - date.getTimezoneOffset() * 60 * 1000);
};

const formatDateAndTime = (date: any) => {
  let dateObj = new Date(convertUTCDateToLocalDate(new Date(date)));
  return dateObj.toLocaleDateString() + " " + dateObj.toLocaleTimeString();
};

export { formatDateAndTime };
