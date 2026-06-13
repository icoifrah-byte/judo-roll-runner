const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

const judokaImg=new Image(); judokaImg.src="assets/judoka.png";
const coneImg=new Image(); coneImg.src="assets/cone.png";
const dojoImg=new Image(); dojoImg.src="assets/dojo-bg.png";
let bgX=0;

function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}
resize();
window.addEventListener("resize", resize);

let gameOver = false;
let power = 0;
let distance = 0;
let combo = 0;

const feedbackEl = document.getElementById("feedback");

const player = {
    x: 150,
    y: 0,
    vy: 0,
    jumping: false,
    rotation: 0
};

const obstacles = [];

function showFeedback(text) {
    feedbackEl.textContent = text;

    setTimeout(() => {
        if (feedbackEl.textContent === text) {
            feedbackEl.textContent = "";
        }
    }, 1500);
}

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

function restartGame() {

    gameOver = false;
    power = 0;
    distance = 0;
    combo = 0;

    player.y = 0;
    player.vy = 0;
    player.jumping = false;
    player.rotation = 0;

    obstacles.length = 0;

    feedbackEl.textContent = "";
}

/* -------------------------
   ROLL DETECTION
------------------------- */

let drawing = false;
let points = [];

function beginGesture(x, y) {

    if (gameOver) return;

    drawing = true;
    points = [[x, y]];
}

function moveGesture(x, y) {

    if (!drawing) return;

    points.push([x, y]);
}

function endGesture() {

    if (!drawing) return;

    drawing = false;

    if (points.length < 15) {
        points = [];
        return;
    }

    const first = points[0];
    const last = points[points.length - 1];

    const dx = last[0] - first[0];
    const dy = last[1] - first[1];

    // swipe up jump
    if (
        dy < -80 &&
        Math.abs(dy) > Math.abs(dx)
    ) {
        jump();
        points = [];
        return;
    }

    let dirs = [];

    for (let i = 1; i < points.length; i += 3) {

        const mx =
            points[i][0] - points[i - 1][0];

        const my =
            points[i][1] - points[i - 1][1];

        if (Math.abs(mx) > Math.abs(my)) {
            dirs.push(mx > 0 ? "R" : "L");
        } else {
            dirs.push(my > 0 ? "D" : "U");
        }
    }

    let changes = 0;

    for (let i = 1; i < dirs.length; i++) {
        if (dirs[i] !== dirs[i - 1]) {
            changes++;
        }
    }

    let minX = Infinity;
    let maxX = -Infinity;
    let minY = Infinity;
    let maxY = -Infinity;

    points.forEach(p => {
        minX = Math.min(minX, p[0]);
        maxX = Math.max(maxX, p[0]);

        minY = Math.min(minY, p[1]);
        maxY = Math.max(maxY, p[1]);
    });

    const width = maxX - minX;
    const height = maxY - minY;

    if (
        changes >= 4 &&
        width > 60 &&
        height > 60
    ) {

        const quality =
            Math.min(width, height);

        if (quality > 150) {

            power = Math.min(
                100,
                power + 30
            );

            combo++;

            showFeedback(
                "🔥 PERFECT ROLL"
            );

        } else {

            power = Math.min(
                100,
                power + 20
            );

            combo++;

            showFeedback(
                "🥋 GOOD ROLL"
            );
        }

    } else {

        combo = 0;
    }

    points = [];
}

/* mouse */

canvas.addEventListener(
    "mousedown",
    e => beginGesture(
        e.clientX,
        e.clientY
    )
);

canvas.addEventListener(
    "mousemove",
    e => moveGesture(
        e.clientX,
        e.clientY
    )
);

canvas.addEventListener(
    "mouseup",
    endGesture
);

/* touch */

canvas.addEventListener(
    "touchstart",
    e => {

        const t = e.touches[0];

        beginGesture(
            t.clientX,
            t.clientY
        );
    }
);

canvas.addEventListener(
    "touchmove",
    e => {

        const t = e.touches[0];

        moveGesture(
            t.clientX,
            t.clientY
        );
    }
);

canvas.addEventListener(
    "touchend",
    endGesture
);

/* -------------------------
   COLLISION
------------------------- */

function checkCollision() {

    const playerLeft = player.x - 25;
    const playerRight = player.x + 25;

    const playerTop =
        canvas.height - 170 + player.y;

    const playerBottom =
        playerTop + 50;

    for (let o of obstacles) {

        const obstacleLeft = o.x;
        const obstacleRight =
            o.x + o.width;

        const obstacleTop =
            canvas.height -
            120 -
            o.height;

        const obstacleBottom =
            canvas.height - 120;

        if (
            playerRight >
                obstacleLeft &&
            playerLeft <
                obstacleRight &&
            playerBottom >
                obstacleTop &&
            playerTop <
                obstacleBottom
        ) {

            gameOver = true;
            return;
        }
    }
}

function update() {

    if (gameOver) return;

    power = Math.max(
        0,
        power - 0.05
    );

    const speed =
        3 +
        power * 0.15 +
        combo * 0.2;

    distance += speed / 10;

    player.vy += 0.8;
    player.y += player.vy;

    if (player.y > 0) {

        player.y = 0;
        player.vy = 0;
        player.jumping = false;
    }

    player.rotation +=
        speed * 0.03;

    obstacles.forEach(o => {
        o.x -= speed;
    });

    checkCollision();

    document.getElementById(
        "distance"
    ).textContent =
        Math.floor(distance);

    document.getElementById(
        "power"
    ).textContent =
        Math.floor(power);

    document.getElementById(
        "combo"
    ).textContent =
        combo;
}

function draw() {

    ctx.clearRect(
        0,
        0,
        canvas.width,
        canvas.height
    );

    bgX-=2;if(bgX<=-canvas.width) bgX=0;
    ctx.drawImage(dojoImg,bgX,0,canvas.width,canvas.height);
    ctx.drawImage(dojoImg,bgX+canvas.width,0,canvas.width,canvas.height);

    obstacles.forEach(o => {

        ctx.fillStyle = "orange";

        ctx.fillRect(
            o.x,
            canvas.height -
                120 -
                o.height,
            o.width,
            o.height
        );
    });

    // draw gesture path

    if (points.length > 1) {

        ctx.beginPath();

        ctx.moveTo(
            points[0][0],
            points[0][1]
        );

        for (
            let i = 1;
            i < points.length;
            i++
        ) {

            ctx.lineTo(
                points[i][0],
                points[i][1]
            );
        }

        ctx.strokeStyle =
            "#0066ff";

        ctx.lineWidth = 5;

        ctx.stroke();
    }

    ctx.save();

    const py =
        canvas.height - 145 +
        player.y;

    ctx.translate(
        player.x,
        py
    );

    if (gameOver) {
        ctx.rotate(Math.PI / 2);
    } else {
        ctx.rotate(player.rotation);
    }

    ctx.drawImage(judokaImg,-35,-55,70,105);

    ctx.restore();

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

        ctx.font =
            "50px Arial";

        ctx.fillText(
            "נפסלת!",
            canvas.width / 2 - 80,
            canvas.height / 2
        );
    }
}

function loop() {

    update();
    draw();

    requestAnimationFrame(loop);
}

loop();