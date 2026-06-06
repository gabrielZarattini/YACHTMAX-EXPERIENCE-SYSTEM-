/**
 * ==========================================================================
 * YACHTMAX EXPERIENCE SYSTEM™ — SCROLL DEPTH ANALYTICS ENGINE
 * Tracks user engagement: scroll depth, slide timings, hotspot/CTA clicks.
 * Persists metrics in sessionStorage (mock — ready for GA4/Segment integration).
 * Feeds the Desire Score™ calculation (FR-LNX-02).
 * ==========================================================================
 */

const SESSION_KEY = 'yachtmax_analytics_session';

let sessionStartTime = performance.now();
const slideEntryTimes = {};
const scrollDepthReached = new Set();

/**
 * Initializes or resets the analytics session.
 */
export function initAnalytics() {
  sessionStartTime = performance.now();
  scrollDepthReached.clear();

  const existing = sessionStorage.getItem(SESSION_KEY);
  if (!existing) {
    sessionStorage.setItem(SESSION_KEY, JSON.stringify({
      sessionId: crypto.randomUUID(),
      startedAt: new Date().toISOString(),
      scrollDepths: [],
      hotspotClicks: [],
      ctaClicks: [],
      slideTimings: {},
      totalEngagementMs: 0
    }));
  }
}

/**
 * Updates the session data via a mutator function.
 * @param {Function} updater - Receives the session object for mutation.
 */
function updateSession(updater) {
  const raw = sessionStorage.getItem(SESSION_KEY);
  if (!raw) return;

  const data = JSON.parse(raw);
  updater(data);
  data.totalEngagementMs = Math.round(performance.now() - sessionStartTime);
  sessionStorage.setItem(SESSION_KEY, JSON.stringify(data));
}

/**
 * Tracks scroll depth at milestone breakpoints (25%, 50%, 75%, 100%).
 * Deduplicates — each milestone is recorded only once per session.
 * @param {number} depthPercent
 */
export function trackScrollDepth(depthPercent) {
  if (scrollDepthReached.has(depthPercent)) return;
  scrollDepthReached.add(depthPercent);

  updateSession(data => {
    data.scrollDepths.push({
      depth: depthPercent,
      timestamp: new Date().toISOString(),
      elapsedMs: Math.round(performance.now() - sessionStartTime)
    });
  });
}

/**
 * Marks the entry time for a slide panel.
 * @param {string} slideId
 */
export function trackSlideEnter(slideId) {
  slideEntryTimes[slideId] = performance.now();
}

/**
 * Records the time spent on a slide panel.
 * @param {string} slideId
 */
export function trackSlideLeave(slideId) {
  const entryTime = slideEntryTimes[slideId];
  if (!entryTime) return;

  const duration = performance.now() - entryTime;
  updateSession(data => {
    if (!data.slideTimings[slideId]) data.slideTimings[slideId] = 0;
    data.slideTimings[slideId] += Math.round(duration);
  });
  delete slideEntryTimes[slideId];
}

/**
 * Tracks a hotspot interaction click.
 * @param {string} hotspotId
 */
export function trackHotspotClick(hotspotId) {
  updateSession(data => {
    data.hotspotClicks.push({
      hotspotId,
      timestamp: new Date().toISOString(),
      elapsedMs: Math.round(performance.now() - sessionStartTime)
    });
  });
}

/**
 * Tracks a CTA button click (e.g., "Falar com Broker", "Agendar Café").
 * @param {string} ctaId
 */
export function trackCTAClick(ctaId) {
  updateSession(data => {
    data.ctaClicks.push({
      ctaId,
      timestamp: new Date().toISOString(),
      elapsedMs: Math.round(performance.now() - sessionStartTime)
    });
  });
}

/**
 * Returns the full session metrics object.
 * @returns {Object}
 */
export function getSessionMetrics() {
  const raw = sessionStorage.getItem(SESSION_KEY);
  if (!raw) return {};

  const data = JSON.parse(raw);
  data.totalEngagementMs = Math.round(performance.now() - sessionStartTime);
  return data;
}

/**
 * Calculates the Desire Score™ based on accumulated session engagement.
 * Score range: 0–100.
 *
 * Scoring matrix:
 *   +10 per scroll depth milestone reached
 *   +5  per hotspot clicked
 *   +15 per CTA clicked
 *   +1  per 10 seconds of engagement (cap: 30)
 *   +30 if 3D deck was viewed (scroll ≥ 50%)
 *
 * @returns {number}
 */
export function getDesireScoreFromAnalytics() {
  const metrics = getSessionMetrics();
  let score = 0;

  // Scroll depth milestones
  score += (metrics.scrollDepths?.length || 0) * 10;

  // Hotspot interactions
  score += (metrics.hotspotClicks?.length || 0) * 5;

  // CTA clicks
  score += (metrics.ctaClicks?.length || 0) * 15;

  // Engagement time (1 point per 10s, max 30)
  const engagementSec = (metrics.totalEngagementMs || 0) / 1000;
  score += Math.min(30, Math.floor(engagementSec / 10));

  // 3D deck viewing bonus (FR-LNX-02: viewed_3d_deck)
  if (metrics.scrollDepths?.some(d => d.depth >= 50)) {
    score += 30;
  }

  return Math.min(100, score);
}
