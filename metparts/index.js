// index.ts
async function fetchPaintings() {
  const url = BASE_URL + ENDPOINT_OBJECTS;
  const params = new URLSearchParams({
    departmentIds: EUROPEAN_PAINTINGS
  });
  const response = await fetch(url + "?" + params, {
    method: "GET"
  });
  const json = await response.json();
  return json.objectIDs;
}
async function fetchSinglePainting(id) {
  const url = BASE_URL + ENDPOINT_OBJECTS + "/" + id;
  const response = await fetch(url, {
    method: "GET"
  });
  const json = await response.json();
  return json.primaryImageSmall;
}
var shuffleArray = function(array) {
  for (var i = array.length - 1;i > 0; i--) {
    var j = Math.floor(Math.random() * (i + 1));
    var temp = array[i];
    array[i] = array[j];
    array[j] = temp;
  }
};
var BASE_URL = "https://collectionapi.metmuseum.org";
var ENDPOINT_OBJECTS = "/public/collection/v1/objects";
var EUROPEAN_PAINTINGS = "11";
var ORIGINS = [
  "15% 15%",
  "15% 75%",
  "75% 15%",
  "75% 75%",
  "15%",
  "75%",
  "center"
];
var selected = [];
var appendImg = (node) => {
  const container = document.getElementById("game-container");
  if (!container) {
    return;
  }
  container.appendChild(node);
};
var createImg = (url) => {
  return ORIGINS.map((origin, index) => {
    const container = document.createElement("div");
    container.classList.add("image-container");
    const img = document.createElement("img");
    img.src = url;
    img.id = String(index);
    img.height = 175;
    img.width = 175;
    img.classList.add("image");
    img.style.transform = `scale(4)`;
    img.style.transformOrigin = origin;
    img.addEventListener("click", createClickHandler(url));
    container.appendChild(img);
    return container;
  });
};
var randomObjects = (list, count) => {
  const random = Array.from({ length: count }, () => Math.floor(Math.random() * list.length));
  const ids = random.map((r) => list[r]);
  return ids;
};
var createClickHandler = (src) => {
  const handler = (event) => {
    if (event.target instanceof HTMLImageElement) {
      const target = event.target;
      const targetSrc = event.target.src;
      const targetID = event.target.id;
      const parent = target.parentElement;
      if (!parent)
        return;
      console.log(parent.classList);
      if (parent.classList.contains("image-selected") || parent.classList.contains("image-correct")) {
        parent.classList.remove("image-selected");
        parent.classList.remove("image-correct");
        selected = selected.filter((x) => {
          if (x) {
            const { id, src: src2 } = x;
            return !(Number(targetID) === id && targetSrc === src2);
          }
          return true;
        });
        console.log("AFTER REMOVE ", { selected });
        return;
      }
      if (!parent.classList.contains("image-selected") && !parent.classList.contains("image-selected")) {
        selected.push({ id: Number(targetID), src: targetSrc, elem: target });
        console.log({ selected });
        parent.classList.add("image-selected");
        if (targetSrc === src && selected.length > 0 && selected.every(({ src: src2 }) => targetSrc === src2) && selected.length >= 7) {
          console.log("YOU WON");
          parent.classList.add("image-correct");
          for (const x of selected) {
            const elem = x.elem;
            const p = elem.parentElement;
            if (p !== null && elem.src === targetSrc) {
              p.classList.add("image-correct");
            }
          }
        }
      }
    }
  };
  return handler;
};
(async () => {
  try {
    const objectIDs = await fetchPaintings();
    const randomIDs = randomObjects(objectIDs, 10);
    const objectImgs = await Promise.all(randomIDs.map(fetchSinglePainting));
    const urls = objectImgs.filter((x) => x !== "");
    const nodes = urls.flatMap(createImg);
    shuffleArray(nodes);
    nodes.map(appendImg);
    console.log({ randomIDs });
    console.log({ objectImgs });
    console.log({ nodes });
  } catch (e) {
  }
})();
