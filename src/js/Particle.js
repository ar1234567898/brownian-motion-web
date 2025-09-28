export class Particle {
    constructor(x, y, size = 10) {
        this.x = x;
        this.y = y;
        this.size = size;
        this.speedX = 0;
        this.speedY = 0;
        // Initialize with random speed
        this.setRandomSpeed(0.5 + (50 / 100) * 2.5); // Default temperature 50
    }

    setRandomSpeed(baseSpeed) {
        const massFactor = 4 / this.size;
        const speed = baseSpeed * massFactor;
        this.speedX = (Math.random() - 0.5) * speed;
        this.speedY = (Math.random() - 0.5) * speed;
    }

    update(bounds) {
        this.x += this.speedX;
        this.y += this.speedY;

        // Boundary collision with proper containment
        if (this.x < this.size) {
            this.x = this.size;
            this.speedX *= -1;
        } else if (this.x > bounds.width - this.size) {
            this.x = bounds.width - this.size;
            this.speedX *= -1;
        }

        if (this.y < this.size) {
            this.y = this.size;
            this.speedY *= -1;
        } else if (this.y > bounds.height - this.size) {
            this.y = bounds.height - this.size;
            this.speedY *= -1;
        }
    }

    draw(ctx) {
        ctx.fillStyle = this.getColor();
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
        
        // Add a subtle glow effect
        ctx.shadowColor = this.getColor();
        ctx.shadowBlur = 10;
        ctx.fill();
        ctx.shadowBlur = 0;
    }

    getColor() {
        if (this.size < 4) return "#2196f3"; // Small - blue
        if (this.size < 7) return "#4caf50"; // Medium - green
        return "#e53935"; // Large - red
    }
}