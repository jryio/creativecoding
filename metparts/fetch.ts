const BASE_URL = "https://collectionapi.metmuseum.org";
const ENDPOINT_OBJECTS = "/public/collection/v1/objects";
const EUROPEAN_PAINTINGS = "11";

type MetObjects = {
  total: number;
  objectIDs: Array<number>;
};

type MetObject = {
  primaryImageSmall: string;
  title: string;
  artistDisplayName: string;
  objectDate: string;
};

// GLOBAL
export let MET: { [src: string]: MetObject } = {};

// FETCH
export async function fetchPaintings(): Promise<Array<number>> {
  const url = BASE_URL + ENDPOINT_OBJECTS;
  const params = new URLSearchParams({
    departmentIds: EUROPEAN_PAINTINGS,
  });
  const response = await fetch(url + "?" + params, {
    method: "GET",
  });

  const json: MetObjects = await response.json();
  return json.objectIDs;
}

// FETCH
export async function fetchSinglePainting(id: number) {
  const url = BASE_URL + ENDPOINT_OBJECTS + "/" + id;
  const response = await fetch(url, {
    method: "GET",
  });
  const json: MetObject = await response.json();
  console.log({ metObject: json });

  if (json.primaryImageSmall !== "") {
    MET[json.primaryImageSmall] = json;
  }

  return json.primaryImageSmall;
}
