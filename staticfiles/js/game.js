// game.js
let canvas = document.getElementById("gameCanvas");
let ctx = canvas.getContext("2d");

let userImg = new Image();
let enemyImg = new Image();
userImg.src = "/static/img/user3.png";
enemyImg.src = "/static/img/enemy.png";

let player = { x: 300, y: 400, width: 50, height: 50, dy: 0, health: 100 };
let cpu = { x: 300, y: 50, width: 50, height: 50, health: 100, targetX: 300 };

let bullets = [];
let cpuBullets = [];
let keys = {};
let gameOver = false;
let speed = 5;
let cpuFireRate = 80;
let tick = 0;
let cpuDelay = 200;
let difficulty = 'medium';
let lastCpuMoveTime = 0;
let level = 1;
let playerName = "Player";

function drawRect(obj) {
    ctx.fillStyle = obj.color;
    ctx.fillRect(obj.x, obj.y, obj.width, obj.height);
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(userImg, player.x, player.y, player.width, player.height);
    ctx.drawImage(enemyImg, cpu.x, cpu.y, cpu.width, cpu.height);
    bullets.forEach(b => drawRect(b));
    cpuBullets.forEach(b => drawRect(b));
}

function showRoundMessage(newLevel) {
    const msg = document.createElement('div');
    msg.innerText = `Round ${newLevel}`;
    msg.style.position = 'absolute';
    msg.style.top = '40%';
    msg.style.left = '50%';
    msg.style.transform = 'translate(-50%, -50%)';
    msg.style.background = 'black';
    msg.style.color = 'white';
    msg.style.padding = '20px';
    msg.style.fontFamily = "'Press Start 2P', monospace";
    msg.style.fontSize = '18px';
    msg.style.zIndex = 1000;
    document.body.appendChild(msg);
    setTimeout(() => msg.remove(), 1500);
}

function update() {
    player.dy += 0.5;
    player.y += player.dy;
    if (player.y > canvas.height - player.height) {
        player.y = canvas.height - player.height;
        player.dy = 0;
    }

    if (keys["ArrowUp"] && player.y >= canvas.height - player.height) {
        player.dy = -10;
    }
    if (keys["ArrowLeft"]) player.x -= speed;
    if (keys["ArrowRight"]) player.x += speed;

    player.x = Math.max(0, Math.min(canvas.width - player.width, player.x));
    player.y = Math.max(0, Math.min(canvas.height - player.height, player.y));

    if (tick - lastCpuMoveTime > cpuDelay) {
        cpu.targetX = player.x;
        lastCpuMoveTime = tick;
    }
    if (cpu.x < cpu.targetX) cpu.x += 2;
    if (cpu.x > cpu.targetX) cpu.x -= 2;
    cpu.x = Math.max(0, Math.min(canvas.width - cpu.width, cpu.x));

    if (tick % cpuFireRate === 0) {
        cpuBullets.push({ x: cpu.x + cpu.width / 2 - 3, y: cpu.y + cpu.height, width: 6, height: 10, color: "red", dy: speed });
    }

    cpuBullets.forEach(b => b.y += b.dy);
    cpuBullets = cpuBullets.filter(b => b.y < canvas.height);

    bullets.forEach(b => b.y -= b.dy);
    bullets = bullets.filter(b => b.y > 0);

    cpuBullets.forEach(b => {
        if (b.x < player.x + player.width && b.x + b.width > player.x && b.y < player.y + player.height && b.y + b.height > player.y) {
            player.health -= 5;
            b.y = canvas.height + 1;
        }
    });

    bullets.forEach(b => {
        if (b.x < cpu.x + cpu.width && b.x + b.width > cpu.x && b.y < cpu.y + cpu.height && b.y + b.height > cpu.y) {
            cpu.health -= 5;
            b.y = -10;
        }
    });

    document.getElementById("score").innerText = level;
    document.getElementById("healthBarPlayer").style.width = player.health + "%";
    document.getElementById("healthBarCPU").style.width = cpu.health + "%";

    if (player.health <= 0) {
        gameOver = true;
        document.getElementById("game-over").style.display = "block";

        fetch("/submit-score/", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "X-CSRFToken": getCSRFToken()
            },
            body: JSON.stringify({ name: playerName, score: level - 1 })
        }).catch(err => console.error("Failed to submit score", err));
    }

    if (cpu.health <= 0) {
        level++;
        document.getElementById("score").innerText = level;

        cpu = { x: 300, y: 50, width: 50, height: 50, health: 100, targetX: player.x };
        bullets = [];
        cpuBullets = [];

        cpuFireRate = Math.max(30, cpuFireRate - 5);
        cpuDelay = Math.max(30, cpuDelay - 20);
        speed += 0.3;

        showRoundMessage(level);
    }

    tick++;
}

function loop() {
    if (!gameOver) {
        update();
        draw();
        requestAnimationFrame(loop);
    }
}

function startGame(selectedDifficulty) {
    const nameInput = document.getElementById("playerName").value.trim();
    if (nameInput) playerName = nameInput;

    difficulty = selectedDifficulty;

    if (difficulty === 'easy') {
        speed = 4;
        cpuDelay = 250;
        cpuFireRate = 60;
    } else if (difficulty === 'medium') {
        speed = 5;
        cpuDelay = 150;
        cpuFireRate = 80;
    } else if (difficulty === 'hard') {
        speed = 10;
        cpuDelay = 50;
        cpuFireRate = 100;
    } else if (difficulty === 'Xtreme') {
        speed = 20;
        cpuDelay = 10;
        cpuFireRate = 200;
    }

    document.getElementById('main-menu').style.display = 'none';
    document.getElementById('game-ui').style.display = 'block';

    initGame();
    loop();
}

function initGame() {
    document.addEventListener("keydown", e => keys[e.key] = true);
    document.addEventListener("keyup", e => keys[e.key] = false);

    document.addEventListener("keydown", e => {
        if (e.key === " ") {
            bullets.push({
                x: player.x + player.width / 2 - 3,
                y: player.y,
                width: 6,
                height: 10,
                color: "green",
                dy: speed
            });
        }
    });

    document.getElementById("leftBtn").addEventListener("touchstart", () => keys["ArrowLeft"] = true);
    document.getElementById("leftBtn").addEventListener("touchend", () => keys["ArrowLeft"] = false);
    document.getElementById("rightBtn").addEventListener("touchstart", () => keys["ArrowRight"] = true);
    document.getElementById("rightBtn").addEventListener("touchend", () => keys["ArrowRight"] = false);
    document.getElementById("jumpBtn").addEventListener("touchstart", () => {
        if (player.y >= canvas.height - player.height) player.dy = -10;
    });
    document.getElementById("shootBtn").addEventListener("touchstart", () => {
        bullets.push({
            x: player.x + player.width / 2 - 3,
            y: player.y,
            width: 6,
            height: 10,
            color: "green",
            dy: speed
        });
    });
}

function getCSRFToken() {
    return document.cookie
        .split('; ')
        .find(row => row.startsWith('csrftoken='))
        ?.split('=')[1];
}
