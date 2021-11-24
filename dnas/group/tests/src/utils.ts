export const delay = (ms = 1500) => new Promise((r) => setTimeout(r, ms));
export const dateToTimestamp = (date: Date) => date.getTime() * 1000;
