import {
  IonButton,
  IonButtons,
  IonLabel,
  IonPage,
  IonSpinner,
  IonTitle,
  useIonPopover,
} from "@ionic/react";
import React, { useEffect, useRef, useState } from "react";
import ReactCrop, { Crop } from "react-image-crop";
import "react-image-crop/dist/ReactCrop.css";
import CropPopover from "./CropPopover";
import styles from "./style.module.css";

interface Props {
  src: string;
  prevPath: string;
  dismiss(): any;
  onComplete(binary: Uint8Array | null): any;
}

const ImageCropper: React.FC<Props> = ({
  src,
  prevPath,
  dismiss,
  onComplete,
}) => {
  const [crop, setCrop] = useState<Partial<Crop>>({
    x: 0,
    y: 0,
    aspect: 1,
  });
  const [binary, setBinary] = useState<Uint8Array | null>(null);
  const imageContainer = useRef<HTMLDivElement | null>(null);
  const [style, setStyle] = useState({});

  useEffect(() => {
    const img = new Image();
    img.onload = () => {
      setTimeout(() => {
        // mobile if innerHeight is greater than innerWidth

        if (window.innerHeight >= window.innerWidth) {
          const percentage =
            imageContainer.current!.getBoundingClientRect().width /
            img.naturalWidth;

          if (img.naturalWidth * percentage >= img.naturalHeight * percentage)
            setCrop((currCrop) => ({
              ...currCrop,
              width: percentage * img.naturalHeight,
              height: percentage * img.naturalHeight,
            }));
          else
            setCrop((currCrop) => ({
              ...currCrop,
              width: percentage * img.naturalWidth,
              height: percentage * img.naturalWidth,
            }));

          if (
            img.naturalHeight * percentage <=
            imageContainer.current!.getBoundingClientRect().height
          )
            // Set to 100vw because height can never be greater than container height
            setStyle({ width: "100vw" });
          else
            setStyle({
              height: `calc(100vh - ${
                header.current?.getBoundingClientRect().height
              }px - ${footer.current?.getBoundingClientRect().height}px)`,
              width:
                (imageContainer.current!.getBoundingClientRect().height /
                  img.naturalHeight) *
                img.naturalWidth,
            });
        } else {
          const percentage =
            imageContainer.current!.getBoundingClientRect().height /
            img.naturalHeight;

          if (img.naturalWidth * percentage >= img.naturalHeight * percentage)
            setCrop((currCrop) => ({
              ...currCrop,
              width: percentage * img.naturalHeight,
              height: percentage * img.naturalHeight,
            }));
          else
            setCrop((currCrop) => ({
              ...currCrop,
              width: percentage * img.naturalWidth,
              height: percentage * img.naturalWidth,
            }));
          if (
            img.naturalWidth * percentage <=
            imageContainer.current!.getBoundingClientRect().width
          )
            setStyle({
              height: `calc(100vh - ${
                header.current?.getBoundingClientRect().height
              }px - ${footer.current?.getBoundingClientRect().height}px)`,
            });
          else
            setStyle({
              width: "100vw",
              height:
                (imageContainer.current!.getBoundingClientRect().width /
                  img.naturalWidth) *
                img.naturalHeight,
            });
        }
      }, 500);
    };
    img.src = src;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const header = useRef<HTMLDivElement>(null);
  const footer = useRef<HTMLDivElement>(null);

  const onChange = (crop: number) => {
    setCrop((currCrop) => {
      const newCrop: Partial<Crop> = { ...currCrop };

      if (crop === 0) delete newCrop["aspect"];
      else newCrop.aspect = crop;

      return newCrop;
    });
  };

  const dismissPopover = () => dismissP();

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [show, dismissP] = useIonPopover(CropPopover, {
    onChange,
    dismiss: dismissPopover,
  });

  function getCroppedImg() {
    const canvas = document.createElement("canvas");
    const img = cropRef?.current?.imageRef?.current;

    const scaleX = img ? img.naturalWidth / img.width : 0;
    const scaleY = img ? img.naturalHeight / img.height : 0;
    canvas.width = crop.width!;
    canvas.height = crop.height!;
    const ctx = canvas.getContext("2d")!;

    // New lines to be added
    const pixelRatio = window.devicePixelRatio;
    canvas.width = crop.width! * pixelRatio;
    canvas.height = crop.height! * pixelRatio;
    ctx.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
    ctx.imageSmoothingQuality = "high";

    if (img)
      ctx.drawImage(
        img,
        crop.x! * scaleX,
        crop.y! * scaleY,
        crop.width! * scaleX,
        crop.height! * scaleY,
        0,
        0,
        crop.width!,
        crop.height!
      );
    canvas.toBlob(
      (blob) => {
        blob?.arrayBuffer().then((v) => {
          const binary = new Uint8Array(v);
          setBinary(binary);
        });
      },
      "image/jpeg",
      1
    );
  }

  useEffect(() => {
    if (binary) {
      onComplete(binary);
      setBinary(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [binary]);

  const onConfirm = () => {
    getCroppedImg();
    dismiss();
  };

  const cropRef = useRef<ReactCrop | null>(null);

  const onChangeCrop = (crop: Crop) => setCrop(crop);

  return (
    <IonPage>
      <div className={styles.content}>
        <div className={styles.header} ref={header}>
          <IonTitle>Crop Image</IonTitle>
          {/* 
          <IonButton fill="clear" href={prevPath}>
            <IonIcon icon={arrowBack} />
          </IonButton>

          <IonButton fill="clear" onClick={onConfirm}>
            <IonIcon icon={checkmarkOutline} />
          </IonButton> */}
        </div>
        <div className={styles["image-cropper"]} ref={imageContainer}>
          {Object.keys(style).length > 0 ? (
            <ReactCrop
              circularCrop
              ref={cropRef}
              imageStyle={{
                // ...(Object.keys(style).length === 0 ? {} : style),
                ...style,
                objectFit: "contain",
              }}
              src={src}
              onChange={onChangeCrop}
              keepSelection={true}
              crop={crop}
            />
          ) : (
            <IonSpinner></IonSpinner>
          )}
        </div>
      </div>
      <div className={styles.footer} ref={footer}>
        <IonButtons>
          <IonButton href={prevPath} fill="outline" color="danger">
            <IonLabel>Cancel</IonLabel>
          </IonButton>
          <IonButton onClick={onConfirm} fill="solid" color="success">
            <IonLabel>Confirm</IonLabel>
          </IonButton>
        </IonButtons>
      </div>
      {/* <IonFooter ref={footer}>
        <IonToolbar>
          <IonButtons>
            <IonButton onClick={onCrop}>
              <IonIcon icon={scanOutline}></IonIcon>
            </IonButton>
          </IonButtons>
        </IonToolbar>
      </IonFooter> */}
    </IonPage>
  );
};

export default ImageCropper;
