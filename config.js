// ============================================
// TimeWise Configuration File
// Version: 3.1
// Last Updated: 02-Feb-2026
// ============================================
// 
// UPDATE THIS URL WHEN DEPLOYING NEW BACKEND VERSION
// All HTML files reference this single file
//
// ============================================

const CONFIG = {
    // Backend API URL - UPDATE THIS WHEN URL CHANGES
    API_URL: 'https://script.google.com/macros/s/AKfycby9UCIR3MFDgCWaTYyjyXG5OfnbrbJ8P7hI6RgdYhp1iCH_AYs3Ip29JdzvW_KZcUFhLQ/exec',
    
    // App Version
    VERSION: '3.1',
    
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
