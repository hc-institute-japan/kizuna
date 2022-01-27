import React, {
  useState,
  ForwardRefRenderFunction,
  useRef,
  useCallback,
  forwardRef,
} from "react";
import { IonInput } from "@ionic/react";

interface Props {
  onChange?: (searchTerm: string) => any;
  onSend?: (searchTerm: string) => any;
}

const GifSearchBox: ForwardRefRenderFunction<Props> = (ref) => {
  const [searchTerm, setSearchTerm] = useState("");

  let input = useRef<HTMLIonInputElement>(null);

  const handleOnChange = (e: CustomEvent) => setSearchTerm(e.detail.value!);

  // const onChangeCallback = useCallback(() => {
  //   if (onChange) onChange(searchTerm);
  //   // eslint-disable-next-line react-hooks/exhaustive-deps
  // }, [searchTerm]);

  return (
    <React.Fragment>
      <IonInput
        ref={input}
        value={searchTerm}
        placeholder="Enter Input"
        onIonChange={handleOnChange}
      />
    </React.Fragment>
  );
};

export default forwardRef(GifSearchBox);
