export const ENV: "HCDEV" | "HC" | "HCC" | "HOLO" =
  process.env.NODE_ENV === "production"
    ? "HOLO"
    : (process.env.REACT_APP_ENV as any);

export const appId = (): string | undefined => {
  if (ENV === "HC" || ENV === "HCDEV") {
    return "kizuna";
  } else if (ENV === "HCC") {
    return "uhCkkHSLbocQFSn5hKAVFc_L34ssLD52E37kq6Gw9O3vklQ3Jv7eL";
  } else if (ENV === "HOLO") {
    return undefined;
  }
};

export const appUrl = () => {
  // for launcher
  if (ENV === "HC")
    return process.env.NODE_ENV === "production"
      ? `ws://localhost:8888`
      : process.env.REACT_APP_DNA_INTERFACE_URL;
  else if (ENV === "HCDEV") return process.env.REACT_APP_DNA_INTERFACE_URL;
  else if (ENV === "HCC") return "http://localhost:24273";
  else if (ENV === "HOLO") return "https://devnet-chaperone.holo.host";
  else return null;
};

export const isHoloEnv = () => {
  return ENV === "HCC" || ENV === "HOLO";
};
