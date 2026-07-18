// SETUP: grab canvas + drawing context:
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const W = canvas.width;
const H = canvas.height;

// GAME STATE:
let score = 0;
let lives = 3;
let level = 1;
let gameRunning = false;   // true once ball is launched
let gameOver = false;

// Paddle: a rectangle the player moves horizontally
const paddle = {
  width: 90,
  height: 12,
  x: W / 2 - 45,
  y: H - 30,
  speed: 7,
  dx: 0            // current horizontal velocity (set by key state)
};

// Ball: position, velocity, radius
const ball = {
  x: W / 2,
  y: paddle.y - 10,
  radius: 7,
  speed: 4.5,
  dx: 0,
  dy: 0
};

// Bricks: a 2D grid. Each brick has a status (1 = alive, 0 = destroyed)
const brickInfo = {
  rows: 5,
  cols: 8,
  width: 68,
  height: 20,
  padding: 8,
  offsetTop: 50,
  offsetLeft: 20
};

// Row colors — gives a visual "value" gradient, top rows worth more
const rowColors = ['#c3d9f7', '#9fc2f2', '#7aa8e8', '#5a8fd6', '#3a6bb8'];
let bricks = [];

function createBricks() {
  bricks = [];
  for (let r = 0; r < brickInfo.rows; r++) {
    bricks[r] = [];
    for (let c = 0; c < brickInfo.cols; c++) {
      bricks[r][c] = { x: 0, y: 0, status: 1 };
    }
  }
}
createBricks();

// INPUT HANDLING:
let rightPressed = false;
let leftPressed = false;

document.addEventListener('keydown', (e) => {
  if (e.key === 'ArrowRight') rightPressed = true;
  if (e.key === 'ArrowLeft') leftPressed = true;
  if (e.key === ' ') {
    e.preventDefault();
    launchBall();
  }
});

document.addEventListener('keyup', (e) => {
  if (e.key === 'ArrowRight') rightPressed = false;
  if (e.key === 'ArrowLeft') leftPressed = false;
});

// Mouse control: paddle follows cursor x-position
canvas.addEventListener('mousemove', (e) => {
  const rect = canvas.getBoundingClientRect();
  const scale = W / rect.width; // account for CSS scaling on small screens
  const mouseX = (e.clientX - rect.left) * scale;
  paddle.x = Math.min(Math.max(mouseX - paddle.width / 2, 0), W - paddle.width);
});

document.getElementById('restartBtn').addEventListener('click', resetGame);

// GAME LOGIC:
function launchBall() {
  if (gameRunning || gameOver) return;
  gameRunning = true;
  // Launch at a slight random angle so it's not perfectly vertical
  const angle = (Math.random() * 0.6 - 0.3); // radians, -0.3 to 0.3
  ball.dx = ball.speed * Math.sin(angle);
  ball.dy = -ball.speed * Math.cos(angle);
}

function movePaddle() {
  if (rightPressed) paddle.x += paddle.speed;
  if (leftPressed) paddle.x -= paddle.speed;
  // Clamp so paddle can't leave the canvas
  paddle.x = Math.max(0, Math.min(W - paddle.width, paddle.x));
}

function moveBall() {
  if (!gameRunning) {
    // Ball rests on paddle before launch
    ball.x = paddle.x + paddle.width / 2;
    ball.y = paddle.y - ball.radius - 1;
    return;
  }

  ball.x += ball.dx;
  ball.y += ball.dy;

  // Wall collisions: left/right bounce, top bounces, bottom = lose life
  if (ball.x - ball.radius < 0 || ball.x + ball.radius > W) {
    ball.dx *= -1;
  }
  if (ball.y - ball.radius < 0) {
    ball.dy *= -1;
  }
  if (ball.y + ball.radius > H) {
    loseLife();
    return;
  }

  // Paddle collision: only bounce if ball is moving downward and overlaps paddle
  if (
    ball.dy > 0 &&
    ball.y + ball.radius >= paddle.y &&
    ball.y + ball.radius <= paddle.y + paddle.height &&
    ball.x >= paddle.x &&
    ball.x <= paddle.x + paddle.width
  ) {
    // Where the ball hit the paddle (-1 = far left, 0 = center, 1 = far right)
    const hitPos = (ball.x - (paddle.x + paddle.width / 2)) / (paddle.width / 2);
    const maxAngle = Math.PI / 3; // 60 degrees max
    const angle = hitPos * maxAngle;

    ball.dx = ball.speed * Math.sin(angle);
    ball.dy = -ball.speed * Math.cos(angle);
  }

  checkBrickCollisions();
}

function checkBrickCollisions() {
  for (let r = 0; r < brickInfo.rows; r++) {
    for (let c = 0; c < brickInfo.cols; c++) {
      const brick = bricks[r][c];
      if (brick.status !== 1) continue;

      if (
        ball.x + ball.radius > brick.x &&
        ball.x - ball.radius < brick.x + brickInfo.width &&
        ball.y + ball.radius > brick.y &&
        ball.y - ball.radius < brick.y + brickInfo.height
      ) {
        ball.dy *= -1;
        brick.status = 0;
        score += (brickInfo.rows - r) * 10; // top rows worth more
        updateHUD();

        if (allBricksCleared()) nextLevel();
        return; // only handle one collision per frame
      }
    }
  }
}

function allBricksCleared() {
  return bricks.every(row => row.every(b => b.status === 0));
}

function nextLevel() {
  level++;
  ball.speed += 0.5;
  gameRunning = false;
  createBricks();
  updateHUD();
}

function loseLife() {
  lives--;
  updateHUD();
  if (lives <= 0) {
    endGame(false);
  } else {
    gameRunning = false;
    ball.dx = 0;
    ball.dy = 0;
  }
}

function endGame(won) {
  gameOver = true;
  gameRunning = false;
  const overlay = document.getElementById('overlay');
  document.getElementById('overlayTitle').textContent = won ? 'YOU WIN' : 'GAME OVER';
  document.getElementById('overlayMsg').textContent = `Final score: ${score}`;
  overlay.classList.add('show');
}

function resetGame() {
  score = 0;
  lives = 3;
  level = 1;
  ball.speed = 4.5;
  gameOver = false;
  gameRunning = false;
  paddle.x = W / 2 - paddle.width / 2;
  ball.dx = 0;
  ball.dy = 0;
  createBricks();
  updateHUD();
  document.getElementById('overlay').classList.remove('show');
}

function updateHUD() {
  document.getElementById('score').textContent = score;
  document.getElementById('lives').textContent = lives;
  document.getElementById('level').textContent = level;
}

// DRAWING:
function drawBricks() {
  for (let r = 0; r < brickInfo.rows; r++) {
    for (let c = 0; c < brickInfo.cols; c++) {
      const brick = bricks[r][c];
      if (brick.status !== 1) continue;

      const x = brickInfo.offsetLeft + c * (brickInfo.width + brickInfo.padding);
      const y = brickInfo.offsetTop + r * (brickInfo.height + brickInfo.padding);
      brick.x = x;
      brick.y = y;

      ctx.fillStyle = rowColors[r % rowColors.length];
      ctx.shadowColor = rowColors[r % rowColors.length];
      ctx.shadowBlur = 6;
      ctx.fillRect(x, y, brickInfo.width, brickInfo.height);
      ctx.shadowBlur = 0;
    }
  }
}

function drawPaddle() {
  ctx.fillStyle = '#9fc2f2';
  ctx.shadowColor = '#5a8fd6';
  ctx.shadowBlur = 10;
  ctx.fillRect(paddle.x, paddle.y, paddle.width, paddle.height);
  ctx.shadowBlur = 0;
}
 
function drawBall() {
  ctx.beginPath();
  ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
  ctx.fillStyle = '#eef4fd';
  ctx.shadowColor = '#9fc2f2';
  ctx.shadowBlur = 12;
  ctx.fill();
  ctx.closePath();
  ctx.shadowBlur = 0;
}
 
function drawPrompt() {
  if (gameRunning || gameOver) return;
  ctx.fillStyle = '#3d5f8a';
  ctx.font = '12px "JetBrains Mono", monospace';
  ctx.textAlign = 'center';
  ctx.fillText('PRESS SPACE TO LAUNCH', W / 2, H / 2);
}

function draw() {
  ctx.clearRect(0, 0, W, H);
  drawBricks();
  drawPaddle();
  drawBall();
  drawPrompt();
}

// GAME LOOP
// requestAnimationFrame calls this function ~60 times per second.
// Each call: update state -> draw -> schedule next frame.
function gameLoop() {
  if (!gameOver) {
    movePaddle();
    moveBall();
    draw();
  }
  requestAnimationFrame(gameLoop);
}

updateHUD();
gameLoop();