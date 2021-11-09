import { ThunkAction } from "../../types";
import { setGifs } from "./setGifs";

const apikey = "9QL1R5ZGUNGM";
const searchLimit = 20;
let baseUrl = "https://g.tenor.com/v1";

export const getGifs =
  (searchTerm: string | undefined): ThunkAction =>
  (dispatch, getState) => {
    var endpoint = "";

    if (searchTerm === undefined) {
      endpoint = "/trending?";
    } else {
      endpoint = "/search?q=" + searchTerm + "&";
    }

    let searchUrl =
      baseUrl + endpoint + "key=" + apikey + "&limit=" + searchLimit;

    var xmlHttp = new XMLHttpRequest();

    // set the state change callback to capture when the response comes in
    xmlHttp.onreadystatechange = function () {
      if (xmlHttp.readyState === 4 && xmlHttp.status === 200) {
        let response_objects = JSON.parse(xmlHttp.responseText);
        let top_10_gifs = response_objects["results"];
        dispatch(setGifs(top_10_gifs));
        return top_10_gifs;
      }
    };

    xmlHttp.open("GET", searchUrl, true);

    xmlHttp.send(null);

    return [];
  };
