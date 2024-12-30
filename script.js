// Получение элементов из DOM
const mainMenu = document.getElementById('main-menu');
const gameScreen = document.getElementById('game-screen');
const gameOverScreen = document.getElementById('game-over');
const difficultyButtons = document.querySelectorAll('.difficulty-buttons button');
const gameArea = document.getElementById('game-area');
const scoreDisplay = document.getElementById('score');
const livesDisplay = document.getElementById('lives');
const finalScore = document.getElementById('final-score');
const restartButton = document.getElementById('restart-button');
const menuButton = document.getElementById('menu-button');
const exitButton = document.getElementById('exit-button'); // Кнопка выхода
const resetButton = document.getElementById('reset-leaderboard'); // Кнопка сброса рекордов
const toggleLayoutButton = document.getElementById('toggle-layout'); // Кнопка переключения раскладки

const menuMusic = document.getElementById('menu-music');
const gameMusic = document.getElementById('game-music');
const destroySound = document.getElementById('destroy-sound');

// Игровые параметры
let score = 0;
let lives = 3;
let gameInterval;
let spawnInterval;
let gameSpeed;
let currentDifficulty = 'easy'; // Переменная для хранения текущей сложности
let currentLayout = 'RUS'; // Переменная для хранения текущей раскладки
let isGameOver = false;

// Сложности
const difficulties = {
    easy: { speed: 1, spawnRate: 2000, lives: Infinity },
    medium: { speed: 1, spawnRate: 1500, lives: 3 },
    hard: { speed: 1, spawnRate: 1000, lives: 2 }
};

// Массив изображений персонажей
const characterImages = [
    'images/character1.png',
    'images/character2.png',
    'images/character3.png',
    // Добавьте пути к вашим изображениям
];

// Наборы символов для разных раскладок
const characterSets = {
    RUS: 'АБВГДЕЁЖЗИЙКЛМНОПРСТУФХЦЧШЩЪЫЬЭЮЯ',
    ENG: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
};

// Функция начала игры
function startGame(difficulty) {
    console.log(`Starting game with difficulty: ${difficulty} and layout: ${currentLayout}`);
    currentDifficulty = difficulty; // Сохраняем выбранную сложность

    // Установка параметров сложности
    gameSpeed = difficulties[difficulty].speed;
    lives = difficulties[difficulty].lives;
    score = 0;
    isGameOver = false;

    // Обновление отображения
    scoreDisplay.textContent = `Счет: ${score}`;
    if (difficulty === 'easy') {
        livesDisplay.textContent = `Жизни: ∞`;
        livesDisplay.style.display = 'none'; // Скрываем жизни в лёгком режиме
        exitButton.classList.remove('hidden'); // Показываем кнопку выхода
    } else {
        livesDisplay.textContent = `Жизни: ${lives}`;
        livesDisplay.style.display = 'block';
        exitButton.classList.add('hidden'); // Скрываем кнопку выхода
    }

    // Показ игрового экрана и скрытие других
    mainMenu.classList.add('hidden');
    gameOverScreen.classList.add('hidden');
    gameScreen.classList.remove('hidden');

    // Управление музыкой
    menuMusic.pause();
    gameMusic.currentTime = 0;
    gameMusic.play();
    gameMusic.volume = 0.5;

    // Очистка игрового поля перед началом
    clearGameArea();

    // Начало спавна персонажей
    spawnInterval = setInterval(spawnCharacter, difficulties[difficulty].spawnRate);

    // Запуск игрового цикла
    gameInterval = requestAnimationFrame(updateGame);
}

// Функция окончания игры
function endGame() {
    console.log(`Game Over. Final score: ${score}`);
    isGameOver = true;
    clearInterval(spawnInterval);
    cancelAnimationFrame(gameInterval);
    gameScreen.classList.add('hidden');
    gameOverScreen.classList.remove('hidden');
    finalScore.textContent = `Ваш счёт: ${score}`;

    // Сохранение рекорда
    saveScore(currentDifficulty, score, currentLayout);

    // Управление музыкой
    gameMusic.pause();
    menuMusic.currentTime = 0;
    menuMusic.play();
    menuMusic.volume = 0.5;

    // Скрытие кнопки "В главное меню" на экране окончания игры в лёгком режиме
    if (currentDifficulty === 'easy') {
        menuButton.style.display = 'none';
    } else {
        menuButton.style.display = 'inline-block';
    }
}

// Функция создания персонажа
function spawnCharacter() {
    const randomChar = getRandomCharacter();
    const character = document.createElement('div');
    character.classList.add('character');

    // Установка случайного изображения
    const randomImage = characterImages[Math.floor(Math.random() * characterImages.length)];
    character.style.backgroundImage = `url(${randomImage})`;

    // Начальная позиция слева
    character.style.left = '0px'; // Старт с самого начала игрового поля

    // Случайная вертикальная позиция
    const gameAreaHeight = gameArea.clientHeight;
    const characterHeight = 80; // Высота персонажа
    const maxTop = gameAreaHeight - characterHeight;
    const randomTop = Math.floor(Math.random() * maxTop);
    character.style.top = `${randomTop}px`;

    // Добавление буквы на персонажа
    const letter = document.createElement('span');
    letter.textContent = randomChar;
    character.appendChild(letter);

    character.dataset.letter = randomChar;

    gameArea.appendChild(character);
}

// Функция получения случайной буквы
function getRandomCharacter() {
    const characters = characterSets[currentLayout];
    return characters[Math.floor(Math.random() * characters.length)];
}

// Функция обновления позиции персонажей
function updateGame() {
    const characters = document.querySelectorAll('.character');
    characters.forEach(char => {
        let left = parseInt(char.style.left);
        left += gameSpeed;
        char.style.left = `${left}px`;

        // Проверка, вышел ли персонаж за правую границу
        if (left > gameArea.clientWidth) {
            char.remove();
            if (lives !== Infinity) {
                lives--;
                livesDisplay.textContent = `Жизни: ${lives}`;
                if (lives <= 0) {
                    endGame();
                }
            }
        }
    });

    if (!isGameOver) {
        gameInterval = requestAnimationFrame(updateGame);
    }
}

// Функция очистки игрового поля
function clearGameArea() {
    const characters = document.querySelectorAll('.character');
    characters.forEach(char => char.remove());
}

// Обработка нажатий клавиш
document.addEventListener('keydown', function(event) {
    const pressedKey = event.key.toUpperCase();
    const characters = document.querySelectorAll(`.character[data-letter="${pressedKey}"]`);

    if (characters.length > 0) {
        destroySound.currentTime = 0; // Сбрасываем звук для повторного воспроизведения
        destroySound.play();
        characters.forEach(char => {
            char.remove();
            score++;
            scoreDisplay.textContent = `Счет: ${score}`;
        });
    } else {
        // Обработка неправильных нажатий клавиш
        if (currentDifficulty === 'hard') { // Жизни отнимаются только в сложном режиме
            lives--;
            livesDisplay.textContent = `Жизни: ${lives}`;
            if (lives <= 0) {
                endGame();
            }
        }
    }
});

// Обработчики кнопок сложности
difficultyButtons.forEach(button => {
    button.addEventListener('click', () => {
        const difficulty = button.dataset.difficulty;
        startGame(difficulty);
    });
});

// Обработчики кнопок на экране окончания игры
restartButton.addEventListener('click', () => {
    console.log('Restarting game');
    // Восстановление видимости кнопки "В главное меню" при перезапуске
    if (currentDifficulty !== 'easy') {
        menuButton.style.display = 'inline-block';
    } else {
        menuButton.style.display = 'none';
    }
    startGame(currentDifficulty);
});

menuButton.addEventListener('click', () => {
    console.log('Returning to main menu from game over screen');
    gameOverScreen.classList.add('hidden');
    mainMenu.classList.remove('hidden');

    // Управление музыкой
    gameMusic.pause();
    menuMusic.currentTime = 0;
    menuMusic.play();
    menuMusic.volume = 0.5;

    // Очистка экрана окончания игры
    finalScore.textContent = `Ваш счёт: 0`;

    // Обновление таблицы рекордов
    displayLeaderboards();
});

// Обработчик кнопки выхода в главное меню в игровом экране
exitButton.addEventListener('click', () => {
    console.log('Exiting to main menu');
    // Останавливаем игру
    isGameOver = true;
    clearInterval(spawnInterval);
    cancelAnimationFrame(gameInterval);
    gameScreen.classList.add('hidden');
    mainMenu.classList.remove('hidden');

    // Управление музыкой
    gameMusic.pause();
    menuMusic.currentTime = 0;
    menuMusic.play();
    menuMusic.volume = 0.5;

    // Убираем всех персонажей
    clearGameArea();

    // Сохранение рекорда на лёгком уровне, если он выше
    if (currentDifficulty === 'easy') {
        saveScore(currentDifficulty, score, currentLayout);
    }

    // Обновление таблицы рекордов
    displayLeaderboards();
});

// Обработчик кнопки сброса рекордов
if (resetButton) {
    resetButton.addEventListener('click', () => {
        if (confirm('Вы уверены, что хотите сбросить все рекорды?')) {
            // Если раскладка важна для рекордов, нужно сбросить их по каждой раскладке
            ['RUS', 'ENG'].forEach(layout => {
                ['easy', 'medium', 'hard'].forEach(difficulty => {
                    const key = `leaderboard_${layout}_${difficulty}`;
                    localStorage.removeItem(key);
                });
            });
            displayLeaderboards();
            console.log('All leaderboards have been reset.');
            alert('Все рекорды были сброшены.');
        }
    });
}

// Обработчик кнопки переключения раскладки
if (toggleLayoutButton) {
    toggleLayoutButton.addEventListener('click', () => {
        // Переключение между RUS и ENG
        currentLayout = currentLayout === 'RUS' ? 'ENG' : 'RUS';
        toggleLayoutButton.textContent = currentLayout;

        // Сохранение выбранной раскладки в localStorage
        localStorage.setItem('preferredLayout', currentLayout);

        console.log(`Layout switched to ${currentLayout}`);

        // Обновление таблицы рекордов, так как раскладка изменилась
        displayLeaderboards();
    });
}

// Инициализация игры на загрузке
window.onload = () => {
    console.log('Initializing game');

    // Загрузка предпочтительной раскладки из localStorage или установка по умолчанию
    const savedLayout = localStorage.getItem('preferredLayout');
    if (savedLayout && (savedLayout === 'RUS' || savedLayout === 'ENG')) {
        currentLayout = savedLayout;
    } else {
        currentLayout = 'RUS'; // Раскладка по умолчанию
    }

    // Установка текста на кнопке переключения раскладки
    toggleLayoutButton.textContent = currentLayout;

    mainMenu.classList.remove('hidden');
    menuMusic.play();
    menuMusic.volume = 0.5;
    displayLeaderboards();
};

// Функция сохранения рекорда (только максимальный счёт)
function saveScore(difficulty, score, layout) {
    const key = `leaderboard_${layout}_${difficulty}`;
    const existingScore = parseInt(localStorage.getItem(key)) || 0;

    if (score > existingScore) {
        localStorage.setItem(key, score);
        console.log(`New high score for ${layout} layout, ${difficulty} level: ${score}`);
        alert(`Поздравляю! Ты побил рекорд! Новый рекорд ${score}!`);
    } else {
        console.log(`Score not high enough for ${layout} layout, ${difficulty} level. Current high score: ${existingScore}`);
    }
}

// Функция загрузки рекордов (только максимальный счёт)
function loadLeaderboard(layout, difficulty) {
    const key = `leaderboard_${layout}_${difficulty}`;
    const score = parseInt(localStorage.getItem(key)) || null;
    return score;
}

// Функция отображения таблиц рекордов
function displayLeaderboards() {
    const leaderboards = document.querySelectorAll('.leaderboard');

    leaderboards.forEach(lb => {
        const difficulty = lb.dataset.difficulty;
        const ul = lb.querySelector('ul');
        ul.innerHTML = ''; // Очистка предыдущих записей

        // Для каждой таблицы рекордов загружаем рекорд для текущей раскладки
        const highScore = loadLeaderboard(currentLayout, difficulty);

        if (highScore === null || highScore === 0) {
            const li = document.createElement('li');
            li.textContent = 'Нет рекордов';
            ul.appendChild(li);
            return;
        }

        const li = document.createElement('li');
        li.textContent = `${highScore}`;
        ul.appendChild(li);
    });
}
