export class CollisionSystem {
    constructor() {
        this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        this.lastSoundTime = 0;
    }

    handleCollisions(particles) {
        for (let i = 0; i < particles.length; i++) {
            for (let j = i + 1; j < particles.length; j++) {
                this.checkCollision(particles[i], particles[j]);
            }
        }
    }

    checkCollision(p1, p2) {
        const dx = p2.x - p1.x;
        const dy = p2.y - p1.y;
        const dist = Math.hypot(dx, dy);

        if (dist < p1.size + p2.size) {
            this.resolveCollision(p1, p2, dx, dy, dist);
            this.playCollisionSound();
        }
    }

    resolveCollision(p1, p2, dx, dy, dist) {
        // Mass based on area (πr² simplified to r²)
        const m1 = p1.size * p1.size;
        const m2 = p2.size * p2.size;

        // Normal vector
        const nx = dx / dist;
        const ny = dy / dist;

        // Relative velocity
        const dvx = p2.speedX - p1.speedX;
        const dvy = p2.speedY - p1.speedY;

        // Velocity along normal
        const velocityAlongNormal = dvx * nx + dvy * ny;

        // Do not resolve if moving apart
        if (velocityAlongNormal > 0) return;

        // Collision impulse
        const restitution = 0.8; // Bounciness
        const impulse = -(1 + restitution) * velocityAlongNormal / (1/m1 + 1/m2);

        // Apply impulse
        const impulseX = impulse * nx;
        const impulseY = impulse * ny;

        p1.speedX -= impulseX / m1;
        p1.speedY -= impulseY / m1;
        p2.speedX += impulseX / m2;
        p2.speedY += impulseY / m2;

        // Position correction to prevent sticking
        const overlap = (p1.size + p2.size - dist) / 2;
        if (overlap > 0) {
            const correctionX = nx * overlap * 0.5;
            const correctionY = ny * overlap * 0.5;

            p1.x -= correctionX;
            p1.y -= correctionY;
            p2.x += correctionX;
            p2.y += correctionY;
        }
    }

    playCollisionSound() {
        const now = performance.now();
        if (now - this.lastSoundTime < 100) return;

        this.lastSoundTime = now;

        try {
            const oscillator = this.audioContext.createOscillator();
            const gainNode = this.audioContext.createGain();

            oscillator.type = 'sine';
            oscillator.frequency.value = 320 + Math.random() * 80;
            gainNode.gain.value = 0.02;

            oscillator.connect(gainNode);
            gainNode.connect(this.audioContext.destination);

            oscillator.start();
            oscillator.stop(this.audioContext.currentTime + 0.09);

            oscillator.onended = () => {
                oscillator.disconnect();
                gainNode.disconnect();
            };
        } catch (error) {
            console.warn('Audio context not available:', error);
        }
    }
}