const canvas = document.getElementById('pong');
const ctx = canvas.getContext('2d');

// Game parameters
const PADDLE_WIDTH = 15;
const PADDLE_HEIGHT = 100;
const PADDLE_MARGIN = 10;
const BALL_RADIUS = 8;

// Player paddle (left)
let player = {
    x: PADDLE_MARGIN,
    y: canvas.height / 2 - PADDLE_HEIGHT / 2,
    width: PADDLE_WIDTH,
    height: PADDLE_HEIGHT,
    score: 0
};

// AI paddle (right)
let ai = {
    x: canvas.width - PADDLE_WIDTH - PADDLE_MARGIN,
    y: canvas.height / 2 - PADDLE_HEIGHT / 2,
    width: PADDLE_WIDTH,
    height: PADDLE_HEIGHT,
    score: 0,
    speed: 4
};

// Ball
let ball = {
    x: canvas.width / 2,
    y: canvas.height / 2,
    vx: 5 * (Math.random() > 0.5 ? 1 : -1),
    vy: 3 * (Math.random() > 0.5 ? 1 : -1),
    radius: BALL_RADIUS
};

// Mouse controls
canvas.addEventListener('mousemove', function (e) {
    let rect = canvas.getBoundingClientRect();
    let mouseY = e.clientY - rect.top;
    player.y = mouseY - player.height / 2;
    // Clamp paddle to canvas
    player.y = Math.max(0, Math.min(canvas.height - player.height, player.y));
});

// Draw everything
function draw() {
    // Clear
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw net
    ctx.setLineDash([8, 12]);
    ctx.beginPath();
    ctx.moveTo(canvas.width / 2, 0);
    ctx.lineTo(canvas.width / 2, canvas.height);
    ctx.strokeStyle = "#fff";
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.setLineDash([]);

    // Draw paddles
    ctx.fillStyle = "#fff";
    ctx.fillRect(player.x, player.y, player.width, player.height);
    ctx.fillRect(ai.x, ai.y, ai.width, ai.height);

    // Draw ball
    ctx.beginPath();
    ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
    ctx.fill();

    // Draw scores
    ctx.font = "32px Arial";
    ctx.fillText(player.score, canvas.width / 4, 40);
    ctx.fillText(ai.score, 3 * canvas.width / 4, 40);
}

// Ball & paddle collision
function collide(paddle, ball) {
    return (
        ball.x - ball.radius < paddle.x + paddle.width &&
        ball.x + ball.radius > paddle.x &&
        ball.y - ball.radius < paddle.y + paddle.height &&
        ball.y + ball.radius > paddle.y
    );
}

// AI movement
function updateAI() {
    // Simple AI: move paddle center toward ball center
    let aiCenter = ai.y + ai.height / 2;
    if (ball.y < aiCenter - 10) {
        ai.y -= ai.speed;
    } else if (ball.y > aiCenter + 10) {
        ai.y += ai.speed;
    }
    // Clamp AI paddle to canvas
    ai.y = Math.max(0, Math.min(canvas.height - ai.height, ai.y));
}

// Update game state
function update() {
    // Move ball
    ball.x += ball.vx;
    ball.y += ball.vy;

    // Top and bottom wall collision
    if (ball.y - ball.radius < 0 || ball.y + ball.radius > canvas.height) {
        ball.vy *= -1;
    }

    // Player paddle collision
    if (collide(player, ball)) {
        ball.x = player.x + player.width + ball.radius; // Prevent sticking
        ball.vx *= -1;
        // Add some "english" based on where it hit the paddle
        let collidePoint = ball.y - (player.y + player.height / 2);
        ball.vy += collidePoint * 0.15;
    }

    // AI paddle collision
    if (collide(ai, ball)) {
        ball.x = ai.x - ball.radius; // Prevent sticking
        ball.vx *= -1;
        let collidePoint = ball.y - (ai.y + ai.height / 2);
        ball.vy += collidePoint * 0.15;
    }

    // Left/right walls (score)
    if (ball.x - ball.radius < 0) {
        ai.score++;
        resetBall();
    } else if (ball.x + ball.radius > canvas.width) {
        player.score++;
        resetBall();
    }

    updateAI();
}

// Reset ball to center
function resetBall() {
    ball.x = canvas.width / 2;
    ball.y = canvas.height / 2;
    // Alternate ball direction
    ball.vx = 5 * (Math.random() > 0.5 ? 1 : -1);
    ball.vy = 3 * (Math.random() > 0.5 ? 1 : -1);
}

// Main game loop
function loop() {
    update();
    draw();
    requestAnimationFrame(loop);
}

// Start the game
loop();