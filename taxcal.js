/**
 * taxcal.js - The "Mouth"
 * Handles UI + saves to history.
 * No forced login — works for everyone,
 * saves silently if logged in.
 */

// ── MAIN CALCULATION HANDLER ──────────────────────
function calculateTax(country, isBusiness, monthlyAmount) {
    const resultBox = document.getElementById('resultBox')

    if (!country || monthlyAmount <= 0 || Number.isNaN(monthlyAmount)) {
        resultBox.innerHTML =
            '<p style="color:red;">Please fill in all fields correctly.</p>'
        return
    }

    const annualAmount = monthlyAmount * 12
    const countryKey   = country.toLowerCase().trim()

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
    const currency = symbols[countryKey] || '$'

    function fmt(n) {
        return Number(n || 0).toLocaleString(undefined, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        })
    }

    function renderTotals(yearlyTax) {
        const monthlyTax = yearlyTax / 12
        return `
            <p><strong>Monthly ${isBusiness ? 'Revenue' : 'Salary'}:</strong>
               ${currency}${monthlyAmount.toLocaleString()}</p>
            <p><strong>Annual ${isBusiness ? 'Revenue' : 'Salary'}:</strong>
               ${currency}${annualAmount.toLocaleString()}</p>
            <p><strong>Monthly Tax:</strong>
               ${currency}${fmt(monthlyTax)}</p>
            <h4 style="color:${isBusiness ? '#1a7f37' : '#c0392b'}">
               Yearly Tax: ${currency}${fmt(yearlyTax)}
            </h4>`
    }

    let html = ''

    if (countryKey === 'nigeria') {
        if (isBusiness) {
            const res = calculateNigeriaBusiness(annualAmount)
            html = `<h3>🇳🇬 Nigeria Business Report</h3>
                    <p>Status: <strong>${res.status}</strong></p>
                    <p>CIT: ${currency}${fmt(res.cit)}</p>
                    <p>Development Levy: ${currency}${fmt(res.devLevy)}</p>
                    ${renderTotals(res.totalTax)}`
        } else {
            const res = calculateNigeriaIndividual(monthlyAmount)
            html = `<h3>🇳🇬 Nigeria Individual Report</h3>
                    <p>Rent Relief: ${currency}${fmt(res.rentRelief)}</p>
                    <p>Taxable Income: ${currency}${fmt(res.taxableIncome)}</p>
                    ${renderTotals(res.tax)}`
        }
    } else if (countryKey === 'ghana') {
        if (isBusiness) {
            const res = calculateGhanaBusiness(annualAmount)
            html = `<h3>🇬🇭 Ghana Business Report</h3>
                    <p>CIT (25%): ${currency}${fmt(res.cit)}</p>
                    ${renderTotals(res.totalTax)}`
        } else {
            const res = calculateGhanaIndividual(monthlyAmount)
            html = `<h3>🇬🇭 Ghana Individual Report</h3>
                    ${renderTotals(res.tax)}`
        }
    } else if (countryKey === 'kenya') {
        if (isBusiness) {
            const res = calculateKenyaBusiness(annualAmount)
            html = `<h3>🇰🇪 Kenya Business Report</h3>
                    <p>Status: <strong>${res.status}</strong></p>
                    ${renderTotals(res.totalTax)}`
        } else {
            const res = calculateKenyaIndividual(monthlyAmount)
            html = `<h3>🇰🇪 Kenya Individual Report</h3>
                    ${renderTotals(res.tax)}`
        }
    } else if (countryKey === 'south africa') {
        if (isBusiness) {
            const res = calculateSABusiness(annualAmount)
            html = `<h3>🇿🇦 South Africa Business Report</h3>
                    <p>Status: <strong>${res.status}</strong></p>
                    <p>CIT Rate: ${res.citRate * 100}%</p>
                    ${renderTotals(res.totalTax)}`
        } else {
            const res = calculateSAIndividual(monthlyAmount)
            html = `<h3>🇿🇦 South Africa Individual Report</h3>
                    ${renderTotals(res.tax)}`
        }
    } else if (countryKey === 'egypt') {
        if (isBusiness) {
            const res = calculateEgyptBusiness(annualAmount)
            html = `<h3>🇪🇬 Egypt Business Report</h3>
                    <p>CIT (22.5%): ${currency}${fmt(res.totalTax)}</p>
                    ${renderTotals(res.totalTax)}`
        } else {
            const res = calculateEgyptIndividual(monthlyAmount)
            html = `<h3>🇪🇬 Egypt Individual Report</h3>
                    <p>Taxable Income: ${currency}${fmt(res.taxableIncome)}</p>
                    ${renderTotals(res.tax)}`
        }
    } else if (countryKey === 'mauritius') {
        if (isBusiness) {
            const res = calculateMauritiusBusiness(annualAmount)
            html = `<h3>🇲🇺 Mauritius Business Report</h3>
                    <p>Status: <strong>${res.status}</strong></p>
                    <p>CIT (15%): ${currency}${fmt(res.cit)}</p>
                    <p>CCR Levy (2%): ${currency}${fmt(res.ccrLevy)}</p>
                    ${renderTotals(res.totalTax)}`
        } else {
            const res = calculateMauritiusIndividual(monthlyAmount)
            html = `<h3>🇲🇺 Mauritius Individual Report</h3>
                    <p>Status: <strong>${res.status || 'Standard Taxpayer'}</strong></p>
                    ${renderTotals(res.tax)}`
        }
    } else if (countryKey === 'rwanda') {
        if (isBusiness) {
            const res = calculateRwandaBusiness(annualAmount)
            html = `<h3>🇷🇼 Rwanda Business Report</h3>
                    <p>Status: <strong>${res.status}</strong></p>
                    <p>CIT (28%): ${currency}${fmt(res.totalTax)}</p>
                    ${renderTotals(res.totalTax)}`
        } else {
            const res = calculateRwandaIndividual(monthlyAmount)
            html = `<h3>🇷🇼 Rwanda Individual Report</h3>
                    ${renderTotals(res.tax)}`
        }
    } else if (countryKey === 'equatorial guinea') {
        if (isBusiness) {
            const res = calculateEquatorialGuineaBusiness(annualAmount)
            html = `<h3>🇬🇶 Equatorial Guinea Business Report</h3>
                    <p>Status: <strong>${res.status}</strong></p>
                    <p>CIT: ${currency}${fmt(res.cit)}</p>
                    <p>Dev Levy: ${currency}${fmt(res.devLevy)}</p>
                    ${renderTotals(res.totalTax)}`
        } else {
            const res = calculateEquatorialGuineaIndividual(monthlyAmount)
            html = `<h3>🇬🇶 Equatorial Guinea Individual Report</h3>
                    ${renderTotals(res.tax)}`
        }
    } else {
        html = '<p style="color:red;">Country not recognised. Please choose from the list.</p>'
    }

    resultBox.innerHTML = html
}


// ── DOM READY ─────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {

    const toggle             = document.getElementById('tax-toggle')
    const calculatorWrapper  = document.querySelector('.tax-calculator')
    const individualForm     = document.getElementById('individual-form')
    const businessForm       = document.getElementById('business-form')
    const countryInput       = document.getElementById('countries-select')
    const currencyLabel      = document.getElementById('currency-label')
    const currencyLabelBiz   = document.getElementById('currency-label-business')
    const calculateButtons   = document.querySelectorAll('.calculate-btn')
    const tabCalc            = document.getElementById('tab-calculator')
    const tabHist            = document.getElementById('tab-history')
    const calcPanel          = document.getElementById('panel-calculator')
    const histPanel          = document.getElementById('panel-history')

    // ── TAB SWITCHING ──────────────────────────────
    if (tabCalc && tabHist) {
        tabCalc.addEventListener('click', () => {
            tabCalc.classList.add('active-tab')
            tabHist.classList.remove('active-tab')
            calcPanel.style.display = 'block'
            histPanel.style.display = 'none'
        })

        tabHist.addEventListener('click', async () => {
            tabHist.classList.add('active-tab')
            tabCalc.classList.remove('active-tab')
            calcPanel.style.display = 'none'
            histPanel.style.display = 'block'
            await loadHistoryTab()
        })
    }

    // ── CURRENCY LABEL ─────────────────────────────
    const symbolMap = {
        'ghana':             '(₵)',
        'nigeria':           '(₦)',
        'kenya':             '(KSh)',
        'south africa':      '(R)',
        'egypt':             '(E£)',
        'mauritius':         '(Rs)',
        'rwanda':            '(FRw)',
        'equatorial guinea': '(XAF)'
    }

    function updateCurrencyLabel() {
        const key = (countryInput?.value || '').toLowerCase().trim()
        const sym = symbolMap[key] || '($)'
        if (currencyLabel)    currencyLabel.textContent    = sym
        if (currencyLabelBiz) currencyLabelBiz.textContent = sym
    }

    if (countryInput) {
        countryInput.addEventListener('input',  updateCurrencyLabel)
        countryInput.addEventListener('change', updateCurrencyLabel)
    }

    // ── TOGGLE ─────────────────────────────────────
    if (toggle) {
        toggle.addEventListener('change', function () {
            const tc = document.querySelector('.toggle-container')
            if (this.checked) {
                if (businessForm)   businessForm.style.display   = 'block'
                if (individualForm) individualForm.style.display = 'none'
                calculatorWrapper?.classList.add('business-mode')
                calculatorWrapper?.classList.remove('individual-mode')
                tc?.classList.add('business-active')
            } else {
                if (businessForm)   businessForm.style.display   = 'none'
                if (individualForm) individualForm.style.display = 'block'
                calculatorWrapper?.classList.remove('business-mode')
                calculatorWrapper?.classList.add('individual-mode')
                tc?.classList.remove('business-active')
            }
        })
    }

    // ── CALCULATE BUTTONS ──────────────────────────
    calculateButtons.forEach(button => {
        button.addEventListener('click', async () => {
            const country      = countryInput?.value.trim() ?? ''
            const isBusiness   = toggle?.checked ?? false
            let   monthlyAmount = 0

            if (isBusiness) {
                monthlyAmount = parseFloat(
                    document.getElementById('monthlyRevenue')?.value
                ) || 0
            } else {
                monthlyAmount = parseFloat(
                    document.getElementById('monthlySalary')?.value
                ) || 0
            }

            if (!country) {
                alert('Please select or type a country first.')
                return
            }
            if (monthlyAmount <= 0 || isNaN(monthlyAmount)) {
                alert('Please enter a valid amount greater than zero.')
                return
            }

            // Show result
            calculateTax(country, isBusiness, monthlyAmount)

            // Compute tax values for history
            const countryKey   = country.toLowerCase().trim()
            const annualAmount = monthlyAmount * 12
            let taxOwed  = 0
            let taxSaved = 0

            try {
                if (countryKey === 'nigeria') {
                    if (isBusiness) {
                        const res = calculateNigeriaBusiness(annualAmount)
                        taxOwed  = res.totalTax
                        taxSaved = annualAmount <= 100000000
                            ? Math.max(0, (annualAmount * 0.34) - taxOwed)
                            : 0
                    } else {
                        const res = calculateNigeriaIndividual(monthlyAmount)
                        taxOwed  = res.tax
                        taxSaved = res.rentRelief
                    }
                } else if (countryKey === 'ghana') {
                    const r = isBusiness
                        ? calculateGhanaBusiness(annualAmount)
                        : calculateGhanaIndividual(monthlyAmount)
                    taxOwed = r.totalTax ?? r.tax ?? 0
                } else if (countryKey === 'kenya') {
                    const r = isBusiness
                        ? calculateKenyaBusiness(annualAmount)
                        : calculateKenyaIndividual(monthlyAmount)
                    taxOwed = r.totalTax ?? r.tax ?? 0
                } else if (countryKey === 'south africa') {
                    const r = isBusiness
                        ? calculateSABusiness(annualAmount)
                        : calculateSAIndividual(monthlyAmount)
                    taxOwed = r.totalTax ?? r.tax ?? 0
                } else if (countryKey === 'egypt') {
                    const r = isBusiness
                        ? calculateEgyptBusiness(annualAmount)
                        : calculateEgyptIndividual(monthlyAmount)
                    taxOwed = r.totalTax ?? r.tax ?? 0
                } else if (countryKey === 'mauritius') {
                    const r = isBusiness
                        ? calculateMauritiusBusiness(annualAmount)
                        : calculateMauritiusIndividual(monthlyAmount)
                    taxOwed = r.totalTax ?? r.tax ?? 0
                } else if (countryKey === 'rwanda') {
                    const r = isBusiness
                        ? calculateRwandaBusiness(annualAmount)
                        : calculateRwandaIndividual(monthlyAmount)
                    taxOwed = r.totalTax ?? r.tax ?? 0
                } else if (countryKey === 'equatorial guinea') {
                    const r = isBusiness
                        ? calculateEquatorialGuineaBusiness(annualAmount)
                        : calculateEquatorialGuineaIndividual(monthlyAmount)
                    taxOwed = r.totalTax ?? r.tax ?? 0
                }
            } catch (err) {
                console.warn('Tax value extraction failed:', err)
            }

            // Save to Supabase silently
            // (does nothing if user is not logged in)
            if (typeof saveCalculationToHistory === 'function') {
                await saveCalculationToHistory(annualAmount, taxOwed, taxSaved)
            }

            // Auto-refresh sidebar if open
            const sidebar = document.getElementById('history-sidebar')
            if (sidebar?.classList.contains('open') &&
                typeof loadSidebarHistory === 'function') {
                await loadSidebarHistory()
            }
        })
    })
})
