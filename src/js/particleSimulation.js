import { Particle } from './Particle.js';
import { BondManager } from './BondManager.js';
import { CollisionSystem } from './CollisionSystem.js';
import { UIManager } from './UIManager.js';

export class ParticleSimulation {
    constructor() {
        this.canvas = document.createElement('canvas');
        this.ctx = this.canvas.getContext('2d');
        this.particles = [];
        this.bondManager = new BondManager();
        this.collisionSystem = new CollisionSystem();
        this.uiManager = new UIManager(this);
        
        this.config = {
            numParticles: 500,
            temperature: 50,
            environment: 'none',
            selectedMass: null,
            pushStrength: 1,
            pushRadius: 150,
            paused: false
        };
        
        this.mouse = {
            x: 0,
            y: 0,
            down: false
        };
        
        this.stats = {
            fps: 0,
            lastFrameTime: 0,
            frameCount: 0
        };
        
        document.body.appendChild(this.canvas);
    }

    init() {
        this.setupCanvas();
        this.setupEventListeners();
        this.uiManager.init();
        this.resetParticles();
        this.animate();
    }

    setupCanvas() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }

    setupEventListeners() {
        window.addEventListener('resize', () => this.handleResize());
        
        this.canvas.addEventListener('mousedown', (e) => this.handleMouseDown(e));
        this.canvas.addEventListener('mouseup', (e) => this.handleMouseUp(e));
        this.canvas.addEventListener('mousemove', (e) => this.handleMouseMove(e));
        
        // Prevent context menu
        this.canvas.addEventListener('contextmenu', (e) => e.preventDefault());
    }

    handleResize() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
        this.resetParticles();
    }

    handleMouseDown(e) {
        if (e.button === 0) { // Left click
            this.mouse.down = true;
            const rect = this.canvas.getBoundingClientRect();
            this.mouse.x = e.clientX - rect.left;
            this.mouse.y = e.clientY - rect.top;
            
            if (this.config.selectedMass !== null) {
                this.addParticle(this.mouse.x, this.mouse.y, this.config.selectedMass);
            }
        }
    }

    handleMouseUp(e) {
        if (e.button === 0) {
            this.mouse.down = false;
        }
    }

    handleMouseMove(e) {
        const rect = this.canvas.getBoundingClientRect();
        this.mouse.x = e.clientX - rect.left;
        this.mouse.y = e.clientY - rect.top;
    }

    addParticle(x, y, size) {
        this.particles.push(new Particle(x, y, size));
        this.bondManager.createBonds(this.particles, this.config.environment);
    }

    resetParticles() {
        this.particles = [];
        for (let i = 0; i < this.config.numParticles; i++) {
            const randomSize = 3 + Math.random() * 3;
            this.particles.push(
                new Particle(
                    Math.random() * this.canvas.width,
                    Math.random() * this.canvas.height,
                    randomSize
                )
            );
        }
        this.bondManager.createBonds(this.particles, this.config.environment);
    }

    adjustParticles() {
        const diff = this.config.numParticles - this.particles.length;
        
        if (diff > 0) {
            for (let i = 0; i < diff; i++) {
                const randomSize = 3 + Math.random() * 3;
                this.particles.push(
                    new Particle(
                        Math.random() * this.canvas.width,
                        Math.random() * this.canvas.height,
                        randomSize
                    )
                );
            }
        } else if (diff < 0) {
            this.particles.splice(diff);
        }
        
        this.bondManager.createBonds(this.particles, this.config.environment);
    }

    updateParticleSpeeds() {
        const baseSpeed = 0.5 + (this.config.temperature / 100) * 2.5;
        this.particles.forEach(particle => particle.setRandomSpeed(baseSpeed));
    }

    pushParticlesFromCursor() {
        if (!this.mouse.down || this.config.selectedMass !== null) return;
        
        this.particles.forEach(particle => {
            const dx = particle.x - this.mouse.x;
            const dy = particle.y - this.mouse.y;
            const dist = Math.hypot(dx, dy);
            
            if (dist < this.config.pushRadius && dist > 0.1) {
                const nx = dx / dist;
                const ny = dy / dist;
                const force = (this.config.pushStrength * (1 - dist / this.config.pushRadius)) / particle.size;
                
                particle.speedX += nx * force;
                particle.speedY += ny * force;
            }
        });
    }

    calculateTemperature() {
        if (this.particles.length === 0) return 0;
        
        let totalEnergy = 0;
        this.particles.forEach(particle => {
            totalEnergy += particle.speedX * particle.speedX + particle.speedY * particle.speedY;
        });
        
        const avgEnergy = totalEnergy / this.particles.length;
        return Math.round(avgEnergy * 30);
    }

    updateStats() {
        // Update FPS
        const now = performance.now();
        this.stats.frameCount++;
        
        if (now >= this.stats.lastFrameTime + 1000) {
            this.stats.fps = Math.round((this.stats.frameCount * 1000) / (now - this.stats.lastFrameTime));
            this.stats.lastFrameTime = now;
            this.stats.frameCount = 0;
        }
        
        // Update UI
        this.uiManager.updateStats({
            particleCount: this.particles.length,
            temperature: this.calculateTemperature(),
            bondCount: this.bondManager.bonds.length,
            fps: this.stats.fps
        });
    }

    animate() {
        if (this.config.paused) {
            requestAnimationFrame(() => this.animate());
            return;
        }

        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // Update physics
        this.pushParticlesFromCursor();
        this.collisionSystem.handleCollisions(this.particles);
        
        // Update particles
        const bounds = { width: this.canvas.width, height: this.canvas.height };
        this.particles.forEach(particle => particle.update(bounds));
        
        // Update bonds
        this.bondManager.cleanupBonds(this.particles);
        this.bondManager.createBonds(this.particles, this.config.environment);
        
        if (this.config.environment === 'solid') {
            this.bondManager.enforceSolidBonds();
        }

        // Draw everything
        this.particles.forEach(particle => particle.draw(this.ctx));
        this.bondManager.drawBonds(this.ctx);
        
        // Update statistics
        this.updateStats();

        requestAnimationFrame(() => this.animate());
    }

    togglePause() {
        this.config.paused = !this.config.paused;
        return this.config.paused;
    }
}   