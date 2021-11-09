export interface gif {
  id: string;
  tinygif: media;
  gif: media;
}

export interface gifResult {
  id: string;
  title: string;
  content_description: string;
  media: any;
}

export interface media {
  preview: string;
  size: number;
  url: string;
  dimensions: [number, number];
}

// {
//     "id": "12759384",
//     "title": "",
//     "h1_title": "",
//     "media": [
//       ...
//         "tinygif": {
//           "preview": "https://media.tenor.com/images/f68119a036c7b7b254d7b5bcad3736f6/tenor.gif",
//           "size": 194945,
//           "url": "https://media.tenor.com/images/d7afbeb5c3b3efc48a86eb2c3450ceb8/tenor.gif",
//           "dims": [
//             220,
//             220
//           ]
//         },
//         "gif": {
//           "url": "https://media.tenor.com/images/bcbb279dee67e5a9d6a22238977a1591/tenor.gif",
//           "preview": "https://media.tenor.com/images/38a9f93856e3ac917315536e2c128933/tenor.png",
//           "size": 1637110,
//           "dims": [
//             268,
//             268
//           ]
//         },
//         ...
//       }
//     ],

/* ACTION TYPES */
export const SET_GIFS = "SET_GIFS";

/* ACTION INTERFACES */
export interface SetGifStateAction {
  type: typeof SET_GIFS;
  state: { [key: string]: gif };
}

export type GifActionType = SetGifStateAction;
