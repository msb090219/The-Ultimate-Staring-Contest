export class FrameRateController {
  constructor(targetFPS = 30) {
    this.targetFPS = targetFPS;
    this.frameInterval = 1000 / targetFPS;
    this.lastFrameTime = 0;
    this.actualFPS = 0;
    this.frameTimes = [];
  }

  shouldProcess(timestamp) {
    const elapsed = timestamp - this.lastFrameTime;

    if (elapsed >= this.frameInterval) {
      this.actualFPS = 1000 / elapsed;
      this.lastFrameTime = timestamp;

      // Track last 100 frame times for averaging
      this.frameTimes.push(elapsed);
      if (this.frameTimes.length > 100) {
        this.frameTimes.shift();
      }

      return true;
    }

    return false;
  }

  getFPS() {
    if (this.frameTimes.length === 0) return 0;
    const avgFrameTime = this.frameTimes.reduce((a, b) => a + b, 0) / this.frameTimes.length;
    return 1000 / avgFrameTime;
  }

  getAverageFPS() {
    return this.actualFPS;
  }

  reset() {
    this.lastFrameTime = 0;
    this.actualFPS = 0;
    this.frameTimes = [];
  }
}

export class PerformanceMonitor {
  constructor() {
    this.metrics = {
      frameTimes: [],
      blinkLatency: [],
      initializationTime: 0,
      errorCount: 0,
      gameCount: 0
    };
  }

  recordFrameTime(duration) {
    this.metrics.frameTimes.push(duration);
    if (this.metrics.frameTimes.length > 100) {
      this.metrics.frameTimes.shift();
    }
  }

  recordBlinkLatency(latency) {
    this.metrics.blinkLatency.push(latency);
  }

  recordError() {
    this.metrics.errorCount++;
  }

  recordGame() {
    this.metrics.gameCount++;
  }

  getAverageFPS() {
    if (this.metrics.frameTimes.length === 0) return 0;
    const avgFrameTime = this.metrics.frameTimes.reduce((a, b) => a + b, 0) / this.metrics.frameTimes.length;
    return 1000 / avgFrameTime;
  }

  getMetrics() {
    return {
      ...this.metrics,
      averageFPS: this.getAverageFPS()
    };
  }

  reset() {
    this.metrics = {
      frameTimes: [],
      blinkLatency: [],
      initializationTime: 0,
      errorCount: 0,
      gameCount: 0
    };
  }
}

export const perfMonitor = new PerformanceMonitor();
export const frameController = new FrameRateController(30);
