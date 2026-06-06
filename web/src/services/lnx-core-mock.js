/**
 * ==========================================================================
 * YACHTMAX EXPERIENCE SYSTEM™ — LNX-CORE CRM MOCK SERVICE
 * Simulates the LNX-Core Custom API for local development.
 * Implements FR-LNX-01 (Lead Registration) and FR-LNX-02 (Desire Score™).
 * ==========================================================================
 */

import { getDesireScoreFromAnalytics } from './analytics';

const LEADS_STORAGE_KEY = 'yachtmax_lnx_core_leads';

/**
 * Retrieves stored leads from localStorage.
 * @returns {Array}
 */
function getStoredLeads() {
  try {
    return JSON.parse(localStorage.getItem(LEADS_STORAGE_KEY) || '[]');
  } catch {
    return [];
  }
}

/**
 * Persists leads array to localStorage.
 * @param {Array} leads
 */
function storeLeads(leads) {
  localStorage.setItem(LEADS_STORAGE_KEY, JSON.stringify(leads));
}

/**
 * Simulates POST /api/v1/leads/register (FR-LNX-01).
 *
 * @param {Object} leadData
 * @param {string} leadData.lead_name
 * @param {string} leadData.lead_contact
 * @param {string|null} leadData.lead_email
 * @param {string} leadData.interaction_type - 'broker_contact' | 'cafe_marina'
 * @param {string|null} leadData.interest
 * @returns {Promise<Object>} - Simulated API response
 */
export async function registerLead(leadData) {
  // Simulate network latency (800ms)
  await new Promise(resolve => setTimeout(resolve, 800));

  const desireScore = getDesireScoreFromAnalytics();

  const lead = {
    lead_id: crypto.randomUUID(),
    lead_name: leadData.lead_name,
    lead_contact: leadData.lead_contact,
    lead_email: leadData.lead_email || null,
    preferred_broker_id: 'uuid-broker-01',
    target_yacht_id: null,
    interaction_type: leadData.interaction_type,
    interest: leadData.interest || null,
    utm_source: new URLSearchParams(window.location.search).get('utm_source') || 'direct',
    client_analytics: {
      desire_score: desireScore,
      viewed_3d_deck: desireScore >= 30,
      session_engagement_ms: Math.round(performance.now())
    },
    created_at: new Date().toISOString(),
    status: 'new'
  };

  // Persist to localStorage (simulating Supabase/LNX-Core)
  const leads = getStoredLeads();
  leads.push(lead);
  storeLeads(leads);

  console.log('[LNX-Core Mock] Lead registered:', lead);

  return {
    success: true,
    data: {
      lead_id: lead.lead_id,
      desire_score: desireScore,
      status: 'registered',
      broker_assigned: 'Marina São Gonçalo — Equipe Premium'
    }
  };
}

/**
 * Retrieves current Desire Score™ for the active session.
 * @returns {number}
 */
export function getDesireScore() {
  return getDesireScoreFromAnalytics();
}

/**
 * Lists all leads stored locally (dev tool utility).
 * @returns {Array}
 */
export function listLeads() {
  return getStoredLeads();
}
