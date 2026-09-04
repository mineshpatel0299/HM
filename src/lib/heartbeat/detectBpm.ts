export type BrightnessSample = { t: number; value: number };

export type BpmResult = {
  bpm: number;
  /** Ms between consecutive detected beats — the actual captured rhythm. */
  intervals: number[];
};

const MIN_BEAT_INTERVAL_MS = 300; // refractory period, caps at ~200bpm
const MAX_BEAT_INTERVAL_MS = 2000; // floor of ~30bpm — anything slower is noise
const SMOOTH_WINDOW = 3;
const BASELINE_WINDOW_MS = 800;

function movingAverage(samples: BrightnessSample[], windowSize: number): BrightnessSample[] {
  if (windowSize <= 1) return samples;
  return samples.map((sample, i) => {
    const start = Math.max(0, i - windowSize + 1);
    const slice = samples.slice(start, i + 1);
    const avg = slice.reduce((sum, s) => sum + s.value, 0) / slice.length;
    return { t: sample.t, value: avg };
  });
}

/** Crude high-pass filter: subtract a wider trailing average to remove drift
 * from ambient light changes or finger pressure shifting, leaving just the
 * pulse-driven ripple. */
function subtractBaseline(samples: BrightnessSample[], windowMs: number): BrightnessSample[] {
  const result: BrightnessSample[] = [];
  let start = 0;
  let sum = 0;
  let count = 0;
  for (let i = 0; i < samples.length; i++) {
    sum += samples[i].value;
    count++;
    while (samples[i].t - samples[start].t > windowMs) {
      sum -= samples[start].value;
      count--;
      start++;
    }
    result.push({ t: samples[i].t, value: samples[i].value - sum / count });
  }
  return result;
}

/**
 * Basic PPG peak detection: smooth -> detrend -> adaptive-threshold local
 * maxima with a refractory period, then keep only physiologically plausible
 * intervals. Returns null when the sample is too short or too noisy to
 * yield a confident reading, rather than guessing.
 */
export function detectBpm(rawSamples: BrightnessSample[]): BpmResult | null {
  if (rawSamples.length < 20) return null;

  const detrended = subtractBaseline(movingAverage(rawSamples, SMOOTH_WINDOW), BASELINE_WINDOW_MS);

  const values = detrended.map((s) => s.value);
  const mean = values.reduce((a, b) => a + b, 0) / values.length;
  const variance = values.reduce((sum, v) => sum + (v - mean) ** 2, 0) / values.length;
  const threshold = Math.sqrt(variance) * 0.5;

  const peakTimes: number[] = [];
  let lastPeakT = -Infinity;
  for (let i = 1; i < detrended.length - 1; i++) {
    const { t, value } = detrended[i];
    const isLocalMax = value > detrended[i - 1].value && value >= detrended[i + 1].value;
    if (isLocalMax && value > threshold && t - lastPeakT >= MIN_BEAT_INTERVAL_MS) {
      peakTimes.push(t);
      lastPeakT = t;
    }
  }
  if (peakTimes.length < 3) return null;

  const intervals: number[] = [];
  for (let i = 1; i < peakTimes.length; i++) {
    intervals.push(Math.round(peakTimes[i] - peakTimes[i - 1]));
  }

  const plausible = intervals.filter(
    (interval) => interval >= MIN_BEAT_INTERVAL_MS && interval <= MAX_BEAT_INTERVAL_MS,
  );
  if (plausible.length < 2) return null;

  const avgInterval = plausible.reduce((a, b) => a + b, 0) / plausible.length;
  return { bpm: Math.round(60000 / avgInterval), intervals: plausible };
}
