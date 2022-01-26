import { ThunkAction } from "../../types";
import { setGifs } from "./setGifs";
const apikey = "9QL1R5ZGUNGM";
const searchLimit = 20;
let baseUrl = "https://g.tenor.com/v1";

export const getGifs =
  (searchTerm: string | undefined, pos?: any): ThunkAction =>
  (dispatch, getState) => {
    const { language } = getState().language;
    const locale = language === "en" ? "en_US" : "ja_JP";
    return new Promise(function (resolve, reject) {
      var endpoint = "";

      if (searchTerm === undefined) {
        endpoint = "/trending?";
      } else {
        endpoint = "/search?q=" + searchTerm + "&";
      }

      let searchUrl =
        baseUrl +
        endpoint +
        "key=" +
        apikey +
        "&locale=" +
        locale +
        "&limit=" +
        searchLimit;

      // language!;

      if (pos) {
        searchUrl = searchUrl + "&pos=" + pos;
      }

      var xmlHttp = new XMLHttpRequest();

      xmlHttp.open("GET", searchUrl, true);

      // set the state change callback to capture when the response comes in
      xmlHttp.onload = function () {
        if (xmlHttp.readyState === 4 && xmlHttp.status === 200) {
          let responseObjects = JSON.parse(xmlHttp.responseText);
          let top = responseObjects["results"];
          let next = responseObjects["next"];
          let returnValue = { gifs: top, next: next };
          dispatch(setGifs(top));
          resolve(returnValue);
        } else {
          reject({});
        }
      };

      xmlHttp.onerror = function () {
        reject({});
      };

      xmlHttp.send(null);
    });
  };
