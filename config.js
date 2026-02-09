// ============================================
// TimeWise Configuration File
// Version: 3.2 (Performance Optimized)
// Last Updated: 02-Feb-2026
// ============================================
// 
// UPDATE THIS URL WHEN DEPLOYING NEW BACKEND VERSION
// All HTML files reference this single file
//
// ============================================

const CONFIG = {
    // Backend API URL - UPDATE THIS WHEN URL CHANGES
    API_URL: 'https://script.google.com/macros/s/AKfycbw9xntJE9JVsBLmSid2J0w80kYW7m5HJ08X3fYUQiarLFrLCZ-3P_yVIOk-ATm-nu7lEA/exec',
    
    // App Version
    VERSION: '3.3',
    
    // Session timeout in minutes
    SESSION_TIMEOUT: 30,
    
    // Date limits
    MAX_PAST_DAYS_TIMESHEET: 7,
    MAX_PAST_DAYS_EXPENSE: 7,
    MAX_PAST_DAYS_LEAVE: 7,
    MAX_FUTURE_MONTHS_LEAVE: 6,
    
    // Working hours
    FULL_DAY_HOURS: 6,
    HALF_DAY_HOURS: 3
};

// Make API_URL available globally for backward compatibility
const API_URL = CONFIG.API_URL;
