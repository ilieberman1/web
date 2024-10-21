// script.js

document.addEventListener('DOMContentLoaded', function() {
    const playVideoButton = document.getElementById('play-video');
    const playGameButton = document.getElementById('play-game');
    const videoContainer = document.getElementById('video-container');
    const ninjaVideo = document.getElementById('ninja-video');
    const gameCanvas = document.getElementById('game-canvas');
    const canvas = gameCanvas.getContext('2d');

    // List of Ninja's video IDs (ensure these are valid)
    const videoIds = ['ryNMM5pMPr0', 'RbyD5SdzlTk', 'oTh0BatQlRE'];

    // Load images
    const carImage = new Image();
    carImage.src = 'car.jpg'; // Update with correct path

    const obstacleImage = new Image();
    obstacleImage.src = 'download.webp'; // Update with correct path

    // Image dimensions
    const carWidth = 50; // Set to your car image width
    const carHeight = 100; // Set to your car image height

    const initialObstacleWidth = 50; // Initial obstacle width
    const initialObstacleHeight = 50; // Initial obstacle height

    // Game variables
    let carX = gameCanvas.width / 2 - carWidth / 2;
    let obstacles = [];
    let obstacleSpeed = 5; // Initial obstacle speed
    let groundY = gameCanvas.height - carHeight - 10;
    let isGameOver = false;
    let score = 0; // Initialize score

    // Difficulty variables
    let gameTime = 0; // Time elapsed since game start
    let difficultyInterval = 5000; // Increase difficulty every 5 seconds
    let lastDifficultyIncrease = 0;
    let maxObstacleSpeed = 15; // Maximum obstacle speed
    let maxObstacleSize = 100; // Maximum obstacle size

    // Event listeners
    playVideoButton.addEventListener('click', function() {
        const randomIndex = Math.floor(Math.random() * videoIds.length);
        const videoId = videoIds[randomIndex];
        ninjaVideo.src = `https://www.youtube.com/embed/${videoId}?autoplay=1`;
        videoContainer.style.display = 'block';
        gameCanvas.style.display = 'none';
    });

    playGameButton.addEventListener('click', function() {
        videoContainer.style.display = 'none';
        gameCanvas.style.display = 'block';
        startGame();
    });

    function startGame() {
        obstacles = [];
        isGameOver = false;
        carX = gameCanvas.width / 2 - carWidth / 2;
        score = 0; // Reset score
        obstacleSpeed = 5; // Reset obstacle speed
        obstacleWidth = initialObstacleWidth; // Reset obstacle size
        obstacleHeight = initialObstacleHeight;
        gameTime = 0; // Reset game time
        lastDifficultyIncrease = 0; // Reset difficulty timer

        // Ensure images are loaded before starting the game
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
        carX = mouseX - carWidth / 2; // Adjust for car width

        // Keep the car within canvas boundaries
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

            // Increase obstacle speed
            if (obstacleSpeed < maxObstacleSpeed) {
                obstacleSpeed += 0.5; // Increment speed
            }

            // Increase obstacle size
            if (obstacleWidth < maxObstacleSize && obstacleHeight < maxObstacleSize) {
                obstacleWidth += 5;
                obstacleHeight += 5;
            }
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
            obstacle.y += obstacleSpeed * (deltaTime / 16); // Adjust movement based on deltaTime

            // Check for collision
            if (
                obstacle.x < carX + carWidth &&
                obstacle.x + obstacle.width > carX &&
                obstacle.y < groundY + carHeight &&
                obstacle.y + obstacle.height > groundY
            ) {
                isGameOver = true;
                alert('Game Over! Your score: ' + score);
                gameCanvas.style.display = 'none';
                return;
            }

            // Check if obstacle has passed the car
            if (!obstacle.passed && obstacle.y > groundY + carHeight) {
                score++;
                obstacle.passed = true;
            }
        }

        // Remove off-screen obstacles
        obstacles = obstacles.filter(obstacle => obstacle.y < gameCanvas.height);
    }

    // Initial obstacle size
    let obstacleWidth = initialObstacleWidth;
    let obstacleHeight = initialObstacleHeight;

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
});
