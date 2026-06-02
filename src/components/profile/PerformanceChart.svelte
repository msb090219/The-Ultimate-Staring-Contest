<script>
  export let games = [];

  let chartCanvas;
  let ctx;

  function drawChart() {
    if (!chartCanvas || !games || games.length === 0) return;

    ctx = chartCanvas.getContext('2d');
    const width = chartCanvas.width = chartCanvas.offsetWidth * 2;
    const height = chartCanvas.height = 300 * 2;

    ctx.scale(2, 2);
    ctx.clearRect(0, 0, width, height);

    const padding = { top: 20, right: 20, bottom: 40, left: 50 };
    const chartWidth = width / 2 - padding.left - padding.right;
    const chartHeight = height / 2 - padding.top - padding.bottom;

    // Reverse games to show oldest to newest
    const reversedGames = [...games].reverse();

    if (reversedGames.length < 2) {
      ctx.fillStyle = '#888';
      ctx.font = '14px system-ui';
      ctx.textAlign = 'center';
      ctx.fillText('Play more games to see your performance trend', width / 4, height / 4);
      return;
    }

    // Find min and max times for scaling
    const times = reversedGames.map(g => g.time_seconds);
    const minTime = Math.min(...times) * 0.9;
    const maxTime = Math.max(...times) * 1.1;
    const timeRange = maxTime - minTime;

    // Draw grid lines
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
    ctx.lineWidth = 1;

    for (let i = 0; i <= 5; i++) {
      const y = padding.top + (chartHeight / 5) * i;
      ctx.beginPath();
      ctx.moveTo(padding.left, y);
      ctx.lineTo(padding.left + chartWidth, y);
      ctx.stroke();
    }

    // Draw line chart
    ctx.strokeStyle = '#00ff88';
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.beginPath();

    const points = [];
    reversedGames.forEach((game, index) => {
      const x = padding.left + (chartWidth / (reversedGames.length - 1)) * index;
      const y = padding.top + chartHeight - ((game.time_seconds - minTime) / timeRange) * chartHeight;
      points.push({ x, y, time: game.time_seconds, date: new Date(game.created_at) });

      if (index === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    });

    ctx.stroke();

    // Draw solid fill under the line
    ctx.fillStyle = 'rgba(0, 255, 136, 0.15)';
    ctx.beginPath();
    ctx.moveTo(points[0].x, padding.top + chartHeight);
    points.forEach(point => ctx.lineTo(point.x, point.y));
    ctx.lineTo(points[points.length - 1].x, padding.top + chartHeight);
    ctx.closePath();
    ctx.fill();

    // Draw points
    points.forEach((point, index) => {
      ctx.fillStyle = '#00ff88';
      ctx.beginPath();
      ctx.arc(point.x, point.y, 5, 0, Math.PI * 2);
      ctx.fill();

      // Draw time labels
      ctx.fillStyle = '#fff';
      ctx.font = '12px system-ui';
      ctx.textAlign = 'center';
      ctx.fillText(point.time.toFixed(1) + 's', point.x, point.y - 10);
    });

    // Draw Y-axis labels
    ctx.fillStyle = '#888';
    ctx.font = '11px system-ui';
    ctx.textAlign = 'right';

    for (let i = 0; i <= 5; i++) {
      const value = maxTime - (timeRange / 5) * i;
      const y = padding.top + (chartHeight / 5) * i;
      ctx.fillText(value.toFixed(1) + 's', padding.left - 10, y + 4);
    }

    // Draw X-axis labels (game numbers)
    ctx.textAlign = 'center';
    reversedGames.forEach((_, index) => {
      const x = padding.left + (chartWidth / (reversedGames.length - 1)) * index;
      ctx.fillText(`Game ${index + 1}`, x, padding.top + chartHeight + 20);
    });
  }

  // Redraw when component mounts or games change
  import { onMount, afterUpdate } from 'svelte';

  onMount(() => {
    drawChart();
  });

  afterUpdate(() => {
    drawChart();
  });
</script>

<div class="performance-chart">
  <canvas bind:this={chartCanvas}></canvas>
</div>

<style>
  .performance-chart {
    width: 100%;
    height: 300px;
    padding: 1rem;
    background: rgba(255, 255, 255, 0.02);
    border: 2px solid rgba(255, 255, 255, 0.08);
    border-radius: 12px;
  }

  canvas {
    width: 100%;
    height: 100%;
  }
</style>
