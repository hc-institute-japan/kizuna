import { IonDatetime } from "@ionic/react";
import React, {
  forwardRef,
  ForwardRefRenderFunction,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";

interface Props {
  // shows/hides date time item
  isVisible?: boolean;
  // callback handler when selecting a date
  onChange?(date: Date): any;
}

export interface DatePickerMethods {
  // opens the date time selector modal
  open(): any;
}

const DatePicker: ForwardRefRenderFunction<DatePickerMethods, Props> = (
  { isVisible = true, onChange },
  ref
) => {
  const [date, setDate] = useState<Date>(
    new Date(new Date().setDate(new Date().getDate() + 2))
  );

  const dateRef = useRef<HTMLIonDatetimeElement>(null);

  const dateToString = (date: Date): string => {
    const year = date.getUTCFullYear();
    const rawMonth = date.getMonth() + 1;
    const month = rawMonth < 10 ? `0${rawMonth}` : rawMonth;
    const day = date.getDate();
    return `${year}-${month}-${day}`;
  };

  useImperativeHandle(ref, () => ({
    open: () => {
      dateRef?.current?.open();
    },
  }));

  const stringToDate = (stringDate: string): Date => {
    const [year, rawMonth, rawDay] = stringDate.split("-");
    let month = rawMonth,
      day = rawDay;

    if (rawMonth.charAt(0) === "0") {
      month = rawMonth.substring(1);
    }

    if (rawDay.charAt(0) === "0") {
      day = rawMonth.substring(1);
    }
    // console.log(new Date(parseInt(year), parseInt(month) - 1, parseInt(day)));
    const newDate = new Date(
      parseInt(year),
      parseInt(month) - 1,
      parseInt(day)
    );
    newDate.setHours(12, 0, 0);
    return newDate;
  };

  return (
    <IonDatetime
      ref={dateRef}
      value={dateToString(date)}
      style={{ display: isVisible ? "block" : "none" }}
      max={dateToString(new Date(new Date().setDate(new Date().getDate())))}
      onIonChange={(event) => {
        if (event.detail.value) {
          const newDate = stringToDate(event.detail.value);
          setDate(newDate);
          if (onChange) onChange(newDate);
        }
      }}
    />
  );
};

export default forwardRef(DatePicker);
