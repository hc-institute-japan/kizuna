// Original: /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
export const isUsernameFormatValid = (username: string): boolean =>
  /^[a-zA-Z0-9_](?!.*?[._]{2})[a-zA-Z0-9_.]{2,15}$/.test(username);
