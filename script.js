const GRID = 18;

const boad = document.getElementById("board");
const scoreBox = document.getElementById("scoreBox");
const highScoreBox = document.getElementById("highScore");

const startBtn = document.getElementById("startBtn");
const pauseBtn = document.getElementById("pauseBtn");
const restartBtn = document.getElementById("restartBtn");
const muteBtn = document.getElementById("muteBtn");
const fsBtn = document.getElementById("fsBtn");
const difficultySelect = document.getElementById("difficulty");

const overlayStart = document.getElementById("overlayStart");
const overlayGameOver = document.getElementById("overlayGameOver");
const overlayStartBtn = document.getElementById("overlayStartBtn");
const tryAgainBtn = document.getElementById("tryAgainBtn");
const goHomeBtn = document.getElementById("goHomeBtn");
const playerNameInput = document.getElementById("playerName");
const finalScore = document.getElementById("finalScore");

const fooSound = new Audio("assets/food.mp3");
const gameOverSound = new Audio("assets/gameover.mp3");
const moveSound = new Audio("assets/move.mp3")

const musicsound = new Audio("assets/music.mp3");
musicsound.loop = true;

let speed = 6, score = 0;
const HKEY_OBJ = "snake_hiscore_obj";
let hiscoreObj = (function () {
  try {
    const raw = localStorage.getItem(HKEY_OBJ);

    // If nothing saved, return default
    if (!raw) return { score: 0, name: "" };
    const parsed = JSON.parse(raw);
    // Validate saved data
    if (typeof parsed.score === 'number' && typeof parsed.name === 'string') {
      return parsed;
    }
    return { score: 0, name: "" };
  } catch (e) {
    return { score: 0, name: "" };
  }
})();

let snake = [{ x: 9, y: 9 }];
let foods = [];

let inputDir = { x: 0, y: 0 };

let lastPaint = 0;

let ruuning = false;
let paused = false;
let musicmuted = false;

const DIFFICULTY = {
  easy: { speed: 5, foods:2},
  medium: { speed: 7, foods:3},
  hard: { speed: 10, foods:4},
};

const rand = (a,b) => Math.floor(a + Math.random() *(b - a + 1));
function play(s) {
  if(!musicMuted){
    try{
      s.currentTime = 0;
      s.play();
      catch (e){}
    }
  }
}
function spawnFood(val) {
  let tries = 0;

  while (tries++ < 300) {
    const x = rand(1, GRID);
    const y = rand(1, GRID);

    // Check if the spot is empty (no snake, no food)
    const onSnake = snake.some(s => s.x === x && s.y === y);
    const onFood = foods.some(f => f.x === x && f.y === y);

    if (!onSnake && !onFood) {
      // Add a unique ID to each food for safe filtering later
      foods.push({
        x,
        y,
        val,
        id: Math.random().toString(36).slice(2, 9)
      });
      return;
    }
  }
}

/* Step 25 — Food Spawning Logic */
function spawnFood(val) {
  let tries = 0;

  while (tries++ < 300) {
    const x = rand(1, GRID);
    const y = rand(1, GRID);

    // Check if the spot is empty (no snake, no food)
    const onSnake = snake.some(s => s.x === x && s.y === y);
    const onFood = foods.some(f => f.x === x && f.y === y);

    if (!onSnake && !onFood) {
      // Add a unique ID to each food for safe filtering later
      foods.push({
        x,
        y,
        val,
        id: Math.random().toString(36).slice(2, 9)
      });
      return;
    }
  }
}


/* Step 26 — Reset the Game */
function resetGame() {
  // Stop movement
  inputDir = { x: 0, y: 0 };

  // Reset snake to the center
  snake = [{ x: 9, y: 9 }];
  // Reset score
  score = 0;
  // Set speed based on chosen difficulty
  speed = DIFFICULTY[difficultySel.value].speed;
  // Create new food items
  setupFoods();
  // Update score display
  updateScore();
  // Re-render the board
  render();
  // Reset game state
  running = false;
  paused = false;
}


/* Step 27 — Save High Score (Score + Player Name) */
function saveHighScoreObject(obj) {
  try {
    // Save the high score object as JSON
    localStorage.setItem(HKEY_OBJ, JSON.stringify(obj));

    // Update the in-memory high score
    hiscoreObj = obj;
  } catch (e) {
    console.warn("Could not save high score:", e);
  }
}


/* Step 28 — Game Over Logic */
function gameOver() {
  // Play game-over sound
  play(gameOverSound);

  // Stop the game
  running = false;

  // Check if player beat the high score
  if (score > hiscoreObj.score) {
    const name =
      (playerNameInput && playerNameInput.value && playerNameInput.value.trim())
        ? playerNameInput.value.trim()
        : "Player";

    const newObj = { score: score, name: name };
    saveHighScoreObject(newObj);
  }

  // Show final score
  finalScore.textContent = `Score: ${score}`;

  // Update high-score display
  highScoreEl.textContent =
    hiscoreObj.score > 0
      ? `High: ${hiscoreObj.score} (${hiscoreObj.name || "Player"})`
      : `High: 0`;

  // Show Game Over overlay
  overlayGameOver.classList.remove("hidden");
}

/* Step 29 — Update Score and High Score on Screen */
function updateScore() {
  // Show current score
  scoreBox.textContent = `Score: ${score}`;

  // Show high score with player name (or default)
  highScoreEl.textContent =
    hiscoreObj.score > 0
      ? `High: ${hiscoreObj.score} (${hiscoreObj.name || "Player"})`
      : `High: 0`;
}


/* Step 30 — Collision Detection */
function willCollide(newHead) {
  // Check if the snake hits the wall
  if (newHead.x < 1 || newHead.x > GRID || newHead.y < 1 || newHead.y > GRID)
    return true;

  // Check if the snake hits itself
  if (snake.some(s => s.x === newHead.x && s.y === newHead.y))
    return true;

  // Safe to move
  return false;
}


