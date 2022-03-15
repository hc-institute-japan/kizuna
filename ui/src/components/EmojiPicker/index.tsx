import React from "react";
import Picker from "emoji-picker-react";
import { IonContent } from "@ionic/react";
import styles from "./style.module.css";

interface Props {
  onSelect: (emoji: any) => any;
}

const EmojiPicker: React.FC<Props> = ({ onSelect }) => {
  const onEmojiClick = (event: any, emojiObject: any) => {
    onSelect(emojiObject);
  };

  return (
    // <IonContent className={styles["popover"]}>

    <Picker
      native={true}
      pickerStyle={{ width: "auto" }}
      onEmojiClick={onEmojiClick}
      preload={true}
    />
    // </IonContent>
  );
};

export default EmojiPicker;
