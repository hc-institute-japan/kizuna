import { IonItem, IonLabel, IonList } from "@ionic/react";
import React from "react";

const values = [
  {
    label: "Original",
    value: 0,
  },
  {
    label: "Square",
    value: 1,
  },
  {
    label: "16 / 9",
    value: 16 / 9,
  },
];

interface Props {
  onChange(): any;
  dismiss(): any;
}

interface ItemInterface {
  label: string;
  value: number;
  onChange(value: number): any;
  dismiss(): any;
}

const Item: React.FC<ItemInterface> = ({ label, value, onChange, dismiss }) => (
  <IonItem
    onClick={() => {
      onChange(value);
      dismiss();
    }}
  >
    <IonLabel>{label}</IonLabel>
  </IonItem>
);

const CropPopover: React.FC<Props> = ({ onChange, dismiss }) => (
  <IonList>
    {values.map((value) => (
      <Item
        key={value.label}
        onChange={onChange}
        label={value.label}
        value={value.value}
        dismiss={dismiss}
      />
    ))}
  </IonList>
);

export default CropPopover;
