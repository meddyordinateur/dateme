let story;
let currentScene;
let choiceTriggered = false;
let countdownInterval = null;
let countdownDuration = 12; // secondes
let choiceLocked = false;


const video = document.getElementById("video");

// Volume maximum simple
video.volume = 1.0;

// Option Web Audio API pour simuler 150 %
const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
const source = audioCtx.createMediaElementSource(video);
const gainNode = audioCtx.createGain();
gainNode.gain.value = 1.5;
source.connect(gainNode).connect(audioCtx.destination);

// Lecture normale
video.play();

const overlay = document.getElementById("overlay");
const choicesContainer = document.getElementById("choices");

fetch("story.json")
  .then(res => res.json())
  .then(data => {
    story = data;
    loadScene(story.start);
  });
  video.playbackRate = 1;


function loadScene(sceneId) {
   choiceLocked = false;
  if (!story.scenes[sceneId]) return;
  if (countdownInterval) {
  clearInterval(countdownInterval);
  countdownInterval = null;

}


  currentScene = story.scenes[sceneId];
  choiceTriggered = false;

  // RESET TOTAL
  video.ontimeupdate = null;
  video.onended = null;
  overlay.classList.remove("active");
  choicesContainer.innerHTML = "";

  video.style.opacity = 0;

  const timerEl = document.getElementById("timer");
timerEl.style.transition = "opacity 0.2s ease";
timerEl.style.opacity = 1;


  setTimeout(() => {
    video.src = currentScene.video;
    video.currentTime = 0;
    video.play().catch(() => {});
    video.style.opacity = 1;

    // TIMECODE UNIQUEMENT SI at EXISTE
    if (typeof currentScene.at === "number") {
      video.ontimeupdate = () => {
        if (!choiceTriggered && video.currentTime >= currentScene.at) {
          choiceTriggered = true;
          showChoices();
        }
      };
    }

    // FIN DE VIDÉO
    video.onended = () => {
      if (currentScene.next) {
        loadScene(currentScene.next);
        return;
      }

      if (!choiceTriggered && currentScene.choices) {
        showChoices();
      }
    };
  }, 300);
}


function showChoices() {
  overlay.classList.add("active");
  choicesContainer.innerHTML = "";

  if (countdownInterval) {
    clearInterval(countdownInterval);
    countdownInterval = null;
  }

  currentScene.choices.forEach(choice => {
    const btn = document.createElement("button");
    btn.className = "choice";
    btn.textContent = choice.text;

    btn.onclick = () => {
      selectChoice(btn, choice.next);
    };

    choicesContainer.appendChild(btn);
  });

  startCountdown(currentScene.choices);


  function startCountdown(choices) {
  const circle = document.getElementById("timer-circle");
  const totalLength = 226;
  let timeLeft = countdownDuration;


  circle.style.strokeDashoffset = 0;

  countdownInterval = setInterval(() => {
    timeLeft -= 0.1;

    const progress = timeLeft / countdownDuration;
    circle.style.strokeDashoffset = totalLength * (1 - progress);

    if (timeLeft <= 0) {
      clearInterval(countdownInterval);
      autoSelectChoice(choices);
    }
  }, 100);
}
function autoSelectChoice(choices) {
  if (choiceLocked) return;
  if (!choices || choices.length === 0) return;

  const index = Math.floor(Math.random() * choices.length);
  const chosenChoice = choices[index];

  const buttons = document.querySelectorAll(".choice");
  const button = buttons[index];

  if (button) {
    selectChoice(button, chosenChoice.next);
  } else {
    // Sécurité ultime : transition sans animation
    loadScene(chosenChoice.next);
  }
}

function selectChoice(button, nextScene) {
 if (choiceLocked) return;
choiceLocked = true;
  if (countdownInterval) {
    clearInterval(countdownInterval);
    countdownInterval = null;
  }

  const buttons = document.querySelectorAll(".choice");
  buttons.forEach(btn => {
    btn.disabled = true;
    if (btn !== button) btn.classList.add("faded");
  });

  button.classList.add("selected");

  // Micro-pause vidéo (option la plus sûre)
 video.playbackRate = 0.2;


  // Durée de la pose
  setTimeout(() => {
    loadScene(nextScene);
  }, 700);
  document.getElementById("timer").style.opacity = 0;

}




}

  
