export class BondManager {
    constructor() {
        this.bonds = [];
        this.settings = {
            none: { maxBonds: 0, bondDistance: 0, bondStrength: 0 },
            gas: { maxBonds: 2, bondDistance: 60, bondStrength: 0.01 },
            liquid: { maxBonds: 3, bondDistance: 70, bondStrength: 0.05 },
            solid: { maxBonds: 7, bondDistance: 120, bondStrength: 0.1 },
        };
    }

    createBonds(particles, environment) {
        if (environment === 'none') {
            this.bonds = [];
            return;
        }

        const settings = this.settings[environment];
        this.bonds = [];

        // Simple neighbor finding (could be optimized with spatial partitioning)
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

            // Sort by distance and take closest ones
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

    bondExists(a, b) {
        return this.bonds.some(bond => 
            (bond.a === a && bond.b === b) || (bond.a === b && bond.b === a)
        );
    }

    cleanupBonds(particles, breakFactor = 1.5) {
        this.bonds = this.bonds.filter(bond => {
            // Remove if particle is gone
            if (!particles.includes(bond.a) || !particles.includes(bond.b)) {
                return false;
            }

            // Check distance
            const dx = bond.b.x - bond.a.x;
            const dy = bond.b.y - bond.a.y;
            const dist = Math.hypot(dx, dy);

            // Keep only if not overstretched
            return dist <= bond.rest * breakFactor;
        });
    }

    enforceSolidBonds(tolerance = 0.1, breakFactor = 1.5) {
        this.bonds = this.bonds.filter(bond => {
            const { a, b, rest } = bond;
            const dx = b.x - a.x;
            const dy = b.y - a.y;
            const dist = Math.hypot(dx, dy);

            if (dist === 0) return true;

            // Break if overheated
            if (dist > rest * breakFactor) {
                return false;
            }

            // Allowed interval
            const minDist = rest * (1 - tolerance);
            const maxDist = rest * (1 + tolerance);

            if (dist < minDist || dist > maxDist) {
                // Push particles back into allowed zone
                const diff = (dist - rest) / dist;
                const offsetX = dx * 0.5 * diff;
                const offsetY = dy * 0.5 * diff;

                a.x += offsetX;
                a.y += offsetY;
                b.x -= offsetX;
                b.y -= offsetY;
            }

            return true;
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

            ctx.strokeStyle = `rgba(200, 200, 200, ${alpha})`;
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.stroke();
        });
    }
}