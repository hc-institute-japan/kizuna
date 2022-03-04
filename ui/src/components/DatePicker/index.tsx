import { IonDatetime } from "@ionic/react";
import React, {
  forwardRef,
  ForwardRefRenderFunction,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import { dateToString, stringToDate } from "../../utils/services/DateService";

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
    new Date(new Date().setDate(new Date().getDate() + 1))
  );

  const dateRef = useRef<HTMLIonDatetimeElement>(null);

  useImperativeHandle(ref, () => ({
    open: () => {
      dateRef?.current?.open();
    },
  }));

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
