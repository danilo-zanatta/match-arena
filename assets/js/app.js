// ===============================
// CONFIGURAÇÃO E DADOS
// ===============================

const characters = [
  { id: 1, name: "Fire Core", image: "assets/images/fire-core.png" },
  { id: 2, name: "Ice Spirit", image: "assets/images/ice-spirit.png" },
  { id: 3, name: "Thunder Orb", image: "assets/images/thunder-orb.png" },
  { id: 4, name: "Wind Blade", image: "assets/images/wind-blade.png" },
  { id: 5, name: "Stone Guard", image: "assets/images/stone-guard.png" },
  { id: 6, name: "Aqua Pulse", image: "assets/images/aqua-pulse.png" },
  { id: 7, name: "Shadow Fang", image: "assets/images/shadow-fang.png" },
  { id: 8, name: "Light Bloom", image: "assets/images/light-bloom.png" },
  { id: 9, name: "Steel Bot", image: "assets/images/steel-bot.png" },
  { id: 10, name: "Slime King", image: "assets/images/slime-king.png" },
  { id: 11, name: "Void Eye", image: "assets/images/void-eye.png" },
  { id: 12, name: "Ghost Spark", image: "assets/images/ghost-spark.png" },
  { id: 13, name: "Pirate Fox", image: "assets/images/pirate-fox.png" },
  { id: 14, name: "Cyber Ninja", image: "assets/images/cyber-ninja.png" },
  { id: 15, name: "Arcane Mage", image: "assets/images/arcane-mage.png" },
  { id: 16, name: "Battle Knight", image: "assets/images/battle-knight.png" },
  { id: 17, name: "Forest Beast", image: "assets/images/forest-beast.png" },
  { id: 18, name: "Rocket Monkey", image: "assets/images/rocket-monkey.png" },
  { id: 19, name: "Crystal Drake", image: "assets/images/crystal-drake.png" },
  { id: 20, name: "Mecha Panda", image: "assets/images/mecha-panda.png" }
];

const gameRules = {
  matchPoints: 5,
  errorPoints: -1,
  comboBonus: 2,
  timeByDifficulty: {
    easy: 120,
    medium: 180,
    hard: 240
  }
};

// ===============================
// ESTADO DO JOGO
// ===============================

let firstCard = null;
let secondCard = null;
let lockBoard = false;

let score = 0;
let moves = 0;
let pairs = 0;
let combo = 0;

let timer = null;
let timeLeft = 0;
let mode = "classic";
let difficulty = "easy";

// ===============================
// ELEMENTOS DOM
// ===============================

const board = document.getElementById("gameBoard");
const scoreEl = document.getElementById("score");
const movesEl = document.getElementById("moves");
const pairsEl = document.getElementById("pairs");
const timeEl = document.getElementById("time");
const comboEl = document.getElementById("combo");

const startScreen = document.getElementById("startScreen");
const endScreen = document.getElementById("endScreen");

const bgMusic = document.getElementById("bgMusic");

// ===============================
// UTILITÁRIOS
// ===============================

function shuffle(array) {
  return array.sort(() => Math.random() - 0.5);
}

function isMobile() {
  return window.innerWidth <= 520;
}

function getTotalPairs() {
  if (isMobile()) {
    if (difficulty === "easy") return 6;
    if (difficulty === "medium") return 8;
    return 10;
  } else {
    if (difficulty === "easy") return 10;
    if (difficulty === "medium") return 15;
    return 20;
  }
}

// ===============================
// CRIAÇÃO DO TABULEIRO
// ===============================

function createBoard() {
  board.innerHTML = "";

  const totalPairs = getTotalPairs();
  const selected = characters.slice(0, totalPairs);
  const cards = shuffle([...selected, ...selected]);

  cards.forEach((char) => {
    const card = document.createElement("div");
    card.classList.add("card");

    card.innerHTML = `
      <div class="card-inner">
        <div class="card-front"></div>
        <div class="card-back">
          <img src="${char.image}" alt="${char.name}" />
        </div>
      </div>
    `;

    card.dataset.id = char.id;

    card.addEventListener("click", () => flipCard(card));

    board.appendChild(card);
  });
}

// ===============================
// INICIAR JOGO
// ===============================

function startGame() {
  score = 0;
  moves = 0;
  pairs = 0;
  combo = 0;

  updateUI();

  startScreen.style.display = "none";
  endScreen.style.display = "none";

  createBoard();

  if (mode === "timed") {
    startTimer();
  }

  playMusic();
}
// ===============================
// LÓGICA DO JOGO
// ===============================

function flipCard(card) {
  if (lockBoard) return;
  if (card === firstCard) return;
  if (card.classList.contains("flipped")) return;
  if (card.classList.contains("match")) return;

  card.classList.add("flipped");

  if (!firstCard) {
    firstCard = card;
    return;
  }

  secondCard = card;
  lockBoard = true;
  moves++;

  checkForMatch();
}

function checkForMatch() {
  const isMatch = firstCard.dataset.id === secondCard.dataset.id;

  if (isMatch) {
    handleMatch();
  } else {
    handleMismatch();
  }

  updateUI();
}

function handleMatch() {
  firstCard.classList.add("match");
  secondCard.classList.add("match");

  pairs++;
  combo++;

  const comboBonus = combo > 1 ? (combo - 1) * gameRules.comboBonus : 0;
  score += gameRules.matchPoints + comboBonus;

  resetTurn();

  const totalPairs = getTotalPairs();
  if (pairs === totalPairs) {
    endGame(true);
  }
}

function handleMismatch() {
  combo = 0;
  score += gameRules.errorPoints;

  firstCard.classList.add("error");
  secondCard.classList.add("error");

  setTimeout(() => {
    firstCard.classList.remove("flipped", "error");
    secondCard.classList.remove("flipped", "error");
    resetTurn();
    updateUI();
  }, 800);
}

function resetTurn() {
  [firstCard, secondCard] = [null, null];
  lockBoard = false;
}

// ===============================
// TIMER
// ===============================

function startTimer() {
  clearInterval(timer);
  timeLeft = gameRules.timeByDifficulty[difficulty];
  updateTimerUI();

  timer = setInterval(() => {
    timeLeft--;
    updateTimerUI();

    if (timeLeft <= 0) {
      clearInterval(timer);
      endGame(false);
    }
  }, 1000);
}

function updateTimerUI() {
  if (!timeEl) return;

  if (mode === "timed") {
    const minutes = String(Math.floor(timeLeft / 60)).padStart(2, "0");
    const seconds = String(timeLeft % 60).padStart(2, "0");
    timeEl.textContent = `${minutes}:${seconds}`;
  } else {
    timeEl.textContent = "--:--";
  }
}

// ===============================
// UI
// ===============================

function updateUI() {
  if (scoreEl) scoreEl.textContent = score;
  if (movesEl) movesEl.textContent = moves;
  if (pairsEl) pairsEl.textContent = pairs;
  if (comboEl) comboEl.textContent = combo;
}

function openStartScreen() {
  startScreen.style.display = "flex";
}

function closeStartScreen() {
  startScreen.style.display = "none";
}

function endGame(win) {
  clearInterval(timer);
  stopMusic();

  saveRanking(win);

  if (endScreen) {
    endScreen.style.display = "flex";

    const endTitle = document.getElementById("endTitle");
    const endText = document.getElementById("endText");
    const finalScore = document.getElementById("finalScore");
    const finalMoves = document.getElementById("finalMoves");
    const finalPairs = document.getElementById("finalPairs");

    if (endTitle) {
      endTitle.textContent = win ? "Você venceu! 🎉" : "Fim de jogo ⏱️";
    }

    if (endText) {
      endText.textContent = win
        ? "Parabéns! Você encontrou todos os pares."
        : "O tempo acabou. Tente novamente.";
    }

    if (finalScore) finalScore.textContent = score;
    if (finalMoves) finalMoves.textContent = moves;
    if (finalPairs) finalPairs.textContent = `${pairs}/${getTotalPairs()}`;
  }
}

// ===============================
// RANKING LOCAL
// ===============================

function saveRanking(win) {
  const playerNameInput =
    document.getElementById("playerName") ||
    document.getElementById("playerNameStart");

  const playerName = playerNameInput?.value?.trim() || "Visitante";

  const rankingKey = "match-arena-ranking";
  const ranking = JSON.parse(localStorage.getItem(rankingKey) || "[]");

  ranking.push({
    name: playerName,
    score,
    moves,
    pairs,
    difficulty,
    mode,
    result: win ? "win" : "lose",
    time:
      mode === "timed"
        ? gameRules.timeByDifficulty[difficulty] - timeLeft
        : null
  });

  ranking.sort((a, b) => b.score - a.score);

  localStorage.setItem(rankingKey, JSON.stringify(ranking.slice(0, 10)));
  renderRanking();
}

function renderRanking() {
  const rankingList = document.getElementById("rankingList");
  if (!rankingList) return;

  const rankingKey = "match-arena-ranking";
  const ranking = JSON.parse(localStorage.getItem(rankingKey) || "[]");

  rankingList.innerHTML = "";

  if (!ranking.length) {
    rankingList.innerHTML = "<li>Nenhuma pontuação ainda.</li>";
    return;
  }

  ranking.forEach((item, index) => {
    const li = document.createElement("li");
    li.className = "rank-item";
    li.innerHTML = `
      <div>
        #${index + 1} · ${item.name}
        <small>${item.difficulty} · ${item.mode} · ${item.moves} jogadas</small>
      </div>
      <strong>${item.score}</strong>
    `;
    rankingList.appendChild(li);
  });
}

// ===============================
// ÁUDIO
// ===============================

function playMusic() {
  if (!bgMusic) return;
  bgMusic.volume = 0.12;
  bgMusic.play().catch(() => {});
}

function stopMusic() {
  if (!bgMusic) return;
  bgMusic.pause();
  bgMusic.currentTime = 0;
}

function toggleMusic() {
  if (!bgMusic) return;

  if (bgMusic.paused) {
    bgMusic.play().catch(() => {});
  } else {
    bgMusic.pause();
  }
}

// ===============================
// EVENTOS
// ===============================

document.addEventListener("DOMContentLoaded", () => {
  const startBtn = document.getElementById("startBtn");
  const restartBtn = document.getElementById("restartBtn");
  const playAgainBtn = document.getElementById("playAgainBtn");
  const toggleMusicBtn = document.getElementById("toggleMusicBtn");
  const difficultySelect = document.getElementById("difficultySelect");
  const difficultyStart = document.getElementById("difficultyStart");
  const modeSelect = document.getElementById("modeSelect");
  const modeStart = document.getElementById("modeStart");

  if (startBtn) {
    startBtn.addEventListener("click", () => {
      const difficultyField = difficultyStart || difficultySelect;
      const modeField = modeStart || modeSelect;

      if (difficultyField) difficulty = difficultyField.value;
      if (modeField) mode = modeField.value;

      startGame();
    });
  }

  if (restartBtn) {
    restartBtn.addEventListener("click", () => {
      const difficultyField = difficultySelect || difficultyStart;
      const modeField = modeSelect || modeStart;

      if (difficultyField) difficulty = difficultyField.value;
      if (modeField) mode = modeField.value;

      startGame();
    });
  }

  if (playAgainBtn) {
    playAgainBtn.addEventListener("click", () => {
      if (endScreen) endScreen.style.display = "none";
      startGame();
    });
  }

  if (toggleMusicBtn) {
    toggleMusicBtn.addEventListener("click", toggleMusic);
  }

  if (difficultySelect) {
    difficultySelect.addEventListener("change", (e) => {
      difficulty = e.target.value;
    });
  }

  if (difficultyStart) {
    difficultyStart.addEventListener("change", (e) => {
      difficulty = e.target.value;
    });
  }

  if (modeSelect) {
    modeSelect.addEventListener("change", (e) => {
      mode = e.target.value;
      updateTimerUI();
    });
  }

  if (modeStart) {
    modeStart.addEventListener("change", (e) => {
      mode = e.target.value;
      updateTimerUI();
    });
  }

  window.addEventListener("resize", () => {
    createBoard();
  });

  renderRanking();
  updateUI();
  updateTimerUI();
});
