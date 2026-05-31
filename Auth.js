// ── INIT SUPABASE ─────────────────────────────────
const supabaseUrl     = 'https://nfuvwkophsugdbnxgljp.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5mdXZ3a29waHN1Z2RibnhnbGpwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk5NjYxNDQsImV4cCI6MjA5NTU0MjE0NH0.WnhS_qqVwtxnoBivgOUylGbqgxJQzd9Kaoj6Pa1tTlI'
const supabaseClient  = window.supabase.createClient(
    supabaseUrl,
    supabaseAnonKey,
    {
        auth: {
            persistSession:     true,
            autoRefreshToken:   true,
            detectSessionInUrl: true,
            storage:            window.localStorage
        }
    }
)

// ── HELPER: GET CURRENT USER ──────────────────────
async function getCurrentUser() {
    const { data: sessionData } =
        await supabaseClient.auth.getSession()
    if (sessionData?.session?.user) {
        return sessionData.session.user
    }
    const { data: userData } =
        await supabaseClient.auth.getUser()
    return userData?.user ?? null
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
const toLoginLink  = document.getElementById('to-login')
const toSignupLink = document.getElementById('to-signup')
const signupBtn    = document.getElementById('signup-btn')
const signinBtn    = document.getElementById('signin-btn')

if (toLoginLink) {
    toLoginLink.addEventListener('click', (e) => {
        e.preventDefault()
        signupForm.classList.add('hidden')
        signinForm.classList.remove('hidden')
    })
}

if (toSignupLink) {
    toSignupLink.addEventListener('click', (e) => {
        e.preventDefault()
        signinForm.classList.add('hidden')
        signupForm.classList.remove('hidden')
    })
}

if (signupForm) {
    signupForm.addEventListener('submit', async (e) => {
        e.preventDefault()
        const fullName = document.getElementById('signup-username').value
        const email    = document.getElementById('signup-email').value
        const password = document.getElementById('signup-password').value

        signupBtn.disabled  = true
        signupBtn.innerText = 'Signing up...'

        const { error } = await supabaseClient.auth.signUp({
            email,
            password,
            options: { data: { full_name: fullName } }
        })

        signupBtn.disabled  = false
        signupBtn.innerText = 'Submit Sign Up'

        if (error) {
            alert('Sign Up Error: ' + error.message)
        } else {
            alert('Sign up successful! Redirecting...')
            window.location.href = 'calculator.html'
        }
    })
}

if (signinForm) {
    signinForm.addEventListener('submit', async (e) => {
        e.preventDefault()
        const email    = document.getElementById('signin-email').value
        const password = document.getElementById('signin-password').value

        signinBtn.disabled  = true
        signinBtn.innerText = 'Logging in...'

        const { error } = await supabaseClient.auth.signInWithPassword({
            email,
            password
        })

        signinBtn.disabled  = false
        signinBtn.innerText = 'Submit Sign In'

        if (error) {
            alert('Sign In Error: ' + error.message)
        } else {
            window.location.href = 'calculator.html'
        }
    })
}

// ── SAVE CALCULATION TO HISTORY ───────────────────
// Saves locally for all users, and syncs to Supabase when logged in.
async function saveCalculationToHistory(
    turnoverAmount, calculatedTax, taxSavedAmount
) {
    try {
        const currentCountry =
            document.getElementById('countries-select')?.value || 'Unknown'
        const entry = {
            turnover:  Number(turnoverAmount) || 0,
            tax_owed:  Number(calculatedTax)  || 0,
            tax_saved: Number(taxSavedAmount) || 0,
            country:   currentCountry,
            created_at: new Date().toISOString()
        }

        saveLocalCalculationHistory(entry)

        const user = await getCurrentUser()
        if (!user) {
            console.log('Not logged in — saved history locally.')
            return
        }

        const { error } = await supabaseClient
            .from('calculations_history')
            .insert([{
                user_id:   user.id,
                turnover:  entry.turnover,
                tax_owed:  entry.tax_owed,
                tax_saved: entry.tax_saved,
                country:   entry.country,
                created_at: entry.created_at
            }])

        if (error) {
            console.error('Save error:', error.message)
        } else {
            console.log('✓ Saved to Supabase history')
        }
    } catch (err) {
        console.error('saveCalculationToHistory failed:', err)
    }
}

// ── FETCH HISTORY FROM SUPABASE OR LOCAL STORAGE ───
async function getUserCalculationHistory() {
    try {
        const localHistory = getLocalCalculationHistory()
        const user = await getCurrentUser()
        if (!user) {
            console.log('Not logged in — using local history.')
            return localHistory
        }

        const { data, error } = await supabaseClient
            .from('calculations_history')
            .select('turnover, tax_owed, tax_saved, created_at, country')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false })

        if (error) {
            console.error('Fetch error:', error.message)
            return localHistory
        }

        const remoteHistory = data || []
        const mergedHistory = [...remoteHistory, ...localHistory]
            .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))

        return mergedHistory
    } catch (err) {
        console.error('getUserCalculationHistory failed:', err)
        return getLocalCalculationHistory()
    }
}

// ── SIDEBAR INTERACTIONS ──────────────────────────
document.addEventListener('DOMContentLoaded', () => {
    const historySidebar    = document.getElementById('history-sidebar')
    const openHistoryBtn    = document.getElementById('open-history-btn')
    const closeHistoryBtn   = document.getElementById('close-history-btn')
    const refreshHistoryBtn = document.getElementById('refresh-history-btn')

    if (openHistoryBtn) {
        openHistoryBtn.addEventListener('click', () => {
            historySidebar.classList.add('open')
            loadSidebarHistory()
        })
    }

    if (closeHistoryBtn) {
        closeHistoryBtn.addEventListener('click', () => {
            historySidebar.classList.remove('open')
        })
    }

    if (refreshHistoryBtn) {
        refreshHistoryBtn.addEventListener('click', loadSidebarHistory)
    }
})

// ── SIDEBAR HISTORY RENDERER ──────────────────────
async function loadSidebarHistory() {
    const container = document.getElementById('history-entries')
    if (!container) return

    container.innerHTML = `
        <p style="color:#0083d6;text-align:center;font-weight:bold;">
            ⏳ Loading…
        </p>`

    const historyData = await getUserCalculationHistory()

    if (!historyData || historyData.length === 0) {
        container.innerHTML = `
            <p style="color:#627d98;text-align:center;">
                No history yet.<br>Make a calculation first!
            </p>`
        return
    }

    container.innerHTML = buildHistoryHTML(historyData)
}

// ── SHARED HTML BUILDER (used by sidebar + tab) ───
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

    const user = await getCurrentUser()
    const localHistory = getLocalCalculationHistory()

    if (!user) {
        if (localHistory.length > 0) {
            container.innerHTML = buildHistoryHTML(localHistory)
            return
        }

        container.innerHTML = `
            <div style="text-align:center;padding:40px 20px;color:#627d98;">
                <div style="font-size:2.5rem;margin-bottom:12px;">🔒</div>
                <p style="font-weight:bold;margin-bottom:6px;">
                    Sign in to sync history
                </p>
                <p style="font-size:0.9rem;">
                    Calculations are saved locally for now.
                    <a href="index.html"
                       style="color:#0083d6;font-weight:700;">
                        Log in here →
                    </a>
                </p>
            </div>`
        return
    }

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
