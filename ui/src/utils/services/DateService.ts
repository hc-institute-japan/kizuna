import { IntlShape } from "react-intl";

/*
  returns a new object with each value mapped using mapFn(value)
  optional keyFn if user wants to uniformly edit the keys as well
*/

export const monthToString = (month: number, intl: IntlShape) => {
  switch (month) {
    case 0:
      return intl.formatMessage({ id: "app.group-chat.media.month.1" })!;
    case 1:
      return intl.formatMessage({ id: "app.group-chat.media.month.2" })!;
    case 2:
      return intl.formatMessage({ id: "app.group-chat.media.month.3" })!;
    case 3:
      return intl.formatMessage({ id: "app.group-chat.media.month.4" })!;
    case 4:
      return intl.formatMessage({ id: "app.group-chat.media.month.5" })!;
    case 5:
      return intl.formatMessage({ id: "app.group-chat.media.month.6" })!;
    case 6:
      return intl.formatMessage({ id: "app.group-chat.media.month.7" })!;
    case 7:
      return intl.formatMessage({ id: "app.group-chat.media.month.8" })!;
    case 8:
      return intl.formatMessage({ id: "app.group-chat.media.month.9" })!;
    case 9:
      return intl.formatMessage({ id: "app.group-chat.media.month.10" })!;
    case 10:
      return intl.formatMessage({ id: "app.group-chat.media.month.11" })!;
    case 11:
      return intl.formatMessage({ id: "app.group-chat.media.month.12" })!;
    default:
      break;
  }
};

export const dateToString = (date: Date): string => {
  const year = date.getUTCFullYear();
  const rawMonth = date.getMonth() + 1;
  const rawDate = date.getDate();

  const month = rawMonth < 10 ? `0${rawMonth}` : rawMonth;
  const day = rawDate < 10 ? `0${rawDate}` : rawDate;
  return `${year}-${month}-${day}`;
};

export const stringToDate = (stringDate: string): Date => {
  const [year, rawMonth, rawDay] = stringDate.split("-");
  let month = rawMonth,
    day = rawDay;

  if (rawMonth.charAt(0) === "0") {
    month = rawMonth.substring(1);
  }

  if (rawDay.charAt(0) === "0") {
    day = rawDay.substring(1);
  }

  const newDate = new Date(
    Date.UTC(parseInt(year), parseInt(month) - 1, parseInt(day))
  );

  return newDate;
};

export const timestampToDate = (timestamp: number) => {
  const microseconds = timestamp;
  const date = new Date(microseconds * 1e-3);
  return date;
};

export const dateToTimestamp = (date: Date) => {
  // need only one field which is microseconds
  // Timestamp constructor in hc is from_micros()
  const milliseconds = date.getTime();
  const microseconds = milliseconds * 1000;
  return microseconds;
};

const DateService = {
  dateToTimestamp,
  timestampToDate,
  stringToDate,
  dateToString,
  monthToString,
};

export default DateService;
