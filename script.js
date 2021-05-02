// script.js

const img = new Image(); // used to load image from <input> and draw to canvas

// const file = document.getElementById('user-image');
// console.log(file);
// img.src = URL.createObjectURL(file);


// const fileUpload = document.getElementById('image-input');
// fileUpload.addEventListener('change', () => {
//   const file = document.getElementById("image-input");
//   console.log(file);
//   img.src = URL.createObjectURL(file);
// })

img.src = 'images/lab.jpg';

// Setup canvas and context for drawing
const canvas = document.getElementById('user-image');
const ctx = canvas.getContext('2d');

// Speech synth
let voices = [];
var synth = window.speechSynthesis;
const MIN_VOL = 0.001;

// Populate select voice
function populateVoiceList() {
  voices = synth.getVoices();
  
  console.log(voices);

  for(var i = 0; i < voices.length ; i++) {
    var option = document.createElement('option');
    option.textContent = voices[i].name + ' (' + voices[i].lang + ')';

    if(voices[i].default) {
      option.textContent += ' -- DEFAULT';
    }

    option.setAttribute('data-lang', voices[i].lang);
    option.setAttribute('data-name', voices[i].name);
    voice_select.appendChild(option);
  }
}

populateVoiceList();
if (speechSynthesis.onvoiceschanged !== undefined) {
  speechSynthesis.onvoiceschanged = populateVoiceList;
}

// Select button options
const form = document.getElementById("generate-meme");
const clear_btn = document.getElementById("button-group").children[0];
const read_btn = document.getElementById("button-group").children[1];
const voice_select = document.getElementById("voice-selection");

// Volume meter element
const volume_icon = document.getElementById("volume-group").children[0];
const volume_meter = document.getElementById("volume-group").children[1];

/**
 * Event Listeners
 */

// Fires whenever the img object loads a new image (such as with img.src =)
img.addEventListener('load', () => {
  console.log("image loaded");
  
  // Clear canvas of previous image
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  // Fill with black border
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  const dimensions = getDimensions(canvas.width, canvas.height, img.width, img.height);
  ctx.drawImage(img, dimensions.startX, dimensions.startY, dimensions.width, dimensions.height);
  
  // Some helpful tips:
  // - Fill the whole Canvas with black first to add borders on non-square images, then draw on top
  // - Clear the form when a new image is selected
  // - If you draw the image to canvas here, it will update as soon as a new image is selected
});

// Form submission
form.addEventListener('submit', (event) => {
  // Prevents page from refreshing on submission
  event.preventDefault();

  const top_text = document.getElementById("text-top").value;
  const bot_text = document.getElementById("text-bottom").value;
  
  ctx.font = "50px Arial";
  ctx.fillStyle = "red";
  ctx.textAlign = "center";
  ctx.fillText(top_text, canvas.width / 2, 50);
  ctx.fillText(bot_text, canvas.width / 2, canvas.height - 30);

  // toggle buttons
  clear_btn.removeAttribute("disabled");
  read_btn.removeAttribute("disabled");
  voice_select.removeAttribute("disabled");
});

clear_btn.addEventListener("click", () => {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
});


// Read Text
read_btn.addEventListener("click", () => {
  const top_text = document.getElementById("text-top").value;
  const bot_text = document.getElementById("text-bottom").value;
  
  // Actual read (top_text concatenated with bot_text)
  let all_text = `${top_text}\n${bot_text}`;

  // Utterance which will be spoken
  let utterance = new SpeechSynthesisUtterance(all_text);

  utterance.volume = volume_meter.value / 100;
  if (utterance.volume == 0) {
    utterance.volume = MIN_VOL;
  }
  
  // Find the name of the selected voice option
  var selected_option = voice_select.selectedOptions[0].getAttribute('data-name');

  // Set the voice for the voice read
  for(var i = 0; i < voices.length ; i++) {
    if(voices[i].name === selected_option) {
      utterance.voice = voices[i];
      break;
    }
  }
  
  speechSynthesis.speak(utterance);
});


volume_meter.addEventListener("change", () => {
  if (volume_meter.value >= 67) {
    volume_icon.setAttribute("src", "icons/volume-level-3.svg");
  }
  else if (volume_meter.value >= 34) {
    volume_icon.setAttribute("src", "icons/volume-level-2.svg");
  }
  else if (volume_meter.value >= 1) {
    volume_icon.setAttribute("src", "icons/volume-level-1.svg");
  }
  else {
    volume_icon.setAttribute("src", "icons/volume-level-0.svg");
  }
});


// volume-level-3: 67-100
// volume-level-2: 34-66
// volume-level-1: 1-33
// volume-level-0: 0

/**
 * Takes in the dimensions of the canvas and the new image, then calculates the new
 * dimensions of the image so that it fits perfectly into the Canvas and maintains aspect ratio
 * @param {number} canvasWidth Width of the canvas element to insert image into
 * @param {number} canvasHeight Height of the canvas element to insert image into
 * @param {number} imageWidth Width of the new user submitted image
 * @param {number} imageHeight Height of the new user submitted image
 * @returns {Object} An object containing four properties: The newly calculated width and height,
 * and also the starting X and starting Y coordinate to be used when you draw the new image to the
 * Canvas. These coordinates align with the top left of the image.
 */
function getDimensions(canvasWidth, canvasHeight, imageWidth, imageHeight) {
  let aspectRatio, height, width, startX, startY;

  // Get the aspect ratio, used so the picture always fits inside the canvas
  aspectRatio = imageWidth / imageHeight;

  // If the apsect ratio is less than 1 it's a verical image
  if (aspectRatio < 1) {
    // Height is the max possible given the canvas
    height = canvasHeight;
    // Width is then proportional given the height and aspect ratio
    width = canvasHeight * aspectRatio;
    // Start the Y at the top since it's max height, but center the width
    startY = 0;
    startX = (canvasWidth - width) / 2;
    // This is for horizontal images now
  } else {
    // Width is the maximum width possible given the canvas
    width = canvasWidth;
    // Height is then proportional given the width and aspect ratio
    height = canvasWidth / aspectRatio;
    // Start the X at the very left since it's max width, but center the height
    startX = 0;
    startY = (canvasHeight - height) / 2;
  }

  return { 'width': width, 'height': height, 'startX': startX, 'startY': startY }
}
