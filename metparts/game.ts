const GUESSES_LIMIT = 12;
const GUESSES_REFRESH = 6;
const SELECTED = "image-selected";
const CORRECT = "image-correct";
const COMPLETED = "image-completed";
const PLAY_ID  "play-button";
const SCORE_ID = "score";

const $BODY = document.body;
const $SCORE = document.getElementById(SCORE_ID);

type SelectedImage = { id: number; src: string; elem: HTMLImageElement };

type Game = {
  // Properties
  remaining: number;
  selected: Array<SelectedImage>;
  // Setup
  renderWelcomeScreen: () => void;
  clearWelcomeScreen: (nodes: Array<Node>) => () => void;
  // Game State
  toggleImage: (
    src: string,
    target: HTMLImageElement,
    targetsrc: string,
    targetID: string,
    parent: HTMLElement,
  ) => void;
  updateScore: () => void;
  addSelected: (id: number, src: string, elem: HTMLImageElement) => void;
  removeSelected: (id: number, src: string) => void;
  // Win
  didWin: (src: string, targetSrc: string) => boolean;
  didLose: () => boolean;
  setAllCorrect: (targetSrc: string) => void;
  setImagesComplete: (src: string) => void;
  // Guesses
  subtractGuess: () => void;
  refreshGuesses: () => void;
  // Helpers
  isSelected(classList: DOMTokenList): boolean;
  classDeselect(classList: DOMTokenList): void;
  classSelect(clasList: DOMTokenList): void;
  classCorrect(classList: DOMTokenList): void;
};

// GAME STATE
export const GAME: Game = {
  // Properties
  remaining: GUESSES_LIMIT,
  selected: [],
  // Setup
  async renderWelcomeScreen() {
    const self = this;
    const playButton = document.createElement("button");
    playButton.type = "button";
    playButton.id = PLAY_ID;
    playButton.textContent = "Play!";

    const x = document.createElement("h1");
    const y = document.createElement("h1");
    const z = document.createElement("h1");
    x.textContent =
      "Oh no! The Met Museum put all their paintings into the shredder";
    y.textContent = "It's your job to put the pieces back together again";
    z.textContent = "Each Artwork is divided into 7 non-contiguous pieces. Find them all!";

    const welcome: Array<Node> = [
      x,
      y,
      z,
      playButton,
    ];

    $BODY.prepend(...welcome);

    return new Promise((resolve) => {
      const clearHandler = self.clearWelcomeScreen(welcome);
      playButton.addEventListener("click", () => {
        clearHandler();
        resolve();
      });
    });
  },

  clearWelcomeScreen(nodes: Array<Node>) {
    // Creates an event handler function which when invoked will clear the
    // nodes from the document.body
    return () => nodes.forEach((elem) => $BODY.removeChild(elem));
  },
  // Game State
  toggleImage(src, target, targetSrc, targetID, parent) {
    const self = this;
    // Image is already selected, de-select it and remove it from the list
    if (self.isSelected(parent.classList)) {
      self.classDeselect(parent.classList);
      self.removeSelected(Number(targetID), targetSrc);
    } // Image is not already selected
    else {
      self.addSelected(Number(targetID), src, target);
      self.classSelect(parent.classList);
      self.subtractGuess();
      // Won
      if (self.didWin(src, targetSrc)) {
        self.classCorrect(parent.classList);
        self.setAllCorrect(targetSrc);
      }
    }
    // Use a guess if and only
    self.updateScore();
    // Lost
    if (self.didLose()) {
      alert("You lost!");
    }
  },

  updateScore() {
    if (!$SCORE) return;
    const self = this;

    $SCORE.textContent = `${self.remaining} guesses remaining`;
  },

  addSelected(id, src, elem) {
    const self = this;
    self.selected.push({
      id,
      src,
      elem,
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
    return targetSrc === src &&
      self.selected.every(({ src }) => targetSrc === src) &&
      self.selected.length === 7;
  },

  didLose() {
    return this.remaining <= 0;
  },

  setImagesComplete(src) {
    const self = this;
    // Find all the correct selected img elements
    const completedImages = self.selected.filter((x) => x.src === src);
    // Change their class to item-complete
    completedImages.map((x) => x.elem.classList.add(COMPLETED));
    // Remove them
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
  },
};
