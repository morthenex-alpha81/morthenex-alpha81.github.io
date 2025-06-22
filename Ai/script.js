const apiURL = "https://api-inference.huggingface.co/models/stabilityai/stable-diffusion-3.5-large";
const tokens = [
  "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",
  "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",
  "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",
  "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",
  "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",
  "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",
  "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",
];

const retryLimit = 5;
const retryDelay = 66600;

let cachedLetters = [];
let cachedNumbers = [];
let cachedObjek = [];
let cachedLatar = [];
let cachedGaya = [];

async function loadJSONCache() {
  if (cachedLetters.length === 0) {
    cachedLetters = await fetchJSON("letters.json");
  }
  if (cachedNumbers.length === 0) {
    cachedNumbers = await fetchJSON("numbers.json");
  }
  if (cachedObjek.length === 0) {
    cachedObjek = await fetchJSON("objek.json");
  }
  if (cachedLatar.length === 0) {
    cachedLatar = await fetchJSON("latar.json");
  }
  if (cachedGaya.length === 0) {
    cachedGaya = await fetchJSON("gaya.json");
  }
}

async function fetchJSON(filePath) {
  try {
    const response = await fetch(filePath);
    if (!response.ok) throw new Error(`Gagal memuat file: ${filePath}`);
    return await response.json();
  } catch (error) {
    console.error("Error saat memuat JSON:", error);
    return [];
  }
}

function generateCode() {
  if (cachedLetters.length === 0 || cachedNumbers.length === 0) return "";
  let code = "";
  for (let i = 0; i < 7; i++) {
    const randomLetter = cachedLetters[Math.floor(Math.random() * cachedLetters.length)];
    const randomNumber = cachedNumbers[Math.floor(Math.random() * cachedNumbers.length)];
    code += Math.random() > 0.5 ? randomLetter : randomNumber;
  }
  return code;
}

async function fetchImageWithRetries(prompt, token, retries = 0) {
  try {
    const response = await fetch(apiURL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ inputs: prompt }),
    });

    if (!response.ok) throw new Error("Gagal memproses permintaan.");
    const blob = await response.blob();
    return URL.createObjectURL(blob);
  } catch (error) {
    console.error("Error:", error);
    if (retries < retryLimit) {
      await delay(retryDelay);
      return fetchImageWithRetries(prompt, token, retries + 1);
    } else {
      return null;
    }
  }
}

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function createPopup(imageUrl, downloadName) {
  const popup = document.createElement("div");
  popup.className = "popup";

  const img = document.createElement("img");
  img.src = imageUrl;

  const closeButton = document.createElement("button");
  closeButton.textContent = "Tutup";
  closeButton.className = "close-popup";
  closeButton.onclick = () => popup.remove();

  const downloadButton = document.createElement("a");
  downloadButton.href = imageUrl;
  downloadButton.download = downloadName;
  downloadButton.textContent = "Download";
  downloadButton.className = "download-popup";

  popup.appendChild(img);
  popup.appendChild(closeButton);
  popup.appendChild(downloadButton);

  document.body.appendChild(popup);

  // Pastikan popup selalu muncul di atas
  popup.style.position = "fixed";
  popup.style.top = "50%";
  popup.style.left = "50%";
  popup.style.transform = "translate(-50%, -50%)";
  popup.style.zIndex = "1000";
  popup.style.backgroundColor = "rgba(0, 0, 0, 0.9)";
  popup.style.padding = "20px";
  popup.style.borderRadius = "8px";
}

async function generateImages() {
  const prompt = document.getElementById("prompt").value.trim();
  const numImages = parseInt(document.getElementById("numImages").value);
  const resultDiv = document.getElementById("result");
  const generateBtn = document.getElementById("generateBtn");

  if (!prompt) {
    alert("Prompt tidak boleh kosong!");
    return;
  }

  generateBtn.disabled = true;
  generateBtn.style.backgroundColor = "gray";
  generateBtn.style.cursor = "not-allowed";

  await loadJSONCache();

  const gridContainer = document.createElement("div");
  gridContainer.className = "grid-container";
  resultDiv.prepend(gridContainer);

  const completedRequests = [];

  for (let i = 0; i < numImages; i++) {
    const uniqueCode = generateCode();
    const modifiedPrompt = `${prompt}, ${uniqueCode}`;
    const token = tokens[Math.floor(Math.random() * tokens.length)];
    
    const gridItem = document.createElement("div");
    gridItem.className = "grid-item";
    const img = document.createElement("img");
    img.src = "loading.gif";
    img.alt = "Loading...";
    gridItem.appendChild(img);
    gridContainer.appendChild(gridItem);
    completedRequests.push(
      fetchImageWithRetries(`${modifiedPrompt}`, token).then((imageUrl) => {
        if (imageUrl) {
          img.src = imageUrl;
          img.alt = "Generated Image";
          gridItem.onclick = () => createPopup(imageUrl, `${prompt}, ${uniqueCode}`);
        } else {
          img.src = "error.png";
          img.alt = "Error";
        }
      })
    );
  }

  await Promise.all(completedRequests);
  generateBtn.disabled = false;
  generateBtn.style.backgroundColor = "";
  generateBtn.style.cursor = "";
}

// Fitur "Aku Bingung"
async function generateRandomPrompt() {
  await loadJSONCache();

  if (cachedObjek.length === 0 || cachedLatar.length === 0 || cachedGaya.length === 0) {
    alert("Gagal memuat data untuk prompt acak!");
    return;
  }

  const randomObjek = cachedObjek[Math.floor(Math.random() * cachedObjek.length)];
  const randomLatar = cachedLatar[Math.floor(Math.random() * cachedLatar.length)];
  const randomGaya = cachedGaya[Math.floor(Math.random() * cachedGaya.length)];

  const randomPrompt = `${randomObjek} at the ${randomLatar} with an ${randomGaya} style`;
  document.getElementById("prompt").value = randomPrompt;
}

document.getElementById("generateBtn").addEventListener("click", generateImages);
document.getElementById("randomPromptBtn").addEventListener("click", generateRandomPrompt);