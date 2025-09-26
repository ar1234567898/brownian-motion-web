const canvas = document.createElement('canvas');
const ctx = canvas.getContext('2d');
document.body.appendChild(canvas);

const numOfParticlesInput = document.querySelector('.numParticles');
const temperatureInput = document.querySelector('.temperature');

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let numParticles = numOfParticlesInput ? parseInt(numOfParticlesInput.value, 10) : 500;
let temperature = temperatureInput ? parseInt(temperatureInput.value, 10) : 50;
let particles = [];

function getSpeed() {
    // Scale temperature to a reasonable speed range (e.g., 0.5 to 3)
    return 0.5 + (temperature / 100) * 2.5;
}

class Particle {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.size = Math.random() * 5 + 1;
        this.setRandomSpeed();
    }

    setRandomSpeed() {
        const speed = getSpeed();
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
        ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
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
                // Mass proportional to area (size^2)
                const m1 = p1.size * p1.size;
                const m2 = p2.size * p2.size;

                // Normalize collision axis
                const nx = dx / dist;
                const ny = dy / dist;

                // Project velocities onto collision axis
                const v1 = p1.speedX * nx + p1.speedY * ny;
                const v2 = p2.speedX * nx + p2.speedY * ny;

                // 1D elastic collision equations
                const v1After = (v1 * (m1 - m2) + 2 * m2 * v2) / (m1 + m2);
                const v2After = (v2 * (m2 - m1) + 2 * m1 * v1) / (m1 + m2);

                // Update velocities along collision axis
                p1.speedX += (v1After - v1) * nx;
                p1.speedY += (v1After - v1) * ny;
                p2.speedX += (v2After - v2) * nx;
                p2.speedY += (v2After - v2) * ny;

                // Move particles apart to prevent sticking
                const overlap = (p1.size + p2.size) - dist;
                const moveX = nx * (overlap / 2);
                const moveY = ny * (overlap / 2);
                p1.x -= moveX;
                p1.y -= moveY;
                p2.x += moveX;
                p2.y += moveY;
            }
        }
    }
}

function init() {
    particles = [];
    for (let i = 0; i < numParticles; i++) {
        particles.push(new Particle(Math.random() * canvas.width, Math.random() * canvas.height));
    }
}

function updateParticleSpeeds() {
    particles.forEach(p => p.setRandomSpeed());
}

function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    handleCollisions();
    particles.forEach(particle => {
        particle.update();
        particle.draw();
    });
    requestAnimationFrame(animate);
}

window.addEventListener('resize', () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    init();
});

// Listen for input changes
if (numOfParticlesInput) {
    numOfParticlesInput.value = numParticles;
    numOfParticlesInput.addEventListener('input', (e) => {
        numParticles = parseInt(e.target.value, 10) || 0;
        init();
    });
}

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
      content.style.display = 'none';
      showBtn.style.display = 'block';
    });

    showBtn.addEventListener('click', () => {
      content.style.display = '';
      showBtn.style.display = 'none';
    });
  }
});

init();
animate();