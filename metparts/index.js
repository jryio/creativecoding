// fetch.ts
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
  console.log({ metObject: json });
  if (json.primaryImageSmall !== "") {
    MET[json.primaryImageSmall] = json;
  }
  return json.primaryImageSmall;
}
var BASE_URL = "https://collectionapi.metmuseum.org";
var ENDPOINT_OBJECTS = "/public/collection/v1/objects";
var EUROPEAN_PAINTINGS = "11";
var MET = {};

// game.ts
var GUESSES_LIMIT = 12;
var GUESSES_REFRESH = 6;
var SELECTED = "image-selected";
var CORRECT = "image-correct";
var COMPLETED = "image-completed";
var PLAY_ID = "play-button";
var WELCOME_ID = "welcome";
var SCORE_ID = "score";
var PAINTING_MODAL_ID = "painting-modal";
var YELLOW = "yellow";
var ORANGE = "orange";
var RED = "red";
var COLORS = ["yellow", "orange", "red"];
var $MODAL = document.getElementById(PAINTING_MODAL_ID);
var $WELCOME = document.getElementById(WELCOME_ID);
var $SCORE = document.getElementById(SCORE_ID);
var GAME = {
  remaining: GUESSES_LIMIT,
  selected: [],
  async renderWelcomeScreen() {
    const self = this;
    const playButton = document.createElement("button");
    playButton.type = "button";
    playButton.id = PLAY_ID;
    playButton.classList.add("btn");
    playButton.textContent = "Play!";
    const x = document.createElement("h1");
    const y = document.createElement("h1");
    const z = document.createElement("h1");
    x.textContent = "Oh no! The Met Museum put all their paintings into the shredder";
    y.textContent = "It's your job to put the pieces back together again";
    z.textContent = "Each Artwork is divided into 7 non-contiguous pieces. Find them all!";
    const welcome = [
      x,
      y,
      z,
      playButton
    ];
    if (!$WELCOME)
      return;
    $WELCOME.prepend(...welcome);
    return new Promise((resolve) => {
      const clearHandler = self.clearWelcomeScreen(welcome);
      playButton.addEventListener("click", () => {
        $SCORE.hidden = false;
        clearHandler();
        resolve();
      });
    });
  },
  clearWelcomeScreen(nodes) {
    return () => nodes.forEach((elem) => $WELCOME.removeChild(elem));
  },
  toggleImage(src, target, targetSrc, targetID, parent) {
    const self = this;
    if (self.didLose()) {
      return;
    }
    if (self.isSelected(parent.classList)) {
      self.classDeselect(parent.classList);
      self.removeSelected(Number(targetID), targetSrc);
    } else {
      self.addSelected(Number(targetID), src, target);
      self.classSelect(parent.classList);
      self.subtractGuess();
      if (self.didWin(src, targetSrc)) {
        self.classCorrect(parent.classList);
        self.setAllCorrect(targetSrc);
        self.showPaintingModal(targetSrc);
      }
    }
    self.updateScore();
    if (self.didLose()) {
      alert("You ruined the paintings! Great, now they're unrecoverable");
    }
  },
  updateScore() {
    if (!$SCORE)
      return;
    const self = this;
    $SCORE.textContent = `${self.remaining} guesses remaining`;
    $SCORE.classList.remove(...COLORS);
    if (self.remaining >= 8 && self.remaining <= 10) {
      $SCORE.classList.add(YELLOW);
    } else if (self.remaining >= 5 && self.remaining <= 7) {
      $SCORE.classList.add(ORANGE);
    } else if (self.remaining <= 4) {
      $SCORE.classList.add(RED);
    }
  },
  addSelected(id, src, elem) {
    const self = this;
    self.selected.push({
      id,
      src,
      elem
    });
  },
  removeSelected(id, src) {
    const self = this;
    self.selected = self.selected.filter((x) => {
      if (x) {
        const { id: targetID, src: targetSrc } = x;
        return !(Number(targetID) === id && targetSrc === src);
      }
      return true;
    });
  },
  setAllCorrect(targetSrc) {
    const self = this;
    for (const x of self.selected) {
      const elem = x.elem;
      const p = elem.parentElement;
      if (p !== null && elem.src === targetSrc) {
        self.classCorrect(p.classList);
      }
    }
    self.refreshGuesses();
  },
  didWin(src, targetSrc) {
    const self = this;
    return targetSrc === src && self.selected.every(({ src: src2 }) => targetSrc === src2) && self.selected.length === 7;
  },
  showPaintingModal(src) {
    if (!$MODAL)
      return;
    const meta = MET[src];
    const $title = document.createElement("h2");
    const $img = document.createElement("img");
    $title.textContent = `${meta.title} by ${meta.artistDisplayName} ${meta.objectDate !== "" ? `- ${meta.objectDate}` : ""}`;
    $title.classList.add("text-center");
    $img.height = 300;
    $img.width = 300;
    $img.src = src;
    $img.classList.add("mx-auto");
    const children = [
      $title,
      $img
    ];
    const $BOX = $MODAL.children.item(0);
    if (!$BOX)
      return;
    children.forEach((x) => $BOX.appendChild(x));
    $MODAL.classList.add("modal-open");
    const $FORM = document.getElementsByClassName("modal-backdrop").item(0);
    if (!$FORM)
      return;
    $FORM.addEventListener("submit", () => {
      $MODAL.classList.remove("modal-open");
    });
  },
  didLose() {
    return this.remaining <= 0;
  },
  setImagesComplete(src) {
    const self = this;
    const completedImages = self.selected.filter((x) => x.src === src);
    completedImages.map((x) => x.elem.classList.add(COMPLETED));
    self.selected = self.selected.filter((x) => x.src !== src);
  },
  subtractGuess() {
    const self = this;
    self.remaining -= 1;
  },
  refreshGuesses() {
    const self = this;
    self.remaining += GUESSES_REFRESH;
  },
  isSelected(classList) {
    return classList.contains(SELECTED) || classList.contains(CORRECT);
  },
  classDeselect(classList) {
    classList.remove(SELECTED);
    classList.remove(CORRECT);
  },
  classSelect(clasList) {
    clasList.add(SELECTED);
  },
  classCorrect(classList) {
    classList.add(CORRECT);
  }
};

// index.ts
var shuffleArray = function(array) {
  for (var i = array.length - 1;i > 0; i--) {
    var j = Math.floor(Math.random() * (i + 1));
    var temp = array[i];
    array[i] = array[j];
    array[j] = temp;
  }
};
var CONTAINER = document.getElementById("game-container");
var NUM_PAINTINGS = 10;
var ORIGINS = [
  "15% 15%",
  "15% 75%",
  "75% 15%",
  "75% 75%",
  "15%",
  "75%",
  "center"
];
var appendImg = (node) => {
  if (!CONTAINER) {
    return;
  }
  CONTAINER.appendChild(node);
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
  return (event) => {
    if (event.target instanceof HTMLImageElement) {
      const target = event.target;
      const targetSrc = event.target.src;
      const targetID = event.target.id;
      const parent = target.parentElement;
      if (!parent)
        return;
      GAME.toggleImage(src, target, targetSrc, targetID, parent);
    }
  };
};
(async () => {
  try {
    const play = GAME.renderWelcomeScreen();
    const objectIDs = await fetchPaintings();
    const randomIDs = randomObjects(objectIDs, NUM_PAINTINGS);
    const objectImgs = await Promise.all(randomIDs.map(fetchSinglePainting));
    const urls = objectImgs.filter((x) => x !== "");
    const nodes = urls.flatMap(createImg);
    shuffleArray(nodes);
    console.log({ nodes });
    await play;
    nodes.map(appendImg);
  } catch (_e) {
    console.error("Something went wrong while trying to start the game, sorry!");
  }
})();
