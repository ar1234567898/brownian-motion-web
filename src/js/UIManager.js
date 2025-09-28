export class UIManager {
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
