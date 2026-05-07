const PixiParticleFX = {
  container: null,
  particles: [],

  init(parentStage) {
    this.container = new PIXI.Container();
    parentStage.addChild(this.container);
  },

  spawnCapture(x, y, color) {
    for (let i = 0; i < 30; i++) {
      const p = new PIXI.Graphics();
      p.beginFill(color);
      p.drawCircle(0, 0, 2 + Math.random() * 3);
      p.endFill();
      p.x = x;
      p.y = y;
      p.vx = (Math.random() - 0.5) * 300;
      p.vy = (Math.random() - 0.5) * 300;
      p.life = 0.5 + Math.random() * 0.5;
      p.maxLife = p.life;
      this.container.addChild(p);
      this.particles.push(p);
    }
  },

  spawnMove(x, y, color) {
    for (let i = 0; i < 8; i++) {
      const p = new PIXI.Graphics();
      p.beginFill(color);
      p.drawCircle(0, 0, 1.5 + Math.random() * 2);
      p.endFill();
      p.x = x;
      p.y = y;
      p.vx = (Math.random() - 0.5) * 150;
      p.vy = (Math.random() - 0.5) * 150;
      p.life = 0.3 + Math.random() * 0.3;
      p.maxLife = p.life;
      this.container.addChild(p);
      this.particles.push(p);
    }
  },

  update(dt) {
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.life -= dt;
      p.alpha = Math.max(0, p.life / p.maxLife);
      if (p.life <= 0) {
        this.container.removeChild(p);
        p.destroy();
        this.particles.splice(i, 1);
      }
    }
  },

  clear() {
    for (const p of this.particles) {
      this.container.removeChild(p);
      p.destroy();
    }
    this.particles = [];
  },

  destroy() {
    this.clear();
    if (this.container) {
      this.container.destroy({ children: true });
      this.container = null;
    }
  },
};
