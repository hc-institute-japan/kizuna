export const delay = async (ms = 1500) =>
  await new Promise((r) => setTimeout(r, ms));
