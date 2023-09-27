/// <reference lib="dom" />
/// <reference lib="dom.iterable" />


import winkNLP from 'wink-nlp';
import model from 'wink-eng-lite-web-model';
const nlp = winkNLP(model)
// Acquire "its" and "as" helpers from nlp.
const its = nlp.its;
const as = nlp.as;

// Set a on change handler for textareac
const textarea = document.getElementById("textarea")
const message = document.getElementById("message")
const result = document.getElementById("result")
console.log({ textarea })

textarea?.addEventListener("input", (event) => {
  const text = textarea.textContent
  console.log({ text })
  if (!text) return
  const doc = nlp.readDoc(text)
  doc.entities().each((e) => e.markup());
  const output = doc.out(its.sentiment)
  if (!result) return
  console.log({ output })
  const color = tocolor(Number(output))
  const percent = normalize(Number(output)) * 100
  console.log({ percent })
  result.style.backgroundColor = color
  result.style.width = `${percent}%`
  if (output)
    if (Number(output) < -0.25) {
      textarea.textContent = ""
      textarea.contentEditable = "false"
      if (!message) return
      message.textContent = "TOO NEGATIVE TRY AGAIN YOU SAD MONKEY"
      message.style.color = "red"
      setTimeout(() => {
        message.textContent = ""
        message.style.color = "black"
        textarea.contentEditable = "true"
        result.style.width = `50%`
        result.style.backgroundColor = "grey"
      }, 1000)
    }
})

// Author: Michele Locati <michele@locati.it>
// Source: https://gist.github.com/mlocati/7210513
function tocolor(p: number) {
  let perc = p * 100
  var r, g, b = 0;
  if (perc == 0) {
    return "grey"
  }
  if (perc > 0) {
    g = 255;
    r = Math.round(510 - 5.10 * perc);
  }
  else {
    r = 255;
    g = Math.round(5.1 * perc);
  }
  var h = r * 0x10000 + g * 0x100 + b * 0x1;
  return '#' + ('000000' + h.toString(16)).slice(-6);
}

function normalize(x: number) {
  var y = (x + 1) / 2;
  return y;
}
