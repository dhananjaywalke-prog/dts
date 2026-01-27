# ============================================
# TimeWise Project Documentation
# ============================================
# Last Updated: 26-Jan-2026
# Purpose: Complete project state for session continuity
# ============================================

## PROJECT OVERVIEW

**Project Name:** TimeWise - Employee Timesheet System
**Type:** Web Application with Google Sheets Backend
**Tech Stack:**
- Frontend: HTML + Tailwind CSS + Vanilla JavaScript
- Backend: Google Apps Script
- Database: Google Sheets

**Google Sheet ID:** 11JYTgZ6RWRZ5lS0Gi6GH49buGjQOl4h6SVsittDe-i8
**API URL:** https://script.google.com/macros/s/AKfycbwDUtXFqFRygwVRBdBzg7EsMN2tFVImbhGPov3cVnfBy-CI368IIM6jDmtJOLsxcLglBA/exec

---

## CURRENT VERSIONS

| Component | Version | File |
|-----------|---------|------|
| Backend | **v2.6** | timewise-backend-v2.6.js |
| Frontend | **v1.5** | timewise-webapp-v1.5.html (or index.html for GitHub) |

---

## GOOGLE SHEETS STRUCTURE

### Sheet: Timesheets
| Column | Purpose |
|--------|---------|
| Row ID | UUID - unique identifier |
| Date | Work date (YYYY-MM-DD) |
| Employee Email | User identifier |
| Client | Client name |
| Task | Task/work name |
| Hours | Hours worked (0.25 intervals) |
| Description | Work description |
| Expense Type | Type of expense or "Not Applicable" |
| Expense Amount | Amount in INR (whole numbers) |
| Timestamp | When entry was created/edited (IST) |
| Audit Trail | "Approved" / "Edited" / "Deleted" |
| Trailstamp | When entry was edited/deleted (IST) or blank |

### Sheet: Employees
| Key Columns |
|-------------|
| Employee Email |
| Employee Name |
| Employee ID |
| Designation |
| Employee Status (Active/Inactive) |
| Joining Date |
| Leaving Date |
| Team Allocation |
| Employee PAN |
| Professional ID |
| Employee Contact |

### Sheet: Clients
| Key Columns |
|-------------|
| Client Full Name |
| Client Status (Active/Inactive) |

### Sheet: Tasks
| Key Columns |
|-------------|
| Work Name |
| Work Status (Active/Inactive) |

### Sheet: Exps (Expense Types)
| Key Columns |
|-------------|
| Expense Type |

### Sheet: Holidays (NEW in v2.6)
| Column | Purpose |
|--------|---------|
| Row ID | (Optional - ignored) |
| Date | Holiday date |
| Employee Email | "All" or specific email |
| Client | Client name for holiday entry |
| Task | Task name (e.g., "Holiday", "Leave") |
| Hours | Usually 6 |
| Description | Holiday description |
| Expense Type | Usually "Not Applicable" |
| Expense Amount | Usually 0 |
| Status | "Active" / "Inactive" |

---

## IMPLEMENTED FEATURES

### Core Features
- [x] Employee login by email
- [x] View employee profile details
- [x] Calendar view (current + previous month)
- [x] Add timesheet entries
- [x] Edit timesheet entries (within 7 days)
- [x] Delete timesheet entries (within 7 days)
- [x] View entries (up to 31 days)
- [x] Expense tracking with type and amount

### Audit Trail (v2.5)
- [x] New entries get Audit Trail = "Approved", Trailstamp = blank
- [x] Edit: Original row → "Edited" + Trailstamp, New row → "Approved" with current timestamp
- [x] Delete: Row → "Deleted" + Trailstamp (row not removed)
- [x] Web app only shows "Approved" entries

### Holidays Feature (v2.6 / v1.5)
- [x] Holidays master sheet with Status column
- [x] Auto-populate holidays at 6 AM daily trigger
- [x] 7-day catch-up mechanism (checks today + last 7 days)
- [x] Tenure check (Joining Date ≤ Holiday ≤ Leaving Date)
- [x] User-specific holidays prevail over "All"
- [x] Blue calendar indicator for holidays
- [x] Holiday banner when selecting holiday date
- [x] Delete warning for holiday entries

### Validations (v1.4 - 19 Total)
| # | Validation | Type |
|---|------------|------|
| 14 | Hours in 0.25 intervals only | Hard block |
| 15 | Total daily hours ≤ 24 | Hard block |
| 16 | Warn if daily hours < 6 | Soft warning |
| 17 | Warn if single entry > 6 hours | Soft warning |
| 20 | Warn if filling for dates > 3 days old | Soft warning |
| 21 | Prevent duplicate client+task+date | Hard block |
| 22 | Validate client is active | Hard block (dropdown filter) |
| 23 | Validate task is active | Hard block (dropdown filter) |
| 24 | Description max 500 characters | Hard block |
| 25 | No special characters/digits only | Hard block |
| 26 | Must contain at least 5 words | Hard block |
| 27 | Block same description in last 7 days | Hard block |
| 29 | Expense amount whole numbers only | Hard block |
| 33 | Session timeout 30 min + 2 min warning | Auto-logout |
| 35 | Warn if editing old entry (> 3 days) | Soft warning |
| 36 | Prevent editing others' entries | Backend (email filter) |
| 38 | Trim whitespace from all inputs | Auto-fix |
| 39 | Disable submit while form incomplete | UX |
| 40 | Real-time validation feedback | UX |
| 41 | Confirm logout with unsaved data | Soft warning |

### UX Features
- [x] Loading indicators (spinner overlay for delete, button spinners for add/edit)
- [x] Session timeout modal with countdown
- [x] Real-time field validation (green/red borders)
- [x] Character counter for description
- [x] Total hours badge per day
- [x] Color-coded calendar (green ≥6hrs, yellow <6hrs, blue = holiday)

---

## PENDING FEATURES (Discussed but not implemented)

### Priority 1 - Easy
| Feature | Effort | Notes |
|---------|--------|-------|
| Block login after 7 days from leaving date | 30 min | Check in getEmployee or frontend |
| Expense Description field (long text) | 1 hr | New column + textarea in form |

### Priority 3 - Complex
| Feature | Effort | Notes |
|---------|--------|-------|
| Upload expense proofs (images/PDF) | 8-12 hrs | Needs Google Drive integration or external storage |

### Workaround Suggested for File Upload
- Add text field "Expense Proof Link" where user pastes Google Drive link manually

---

## TIMEZONE HANDLING (IMPORTANT)

**Issue Resolved:** Google Sheets was adding +5:30 offset to timestamps.

**Solution (v2.3+):**
```javascript
// IST-safe timestamp
const timestamp = new Date(
  Utilities.formatDate(new Date(), "Asia/Kolkata", "yyyy/MM/dd HH:mm:ss")
);
```

**Key Settings:**
- Script timezone: Asia/Kolkata
- Spreadsheet timezone: Asia/Calcutta (same as Kolkata)
- All timestamps stored and displayed in IST

---

## KEY TECHNICAL DECISIONS

1. **Spreadsheet Reference:** Using `openById()` instead of `getActiveSpreadsheet()` for public web app deployment

2. **Audit Trail Approach:** Single sheet with status column instead of separate audit log sheet

3. **Timestamp Logic on Edit:**
   - Original row: Keeps original Timestamp, gets Trailstamp (edit time)
   - New row: Gets current Timestamp (edit time), blank Trailstamp

4. **Active Items Only:** Dropdowns show only active Clients (Client Status = "Active") and Tasks (Work Status = "Active")

5. **Session Management:** 30-minute timeout with 2-minute warning modal, resets on user activity

6. **Holidays Trigger:** Daily at 6 AM IST, processes today + last 7 days for catch-up

---

## FILE LOCATIONS

All output files are saved to: `/mnt/user-data/outputs/`

| File | Description |
|------|-------------|
| timewise-backend-v2.6.js | Current backend code (with Holidays) |
| timewise-webapp-v1.5.html | Current frontend code (with Holidays) |
| index.html | Same as v1.5, renamed for GitHub Pages |
| TIMEWISE_PROJECT_README.md | This documentation |

---

## DEPLOYMENT

### Backend (Google Apps Script)
1. Open Google Apps Script editor
2. Replace ALL code with timewise-backend-v2.6.js
3. Save (Ctrl+S)
4. Deploy → Manage deployments → Edit (pencil icon)
5. Version → New version
6. Deploy

### Daily Trigger Setup
1. In Apps Script, click ⏰ Triggers
2. Click + Add Trigger
3. Function: `autoPopulateHolidays`
4. Event source: Time-driven
5. Type: Day timer
6. Time: 6am to 7am
7. Deployment: Head
8. Save

### Frontend (GitHub Pages)
1. Create GitHub repository
2. Upload `index.html` file
3. Go to Settings → Pages
4. Source: Deploy from branch
5. Branch: main, folder: / (root)
6. Save
7. Wait 1-2 minutes
8. Access at: `https://yourusername.github.io/repositoryname`

---

## TESTING CHECKLIST

### After Backend Changes
- [x] Add new entry → Check Audit Trail = "Approved"
- [x] Edit entry → Check old row "Edited" + Trailstamp, new row "Approved"
- [x] Delete entry → Check "Deleted" + Trailstamp
- [x] Verify only "Approved" entries show in web app
- [x] testHolidayPopulation() → Creates holiday entries
- [x] autoPopulateHolidays() → Skips existing entries

### After Frontend Changes
- [x] All validations working
- [x] Loading indicators showing
- [x] Session timeout working
- [x] Form reset after submit
- [x] Blue calendar color for holidays
- [x] Holiday banner displayed
- [x] Delete warning for holiday entries

---

## CONTACT/CONTEXT

- User timezone: IST (India Standard Time, UTC+5:30)
- User location: India
- Sheet locale: India
- Currency: INR (₹)
- Company: DRP & Co. LLP (Chartered Accountants)
- Website: www.drpca.com

---

## VERSION HISTORY

| Date | Backend | Frontend | Key Changes |
|------|---------|----------|-------------|
| 24-Jan-2026 | v1.0-v2.0 | v1.0-v1.2 | Initial development, timestamp fixes |
| 25-Jan-2026 | v2.3 | v1.2 | Timestamp fix finalized |
| 25-Jan-2026 | v2.4 | v1.3 | openById(), loading indicators |
| 25-Jan-2026 | v2.4 | v1.4 | 19 validations, session timeout |
| 25-Jan-2026 | v2.5 | v1.4 | Audit Trail implementation |
| 26-Jan-2026 | **v2.6** | **v1.5** | **Holidays auto-population feature** |

---

# END OF PROJECT DOCUMENTATION
