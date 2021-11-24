import { ThunkAction } from "../../types";
import { returnValue } from "../types";
import { setCategories } from "./setCategories";

const apikey = "9QL1R5ZGUNGM";
const searchLimit = 20;
let baseUrl = "https://g.tenor.com/v1";

export const getCategories = (): ThunkAction => (dispatch, getState) => {
  return new Promise(function (resolve, reject) {
    var endpoint = "/categories?";
    let searchUrl = baseUrl + endpoint + "key=" + apikey;

    var xmlHttp = new XMLHttpRequest();

    xmlHttp.open("GET", searchUrl, true);

    // set the state change callback to capture when the response comes in
    xmlHttp.onload = function () {
      if (xmlHttp.readyState === 4 && xmlHttp.status === 200) {
        let responseObjects = JSON.parse(xmlHttp.responseText);
        let top = responseObjects["tags"];
        let returnValue = { top };
        dispatch(setCategories(top));
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
