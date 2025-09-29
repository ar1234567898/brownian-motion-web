export class UIManager {
    constructor(simulation) {
        this.simulation = simulation;
        this.elements = {};
    }

    init() {
        this.cacheElements();
        this.setupEventListeners();
        this.setupTheme();
        this.setupGlowControls();
        this.initializeSliderValues();
    }

    cacheElements() {
        this.elements = {
            // ... existing elements ...
            // Make sure glow elements are included
            glowToggle: document.getElementById("glowToggle"),
            glowIntensity: document.getElementById("glowIntensity"),
            glowIntensityValue: document.getElementById("glowIntensityValue"),
            glowColor: document.getElementById("glowColor"),
            glowPreview: document.getElementById("glowPreview")
        };
    }

    setupGlowControls() {
        // Create glow controls if they don't exist
        if (!this.elements.glowToggle) {
            this.createGlowControls();
        }
        this.setupGlowEventListeners();
        this.updateGlowPreview();
    }

    createGlowControls() {
        const controlsContainer = document.querySelector('.controls');
        if (!controlsContainer) return;
        
        const glowGroup = document.createElement('div');
        glowGroup.className = 'control-group';
        glowGroup.innerHTML = `
            <label class="glow-toggle">
                <input type="checkbox" id="glowToggle" checked>
                <span class="glow-label">Glow Effect</span>
            </label>
            
            <div class="glow-controls">
                <label for="glowIntensity">Glow Intensity:</label>
                <input type="range" id="glowIntensity" min="0" max="1" step="0.1" value="0.8" class="slider-control">
                <span id="glowIntensityValue" class="slider-value">0.8</span>
                
                <label for="glowColor">Glow Color Override:</label>
                <input type="color" id="glowColor" value="#ffffff" class="color-picker">
                <div id="glowPreview" class="glow-preview">Glow Preview</div>
            </div>
        `;
        
        controlsContainer.appendChild(glowGroup);
        this.cacheElements(); // Re-cache to include new elements
    }

    setupGlowEventListeners() {
        if (this.elements.glowToggle) {
            this.elements.glowToggle.addEventListener('change', (e) => {
                this.simulation.setGlowEnabled(e.target.checked);
            });
        }

        if (this.elements.glowIntensity) {
            this.elements.glowIntensity.addEventListener('input', (e) => {
                const intensity = parseFloat(e.target.value);
                if (this.elements.glowIntensityValue) {
                    this.elements.glowIntensityValue.textContent = intensity.toFixed(1);
                }
                this.simulation.setGlowIntensity(intensity);
                this.updateGlowPreview();
            });
        }

        if (this.elements.glowColor) {
            this.elements.glowColor.addEventListener('input', (e) => {
                this.updateGlowPreview();
            });
        }
    }

    updateGlowPreview() {
        if (!this.elements.glowPreview || !this.elements.glowColor || !this.elements.glowIntensity) return;
        
        const color = this.elements.glowColor.value;
        const intensity = parseFloat(this.elements.glowIntensity.value);
        const rgb = this.hexToRgb(color);
        
        const gradient = `linear-gradient(90deg, 
            rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${intensity}), 
            rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0)
        )`;
        
        this.elements.glowPreview.style.background = gradient;
        this.elements.glowPreview.textContent = `Intensity: ${intensity.toFixed(1)}`;
    }

    hexToRgb(hex) {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16)
        } : { r: 255, g: 255, b: 255 };
    }

    getContrastColor(r, g, b) {
        const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
        return luminance > 0.5 ? '#000000' : '#ffffff';
    }

    setupEventListeners() {
        // Particle count
        if (this.elements.numParticles) {
            this.elements.numParticles.addEventListener("input", (e) => {
                this.simulation.config.numParticles = parseInt(e.target.value);
                if (this.elements.numParticlesValue) {
                    this.elements.numParticlesValue.textContent = e.target.value;
                }
                this.simulation.adjustParticles();
            });
        }

        // Temperature
        if (this.elements.temperature) {
            this.elements.temperature.addEventListener("input", (e) => {
                this.simulation.config.temperature = parseInt(e.target.value);
                if (this.elements.temperatureValue) {
                    this.elements.temperatureValue.textContent = e.target.value;
                }
                this.simulation.updateParticleSpeeds();
            });
        }

        // Environment
        if (this.elements.environment) {
            this.elements.environment.addEventListener("change", (e) => {
                this.simulation.config.environment = e.target.value;
                this.simulation.bondManager.createBonds(
                    this.simulation.particles,
                    this.simulation.config.environment
                );
            });
        }

        // Mass selection
        if (this.elements.massInputs) {
            this.elements.massInputs.forEach((input) => {
                input.addEventListener("change", (e) => {
                    this.simulation.config.selectedMass =
                        e.target.value === "" ? null : parseFloat(e.target.value);

                    // Show/hide push menu
                    if (this.elements.pushMenu) {
                        this.elements.pushMenu.style.display =
                            this.simulation.config.selectedMass === null ? "block" : "none";
                    }
                });
            });
        }

        // Push controls
        if (this.elements.pushStrength) {
            this.elements.pushStrength.addEventListener("input", (e) => {
                this.simulation.config.pushStrength = parseFloat(e.target.value);
                if (this.elements.pushStrengthValue) {
                    this.elements.pushStrengthValue.textContent = parseFloat(e.target.value).toFixed(1);
                }
            });
        }

        if (this.elements.pushRadius) {
            this.elements.pushRadius.addEventListener("input", (e) => {
                this.simulation.config.pushRadius = parseInt(e.target.value);
                if (this.elements.pushRadiusValue) {
                    this.elements.pushRadiusValue.textContent = e.target.value;
                }
            });
        }

        // Buttons
        if (this.elements.pauseBtn) {
            this.elements.pauseBtn.addEventListener("click", () => {
                const isPaused = this.simulation.togglePause();
                this.elements.pauseBtn.textContent = isPaused ? "▶️ Resume" : "⏸ Pause";
            });
        }

        if (this.elements.resetBtn) {
            this.elements.resetBtn.addEventListener("click", () => {
                this.simulation.resetParticles();
            });
        }

        // Show/hide controls
        if (this.elements.hideBtn) {
            this.elements.hideBtn.addEventListener("click", () => {
                this.elements.content.classList.add("hidden");
                setTimeout(() => {
                    if (this.elements.showBtn) {
                        this.elements.showBtn.style.display = "block";
                    }
                }, 400);
            });
        }

        if (this.elements.showBtn) {
            this.elements.showBtn.addEventListener("click", () => {
                this.elements.content.classList.remove("hidden");
                this.elements.showBtn.style.display = "none";
            });
        }

        // Theme toggle
        if (this.elements.themeToggle) {
            this.elements.themeToggle.addEventListener("change", (e) => {
                document.body.classList.toggle("dark", e.target.checked);
                localStorage.setItem("theme", e.target.checked ? "dark" : "light");
            });
        }
    }

    setupTheme() {
        const savedTheme = localStorage.getItem("theme") || "light";
        const isDark = savedTheme === "dark";

        document.body.classList.toggle("dark", isDark);
        if (this.elements.themeToggle) {
            this.elements.themeToggle.checked = isDark;
        }
    }

    updateStats(stats) {
        if (this.elements.particleCount) {
            this.elements.particleCount.textContent = stats.particleCount;
        }
        if (this.elements.currentTemperature) {
            this.elements.currentTemperature.textContent = stats.temperature;
        }
        if (this.elements.bondCount) {
            this.elements.bondCount.textContent = stats.bondCount;
        }
        if (this.elements.fps) {
            this.elements.fps.textContent = stats.fps;
        }
    }
}