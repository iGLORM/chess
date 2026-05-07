const StatsScreen = {
  init() {},
  destroy() {},

  render(ctx, dt) {
    const theme = ThemeManager.getTheme(store.get('theme'));
    const cols = theme.colors;

    if (typeof backgroundRenderer !== 'undefined') {
      backgroundRenderer.render(ctx, dt);
    } else {
      ctx.fillStyle = cols.background;
      ctx.fillRect(0, 0, 1280, 800);
    }

    ctx.fillStyle = 'rgba(0,0,0,0.5)';
    ctx.fillRect(0, 0, 1280, 800);

    UIHelpers.drawPanel(ctx, 240, 50, 800, 700, cols, { accentTop: true });

    UIHelpers.drawIcon(ctx, 636, 62, 'trophy', 12, cols);

    ctx.fillStyle = cols.text;
    ctx.font = 'bold 28px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('STATISTICS', 640, 95);

    const stats = store.get('stats') || {};

    // Rating display (prominent)
    const rating = stats.rating || 1200;
    const ratingHistory = stats.ratingHistory || [];
    const lastChange = ratingHistory.length > 0 ? ratingHistory[ratingHistory.length - 1].change : 0;

    // Rating badge
    const ratingY = 130;
    ctx.fillStyle = cols.panel;
    ctx.fillRect(340, ratingY - 20, 600, 80);
    ctx.strokeStyle = cols.accent;
    ctx.lineWidth = 2;
    ctx.strokeRect(340, ratingY - 20, 600, 80);

    // Rating number
    ctx.fillStyle = cols.accent;
    ctx.font = 'bold 36px monospace';
    ctx.textAlign = 'center';
    ctx.fillText(rating, 580, ratingY + 30);

    // Rating label
    ctx.fillStyle = cols.text + 'aa';
    ctx.font = '14px monospace';
    ctx.fillText('RATING', 580, ratingY - 4);

    // Rating change
    const changeStr = lastChange > 0 ? ('+' + lastChange) : String(lastChange);
    ctx.fillStyle = lastChange > 0 ? '#44dd44' : lastChange < 0 ? '#dd4444' : cols.text + '88';
    ctx.font = 'bold 18px monospace';
    ctx.fillText(changeStr, 760, ratingY + 5);

    // Rating tier label
    let tier = 'Beginner';
    let tierColor = cols.text + '88';
    if (rating >= 2000) { tier = 'Grandmaster'; tierColor = '#ffdd44'; }
    else if (rating >= 1800) { tier = 'Expert'; tierColor = '#ff8844'; }
    else if (rating >= 1600) { tier = 'Advanced'; tierColor = '#44dd44'; }
    else if (rating >= 1400) { tier = 'Intermediate'; tierColor = '#44aaff'; }
    else if (rating >= 1200) { tier = 'Developing'; tierColor = cols.text; }
    else if (rating >= 1000) { tier = 'Beginner'; tierColor = cols.text + 'aa'; }
    else { tier = 'Newcomer'; tierColor = cols.text + '66'; }
    ctx.fillStyle = tierColor;
    ctx.font = '16px monospace';
    ctx.fillText(tier, 760, ratingY + 28);

    // Win rate progress bar
    const winRate = stats.gamesPlayed > 0 ? (stats.wins || 0) / stats.gamesPlayed : 0;
    ctx.fillStyle = cols.text + '66';
    ctx.font = '10px monospace';
    ctx.fillText('WIN RATE', 920, ratingY - 2);
    UIHelpers.drawProgressBar(ctx, 880, ratingY + 10, 80, 8, winRate, cols);
    ctx.fillStyle = cols.accent;
    ctx.font = 'bold 12px monospace';
    ctx.fillText(Math.round(winRate * 100) + '%', 920, ratingY + 38);

    // Mini rating history graph
    if (ratingHistory.length > 1) {
      const graphX = 360;
      const graphY = ratingY + 45;
      const graphW = 560;
      const graphH = 60;

      ctx.fillStyle = cols.panel + '88';
      ctx.fillRect(graphX, graphY, graphW, graphH);
      ctx.strokeStyle = cols.text + '33';
      ctx.lineWidth = 1;
      ctx.strokeRect(graphX, graphY, graphW, graphH);

      const recentRatings = ratingHistory.slice(-20);
      const minR = Math.min(...recentRatings.map(r => r.rating)) - 20;
      const maxR = Math.max(...recentRatings.map(r => r.rating)) + 20;
      const rangeR = Math.max(maxR - minR, 100);

      ctx.beginPath();
      ctx.strokeStyle = cols.accent;
      ctx.lineWidth = 2;
      recentRatings.forEach((entry, i) => {
        const px = graphX + (i / (recentRatings.length - 1)) * graphW;
        const py = graphY + graphH - ((entry.rating - minR) / rangeR) * graphH;
        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      });
      ctx.stroke();

      // Dots for wins/losses
      recentRatings.forEach((entry, i) => {
        const px = graphX + (i / (recentRatings.length - 1)) * graphW;
        const py = graphY + graphH - ((entry.rating - minR) / rangeR) * graphH;
        ctx.fillStyle = entry.result === 'white' ? '#44dd44' : entry.result === 'draw' ? '#ddaa22' : '#dd4444';
        ctx.beginPath();
        ctx.arc(px, py, 3, 0, Math.PI * 2);
        ctx.fill();
      });
    }

    // Stats list
    const items = [
      { label: 'Games Played', value: stats.gamesPlayed || 0 },
      { label: 'Wins', value: stats.wins || 0 },
      { label: 'Losses', value: stats.losses || 0 },
      { label: 'Draws', value: stats.draws || 0 },
      { label: 'Captures', value: stats.captures || 0 },
      { label: 'Mini-Games Played', value: stats.miniGamesPlayed || 0 },
      { label: 'Mini-Games Won', value: stats.miniGamesWon || 0 },
      { label: 'Story Level', value: (store.getActiveSave() && store.getActiveSave().storyLevel) || 1 },
    ];

    const x = 360;
    const w = 560;
    let y = 265;
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      ctx.fillStyle = cols.text + '88';
      ctx.font = '14px monospace';
      ctx.textAlign = 'left';
      ctx.fillText(item.label, x + 40, y);

      ctx.fillStyle = cols.text;
      ctx.font = 'bold 16px monospace';
      ctx.textAlign = 'right';
      ctx.fillText(String(item.value), x + w - 40, y);

      y += 40;
      if (i % 2 === 0 && i < items.length - 1) {
        UIHelpers.drawSeparator(ctx, x + 20, y - 18, w - 40, cols);
      }
    }

    UIHelpers.drawDitheredRect(ctx, 0, 770, 1280, 30, cols.accent, '11');

    // Back button
    UIHelpers.drawButton(ctx, 540, 610, 200, 40, '< Back', cols, { font: 'bold 14px monospace' });
  },

  handleClick(x, y) {
    if (x >= 540 && x <= 740 && y >= 610 && y <= 650) {
      switchScreen('home');
    }
  },

  handleKeyDown(e) {
    if (e.key === 'Escape') {
      switchScreen('home');
    }
  },
};