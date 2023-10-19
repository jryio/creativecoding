/// <reference lib="dom" />
/// <reference lib="dom.iterable" />

import { fetchPaintings, fetchSinglePainting } from "./fetch.ts";
import { GAME } from "./game.ts";

// TODO: pre render the boxes for the images
// TODO: Style the header text

const CONTAINER = document.getElementById("game-container");
const NUM_PAINTINGS = 10;
// 7 possilbe pieces for each painting
const ORIGINS = [
  "15% 15%",
  "15% 75%",
  "75% 15%",
  "75% 75%",
  "15%",
  "75%",
  "center",
];

// GLOBAL STATE
let selected: Array<{ id: number; src: string; elem: HTMLImageElement }> = [];

// Randomize array in-place using Durstenfeld shuffle algorithm
function shuffleArray(array: Array<any>) {
  for (var i = array.length - 1; i > 0; i--) {
    var j = Math.floor(Math.random() * (i + 1));
    var temp = array[i];
    array[i] = array[j];
    array[j] = temp;
  }
}

const appendImg = (node: HTMLDivElement) => {
  if (!CONTAINER) {
    return;
  }
  CONTAINER.appendChild(node);
};

const createImg = (url: string): Array<HTMLDivElement> => {
  return ORIGINS.map((origin, index) => {
    const container: HTMLDivElement = document.createElement("div");
    container.classList.add("image-container");

    // Create multiple images of the same SRC, each one zoomed in
    const img: HTMLImageElement = document.createElement("img");
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
// Choose random paintings from list
const randomObjects = (list: Array<number>, count: number) => {
  const random = Array.from(
    { length: count },
    () => Math.floor(Math.random() * list.length),
  );
  const ids = random.map((r) => list[r]);
  return ids;
};

const createClickHandler = (src: string) => {
  // Return a new handler function for each image
  return (event: Event) => {
    if (event.target instanceof HTMLImageElement) {
      const target = event.target;
      const targetSrc = event.target.src;
      const targetID = event.target.id;
      const parent = target.parentElement;
      if (!parent) return;

      // TOGGLE IMAGE
      GAME.toggleImage(src, target, targetSrc, targetID, parent);
    }
  };
};

// MAIN
(async () => {
  try {
    // WELCOME SCREEN
    const play = GAME.renderWelcomeScreen();

    // FETCH
    // TODO: Store detailed information about the artwork and display upon
    // successfully identifying a paiting (correct guesses)
    const objectIDs = await fetchPaintings();
    const randomIDs = randomObjects(objectIDs, NUM_PAINTINGS);
    const objectImgs = await Promise.all(
      randomIDs.map(fetchSinglePainting),
    );

    const urls = objectImgs.filter((x) => x !== "");
    const nodes = urls.flatMap(createImg);
    shuffleArray(nodes);

    // WAIT HERE UNTIL PLAY BUTTON IS CLICKED
    console.log({ nodes });
    await play;
    nodes.map(appendImg);
  } catch (_e) {
    console.error(
      "Something went wrong while trying to start the game, sorry!",
    );
  }
})();
