const apikey = "9QL1R5ZGUNGM";
const searchLimit = 20;
let baseUrl = "https://g.tenor.com/v1";

export const httpGetAsync = (url: string, callback: any) => {
  var xmlHttp = new XMLHttpRequest();

  // set the state change callback to capture when the response comes in
  xmlHttp.onreadystatechange = function () {
    if (xmlHttp.readyState === 4 && xmlHttp.status === 200) {
      callback(xmlHttp.responseText);
    }
  };

  xmlHttp.open("GET", url, true);

  xmlHttp.send(null);

  return;
};

// callback for the top 8 GIFs of search
export const tenorCallback_search = (responsetext: any) => {
  // parse the json response
  let response_objects = JSON.parse(responsetext);
  console.log("gif response", responsetext);

  let top_10_gifs = response_objects["results"];

  return;
};

export const getGifs = (searchTerm: string | undefined) => {
  var endpoint = "";

  if (searchTerm === undefined) {
    endpoint = "/trending?";
  } else {
    endpoint = "/search?q=" + searchTerm + "&";
  }

  let searchUrl =
    baseUrl + endpoint + "key=" + apikey + "&limit=" + searchLimit;

  httpGetAsync(searchUrl, tenorCallback_search);

  return;
};
