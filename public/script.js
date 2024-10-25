// script.js

document.addEventListener('DOMContentLoaded', function() {
    const playVideoButton = document.getElementById('play-video');
    const playGameButton = document.getElementById('play-game');
    const videoContainer = document.getElementById('video-container');
    const ninjaVideo = document.getElementById('ninja-video');
    const gameCanvas = document.getElementById('game-canvas');
    const canvas = gameCanvas.getContext('2d');

    const leaderboardDiv = document.getElementById('leaderboard');
    const clearLeaderboardButton = document.getElementById('clear-leaderboard');

    // List of Ninja's video IDs
    const videoIds = ['ryNMM5pMPr0', 'RbyD5SdzlTk', 'oTh0BatQlRE'];

    // Load images
    const carImage = new Image();
    carImage.src = 'car.jpg'; // Update with correct path

    const obstacleImage = new Image();
    obstacleImage.src = 'download.webp'; // Update with correct path

    // Image dimensions
    const carWidth = 50;
    const carHeight = 100;

    const obstacleWidth = 50; // Fixed obstacle width
    const obstacleHeight = 50; // Fixed obstacle height

    // Game variables
    let carX = gameCanvas.width / 2 - carWidth / 2;
    let obstacles = [];
    let obstacleSpeed = 5;
    let groundY = gameCanvas.height - carHeight - 10;
    let isGameOver = false;
    let score = 0;

    // Difficulty variables
    let gameTime = 0;
    let difficultyInterval = 5000;
    let lastDifficultyIncrease = 0;
    let maxObstacleSpeed = 15;
    // Scoring variables
    let pointsPerObstacle = 1; // Initial points per obstacle

    // Event listeners
    playVideoButton.addEventListener('click', function() {
        const randomIndex = Math.floor(Math.random() * videoIds.length);
        const videoId = videoIds[randomIndex];
        ninjaVideo.src = `https://www.youtube.com/embed/${videoId}?autoplay=1`;
        videoContainer.style.display = 'block';
        gameCanvas.style.display = 'none';

        // Hide leaderboard and clear button
        leaderboardDiv.style.display = 'none';
        clearLeaderboardButton.style.display = 'none';
    });

    playGameButton.addEventListener('click', function() {
        videoContainer.style.display = 'none';
        gameCanvas.style.display = 'block';
        startGame();
    });

    document.getElementById('show-local-leaderboard').addEventListener('click', function() {
        displayLeaderboard('local');
    });

    document.getElementById('show-global-leaderboard').addEventListener('click', function() {
        displayLeaderboard('global');
    });

    if (clearLeaderboardButton) {
        clearLeaderboardButton.addEventListener('click', function() {
            clearLeaderboard();
        });
    }

    function startGame() {
        obstacles = [];
        isGameOver = false;
        carX = gameCanvas.width / 2 - carWidth / 2;
        score = 0;
        obstacleSpeed = 5;
        gameTime = 0;
        lastDifficultyIncrease = 0;
        pointsPerObstacle = 1; // Reset points per obstacle

        // Hide leaderboard and clear button
        leaderboardDiv.style.display = 'none';
        clearLeaderboardButton.style.display = 'none';

        if (carImage.complete && obstacleImage.complete) {
            gameLoop();
        } else {
            carImage.onload = () => {
                obstacleImage.onload = () => {
                    gameLoop();
                };
            };
        }
    }

    gameCanvas.addEventListener('mousemove', function(event) {
        const rect = gameCanvas.getBoundingClientRect();
        const mouseX = event.clientX - rect.left;
        carX = mouseX - carWidth / 2;

        if (carX < 0) carX = 0;
        if (carX + carWidth > gameCanvas.width) carX = gameCanvas.width - carWidth;
    });

    function gameLoop(timestamp) {
        if (isGameOver) return;

        if (!timestamp) timestamp = 0;
        let deltaTime = timestamp - (lastTime || 0);
        lastTime = timestamp;

        gameTime += deltaTime;

        updateGame(deltaTime);
        drawGame();

        requestAnimationFrame(gameLoop);
    }

    let lastTime = 0;

    function updateGame(deltaTime) {
        // Increase difficulty over time
        if (gameTime - lastDifficultyIncrease >= difficultyInterval) {
            lastDifficultyIncrease = gameTime;

            if (obstacleSpeed < maxObstacleSpeed) {
                obstacleSpeed += 0.5;
            }

            // Increase points per obstacle
            pointsPerObstacle += 1; // Increase points awarded per obstacle
        }

        // Create new obstacles
        if (Math.random() < 0.02) {
            const obstacleX = Math.random() * (gameCanvas.width - obstacleWidth);
            obstacles.push({
                x: obstacleX,
                y: -obstacleHeight,
                width: obstacleWidth,
                height: obstacleHeight,
                passed: false
            });
        }

        // Update obstacles
        for (let i = 0; i < obstacles.length; i++) {
            const obstacle = obstacles[i];
            obstacle.y += obstacleSpeed * (deltaTime / 16);

            // Check for collision
            if (
                obstacle.x < carX + carWidth &&
                obstacle.x + obstacle.width > carX &&
                obstacle.y < groundY + carHeight &&
                obstacle.y + obstacle.height > groundY
            ) {
                isGameOver = true;
                let playerName = prompt('Game Over! Your score: ' + score + '\nEnter your name (or leave blank to remain anonymous):');
                if (!playerName) {
                    playerName = 'Unknown';
                }
                saveScore(playerName, score);
                gameCanvas.style.display = 'none';
                return;
            }

            // Check if obstacle has passed the car
            if (!obstacle.passed && obstacle.y > groundY + carHeight) {
                score += pointsPerObstacle; // Increase score by pointsPerObstacle
                obstacle.passed = true;
            }
        }

        // Remove off-screen obstacles
        obstacles = obstacles.filter(obstacle => obstacle.y < gameCanvas.height);
    }

    function drawGame() {
        // Clear canvas
        canvas.clearRect(0, 0, gameCanvas.width, gameCanvas.height);

        // Draw car
        canvas.drawImage(carImage, carX, groundY, carWidth, carHeight);

        // Draw obstacles
        obstacles.forEach(function(obstacle) {
            canvas.drawImage(obstacleImage, obstacle.x, obstacle.y, obstacle.width, obstacle.height);
        });

        // Draw score
        canvas.fillStyle = '#fff';
        canvas.font = '24px Arial';
        canvas.fillText('Score: ' + score, 10, 30);
    }

    function saveScore(name, score) {
        saveLocalScore(name, score);
        saveGlobalScore(name, score);
    }

    function saveLocalScore(name, score) {
        let leaderboard = JSON.parse(localStorage.getItem('leaderboard')) || [];
        leaderboard.push({ name: name, score: score });
        leaderboard.sort((a, b) => b.score - a.score);
        leaderboard = leaderboard.slice(0, 10);
        localStorage.setItem('leaderboard', JSON.stringify(leaderboard));
    }

    function saveGlobalScore(name, score) {
        db.collection('leaderboard').add({
            name: name,
            score: score
        })
        .then(() => {
            console.log('Score saved to Firestore');
        })
        .catch(error => {
            console.error('Error saving score: ', error);
        });
    }

    function displayLeaderboard(type) {
        // Hide the leaderboard and clear button before displaying
        leaderboardDiv.style.display = 'none';
        clearLeaderboardButton.style.display = 'none';

        if (type === 'local') {
            let leaderboard = JSON.parse(localStorage.getItem('leaderboard')) || [];
            let leaderboardHTML = '<h2>Local Leaderboard</h2><ol>';
            leaderboard.forEach(entry => {
                leaderboardHTML += `<li>${entry.name}: ${entry.score}</li>`;
            });
            leaderboardHTML += '</ol>';

            leaderboardDiv.innerHTML = leaderboardHTML;
            leaderboardDiv.style.display = 'block';

            // Show clear leaderboard button
            clearLeaderboardButton.style.display = 'block';
        } else if (type === 'global') {
            db.collection('leaderboard').orderBy('score', 'desc').limit(10).get()
            .then(querySnapshot => {
                let leaderboardHTML = '<h2>Global Leaderboard</h2><ol>';
                querySnapshot.forEach(doc => {
                    const data = doc.data();
                    leaderboardHTML += `<li>${data.name}: ${data.score}</li>`;
                });
                leaderboardHTML += '</ol>';

                leaderboardDiv.innerHTML = leaderboardHTML;
                leaderboardDiv.style.display = 'block';

                // Hide clear leaderboard button for global leaderboard
                clearLeaderboardButton.style.display = 'none';
            })
            .catch(error => {
                console.error('Error retrieving leaderboard: ', error);
            });
        }
    }

    function clearLeaderboard() {
        localStorage.removeItem('leaderboard');
        displayLeaderboard('local');
    }
});
