const PixiBackgroundRenderer = {
  container: null,
  bgSprite: null,

  init(parentStage) {
    this.container = new PIXI.Container();
    parentStage.addChild(this.container);
  },

  render(themeId) {
    if (!this.container) return;
    this.container.removeChildren();

    const theme = ThemeManager.getTheme(themeId);
    const cols = theme.colors;

    // Try photo background first
    const img = TextureManager.getBackgroundTexture(themeId);
    if (img) {
      this.bgSprite = PIXI.Sprite.from(img);
      this.bgSprite.width = 1280;
      this.bgSprite.height = 800;
      this.container.addChild(this.bgSprite);
      return;
    }

    // Fallback: gradient via canvas texture
    const canvas = document.createElement('canvas');
    canvas.width = 1;
    canvas.height = 800;
    const ctx = canvas.getContext('2d');
    const grad = ctx.createLinearGradient(0, 0, 0, 800);
    grad.addColorStop(0, cols.background);
    grad.addColorStop(1, cols.panel);
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 1, 800);
    const texture = PIXI.Texture.from(canvas);
    const sprite = new PIXI.Sprite(texture);
    sprite.width = 1280;
    sprite.height = 800;
    this.container.addChild(sprite);
  },

  destroy() {
    if (this.container) {
      this.container.destroy({ children: true });
      this.container = null;
    }
    this.bgSprite = null;
  },
};
