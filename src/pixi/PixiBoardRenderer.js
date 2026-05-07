const PixiBoardRenderer = {
  container: null,
  boardContainer: null,
  piecesContainer: null,
  overlayContainer: null,
  squares: [],
  pieceSprites: {},
  squareSize: 80,
  boardOffsetX: 320,
  boardOffsetY: 80,
  flashGraphics: null,
  selectedSprite: null,

  init(parentStage) {
    this.container = new PIXI.Container();
    parentStage.addChild(this.container);

    this.boardContainer = new PIXI.Container();
    this.piecesContainer = new PIXI.Container();
    this.overlayContainer = new PIXI.Container();

    this.container.addChild(this.boardContainer);
    this.container.addChild(this.piecesContainer);
    this.container.addChild(this.overlayContainer);

    // Screen flash overlay
    this.flashGraphics = new PIXI.Graphics();
    this.flashGraphics.interactive = false;
    this.container.addChild(this.flashGraphics);

    this.squares = [];
    this.pieceSprites = {};
  },

  drawBoard(themeId) {
    const theme = ThemeManager.getTheme(themeId);
    const cols = theme.colors;
    this.boardContainer.removeChildren();
    this.squares = [];

    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        const isLight = (row + col) % 2 === 0;
        const color = isLight ? cols.lightSquare : cols.darkSquare;
        const x = this.boardOffsetX + col * this.squareSize;
        const y = this.boardOffsetY + row * this.squareSize;

        const square = new PIXI.Graphics();
        square.beginFill(color);
        square.drawRect(x, y, this.squareSize, this.squareSize);
        square.endFill();
        square.gridX = col;
        square.gridY = row;
        square.baseColor = color;
        this.boardContainer.addChild(square);
        this.squares.push(square);
      }
    }
  },

  setPieces(board, themeId) {
    // Remove old piece sprites
    for (const key in this.pieceSprites) {
      const sprite = this.pieceSprites[key];
      if (sprite.parent) sprite.parent.removeChild(sprite);
      sprite.destroy();
    }
    this.pieceSprites = {};

    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        const piece = board.getPiece(row, col);
        if (piece) {
          const key = `${col},${row}`;
          const sprite = PixiPieceRenderer.createSprite(themeId, piece.color, piece.type);
          const x = this.boardOffsetX + col * this.squareSize + this.squareSize / 2;
          const y = this.boardOffsetY + row * this.squareSize + this.squareSize / 2;
          sprite.x = x;
          sprite.y = y;
          this.piecesContainer.addChild(sprite);
          this.pieceSprites[key] = sprite;
        }
      }
    }
  },

  movePiece(fromCol, fromRow, toCol, toRow, themeId, onComplete) {
    const key = `${fromCol},${fromRow}`;
    const sprite = this.pieceSprites[key];
    if (!sprite) {
      if (onComplete) onComplete();
      return;
    }

    const toX = this.boardOffsetX + toCol * this.squareSize + this.squareSize / 2;
    const toY = this.boardOffsetY + toRow * this.squareSize + this.squareSize / 2;

    PixiAnimator.movePiece(sprite, sprite.x, sprite.y, toX, toY, 0.3, () => {
      delete this.pieceSprites[key];
      this.pieceSprites[`${toCol},${toRow}`] = sprite;
      if (onComplete) onComplete();
    });
  },

  capturePiece(col, row, onComplete) {
    const key = `${col},${row}`;
    const sprite = this.pieceSprites[key];
    if (sprite) {
      PixiAnimator.capturePiece(sprite, () => {
        delete this.pieceSprites[key];
        if (onComplete) onComplete();
      });
    } else if (onComplete) {
      onComplete();
    }
  },

  highlightSquare(col, row, color, alpha) {
    const x = this.boardOffsetX + col * this.squareSize;
    const y = this.boardOffsetY + row * this.squareSize;
    const highlight = new PIXI.Graphics();
    highlight.beginFill(color, alpha || 0.5);
    highlight.drawRect(x, y, this.squareSize, this.squareSize);
    highlight.endFill();
    this.overlayContainer.addChild(highlight);
    return highlight;
  },

  clearHighlights() {
    this.overlayContainer.removeChildren();
    this.selectedSprite = null;
  },

  drawLegalMoves(moves) {
    for (const move of moves) {
      const cx = this.boardOffsetX + move.col * this.squareSize + this.squareSize / 2;
      const cy = this.boardOffsetY + move.row * this.squareSize + this.squareSize / 2;
      const dot = new PIXI.Graphics();
      dot.beginFill(0xffffff, 0.4);
      dot.drawCircle(cx, cy, 6);
      dot.endFill();
      this.overlayContainer.addChild(dot);
    }
  },

  selectSquare(col, row, color) {
    this.clearSelection();
    const x = this.boardOffsetX + col * this.squareSize;
    const y = this.boardOffsetY + row * this.squareSize;
    const select = new PIXI.Graphics();
    select.beginFill(color || 0xffff00, 0.3);
    select.lineStyle(3, color || 0xffff00, 0.6);
    select.drawRect(x, y, this.squareSize, this.squareSize);
    select.endFill();
    this.overlayContainer.addChild(select);
    this.selectedSprite = select;
    return select;
  },

  clearSelection() {
    if (this.selectedSprite) {
      this.overlayContainer.removeChild(this.selectedSprite);
      this.selectedSprite.destroy();
      this.selectedSprite = null;
    }
  },

  flash(color) {
    PixiAnimator.flashScreen(this.flashGraphics, color || 0xffffff, 0.3);
  },

  shake(intensity) {
    PixiAnimator.screenShake(this.container, intensity || 8, 0.4);
  },

  getSquareAt(x, y) {
    const col = Math.floor((x - this.boardOffsetX) / this.squareSize);
    const row = Math.floor((y - this.boardOffsetY) / this.squareSize);
    if (col >= 0 && col < 8 && row >= 0 && row < 8) {
      return { col, row };
    }
    return null;
  },

  destroy() {
    if (this.container) {
      this.container.destroy({ children: true });
      this.container = null;
    }
    this.boardContainer = null;
    this.piecesContainer = null;
    this.overlayContainer = null;
    this.squares = [];
    this.pieceSprites = {};
    this.flashGraphics = null;
    this.selectedSprite = null;
  },
};
