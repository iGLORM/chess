const PixiAnimator = {
  movePiece(sprite, fromX, fromY, toX, toY, duration, onComplete) {
    sprite.x = fromX;
    sprite.y = fromY;
    gsap.to(sprite, {
      x: toX,
      y: toY,
      duration: duration || 0.3,
      ease: 'back.out(1.7)',
      onComplete: onComplete,
    });
  },

  capturePiece(sprite, onComplete) {
    gsap.to(sprite, {
      alpha: 0,
      scale: { x: 0.1, y: 0.1 },
      duration: 0.25,
      ease: 'power2.in',
      onComplete: () => {
        if (sprite.parent) sprite.parent.removeChild(sprite);
        if (onComplete) onComplete();
      },
    });
  },

  promotePiece(sprite, onComplete) {
    gsap.to(sprite, {
      alpha: 0,
      duration: 0.15,
      yoyo: true,
      repeat: 1,
      onComplete: onComplete,
    });
  },

  screenShake(container, intensity, duration) {
    const originalX = container.x || 0;
    const originalY = container.y || 0;
    gsap.to(container, {
      x: originalX + intensity,
      y: originalY + intensity,
      duration: duration / 4,
      yoyo: true,
      repeat: 3,
      ease: 'power1.inOut',
      onComplete: () => {
        container.x = originalX;
        container.y = originalY;
      },
    });
  },

  flashScreen(graphics, color, duration) {
    graphics.clear();
    graphics.beginFill(color, 0.3);
    graphics.drawRect(0, 0, 1280, 800);
    graphics.endFill();
    graphics.alpha = 1;
    gsap.to(graphics, {
      alpha: 0,
      duration: duration || 0.3,
      ease: 'power2.out',
    });
  },

  highlightPulse(graphics, color) {
    gsap.fromTo(
      graphics,
      { alpha: 0.6 },
      { alpha: 0.2, duration: 0.8, repeat: -1, yoyo: true, ease: 'sine.inOut' }
    );
  },

  killTweensOf(target) {
    gsap.killTweensOf(target);
  },
};
