export const isUsernameFormatValid = (username: string): boolean =>
  /^[a-zA-Z0-9_](?!.*?[._]{2})[a-zA-Z0-9_.]{2,15}$/.test(username);
