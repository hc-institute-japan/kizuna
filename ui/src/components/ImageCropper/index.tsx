import { IonButton, IonIcon, IonPage, useIonPopover } from "@ionic/react";
import { arrowBack, checkmarkOutline } from "ionicons/icons";
import React, { useEffect, useRef, useState } from "react";
import ReactCrop, { Crop } from "react-image-crop";
import "react-image-crop/dist/ReactCrop.css";
import CropPopover from "./CropPopover";
import styles from "./style.module.css";

interface Props {
  src: string;
  prevPath: string;
  dismiss(): any;
  onComplete(srcSet: string | null): any;
}

const ImageCropper: React.FC<Props> = ({
  src,
  prevPath,
  dismiss,
  onComplete,
}) => {
  const [crop, setCrop] = useState<Partial<Crop>>({ x: 0, y: 0, aspect: 1 });
  const [srcSet, setSrcSet] = useState<string | null>(null);
  const imageContainer = useRef<HTMLDivElement | null>(null);
  const [style, setStyle] = useState({});

  useEffect(() => {
    const img = new Image();

    img.onload = () => {
      setTimeout(() => {
        if (window.innerHeight >= window.innerWidth) {
          const percentage =
            imageContainer.current!.getBoundingClientRect().width /
            img.naturalWidth;
          if (
            img.naturalHeight * percentage <=
            imageContainer.current!.getBoundingClientRect().height
          ) {
            setStyle({ width: "100vw" });
          } else {
            setStyle({
              height: "100vh",
              width:
                (imageContainer.current!.getBoundingClientRect().height /
                  img.naturalHeight) *
                img.naturalWidth,
            });
          }
        } else {
          const percentage =
            imageContainer.current!.getBoundingClientRect().height /
            img.naturalHeight;
          if (
            img.naturalWidth * percentage <=
            imageContainer.current!.getBoundingClientRect().width
          ) {
            setStyle({ height: "100vh" });
          } else {
            setStyle({
              width: "100vw",
              height:
                (imageContainer.current!.getBoundingClientRect().width /
                  img.naturalWidth) *
                img.naturalHeight,
            });
          }
        }
        // console.log(
        //   imageContainer.current!.getBoundingClientRect().height,
        //   img.naturalHeight
        // );

        // console.log(
        //   // vert,
        //   imageContainer.current!.getBoundingClientRect().height /
        //     img.naturalHeight
        // );

        // const ratio = img.naturalHeight / img.naturalWidth;

        // if (ratio === 1) {
        //   setStyle({ width: "100vw" });
        // } else if (ratio > 1) {
        //   const percentage =
        //     imageContainer.current!.getBoundingClientRect().height /
        //     img.naturalHeight;

        //   const width = img.naturalWidth * percentage;

        //   setStyle({
        //     height: imageContainer.current!.getBoundingClientRect().height,
        //     width,
        //   });
        // } else {
        //   const percentage =
        //     imageContainer.current!.getBoundingClientRect().width / img.width;

        //   const height = img.naturalHeight * percentage;

        //   setStyle({
        //     width: imageContainer.current!.getBoundingClientRect().width,
        //     height,
        //   });
        // }

        // if square, width = 100
        // else if(tall)
        // get percentage
        // adjust width using height percentage
        // else (wide)
        // get percentage width
        // adjust height
        // const ratio = img.naturalHeight/ img.naturalWidth
        // };
      }, 500);
    };

    img.src = src;
  }, []);
  const header = useRef<HTMLDivElement>(null);
  // const footer = useRef<HTMLIonFooterElement>(null);

  const onChange = (crop: number) => {
    setCrop((currCrop) => {
      const newCrop: Partial<Crop> = { ...currCrop };

      if (crop === 0) delete newCrop["aspect"];
      else newCrop.aspect = crop;

      return newCrop;
    });
  };

  const dismissPopover = () => dismissP();

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

    // console.log(canvas, img);
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
        // const canvasImage = ctx.getImageData(
        //   crop.x! * scaleX,
        //   crop.y! * scaleY,
        //   crop.width! * scaleX,
        //   crop.height! * scaleY
        // );
        // const binary = new Uint8Array(canvasImage.data.length);
        // canvasImage.data.forEach((byte, i) => {
        //   binary[i] = byte;
        // });

        setSrcSet(URL.createObjectURL(blob!));
      },
      "image/jpeg",
      1
    );

    // As Base64 string
    // return base64Image;

    // As a blob
  }

  useEffect(() => {
    if (srcSet) {
      onComplete(srcSet);
      setSrcSet(null);
    }
  }, [srcSet]);

  const onConfirm = () => {
    getCroppedImg();
    dismiss();
  };

  const cropRef = useRef<ReactCrop | null>(null);

  return (
    <IonPage>
      <div className={styles.content}>
        <div className={styles.header} ref={header}>
          <IonButton fill="clear" href={prevPath}>
            <IonIcon icon={arrowBack} />
          </IonButton>

          <IonButton fill="clear" onClick={onConfirm}>
            <IonIcon icon={checkmarkOutline} />
          </IonButton>
        </div>
        <div className={styles["image-cropper"]} ref={imageContainer}>
          <ReactCrop
            circularCrop
            ref={cropRef}
            imageStyle={{
              ...style,
              objectFit: "contain",
            }}
            src={src}
            onChange={(crop) => setCrop(crop)}
            keepSelection={true}
            crop={crop}
          />
        </div>
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
