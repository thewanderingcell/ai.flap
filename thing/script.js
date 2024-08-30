const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

canvas.width = 320;
canvas.height = 480;

// Game variables
const bird = {
    x: 50,
    y: 150,
    width: 20,
    height: 20,
    gravity: 0.1,
    lift: -4,
    velocity: 0
};

const pipes = [];
const pipeWidth = 50;
const pipeGap = 200; // Increased gap size
const floorHeight = 60; // Height of the floor
let frame = 0;
let score = 0;
let gameOver = false;
let spacePressed = false;  // Flag to track spacebar press

function drawBird() {
    ctx.fillStyle = "yellow";
    ctx.fillRect(bird.x, bird.y, bird.width, bird.height);
}

function drawPipes() {
    ctx.fillStyle = "green";
    pipes.forEach(pipe => {
        // Draw top pipe
        ctx.fillRect(pipe.x, 0, pipeWidth, pipe.top);
        // Draw bottom pipe
        ctx.fillRect(pipe.x, canvas.height - pipe.bottom - floorHeight, pipeWidth, pipe.bottom);
    });
}

function drawFloor() {
    ctx.fillStyle = "darkgreen";
    ctx.fillRect(0, canvas.height - floorHeight, canvas.width, floorHeight);
}

function updateBird() {
    bird.velocity += bird.gravity;
    bird.y += bird.velocity;

    // Check for collision with the floor
    if (bird.y + bird.height > canvas.height - floorHeight) {
        bird.y = canvas.height - floorHeight - bird.height;
        bird.velocity = 0;
        gameOver = true;
    }

    // Check for collision with the ceiling
    if (bird.y < 0) {
        bird.y = 0;
        bird.velocity = 0;
        gameOver = true;
    }
}

function updatePipes() {
    if (frame % 90 === 0) {
        const maxPipeHeight = canvas.height - pipeGap - floorHeight - 20;
        const topHeight = Math.floor(Math.random() * (maxPipeHeight - 20)) + 20;
        const bottomHeight = canvas.height - topHeight - pipeGap - floorHeight;
        pipes.push({ x: canvas.width, top: topHeight, bottom: bottomHeight, scored: false });
    }

    pipes.forEach((pipe, index) => {
        pipe.x -= 2;

        // Calculate the middle of the pipe's gap
        const pipeMiddleX = pipe.x + pipeWidth / 2;

        // Check if the bird's X position is at the middle of the pipe and score hasn't been awarded
        if (!pipe.scored && bird.x > pipeMiddleX - bird.width / 2 && bird.x < pipeMiddleX + bird.width / 2) {
            score++;
            pipe.scored = true; // Mark this pipe as scored
        }

        // Remove pipes that have gone off-screen
        if (pipe.x + pipeWidth < 0) {
            pipes.splice(index, 1);
        }

        // Check for collision with the bird
        if (
            bird.x < pipe.x + pipeWidth &&
            bird.x + bird.width > pipe.x &&
            (bird.y < pipe.top || bird.y + bird.height > canvas.height - pipe.bottom - floorHeight)
        ) {
            gameOver = true;
        }
    });
}

function drawScore() {
    ctx.fillStyle = "white";
    ctx.font = "20px Arial";
    ctx.fillText(`Score: ${score}`, 10, 25);
}

function resetGame() {
    bird.y = 150;
    bird.velocity = 0;
    pipes.length = 0;
    score = 0;
    frame = 0;
    gameOver = false;
    spacePressed = false;  // Reset the spacebar flag
}

function gameLoop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (!gameOver) {
        updateBird();
        updatePipes();
        drawFloor(); // Draw the floor rectangle
        drawBird();
        drawPipes();
        drawScore();
        frame++;
    } else {
        ctx.fillStyle = "red";
        ctx.font = "30px Arial";
        ctx.fillText("Game Over", 70, canvas.height / 2);
        ctx.fillStyle = "white";
        ctx.font = "20px Arial";
        ctx.fillText(`Final Score: ${score}`, 90, canvas.height / 2 + 30);
        ctx.fillText("Press Space to Restart", 40, canvas.height / 2 + 60);
    }

    requestAnimationFrame(gameLoop);
}

gameLoop();

// Handle space bar input for jumping and restarting the game
document.addEventListener('keydown', function(event) {
    if (event.code === 'Space') {
        if (!spacePressed && !gameOver) { // Only jump if space was not already pressed
            bird.velocity = bird.lift;
            spacePressed = true; // Set flag to prevent repeated jumps
        } else if (gameOver) {
            resetGame();
        }
    }
});

document.addEventListener('keyup', function(event) {
    if (event.code === 'Space') {
        spacePressed = false; // Reset flag when spacebar is released
    }
});
