export class BondManager {
    constructor() {
        this.bonds = [];
        this.settings = {
            none: { maxBonds: 0, bondDistance: 0, bondStrength: 0 },
            gas: { maxBonds: 2, bondDistance: 60, bondStrength: 0.01 },
            liquid: { maxBonds: 3, bondDistance: 70, bondStrength: 0.05 },
            solid: { maxBonds: 6, bondDistance: 80, bondStrength: 0.3 }, // Reduced distance for more local bonds
        };
    }

    createBonds(particles, environment) {
        if (environment === 'none') {
            this.bonds = [];
            return;
        }

        const settings = this.settings[environment];
        this.bonds = [];

        if (environment === 'solid') {
            this.createSolidBonds(particles, settings);
        } else {
            this.createFluidBonds(particles, settings);
        }
    }

    createFluidBonds(particles, settings) {
        for (let i = 0; i < particles.length; i++) {
            const p1 = particles[i];
            const neighbors = [];

            for (let j = 0; j < particles.length; j++) {
                if (i === j) continue;

                const p2 = particles[j];
                const dx = p2.x - p1.x;
                const dy = p2.y - p1.y;
                const dist = Math.hypot(dx, dy);

                if (dist < settings.bondDistance) {
                    neighbors.push({ particle: p2, distance: dist });
                }
            }

            neighbors.sort((a, b) => a.distance - b.distance);
            const selectedNeighbors = neighbors.slice(0, settings.maxBonds);

            selectedNeighbors.forEach(neighbor => {
                if (!this.bondExists(p1, neighbor.particle)) {
                    this.bonds.push({
                        a: p1,
                        b: neighbor.particle,
                        rest: neighbor.distance,
                        strength: settings.bondStrength
                    });
                }
            });
        }
    }

createSolidBonds(particles, settings) {
    // Simple approach: each particle bonds with its 6 closest neighbors
    for (let i = 0; i < particles.length; i++) {
        const p1 = particles[i];
        const neighbors = [];
        
        // Find distances to all other particles
        for (let j = 0; j < particles.length; j++) {
            if (i === j) continue;
            
            const p2 = particles[j];
            const dx = p2.x - p1.x;
            const dy = p2.y - p1.y;
            const dist = Math.hypot(dx, dy);
            
            neighbors.push({ particle: p2, distance: dist });
        }
        
        // Sort by distance and take the closest ones
        neighbors.sort((a, b) => a.distance - b.distance);
        const closestNeighbors = neighbors.slice(0, 6); // 6 closest neighbors for hexagonal packing
        
        // Create bonds with closest neighbors
        closestNeighbors.forEach(neighbor => {
            if (neighbor.distance < settings.bondDistance && 
                !this.bondExists(p1, neighbor.particle)) {
                this.bonds.push({
                    a: p1,
                    b: neighbor.particle,
                    rest: neighbor.distance,
                    strength: settings.bondStrength
                });
            }
        });
    }
    
    this.ensureBondSymmetry();
}

    isGoodBondAngle(particle, newNeighbor, existingNeighbors) {
        if (existingNeighbors.length === 0) return true;
        
        const minAngle = Math.PI / 6; // 30 degrees minimum between bonds
        
        for (const existing of existingNeighbors) {
            const angleDiff = Math.abs(newNeighbor.angle - existing.angle);
            const normalizedDiff = Math.min(angleDiff, 2 * Math.PI - angleDiff);
            
            if (normalizedDiff < minAngle) {
                return false; // Angle too small, would create clustering
            }
        }
        
        return true;
    }

    ensureBondSymmetry() {
        // Remove any duplicate bonds and ensure if A is bonded to B, then B is bonded to A
        const uniqueBonds = new Set();
        const symmetricBonds = [];
        
        this.bonds.forEach(bond => {
            const key1 = `${bond.a.x},${bond.a.y}-${bond.b.x},${bond.b.y}`;
            const key2 = `${bond.b.x},${bond.b.y}-${bond.a.x},${bond.a.y}`;
            
            if (!uniqueBonds.has(key1) && !uniqueBonds.has(key2)) {
                uniqueBonds.add(key1);
                symmetricBonds.push(bond);
            }
        });
        
        this.bonds = symmetricBonds;
    }

    countBonds(particle) {
        return this.bonds.filter(bond => bond.a === particle || bond.b === particle).length;
    }

    bondExists(a, b) {
        return this.bonds.some(bond => 
            (bond.a === a && bond.b === b) || (bond.a === b && bond.b === a)
        );
    }

    // ... rest of the methods remain the same
    cleanupBonds(particles, breakFactor = 1.5) {
        this.bonds = this.bonds.filter(bond => {
            if (!particles.includes(bond.a) || !particles.includes(bond.b)) {
                return false;
            }

            const dx = bond.b.x - bond.a.x;
            const dy = bond.b.y - bond.a.y;
            const dist = Math.hypot(dx, dy);

            return dist <= bond.rest * breakFactor;
        });
    }

    enforceSolidBonds() {
        const stiffness = 0.8;
        const iterations = 3;

        for (let iter = 0; iter < iterations; iter++) {
            this.bonds.forEach(bond => {
                const { a, b, rest, strength } = bond;
                const dx = b.x - a.x;
                const dy = b.y - a.y;
                const dist = Math.hypot(dx, dy);

                if (dist === 0) return;

                const displacement = (dist - rest) / dist;
                const adjustX = dx * displacement * strength * stiffness;
                const adjustY = dy * displacement * strength * stiffness;

                a.x += adjustX * 0.5;
                a.y += adjustY * 0.5;
                b.x -= adjustX * 0.5;
                b.y -= adjustY * 0.5;
            });
        }

        this.cleanupBonds(this.getParticlesFromBonds(), 2.0);
    }

    getParticlesFromBonds() {
        const particles = new Set();
        this.bonds.forEach(bond => {
            particles.add(bond.a);
            particles.add(bond.b);
        });
        return Array.from(particles);
    }

    applyBondForces(environment) {
        if (environment !== 'solid') return;

        this.bonds.forEach(bond => {
            const { a, b, rest, strength } = bond;
            const dx = b.x - a.x;
            const dy = b.y - a.y;
            const dist = Math.hypot(dx, dy);

            if (dist === 0) return;

            const force = (dist - rest) * strength;
            const forceX = (dx / dist) * force;
            const forceY = (dy / dist) * force;

            const massA = a.size * a.size;
            const massB = b.size * b.size;

            a.speedX += forceX / massA;
            a.speedY += forceY / massA;
            b.speedX -= forceX / massB;
            b.speedY -= forceY / massB;
        });
    }

    drawBonds(ctx) {
        if (this.bonds.length === 0) return;

        ctx.lineWidth = 1;

        this.bonds.forEach(bond => {
            const { a, b, rest } = bond;
            const dx = b.x - a.x;
            const dy = b.y - a.y;
            const dist = Math.hypot(dx, dy);
            const alpha = 1 - Math.min(dist / (rest * 1.5), 1);

            // Different colors for different environments
            let bondColor;
            if (dist > rest * 1.3) {
                bondColor = `rgba(255, 100, 100, ${alpha})`; // Red for stressed bonds
            } else {
                bondColor = `rgba(200, 200, 200, ${alpha})`; // Gray for normal bonds
            }

            ctx.strokeStyle = bondColor;
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.stroke();
        });
    }
}