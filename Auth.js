// ── USER UUID SYSTEM ──────────────────────────────
// Generate a unique ID for this user/device on first visit
const USER_ID_KEY = 'tax_shield_user_id'

function getUserId() {
    let userId = window.localStorage.getItem(USER_ID_KEY)
    
    if (!userId) {
        // Generate a new UUID v4
        userId = generateUUID()
        window.localStorage.setItem(USER_ID_KEY, userId)
        console.log('✓ New user ID created:', userId)
    }
    
    return userId
}

function generateUUID() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        const r = Math.random() * 16 | 0
        const v = c === 'x' ? r : (r & 0x3 | 0x8)
        return v.toString(16)
        // after generating send user to tax cal
         
    })
}

const LOCAL_HISTORY_KEY = 'calculation_history_local'

function getLocalCalculationHistory() {
    try {
        const raw = window.localStorage.getItem(LOCAL_HISTORY_KEY)
        if (!raw) return []
        const parsed = JSON.parse(raw)
        if (!Array.isArray(parsed)) return []
        return parsed.sort((a, b) =>
            new Date(b.created_at) - new Date(a.created_at)
        )
    } catch (err) {
        console.warn('Could not read local history:', err)
        return []
    }
}

function saveLocalCalculationHistory(entry) {
    try {
        const history = getLocalCalculationHistory()
        history.unshift(entry)
        window.localStorage.setItem(
            LOCAL_HISTORY_KEY,
            JSON.stringify(history.slice(0, 50))
        )
    } catch (err) {
        console.warn('Could not save local history:', err)
    }
}

// ── AUTH FORMS (index.html only) ──────────────────
const signupForm   = document.getElementById('signup-form')
const signinForm   = document.getElementById('signin-form')

// ── SHARED HTML BUILDER (used by tab) ──────────────

// ── SAVE CALCULATION TO HISTORY ───────────────────
// Saves to localStorage under the user's UUID
async function saveCalculationToHistory(
    turnoverAmount, calculatedTax, taxSavedAmount
) {
    try {
        const currentCountry =
            document.getElementById('countries-select')?.value || 'Unknown'
        const entry = {
            id: Date.now(),
            turnover:  Number(turnoverAmount) || 0,
            tax_owed:  Number(calculatedTax)  || 0,
            tax_saved: Number(taxSavedAmount) || 0,
            country:   currentCountry,
            created_at: new Date().toISOString()
        }

        saveLocalCalculationHistory(entry)
        console.log('✓ Calculation saved to history')
    } catch (err) {
        console.error('saveCalculationToHistory failed:', err)
    }
}

// ── FETCH HISTORY FROM LOCAL STORAGE ───────────────
async function getUserCalculationHistory() {
    try {
        const localHistory = getLocalCalculationHistory()
        return localHistory
    } catch (err) {
        console.error('getUserCalculationHistory failed:', err)
        return getLocalCalculationHistory()
    }
}

// ── SHARED HTML BUILDER (used by tab) ──────────────
function buildHistoryHTML(historyData) {
    const symbols = {
        'ghana':             '₵',
        'nigeria':           '₦',
        'kenya':             'KSh',
        'south africa':      'R',
        'egypt':             'E£',
        'mauritius':         'Rs',
        'rwanda':            'FRw',
        'equatorial guinea': 'XAF'
    }

    let html = '<div style="display:flex;flex-direction:column;gap:14px;">'

    historyData.forEach(row => {
        const date = new Date(row.created_at)
            .toLocaleDateString('en-NG', { dateStyle: 'medium' })
        const time = new Date(row.created_at)
            .toLocaleTimeString('en-NG', { timeStyle: 'short' })
        const key  = String(row.country || '').toLowerCase().trim()
        const sym  = symbols[key] || '$'

        html += `
            <div style="
                background:#fff;
                border-radius:16px;
                padding:18px 20px;
                border:1px solid rgba(0,131,214,0.12);
                border-left:4px solid #0083d6;
                box-shadow:0 2px 10px rgba(15,23,42,0.06);
                color:#102a43;
            ">
                <div style="
                    display:flex;
                    justify-content:space-between;
                    align-items:center;
                    margin-bottom:12px;
                ">
                    <span style="
                        background:rgba(0,131,214,0.08);
                        color:#0083d6;
                        font-size:0.75rem;
                        font-weight:700;
                        padding:3px 10px;
                        border-radius:999px;
                        text-transform:capitalize;
                    ">${row.country || 'Unknown'}</span>
                    <span style="font-size:0.75rem;color:#627d98;">
                        ${date} · ${time}
                    </span>
                </div>
                <div style="
                    display:grid;
                    grid-template-columns:1fr 1fr 1fr;
                    gap:10px;
                    text-align:center;
                ">
                    <div style="background:#f0f7ff;border-radius:12px;padding:12px 8px;">
                        <div style="font-size:0.7rem;color:#627d98;font-weight:700;
                                    margin-bottom:4px;text-transform:uppercase;">
                            Amount
                        </div>
                        <div style="font-size:1rem;font-weight:800;color:#102a43;">
                            ${sym}${Number(row.turnover || 0).toLocaleString()}
                        </div>
                    </div>
                    <div style="background:#fff0f0;border-radius:12px;padding:12px 8px;">
                        <div style="font-size:0.7rem;color:#c53030;font-weight:700;
                                    margin-bottom:4px;text-transform:uppercase;">
                            Tax Owed
                        </div>
                        <div style="font-size:1rem;font-weight:800;color:#c53030;">
                            ${sym}${Number(row.tax_owed || 0).toLocaleString()}
                        </div>
                    </div>
                    <div style="background:#f0fff6;border-radius:12px;padding:12px 8px;">
                        <div style="font-size:0.7rem;color:#276749;font-weight:700;
                                    margin-bottom:4px;text-transform:uppercase;">
                            Tax Saved
                        </div>
                        <div style="font-size:1rem;font-weight:800;color:#276749;">
                            ${sym}${Number(row.tax_saved || 0).toLocaleString()}
                        </div>
                    </div>
                </div>
            </div>`
    })

    html += '</div>'
    return html
}

// ── IN-PAGE HISTORY TAB LOADER ────────────────────
async function loadHistoryTab() {
    const container = document.getElementById('history-tab-entries')
    if (!container) return

    container.innerHTML = `
        <p style="text-align:center;color:#0083d6;
                  font-weight:bold;padding:20px 0;">
            ⏳ Loading your history…
        </p>`

    const historyData = await getUserCalculationHistory()

    if (!historyData || historyData.length === 0) {
        container.innerHTML = `
            <div style="text-align:center;padding:40px 20px;color:#627d98;">
                <div style="font-size:2.5rem;margin-bottom:12px;">📭</div>
                <p style="font-weight:bold;margin-bottom:6px;">
                    No calculations yet.
                </p>
                <p style="font-size:0.9rem;">
                    Run your first calculation and it will appear here.
                </p>
            </div>`
        return
    }

    container.innerHTML = buildHistoryHTML(historyData)
}

// ── DELETE A HISTORY ENTRY ───────────────────────
function deleteHistoryEntry(entryId) {
    try {
        const history = getLocalCalculationHistory()
        const filtered = history.filter(entry => entry.id !== entryId)
        window.localStorage.setItem(
            LOCAL_HISTORY_KEY,
            JSON.stringify(filtered)
        )
        console.log('✓ Entry deleted successfully')
        return true
    } catch (err) {
        console.error('deleteHistoryEntry failed:', err)
        return false
    }
}

// ── CLEAR LOCAL HISTORY ──────────────────────────
function clearLocalHistory() {
    try {
        window.localStorage.removeItem(LOCAL_HISTORY_KEY)
        console.log('✓ Local history cleared')
        return true
    } catch (err) {
        console.error('Could not clear local history:', err)
        return false
    }
}

// ── CLEAR ALL HISTORY (same as clearLocalHistory) ─
function clearAllHistory() {
    return clearLocalHistory()
}

// ── EXPORT HISTORY AS CSV ────────────────────────
async function exportHistoryAsCSV() {
    try {
        const historyData = await getUserCalculationHistory()
        
        if (!historyData || historyData.length === 0) {
            console.warn('No history to export')
            return null
        }

        // Build CSV header
        const headers = ['Date', 'Time', 'Country', 'Amount', 'Tax Owed', 'Tax Saved']
        const rows = []

        // Add data rows
        historyData.forEach(entry => {
            const date = new Date(entry.created_at)
            const dateStr = date.toLocaleDateString('en-NG')
            const timeStr = date.toLocaleTimeString('en-NG')
            
            rows.push([
                dateStr,
                timeStr,
                entry.country || 'Unknown',
                entry.turnover || 0,
                entry.tax_owed || 0,
                entry.tax_saved || 0
            ])
        })

        // Combine headers and rows
        const csvContent = [
            headers.join(','),
            ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
        ].join('\n')

        // Create and trigger download
        const blob = new Blob([csvContent], { type: 'text/csv' })
        const url = window.URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url
        link.download = `tax-shield-history-${new Date().toISOString().split('T')[0]}.csv`
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        window.URL.revokeObjectURL(url)

        console.log('✓ History exported as CSV')
        return true
    } catch (err) {
        console.error('exportHistoryAsCSV failed:', err)
        return false
    }
}

// ── GET HISTORY STATISTICS ──────────────────────
async function getHistoryStats() {
    try {
        const historyData = await getUserCalculationHistory()
        
        if (!historyData || historyData.length === 0) {
            return {
                totalCalculations: 0,
                totalTaxOwed: 0,
                totalTaxSaved: 0,
                averageTaxRate: 0,
                dateRange: null
            }
        }

        const totalTaxOwed = historyData.reduce((sum, entry) => 
            sum + (Number(entry.tax_owed) || 0), 0
        )
        
        const totalTurnover = historyData.reduce((sum, entry) => 
            sum + (Number(entry.turnover) || 0), 0
        )
        
        const totalTaxSaved = historyData.reduce((sum, entry) => 
            sum + (Number(entry.tax_saved) || 0), 0
        )

        const averageTaxRate = totalTurnover > 0 
            ? ((totalTaxOwed / totalTurnover) * 100).toFixed(2)
            : 0

        const dates = historyData
            .map(entry => new Date(entry.created_at))
            .sort((a, b) => a - b)

        return {
            totalCalculations: historyData.length,
            totalTaxOwed: totalTaxOwed,
            totalTaxSaved: totalTaxSaved,
            averageTaxRate: averageTaxRate,
            dateRange: dates.length > 0 ? {
                from: dates[0].toLocaleDateString(),
                to: dates[dates.length - 1].toLocaleDateString()
            } : null
        }
    } catch (err) {
        console.error('getHistoryStats failed:', err)
        return null
    }
}
