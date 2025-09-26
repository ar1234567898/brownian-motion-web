const canvas = document.createElement('canvas');
const ctx = canvas.getContext('2d');
document.body.appendChild(canvas);

const numOfParticlesInput = document.querySelector('.numParticles');
const temperatureInput = document.querySelector('.temperature');
const massInputs = document.querySelectorAll('.mass-menu input[name="mass"]');
const pushMenu = document.querySelector('.push-menu');
const pushStrengthInput = document.getElementById('pushStrength');
const pushStrengthValue = document.getElementById('pushStrengthValue');
const pushRadiusInput = document.getElementById('pushRadius');
const pushRadiusValue = document.getElementById('pushRadiusValue');

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
let lastSoundTime = 0;

function playCollisionSound() {
    const now = performance.now();
    if (now - lastSoundTime < 100) return;
    lastSoundTime = now;
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = 'sine'; // або 'triangle' для ще м'якшого звуку
    osc.frequency.value = 320 + Math.random() * 80; // нижча частота
    gain.gain.value = 0.04; // тихіше
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.start();
    osc.stop(audioCtx.currentTime + 0.09); // трохи довше
    osc.onended = () => {
        osc.disconnect();
        gain.disconnect();
    };
}

let numParticles = numOfParticlesInput ? parseInt(numOfParticlesInput.value, 10) : 500;
let temperature = temperatureInput ? parseInt(temperatureInput.value, 10) : 50;
let particles = [];

const MASS_OPTIONS = [
    { label: 'Ніяка', value: null },
    { label: 'Мала', value: 3 },
    { label: 'Середня', value: 6 },
    { label: 'Велика', value: 10 }
];
let selectedMass = null;
let pushStrength = parseFloat(pushStrengthInput.value);
let pushRadius = parseInt(pushRadiusInput.value, 10);

// Вибір маси через меню
if (massInputs.length) {
    massInputs.forEach(input => {
        input.addEventListener('change', e => {
            selectedMass = e.target.value === '' ? null : parseFloat(e.target.value);
            if (pushMenu) {
                pushMenu.style.display = selectedMass === null ? 'block' : 'none';
            }
        });
        if (input.checked && pushMenu) {
            pushMenu.style.display = input.value === '' ? 'block' : 'none';
        }
    });
}

function getSpeed() {
    return 0.5 + (temperature / 100) * 2.5;
}

function getColorByMass(size) {
    if (size < 4) return '#2196f3';      // Мала — синя
    if (size < 7) return '#4caf50';      // Середня — зелена
    return '#e53935';                    // Велика — червона
}

class Particle {
    constructor(x, y, size = 10) {
        this.x = x;
        this.y = y;
        this.size = size;
        this.setRandomSpeed();
    }

    setRandomSpeed() {
        const baseSpeed = getSpeed();
        const massFactor = 4 / this.size;
        const speed = baseSpeed * massFactor;
        this.speedX = (Math.random() - 0.5) * speed;
        this.speedY = (Math.random() - 0.5) * speed;
    }

    update() {
        this.x += this.speedX;
        this.y += this.speedY;
        if (this.x < 0 || this.x > canvas.width) this.speedX *= -1;
        if (this.y < 0 || this.y > canvas.height) this.speedY *= -1;
    }

    draw() {
        ctx.fillStyle = getColorByMass(this.size);
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
    }
}

function handleCollisions() {
    for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
            const p1 = particles[i];
            const p2 = particles[j];
            const dx = p2.x - p1.x;
            const dy = p2.y - p1.y;
            const dist = Math.hypot(dx, dy);
            if (dist < p1.size + p2.size) {
                const m1 = p1.size * p1.size;
                const m2 = p2.size * p2.size;
                const nx = dx / dist;
                const ny = dy / dist;
                const v1 = p1.speedX * nx + p1.speedY * ny;
                const v2 = p2.speedX * nx + p2.speedY * ny;
                const v1After = (v1 * (m1 - m2) + 2 * m2 * v2) / (m1 + m2);
                const v2After = (v2 * (m2 - m1) + 2 * m1 * v1) / (m1 + m2);
                p1.speedX += (v1After - v1) * nx;
                p1.speedY += (v1After - v1) * ny;
                p2.speedX += (v2After - v2) * nx;
                p2.speedY += (v2After - v2) * ny;
                const overlap = (p1.size + p2.size) - dist;
                const moveX = nx * (overlap / 2);
                const moveY = ny * (overlap / 2);
                p1.x -= moveX;
                p1.y -= moveY;
                p2.x += moveX;
                p2.y += moveY;
                playCollisionSound();
            }
        }
    }
}

function init() {
    particles = [];
    for (let i = 0; i < numParticles; i++) {
        const randomSize = 3 + Math.random() * 3;
        particles.push(new Particle(
            Math.random() * canvas.width,
            Math.random() * canvas.height,
            randomSize
        ));
    }
}

function updateParticleSpeeds() {
    particles.forEach(p => p.setRandomSpeed());
}

pushStrengthInput.addEventListener('input', e => {
    pushStrength = parseFloat(e.target.value);
    pushStrengthValue.textContent = pushStrength;
});
pushRadiusInput.addEventListener('input', e => {
    pushRadius = parseInt(e.target.value, 10);
    pushRadiusValue.textContent = pushRadius;
});

function pushParticlesFromCursor(x, y) {
    particles.forEach(p => {
        const dx = p.x - x;
        const dy = p.y - y;
        const dist = Math.hypot(dx, dy);
        if (dist < pushRadius && dist > 0.1) {
            const nx = dx / dist;
            const ny = dy / dist;
            p.speedX += nx * pushStrength * (1 - dist / pushRadius) / p.size;
            p.speedY += ny * pushStrength * (1 - dist / pushRadius) / p.size;
        }
    });
}

let paused = false;
const pauseBtn = document.querySelector('.pause-btn');

if (pauseBtn) {
    pauseBtn.addEventListener('click', () => {
        paused = !paused;
        pauseBtn.textContent = paused ? '▶️ Відновити' : '⏸ Пауза';
        if (!paused) animate();
    });
}

let mouseDown = false;
let mouseX = 0;
let mouseY = 0;

canvas.addEventListener('mousedown', (e) => {
    if (e.button === 0) {
        mouseDown = true;
        const rect = canvas.getBoundingClientRect();
        mouseX = e.clientX - rect.left;
        mouseY = e.clientY - rect.top;
        if (selectedMass !== null) {
            particles.push(new Particle(mouseX, mouseY, selectedMass));
        }
    }
});

canvas.addEventListener('mouseup', (e) => {
    if (e.button === 0) {
        mouseDown = false;
    }
});

canvas.addEventListener('mousemove', (e) => {
    const rect = canvas.getBoundingClientRect();
    mouseX = e.clientX - rect.left;
    mouseY = e.clientY - rect.top;
});

function animate() {
    if (paused) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    handleCollisions();
    if (mouseDown && selectedMass === null) {
        pushParticlesFromCursor(mouseX, mouseY);
    }
    particles.forEach(particle => {
        particle.update();
        particle.draw();
    });

    // ОНОВЛЕННЯ температури та повзунка
    const actualTemperature = calculateTemperature();
    temperature = actualTemperature;
    if (temperatureInput) {
        temperatureInput.value = temperature;
    }

    requestAnimationFrame(animate);
}

window.addEventListener('resize', () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    init();
});

function adjustParticles() {
    const diff = numParticles - particles.length;
    if (diff > 0) {
        // Додаємо нові частинки
        for (let i = 0; i < diff; i++) {
            const randomSize = 3 + Math.random() * 3;
            particles.push(new Particle(
                Math.random() * canvas.width,
                Math.random() * canvas.height,
                randomSize
            ));
        }
    } else if (diff < 0) {
        // Видаляємо зайві частинки
        particles.splice(diff);
    }
}

// Замість init() при зміні кількості частинок:
if (numOfParticlesInput) {
    numOfParticlesInput.value = numParticles;
    numOfParticlesInput.addEventListener('input', (e) => {
        numParticles = parseInt(e.target.value, 10) || 0;
        adjustParticles(); // Викликаємо цю функцію
    });
}

// Викликайте init() лише при старті або зміні розміру canvas

if (temperatureInput) {
    temperatureInput.value = temperature;
    temperatureInput.addEventListener('input', (e) => {
        temperature = parseInt(e.target.value, 10) || 0;
        updateParticleSpeeds();
    });
}

document.addEventListener('DOMContentLoaded', () => {
  const content = document.querySelector('.content');
  const hideBtn = document.querySelector('.hide-content-btn');
  const showBtn = document.querySelector('.show-content-btn');

  if (hideBtn && showBtn && content) {
    hideBtn.addEventListener('click', () => {
      content.classList.add('hidden');
      setTimeout(() => {
        showBtn.style.display = 'block';
      }, 400);
    });

    showBtn.addEventListener('click', () => {
      content.classList.remove('hidden');
      showBtn.style.display = 'none';
    });
  }
});

const themeToggle = document.getElementById('themeToggle');
if (themeToggle) {
    themeToggle.addEventListener('change', () => {
        document.body.classList.toggle('dark', themeToggle.checked);
    });
}

function calculateTemperature() {
    // Температура ~ середній квадрат швидкості (кінетична енергія)
    let sum = 0;
    particles.forEach(p => {
        sum += p.speedX * p.speedX + p.speedY * p.speedY;
    });
    const avg = sum / particles.length;
    // Можна масштабувати для зручності (наприклад, множити на 30)
    return Math.round(avg * 30);
}

init();
animate();