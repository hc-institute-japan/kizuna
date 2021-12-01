import React, { useEffect, useState, useCallback, useRef } from "react";
import {
  IonContent,
  IonInfiniteScroll,
  IonInfiniteScrollContent,
  IonCard,
  IonCardHeader,
  IonSearchbar,
  IonText,
  IonButton,
  IonIcon,
} from "@ionic/react";
import {
  chevronUpOutline,
  chevronDownOutline,
  arrowBack,
} from "ionicons/icons";
import { getGifs } from "../../../redux/gif/actions/getGifs";
import { getCategories } from "../../../redux/gif/actions/getCategories";
import styles from "./style.module.css";
import { useAppDispatch } from "../../../utils/helpers";
import Spinner from "../../../components/Spinner";
import { getGifsState } from "../../../redux/gif/actions/getGifsState";

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

interface Props {
  onChange?: (message: string) => any;
  onSend?: (opt?: MessageInputOnSendParams) => any;
  onSelect?: (message: string) => any;
}

const GifKeyboard: React.FC<Props> = ({ onSend, onChange, onSelect }) => {
  const dispatch = useAppDispatch();
  const [searchText, setSearchText] = useState("");
  const [selectedGif, setSelectedGif] = useState("");
  const [categories, setCategories] = useState<any[]>([]);
  const [showCategories, setShowCategories] = useState<boolean>(true);
  const [gifs, setGifs] = useState<any[]>([]);
  const [next, setNext] = useState<any>(undefined);
  const [expanded, setExpanded] = useState<boolean>(false);

  const handleOnChange = (e: CustomEvent) => setSearchText(e.detail.value!);

  const handleOnClick = (url: string) => {
    setSelectedGif(url);
    resetSearchText();
  };

  const handleOnExpandClick = () => {
    setExpanded(!expanded);
  };

  const handleOnBackClick = () => {
    setShowCategories(true);
    resetSearchText();
  };

  const handleOnCategoryClick = (searchTerm: string) => {
    setSearchText(searchTerm);

    dispatch(getGifs(searchText)).then((res: any) => {
      setGifs(res.gifs);
      setNext(res.next);
    });
    setShowCategories(false);
  };

  const handleOnScrollBottom = (complete: () => Promise<void>) => {
    dispatch(getGifs(searchText, next)).then((res: any) => {
      setGifs(gifs ? [...gifs, ...res.gifs] : res.gifs);
      setNext(res.next);
    });
    complete();
  };

  const resetSearchText = () => setSearchText("");

  const onChangeCallback = useCallback(() => {
    if (onSelect) onSelect(selectedGif);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedGif]);

  useEffect(() => {
    dispatch(getCategories()).then((res: any) => {
      setCategories(res.top);
    });
    dispatch(getGifs(searchText)).then((res: any) => {
      setGifs(res.gifs);
      setNext(res.next);
    });
    dispatch(getGifsState()).then((res: any[]) => setGifs(res));
  }, [searchText]);

  useEffect(() => onChangeCallback(), [selectedGif, onChangeCallback]);

  const infiniteGifScroll = useRef<HTMLIonInfiniteScrollElement>(null);
  const complete: () => any = () => infiniteGifScroll.current?.complete();

  const renderCategories = () => {
    return Object.values(categories).map((category: any) => {
      return (
        <div key={category.name}>
          <div
            className={styles.textholder}
            onClick={() => handleOnCategoryClick(category.searchterm)}
          >
            <IonText className={styles.categorytext}>
              {category.name.replace("#", "").toUpperCase()}
            </IonText>
          </div>
          <img className={styles.categorypreview} src={category.image} />
        </div>
      );
    });
  };

  const renderGif = () =>
    Object.values(gifs).map((gif: any) => {
      return (
        // <IonCard
        //   className={styles.gifcard}
        //   onClick={() => handleOnClick(gif.media[0].gif.url)}
        // >
        <div key={gif.media[0].nanogif.url}>
          <img
            className={styles.gifpreview}
            onClick={() => handleOnClick(gif.media[0].gif.url)}
            alt={gif.title}
            src={
              gif.media[0].tinygif.preview
                ? gif.media[0].nanogif.url
                : gif.media[0].gif.preview
            }
          />
        </div>
        // </IonCard>
      );
    });

  return (
    <IonCard className={styles.keyboardcontainer}>
      <IonCardHeader className={styles.header}>
        {showCategories ? null : (
          <IonButton onClick={handleOnBackClick} fill="clear">
            <IonIcon icon={arrowBack} />
          </IonButton>
        )}
        <IonSearchbar
          value={searchText}
          onIonChange={handleOnChange}
          debounce={2000}
        ></IonSearchbar>

        <IonButton onClick={handleOnExpandClick} fill="clear">
          <IonIcon icon={expanded ? chevronDownOutline : chevronUpOutline} />
        </IonButton>
      </IonCardHeader>

      <IonContent
        className={expanded ? styles.gifcontainerexpanded : styles.gifcontainer}
      >
        {gifs && Object.values(gifs).length > 0 ? (
          <div className={styles.images}>
            {showCategories && searchText === ""
              ? renderCategories()
              : renderGif()}

            <IonInfiniteScroll
              ref={infiniteGifScroll}
              position="bottom"
              threshold="0px"
              onIonInfinite={(e) => handleOnScrollBottom(complete)}
            >
              <IonInfiniteScrollContent loadingSpinner="circles"></IonInfiniteScrollContent>
            </IonInfiniteScroll>
          </div>
        ) : (
          <Spinner />
        )}
      </IonContent>
    </IonCard>
  );
};

export default GifKeyboard;
