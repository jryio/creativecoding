// index.ts
var buf2hex = function(buffer) {
  return [...new Uint8Array(buffer)].map((x) => x.toString(16).padStart(2, "0")).join("");
};
var tocolor = function(p) {
  if (p >= 88 && p < 92) {
    return "blue";
  } else if (p >= 92 && p < 96) {
    return "yellow";
  } else if (p >= 96 && p < 100) {
    return "green";
  } else if (p >= 100 && p < 104) {
    return "red";
  } else if (p >= 104 && p < 108) {
    return "pink";
  } else {
    return "black";
  }
};
var freuency = document.getElementById("frequency");
var label = document.getElementById("label");
var histogramElement = document.getElementById("histogram");
var fm = "";
var lastFm = "";
freuency?.addEventListener("input", async (event) => {
  if (event.target instanceof HTMLInputElement) {
    const value = event.target?.value;
    fm = value;
    if (!label) {
      return;
    }
    label.innerHTML = `Frequency: ${fm} MHz`;
    console.log({ value });
    const length = 2048;
    const alg = "HKDF";
    const pw = value;
    const enc = new TextEncoder;
    const key = await window.crypto.subtle.importKey("raw", enc.encode(pw), { name: "PBKDF2" }, false, ["deriveBits", "deriveKey"]);
    console.log({ lastFm, fm });
    while (fm !== lastFm) {
      const salt = window.crypto.getRandomValues(new Uint8Array(16));
      const derivedBits = await window.crypto.subtle.deriveBits({
        name: "PBKDF2",
        salt,
        iterations: 1e5,
        hash: "SHA-256"
      }, key, length);
      const output = new Uint8Array(derivedBits);
      const hex = buf2hex(output);
      const histogram = {};
      const histostring = {};
      const binned = hex.match(/.{1,2}/g);
      if (!binned) {
        return;
      }
      binned.map((x) => {
        const count = histogram[x];
        histogram[x] = count ? count + 3 : 1;
        histostring[x] = x.repeat(count);
      });
      if (histogramElement) {
        const children = Object.values(histostring).map((value2) => {
          let pre = document.createElement("pre");
          pre.innerHTML = value2;
          pre.style.transform = "rotate(-90deg)";
          const color = tocolor(Number(fm));
          console.log({ color, fm });
          pre.style.color = color;
          pre.style.margin = "0";
          pre.style.padding = "0";
          return pre;
        });
        histogramElement.replaceChildren(...children);
      }
    }
  }
});
