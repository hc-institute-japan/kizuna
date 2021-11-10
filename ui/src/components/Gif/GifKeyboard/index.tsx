import React, { useEffect, useState, useCallback } from "react";
import {
  IonContent,
  IonGrid,
  IonRow,
  IonButton,
  IonInfiniteScroll,
  IonInfiniteScrollContent,
  IonCol,
  IonCard,
  IonImg,
  IonSearchbar,
} from "@ionic/react";
import { useSelector } from "react-redux";
import { RootState } from "../../../redux/types";
import { getGifs } from "../../../redux/gif/actions/utils";
import styles from "./style.module.css";
import { useAppDispatch } from "../../../utils/helpers";
import GifSearchBox from "../GifSearchBox";

export interface FileContent {
  metadata: {
    fileName: string;
    fileType: "VIDEO" | "IMAGE" | "OTHER";
    fileSize: number;
  };
  fileType: {
    type: "VIDEO" | "IMAGE" | "OTHER";
    payload?: { thumbnail: Uint8Array };
  };
  fileBytes: Uint8Array;
}

export interface MessageInputOnSendParams {
  message?: string;
  files?: FileContent[];
  reply?: string;
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>;
}

// export interface MessageInputMethods {
//   reply: (message: { payload: Payload; author: string; id: string }) => any;
// }

interface Props {
  onChange?: (message: string) => any;
  onSend?: (opt?: MessageInputOnSendParams) => any;
  onSelect?: (message: string) => any;
}

const GifKeyboard: React.FC<Props> = ({ onSend, onChange, onSelect }) => {
  const dispatch = useAppDispatch();
  const [searchText, setSearchText] = useState("");
  const [selectedGif, setSelectedGif] = useState("");
  const [loading, setLoading] = useState<boolean>(true);
  let gifs = useSelector((state: RootState) => state.gif.gifs);

  useEffect(() => {
    dispatch(getGifs(undefined));
  }, []);

  const handleOnChange = (e: CustomEvent) => setSearchText(e.detail.value!);

  // const handleOnSubmit = (term: string) => {
  //   dispatch(getGifs(term));
  // };

  const onChangeCallback = useCallback(() => {
    // if (onChange) onChange(selectedGif);
    if (onSelect) onSelect(selectedGif);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedGif]);

  const handleOnClick = (url: string) => {
    setSelectedGif(url);
    // if (onSend) {
    //   console.log("sending", url);
    //   onSend({
    //     message: url,
    //     // reply: isReply?.id,
    //     setIsLoading: setLoading,
    //   });
    // }
  };

  useEffect(() => {
    dispatch(getGifs(searchText));
  }, [searchText]);

  useEffect(() => onChangeCallback(), [selectedGif, onChangeCallback]);

  const renderGif = () =>
    Object.values(gifs).map((gif: any) => {
      return (
        <React.Fragment key={gif.id}>
          <IonCol size="3">
            <IonCard
              className={styles.mediacard}
              onClick={() => handleOnClick(gif.media[0].gif.url)}
            >
              <IonImg
                src={
                  gif.media[0].tinygif.preview
                    ? gif.media[0].nanogif.url
                    : gif.media[0].gif.preview
                }
              />
            </IonCard>
          </IonCol>
        </React.Fragment>
      );
    });

  return (
    <>
      <div slot="fixed" className={styles.wrapper}>
        <IonSearchbar
          slot="fixed"
          value={searchText}
          onIonChange={
            // setSearchText(e.detail.value!);
            handleOnChange
            // handleOnSubmit(e.detail.value!);
          }
          debounce={2000}
        ></IonSearchbar>
        <IonInfiniteScroll className={styles.size} position="bottom">
          <IonGrid>
            <IonRow className={styles.mediarow}>{renderGif()}</IonRow>
            <IonInfiniteScrollContent></IonInfiniteScrollContent>
          </IonGrid>
        </IonInfiniteScroll>
      </div>
    </>
  );
};

export default GifKeyboard;
