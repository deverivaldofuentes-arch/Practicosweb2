// Juego de Memoria Pro - Versión Mejorada 2025
const board = document.getElementById("gameBoard");
const timerEl = document.getElementById("timer");
const movesEl = document.getElementById("moves");
const scoreEl = document.getElementById("score");
const bestScoreEl = document.getElementById("bestScore");
const resetBtn = document.getElementById("resetBtn");
const winModal = document.getElementById("winModal");
const winMovesEl = document.getElementById("winMoves");
const winTimeEl = document.getElementById("winTime");
const winScoreEl = document.getElementById("winScore");
const playAgainBtn = document.getElementById("playAgainBtn");

let icons = ["🍎", "🍌", "🍇", "🍓", "🍉", "🍒", "🍑", "🍍", "🥝", "🍊", "🍋", "🥭", "🍈", "🍑", "🥥", "🍍"];
let cards = [];
let firstCard = null;
let secondCard = null;
let lock = false;

let moves = 0;
let score = 0;
let time = 0;
let timer = null;
let bestScore = parseInt(localStorage.getItem('bestMemoryScore')) || 0;

// Inicializar
bestScoreEl.textContent = bestScore;

function startGame() {
    // Reiniciar
    moves = 0;
    score = 0;
    time = 0;
    firstCard = null;
    secondCard = null;
    lock = false;
    winModal.style.display = 'none';

    movesEl.textContent = moves;
    scoreEl.textContent = score;
    timerEl.textContent = "00:00";

    clearInterval(timer);
    startTimer();

    // Cartas (16 pares para 8x2, pero usamos 16)
    cards = [...icons.slice(0, 8), ...icons.slice(0, 8)];
    shuffle(cards);

    board.innerHTML = "";
    cards.forEach((icon, index) => {
        const card = document.createElement("div");
        card.classList.add("card");
        card.dataset.icon = icon;
        card.dataset.index = index;
        card.innerHTML = '<div class="card-inner"><div class="card-front"></div><div class="card-back"></div></div>';
        board.appendChild(card);
    });
}

function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

function startTimer() {
    timer = setInterval(() => {
        time++;
        const min = String(Math.floor(time / 60)).padStart(2, "0");
        const sec = String(time % 60).padStart(2, "0");
        timerEl.textContent = `${min}:${sec}`;
    }, 1000);
}

board.addEventListener("click", (e) => {
    const card = e.target.closest('.card');
    if (!card || lock || card.classList.contains("revealed") || card.classList.contains("matched")) return;

    revealCard(card);

    if (!firstCard) {
        firstCard = card;
    } else if (firstCard !== card) {
        secondCard = card;
        checkMatch();
    }
});

function revealCard(card) {
    card.classList.add("revealed");
    const back = card.querySelector('.card-back');
    back.textContent = card.dataset.icon;
}

function hideCard(card) {
    card.classList.remove("revealed");
    card.querySelector('.card-back').textContent = '';
}

function checkMatch() {
    lock = true;
    moves++;
    movesEl.textContent = moves;
    score = Math.max(0, score - 1); // Penalización por movimiento
    scoreEl.textContent = score;

    if (firstCard.dataset.icon === secondCard.dataset.icon) {
        firstCard.classList.add("matched");
        secondCard.classList.add("matched");
        score += 20; // Bonus por pareja
        scoreEl.textContent = score;
        resetSelection();
        checkWin();
    } else {
        setTimeout(() => {
            hideCard(firstCard);
            hideCard(secondCard);
            resetSelection();
        }, 1000);
    }
}

function resetSelection() {
    firstCard = null;
    secondCard = null;
    lock = false;
}

function checkWin() {
    const matched = document.querySelectorAll(".matched").length;
    if (matched === cards.length) {
        clearInterval(timer);
        if (score > bestScore) {
            bestScore = score;
            localStorage.setItem('bestMemoryScore', bestScore);
            bestScoreEl.textContent = bestScore;
        }
        showWinModal();
    }
}

function showWinModal() {
    winMovesEl.textContent = moves;
    winTimeEl.textContent = timerEl.textContent;
    winScoreEl.textContent = score;
    winModal.style.display = 'flex';
}

resetBtn.addEventListener("click", startGame);
playAgainBtn.addEventListener("click", startGame);

// Inicio
startGame();
