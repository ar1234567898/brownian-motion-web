export class Particle {
    constructor(x, y, size = 10) {
        this.x = x;
        this.y = y;
        this.size = size;
        this.speedX = 0;
        this.speedY = 0;
        this.glowColor = this.getColor(); // Store base color for glow
        this.glowIntensity = 0.8; // Default glow intensity
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

draw(ctx, withGlow = false) {
        if (withGlow) {
            // This is now handled by the simulation's drawParticleGlow method
            return;
        }

        // Draw solid particle
        ctx.fillStyle = this.getColor();
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
        
        // Add a subtle highlight
        ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
        ctx.beginPath();
        ctx.arc(this.x - this.size * 0.3, this.y - this.size * 0.3, this.size * 0.4, 0, Math.PI * 2);
        ctx.fill();
    }

    getColor() {
        if (this.size < 4) return "#2196f3"; // Small - blue
        if (this.size < 7) return "#4caf50"; // Medium - green
        return "#e53935"; // Large - red
    }

    adjustColorAlpha(color, alpha) {
        // Convert hex to rgba
        if (color.startsWith('#')) {
            const r = parseInt(color.slice(1, 3), 16);
            const g = parseInt(color.slice(3, 5), 16);
            const b = parseInt(color.slice(5, 7), 16);
            return `rgba(${r}, ${g}, ${b}, ${alpha})`;
        }
        return color;
    }

     setGlowEnabled(enabled) {
        this.config.glowEnabled = enabled;
    }

    setGlowIntensity(intensity) {
        this.config.glowIntensity = Math.max(0, Math.min(1, intensity));
    }

    // In the animate method, update the particle drawing:
    animate() {
        if (this.config.paused) {
            requestAnimationFrame(() => this.animate());
            return;
        }

        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // Update physics
        this.pushParticlesFromCursor();
        
        if (this.config.environment === 'solid') {
            this.bondManager.applyBondForces(this.config.environment);
        }
        
        this.collisionSystem.handleCollisions(this.particles);
        
        // Update particles
        const bounds = { width: this.canvas.width, height: this.canvas.height };
        this.particles.forEach(particle => particle.update(bounds));
        
        // Update bonds
        this.bondManager.cleanupBonds(this.particles);
        this.bondManager.createBonds(this.particles, this.config.environment);
        
        if (this.config.environment === 'solid') {
            this.bondManager.enforceSolidBonds();
            this.particles.forEach(particle => {
                particle.speedX *= 0.95;
                particle.speedY *= 0.95;
            });
        }

        // Draw everything with glow effect
        this.drawParticlesWithGlow();
        this.bondManager.drawBonds(this.ctx);
        
        this.updateStats();
        requestAnimationFrame(() => this.animate());
    }

    drawParticlesWithGlow() {
        if (this.config.glowEnabled) {
            // First pass: draw glow
            this.particles.forEach(particle => {
                this.drawParticleGlow(particle);
            });
            
            // Second pass: draw solid particles
            this.particles.forEach(particle => {
                particle.draw(this.ctx, false); // Draw without glow
            });
        } else {
            // Single pass: draw particles without glow
            this.particles.forEach(particle => {
                particle.draw(this.ctx, false);
            });
        }
    }

    drawParticleGlow(particle) {
        const ctx = this.ctx;
        const intensity = this.config.glowIntensity;
        
        // Create radial gradient for glow
        const gradient = ctx.createRadialGradient(
            particle.x, particle.y, 0,
            particle.x, particle.y, particle.size * (2 + intensity * 3)
        );
        
        const baseColor = particle.getColor();
        const rgb = this.hexToRgb(baseColor);
        
        gradient.addColorStop(0, `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${intensity * 0.8})`);
        gradient.addColorStop(0.5, `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${intensity * 0.3})`);
        gradient.addColorStop(1, `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0)`);
        
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size * (2 + intensity * 3), 0, Math.PI * 2);
        ctx.fill();
    }

    hexToRgb(hex) {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16)
        } : { r: 255, g: 255, b: 255 };
    }

}