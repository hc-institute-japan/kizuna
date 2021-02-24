export const delay = (timeout = 1500) =>
  new Promise((resolve) => setTimeout(resolve, timeout));
