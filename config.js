// ============================================
// TimeWise EMS2 Configuration File (ems2 branch)
// Version: 4.0-ems2 — Supabase backend
// ============================================
//
// STEP 1: paste the two Supabase values below (Project Settings → Data API /
//         API Keys → Project URL + anon PUBLIC key — the anon key is safe to
//         publish; security is enforced by the database, not the key).
//
// At go-live this same file ships on the main branch with IS_TEST_PORTAL: false.
// ============================================

const CONFIG = {
    SUPABASE_URL: 'https://kwwveapuniegeahbxeee.supabase.co',
    SUPABASE_ANON_KEY: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt3d3ZlYXB1bmllZ2VhaGJ4ZWVlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODM0MDU4ODYsImV4cCI6MjA5ODk4MTg4Nn0.pjQ3sgh8iUo_cZNrgow24qcFL4ihMwYkVLgIQTpnI7c',

    IS_TEST_PORTAL: window.location.hostname.indexOf('ems2') === 0,          // shows the gold TEST PORTAL ribbon on every page

    // App
    VERSION: '4.0-ems2',
    SESSION_TIMEOUT: 720,          // minutes; actual auth session is managed by Supabase

    // Date limits (also enforced server-side now)
    MAX_PAST_DAYS_TIMESHEET: 7,
    MAX_PAST_DAYS_EXPENSE: 7,
    MAX_PAST_DAYS_LEAVE: 7,
    MAX_FUTURE_MONTHS_LEAVE: 6,

    // Working hours
    FULL_DAY_HOURS: 6,
    HALF_DAY_HOURS: 3
};

// Legacy global kept so untouched code paths never break
const API_URL = '';
