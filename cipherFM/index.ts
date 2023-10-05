/// <reference lib="dom" />
/// <reference lib="dom.iterable" />
function buf2hex(buffer: Uint8Array) { // buffer is an ArrayBuffer
  return [...new Uint8Array(buffer)]
    .map(x => x.toString(16).padStart(2, '0'))
    .join('');

}

const k = 2;
function sigmoid(z: number) {
  return 1 / (1 + Math.exp(-z / k));
}

function tocolor(p: number): string {
  if (p >= 88 && p < 92) {
    return "blue"
  } else if (p >= 92 && p < 96) {
    return "yellow"
  } else if (p >= 96 && p < 100) {
    return "green"
  } else if (p >= 100 && p < 104) {
    return "red"
  } else if (p >= 104 && p < 108) {
    return "pink"
  } else {
    return "black"
  }
}


const freuency = document.getElementById("frequency")
const label = document.getElementById("label")
const histogramElement = document.getElementById("histogram")

let fm = ""
let lastFm = ""

freuency?.addEventListener("input", async (event: Event) => {
  if (event.target instanceof HTMLInputElement) {
    const value = event.target?.value
    fm = value
    if (!label) { return }
    label.innerHTML = `Frequency: ${fm} MHz`
    console.log({ value })
    // crypto
    const length = 8 * 256
    const alg = "HKDF"


    const pw = value;
    const enc = new TextEncoder()

    const key = await window.crypto.subtle.importKey(
      "raw",
      enc.encode(pw),
      { name: "PBKDF2" },
      false,
      ["deriveBits", "deriveKey"],
    );

    console.log({ lastFm, fm })
    while (fm !== lastFm) {
      const salt = window.crypto.getRandomValues(new Uint8Array(16))
      const derivedBits = await window.crypto.subtle.deriveBits(
        {
          name: "PBKDF2",
          salt,
          iterations: 100000,
          hash: "SHA-256",
        },
        key,
        length,
      );
      const output = new Uint8Array(derivedBits);
      const hex = buf2hex(output)

      const histogram: { [key: string]: number } = {}
      const histostring: { [key: string]: string } = {}
      const binned = hex.match(/.{1,2}/g)
      if (!binned) { return }
      binned.map((x) => {
        const count = histogram[x]
        histogram[x] = count ? count + 3 : 1
        histostring[x] = x.repeat(count)
      })

      if (histogramElement) {
        const children = Object.values(histostring).map((value) => {
          let pre = document.createElement("pre")
          pre.innerHTML = value
          pre.style.transform = "rotate(-90deg)"
          const color = tocolor(Number(fm))
          console.log({ color, fm })
          pre.style.color = color
          pre.style.margin = "0"
          pre.style.padding = "0"
          return pre as Node
        })

        histogramElement.replaceChildren(...children)
      }
    }
  }

})
