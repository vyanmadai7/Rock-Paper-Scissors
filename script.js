const state = {
    playerScore: 0,
    computerScore: 0,
    totalRounds: 0,
    wins: 0,
    streak: 0,
    history: [],
    difficulty: 'intermediate'
};

const playerScoreEl = document.getElementById('player-score');
const computerScoreEl = document.getElementById('computer-score');
const messageEl = document.getElementById('message');
const winRateEl = document.getElementById('win-rate');
const streakEl = document.getElementById('streak');
const totalRoundsEl = document.getElementById('total-rounds');
const difficultySelect = document.getElementById('difficulty');
const difficultyNameEl = document.getElementById('difficulty-name');
const difficultyDescEl = document.getElementById('difficulty-desc');
const historyListEl = document.getElementById('history-list');
const choices = document.querySelectorAll('.choice');
const themeToggle = document.getElementById('theme-toggle');
const resetBtn = document.getElementById('reset-btn');
const statsBtn = document.getElementById('stats-btn');

const difficulties = {
    beginner: {
        name: 'Beginner',
        desc: 'Computer makes random choices',
        winChance: 0
    },
    intermediate: {
        name: 'Intermediate',
        desc: 'Balanced gameplay with occasional strategic moves',
        winChance: 0.4
    },
    advanced: {
        name: 'Advanced',
        desc: 'Computer analyzes patterns and adapts',
        winChance: 0.7
    },
    expert: {
        name: 'Expert',
        desc: 'Nearly optimal play with counter-strategies',
        winChance: 0.9
    }
};

const beats = {
    rock: 'scissors',
    paper: 'rock',
    scissors: 'paper'
};

const getComputerChoice = (playerChoice) => {
    const options = ['rock', 'paper', 'scissors'];
    const diff = difficulties[state.difficulty];

    if (Math.random() < diff.winChance) {
        return Object.keys(beats).find(key => beats[key] === playerChoice);
    }

    return options[Math.floor(Math.random() * options.length)];
};

const determineWinner = (player, computer) => {
    if (player === computer) return 'draw';
    return beats[player] === computer ? 'win' : 'lose';
};

const updateStats = () => {
    playerScoreEl.textContent = state.playerScore;
    computerScoreEl.textContent = state.computerScore;
    totalRoundsEl.textContent = state.totalRounds;
    streakEl.textContent = state.streak;

    if (state.totalRounds > 0) {
        const winRate = ((state.wins / state.totalRounds) * 100).toFixed(1);
        winRateEl.textContent = `${winRate}%`;
    } else {
        winRateEl.textContent = '—';
    }
};

const updateHistory = (player, computer, result) => {
    state.history.unshift({ player, computer, result });
    if (state.history.length > 5) state.history.pop();

    historyListEl.innerHTML = state.history.map(h => `
                <div class="history-item">
                    <span>${h.player} vs ${h.computer}</span>
                    <span class="history-result ${h.result}">${h.result === 'win' ? 'Won' :
            h.result === 'lose' ? 'Lost' : 'Draw'
        }</span>
                </div>
            `).join('');
};

const showMessage = (result, player, computer) => {
    messageEl.className = 'message';

    if (result === 'win') {
        messageEl.textContent = `You win — ${player} beats ${computer}`;
        messageEl.classList.add('win');
    } else if (result === 'lose') {
        messageEl.textContent = `You lose — ${computer} beats ${player}`;
        messageEl.classList.add('lose');
    } else {
        messageEl.textContent = `Draw — both chose ${player}`;
    }
};

const playRound = (playerChoice) => {
    choices.forEach(c => c.classList.add('processing'));

    setTimeout(() => {
        const computerChoice = getComputerChoice(playerChoice);
        const result = determineWinner(playerChoice, computerChoice);

        state.totalRounds++;
        if (result === 'win') {
            state.playerScore++;
            state.wins++;
            state.streak++;
        } else if (result === 'lose') {
            state.computerScore++;
            state.streak = 0;
        } else {
            state.streak = 0;
        }

        updateStats();
        showMessage(result, playerChoice, computerChoice);
        updateHistory(playerChoice, computerChoice, result);

        choices.forEach(c => {
            c.classList.remove('selected', 'winner', 'processing');
            if (c.dataset.choice === playerChoice) {
                c.classList.add('selected');
                if (result === 'win') c.classList.add('winner');
            }
        });

        setTimeout(() => {
            choices.forEach(c => c.classList.remove('selected', 'winner'));
        }, 1500);
    }, 300);
};

choices.forEach(choice => {
    choice.addEventListener('click', () => {
        if (!choice.classList.contains('processing')) {
            playRound(choice.dataset.choice);
        }
    });
});

difficultySelect.addEventListener('change', (e) => {
    state.difficulty = e.target.value;
    const diff = difficulties[state.difficulty];
    difficultyNameEl.textContent = diff.name;
    difficultyDescEl.textContent = diff.desc;
});

themeToggle.addEventListener('click', () => {
    const html = document.documentElement;
    const currentTheme = html.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? '' : 'dark';
    html.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
});

resetBtn.addEventListener('click', () => {
    if (confirm('Are you sure you want to reset the game? All statistics will be cleared.')) {
        state.playerScore = 0;
        state.computerScore = 0;
        state.totalRounds = 0;
        state.wins = 0;
        state.streak = 0;
        state.history = [];

        updateStats();
        messageEl.className = 'message';
        messageEl.textContent = 'Make your choice';
        historyListEl.innerHTML = `
                    <div style="text-align: center; color: var(--color-text-secondary); font-size: 0.875rem; padding: calc(var(--spacing-unit) * 2) 0;">
                        No games played yet
                    </div>
                `;
    }
});

statsBtn.addEventListener('click', () => {
    const winRate = state.totalRounds > 0
        ? ((state.wins / state.totalRounds) * 100).toFixed(1)
        : 0;

    alert(`Game Statistics\n\n` +
        `Total Rounds: ${state.totalRounds}\n` +
        `Wins: ${state.wins}\n` +
        `Losses: ${state.computerScore}\n` +
        `Draws: ${state.totalRounds - state.wins - state.computerScore}\n` +
        `Win Rate: ${winRate}%\n` +
        `Current Streak: ${state.streak}\n` +
        `Difficulty: ${difficulties[state.difficulty].name}`
    );
});

const savedTheme = localStorage.getItem('theme');
if (savedTheme) {
    document.documentElement.setAttribute('data-theme', savedTheme);
}

const initialDiff = difficulties[state.difficulty];
difficultyNameEl.textContent = initialDiff.name;
difficultyDescEl.textContent = initialDiff.desc;
