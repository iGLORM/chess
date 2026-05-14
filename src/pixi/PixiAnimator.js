const PixiAnimator = {
  _activeTrailTimers: [],
  _activeTweens: [],

  movePiece(sprite, fromX, fromY, toX, toY, duration, onComplete) {
    sprite.x = fromX;
    sprite.y = fromY;

    // Motion trail effect
    if (sprite.parent) {
      this._spawnMotionTrail(sprite.parent, sprite, fromX, fromY, toX, toY, duration || 0.3);
    }

    const tween = gsap.to(sprite, {
      x: toX,
      y: toY,
      duration: duration || 0.3,
      ease: 'back.out(1.7)',
      onComplete: () => {
        const idx = this._activeTweens.indexOf(tween);
        if (idx !== -1) this._activeTweens.splice(idx, 1);
        if (onComplete) onComplete();
      },
    });
    this._activeTweens.push(tween);
  },

  _spawnMotionTrail(parent, sprite, fromX, fromY, toX, toY, duration) {
    const dist = Math.sqrt((toX - fromX) ** 2 + (toY - fromY) ** 2);
    const steps = Math.min(12, Math.max(6, Math.floor(dist / 15)));
    const dx = (toX - fromX) / steps;
    const dy = (toY - fromY) / steps;

    for (let i = 1; i < steps; i++) {
      const h = setTimeout(() => {
        if (!sprite || !sprite.texture || !parent || parent.destroyed) return;
        const trail = new PIXI.Sprite(sprite.texture);
        trail.anchor.set(0.5);
        trail.x = fromX + dx * i;
        trail.y = fromY + dy * i;
        trail.scale.set(sprite.scale.x * (1 - i / steps) * 0.7);
        trail.alpha = 0.4 * (1 - i / steps);
        trail.tint = 0xffffff;
        parent.addChildAt(trail, 0);

        const trailTween = gsap.to(trail, {
          alpha: 0,
          scale: { x: 0, y: 0 },
          duration: 0.2 + (steps - i) * 0.02,
          ease: 'power2.out',
          onComplete: () => {
            const idx = this._activeTweens.indexOf(trailTween);
            if (idx !== -1) this._activeTweens.splice(idx, 1);
            if (trail.parent) trail.parent.removeChild(trail);
            trail.destroy();
          },
        });
        this._activeTweens.push(trailTween);
      }, i * (duration * 1000 / steps));
      this._activeTrailTimers.push(h);
    }
  },

  capturePiece(sprite, onComplete) {
    // Scale bounce before shrinking
    const bounceTween = gsap.to(sprite.scale, {
      x: 1.3,
      y: 1.3,
      duration: 0.1,
      ease: 'power2.out',
      onComplete: () => {
        const idx1 = this._activeTweens.indexOf(bounceTween);
        if (idx1 !== -1) this._activeTweens.splice(idx1, 1);
        const shrinkTween = gsap.to(sprite, {
          alpha: 0,
          scale: { x: 0.1, y: 0.1 },
          duration: 0.2,
          ease: 'power2.in',
          onComplete: () => {
            const idx2 = this._activeTweens.indexOf(shrinkTween);
            if (idx2 !== -1) this._activeTweens.splice(idx2, 1);
            if (sprite.parent) sprite.parent.removeChild(sprite);
            if (onComplete) onComplete();
          },
        });
        this._activeTweens.push(shrinkTween);
      },
    });
    this._activeTweens.push(bounceTween);
  },

  promotePiece(sprite, onComplete) {
    const tween = gsap.to(sprite.scale, {
      x: 1.4,
      y: 1.4,
      duration: 0.15,
      ease: 'power2.out',
      yoyo: true,
      repeat: 1,
      onComplete: () => {
        const idx = this._activeTweens.indexOf(tween);
        if (idx !== -1) this._activeTweens.splice(idx, 1);
        if (onComplete) onComplete();
      },
    });
    this._activeTweens.push(tween);
  },

  screenShake(container, intensity, duration) {
    const originalX = container.x || 0;
    const originalY = container.y || 0;
    container._shakeOrigX = originalX;
    container._shakeOrigY = originalY;
    const tween = gsap.to(container, {
      x: originalX + intensity,
      y: originalY + intensity,
      duration: duration / 4,
      yoyo: true,
      repeat: 3,
      ease: 'power1.inOut',
      onComplete: () => {
        const idx = this._activeTweens.indexOf(tween);
        if (idx !== -1) this._activeTweens.splice(idx, 1);
        container.x = originalX;
        container.y = originalY;
        delete container._shakeOrigX;
        delete container._shakeOrigY;
      },
    });
    this._activeTweens.push(tween);
  },

  resetShake(container) {
    if (container && container._shakeOrigX !== undefined) {
      container.x = container._shakeOrigX;
      container.y = container._shakeOrigY;
      delete container._shakeOrigX;
      delete container._shakeOrigY;
    }
  },

  flashScreen(graphics, color, duration) {
    graphics.clear();
    graphics.rect(0, 0, Layout.W, Layout.H).fill({ color, alpha: 0.3 });
    graphics.alpha = 1;
    const tween = gsap.to(graphics, {
      alpha: 0,
      duration: duration || 0.3,
      ease: 'power2.out',
      onComplete: () => {
        const idx = this._activeTweens.indexOf(tween);
        if (idx !== -1) this._activeTweens.splice(idx, 1);
      },
    });
    this._activeTweens.push(tween);
  },

  highlightPulse(graphics, color) {
    const tween = gsap.fromTo(
      graphics,
      { alpha: 0.6 },
      { alpha: 0.2, duration: 0.8, repeat: -1, yoyo: true, ease: 'sine.inOut' }
    );
    this._activeTweens.push(tween);
  },

  killTweensOf(target) {
    this.resetShake(target);
    gsap.killTweensOf(target);
  },

  clearTrails() {
    for (const h of this._activeTrailTimers) clearTimeout(h);
    this._activeTrailTimers = [];
  },

  killAll() {
    for (const t of this._activeTweens) t.kill();
    this._activeTweens = [];
    this.clearTrails();
  },
};
