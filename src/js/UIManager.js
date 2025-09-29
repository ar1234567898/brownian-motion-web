export class UIManager {
  export class UIManager {
    constructor(simulation) {
        this.simulation = simulation;
        this.elements = {};
    }

    init() {
        this.cacheElements();
        this.setupEventListeners();
        this.setupTheme();
        this.setupGlowControls(); // Initialize glow controls
    }

    cacheElements() {
        this.elements = {
            // Existing elements...
            numParticles: document.getElementById('numParticles'),
            temperature: document.getElementById('temperature'),
            pushStrength: document.getElementById('pushStrength'),
            pushRadius: document.getElementById('pushRadius'),
            
            // Display values
            numParticlesValue: document.getElementById('numParticlesValue'),
            temperatureValue: document.getElementById('temperatureValue'),
            pushStrengthValue: document.getElementById('pushStrengthValue'),
            pushRadiusValue: document.getElementById('pushRadiusValue'),
            
            // Selects and radios
            environment: document.getElementById('environment'),
            massInputs: document.querySelectorAll('input[name="mass"]'),
            themeToggle: document.getElementById('themeToggle'),
            
            // Buttons
            pauseBtn: document.querySelector('.pause-btn'),
            resetBtn: document.querySelector('.reset-btn'),
            hideBtn: document.querySelector('.hide-content-btn'),
            showBtn: document.querySelector('.show-content-btn'),
            
            // Stats
            particleCount: document.getElementById('particleCount'),
            currentTemperature: document.getElementById('currentTemperature'),
            bondCount: document.getElementById('bondCount'),
            fps: document.getElementById('fps'),
            
            // UI containers
            content: document.querySelector('.content'),
            pushMenu: document.querySelector('.push-menu'),

            // New glow effect elements
            glowToggle: document.getElementById('glowToggle'),
            glowIntensity: document.getElementById('glowIntensity'),
            glowIntensityValue: document.getElementById('glowIntensityValue'),
            glowColor: document.getElementById('glowColor'),
            glowPreview: document.getElementById('glowPreview')
        };
    }

    setupGlowControls() {
        // Create glow controls if they don't exist
        if (!this.elements.glowToggle) {
            this.createGlowControls();
        }
    }

    createGlowControls() {
        const controlsContainer = document.querySelector('.controls');
        
        // Create glow control group
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
                <span id="glowIntensityValue">0.8</span>
                
                <label for="glowColor">Glow Color:</label>
                <input type="color" id="glowColor" value="#ffffff" class="color-picker">
                <div id="glowPreview" class="glow-preview">Preview</div>
            </div>
        `;
        
        controlsContainer.appendChild(glowGroup);
        
        // Re-cache elements to include new ones
        this.cacheElements();
        this.setupGlowEventListeners();
    }

    setupGlowEventListeners() {
        if (!this.elements.glowToggle) return;

        // Glow toggle
        this.elements.glowToggle.addEventListener('change', (e) => {
            this.simulation.setGlowEnabled(e.target.checked);
        });

        // Glow intensity
        this.elements.glowIntensity.addEventListener('input', (e) => {
            const intensity = parseFloat(e.target.value);
            this.elements.glowIntensityValue.textContent = intensity.toFixed(1);
            this.simulation.setGlowIntensity(intensity);
            this.updateGlowPreview();
        });

        // Glow color
        this.elements.glowColor.addEventListener('input', (e) => {
            this.updateGlowPreview();
        });
    }

    updateGlowPreview() {
        if (!this.elements.glowPreview) return;
        
        const color = this.elements.glowColor.value;
        const intensity = parseFloat(this.elements.glowIntensity.value);
        
        // Create gradient preview
        const rgbColor = this.hexToRgb(color);
        const rgbaColor = `rgba(${rgbColor.r}, ${rgbColor.g}, ${rgbColor.b}, ${intensity})`;
        
        this.elements.glowPreview.style.background = `linear-gradient(90deg, ${rgbaColor}, transparent)`;
        this.elements.glowPreview.style.color = this.getContrastColor(rgbColor.r, rgbColor.g, rgbColor.b);
    }

    // Color conversion utilities
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
}

  constructor(simulation) {
    this.simulation = simulation;
    this.elements = {};
  }

  init() {
    this.cacheElements();
    this.setupEventListeners();
    this.setupTheme();
  }

  cacheElements() {
    this.elements = {
      // Sliders
      numParticles: document.getElementById("numParticles"),
      temperature: document.getElementById("temperature"),
      pushStrength: document.getElementById("pushStrength"),
      pushRadius: document.getElementById("pushRadius"),

      // Display values
      numParticlesValue: document.getElementById("numParticlesValue"),
      temperatureValue: document.getElementById("temperatureValue"),
      pushStrengthValue: document.getElementById("pushStrengthValue"),
      pushRadiusValue: document.getElementById("pushRadiusValue"),

      // Selects and radios
      environment: document.getElementById("environment"),
      massInputs: document.querySelectorAll('input[name="mass"]'),
      themeToggle: document.getElementById("themeToggle"),

      // Buttons
      pauseBtn: document.querySelector(".pause-btn"),
      resetBtn: document.querySelector(".reset-btn"),
      hideBtn: document.querySelector(".hide-content-btn"),
      showBtn: document.querySelector(".show-content-btn"),

      // Stats
      particleCount: document.getElementById("particleCount"),
      currentTemperature: document.getElementById("currentTemperature"),
      bondCount: document.getElementById("bondCount"),
      fps: document.getElementById("fps"),

      // UI containers
      content: document.querySelector(".content"),
      pushMenu: document.querySelector(".push-menu"),
    };
  }

  setupEventListeners() {
    // Particle count
    this.elements.numParticles.addEventListener("input", (e) => {
      this.simulation.config.numParticles = parseInt(e.target.value);
      this.elements.numParticlesValue.textContent = e.target.value;
      this.simulation.adjustParticles();
    });

    // Temperature
    // In the setupEventListeners method of UIManager.js
    this.elements.temperature.addEventListener("input", (e) => {
      this.simulation.config.temperature = parseInt(e.target.value);
      this.elements.temperatureValue.textContent = e.target.value;
      this.simulation.updateParticleSpeeds();
    });

    // Environment
    this.elements.environment.addEventListener("change", (e) => {
      this.simulation.config.environment = e.target.value;
      this.simulation.bondManager.createBonds(
        this.simulation.particles,
        this.simulation.config.environment
      );
    });

    // Mass selection
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

    // Push controls
    this.elements.pushStrength.addEventListener("input", (e) => {
      this.simulation.config.pushStrength = parseFloat(e.target.value);
      this.elements.pushStrengthValue.textContent = e.target.value;
    });

    this.elements.pushRadius.addEventListener("input", (e) => {
      this.simulation.config.pushRadius = parseInt(e.target.value);
      this.elements.pushRadiusValue.textContent = e.target.value;
    });

    // Buttons
    this.elements.pauseBtn.addEventListener("click", () => {
      const isPaused = this.simulation.togglePause();
      this.elements.pauseBtn.textContent = isPaused ? "▶️ Resume" : "⏸ Pause";
    });

    this.elements.resetBtn.addEventListener("click", () => {
      this.simulation.resetParticles();
    });

    // Show/hide controls
    this.elements.hideBtn.addEventListener("click", () => {
      this.elements.content.classList.add("hidden");
      setTimeout(() => {
        this.elements.showBtn.style.display = "block";
      }, 400);
    });

    this.elements.showBtn.addEventListener("click", () => {
      this.elements.content.classList.remove("hidden");
      this.elements.showBtn.style.display = "none";
    });

    // Theme toggle
    this.elements.themeToggle.addEventListener("change", (e) => {
      document.body.classList.toggle("dark", e.target.checked);
      localStorage.setItem("theme", e.target.checked ? "dark" : "light");
    });
  }

  setupTheme() {
    const savedTheme = localStorage.getItem("theme") || "light";
    const isDark = savedTheme === "dark";

    document.body.classList.toggle("dark", isDark);
    this.elements.themeToggle.checked = isDark;
  }

  updateStats(stats) {
    this.elements.particleCount.textContent = stats.particleCount;
    this.elements.currentTemperature.textContent = stats.temperature;
    this.elements.bondCount.textContent = stats.bondCount;
    this.elements.fps.textContent = stats.fps;
  }
}


