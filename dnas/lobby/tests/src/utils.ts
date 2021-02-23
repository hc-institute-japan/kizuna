export const delay = async (ms = 1500) =>
  await new Promise((r) => setTimeout(r, ms));

export const dateToTimestamp = (date: Date) => [date.getTime() / 1000, 0];
