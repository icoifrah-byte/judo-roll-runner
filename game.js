const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}
resize();

window.addEventListener("resize", resize);

let gameOver = false;
let power = 0;
let distance = 0;

const player = {
    x: 150,
    y: 0,
    vy: 0,
    size: 50,
    jumping: false,
    rotation: 0
};

const obstacles = [];

function spawnObstacle() {

    if (gameOver) return;

    obstacles.push({
        x: canvas.width + 50,
        width: 40,
        height: 60
    });
}

setInterval(spawnObstacle, 2000);

function jump() {

    if (gameOver) return;
    if (player.jumping) return;

    player.vy = -18;
    player.jumping = true;
}

document.addEventListener("keydown", e => {

    if (e.code === "Space") {
        jump();
    }

    if (gameOver && e.key.toLowerCase() === "r") {
        restartGame();
    }

});

canvas.addEventListener("click", () => {

    if (gameOver) return;

    power = Math.min(100, power + 20);
});

function restartGame() {

    gameOver = false;

    power = 0;
    distance = 0;

    player.y = 0;
    player.vy = 0;
    player.jumping = false;
    player.rotation = 0;

    obstacles.length = 0;
}

function checkCollision() {

    const playerLeft = player.x - 25;
    const playerRight = player.x + 25;

    const playerTop =
        canvas.height - 170 + player.y;

    const playerBottom =
        playerTop + 50;

    for (let o of obstacles) {

        const obstacleLeft = o.x;
        const obstacleRight = o.x + o.width;

        const obstacleTop =
            canvas.height - 120 - o.height;

        const obstacleBottom =
            canvas.height - 120;

        if (
            playerRight > obstacleLeft &&
            playerLeft < obstacleRight &&
            playerBottom > obstacleTop &&
            playerTop < obstacleBottom
        ) {
            gameOver = true;
            return;
        }
    }
}

function update() {

    if (gameOver) return;

    power = Math.max(0, power - 0.05);

    const speed = 3 + power * 0.15;

    distance += speed / 10;

    player.vy += 0.8;
    player.y += player.vy;

    if (player.y > 0) {
        player.y = 0;
        player.vy = 0;
        player.jumping = false;
    }

    player.rotation += speed * 0.03;

    obstacles.forEach(o => {
        o.x -= speed;
    });

    checkCollision();

    document.getElementById("distance").textContent =
        Math.floor(distance);

    document.getElementById("power").textContent =
        Math.floor(power);
}

function draw() {

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // שמיים
    ctx.fillStyle = "#8fd3ff";
    ctx.fillRect(
        0,
        0,
        canvas.width,
        canvas.height
    );

    // רצפה
    ctx.fillStyle = "#7ac96f";
    ctx.fillRect(
        0,
        canvas.height - 120,
        canvas.width,
        120
    );

    // מכשולים
    ctx.fillStyle = "orange";

    obstacles.forEach(o => {

        ctx.fillRect(
            o.x,
            canvas.height - 120 - o.height,
            o.width,
            o.height
        );

    });

    // ג'ודוקא
    ctx.save();

    const py =
        canvas.height - 145 + player.y;

    ctx.translate(
        player.x,
        py
    );

    if (gameOver) {
        ctx.rotate(Math.PI / 2);
    } else {
        ctx.rotate(player.rotation);
    }

    ctx.fillStyle = "white";

    ctx.fillRect(
        -25,
        -25,
        50,
        50
    );

    // חגורה
    ctx.fillStyle = "yellow";

    ctx.fillRect(
        -24,
        0,
        48,
        5
    );

    ctx.restore();

    // Game Over
    if (gameOver) {

        ctx.fillStyle =
            "rgba(0,0,0,0.7)";

        ctx.fillRect(
            0,
            0,
            canvas.width,
            canvas.height
        );

        ctx.fillStyle = "white";

        ctx.font = "50px Arial";

        ctx.fillText(
            "נפסלת!",
            canvas.width / 2 - 80,
            canvas.height / 2 - 20
        );

        ctx.font = "24px Arial";

        ctx.fillText(
            "לחץ R כדי להתחיל מחדש",
            canvas.width / 2 - 120,
            canvas.height / 2 + 30
        );

        ctx.fillText(
            "מרחק: " + Math.floor(distance),
            canvas.width / 2 - 50,
            canvas.height / 2 + 70
        );
    }
}

function loop() {

    update();
    draw();

    requestAnimationFrame(loop);
}

loop();