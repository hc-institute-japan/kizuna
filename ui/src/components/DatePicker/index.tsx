import { IonDatetime } from "@ionic/react";
import React, {
  forwardRef,
  ForwardRefRenderFunction,
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
  const [date, setDate] = useState<Date>(new Date());
  const dateRef = useRef<HTMLIonDatetimeElement>(null);

  const dateToString = (): string => {
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

    return new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
  };

  return (
    <IonDatetime
      ref={dateRef}
      value={dateToString()}
      style={{ display: isVisible ? "block" : "none" }}
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
