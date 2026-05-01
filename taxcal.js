/**
 * taxcal.js - The "Mouth"
 * Handles UI interactions and displays results.
 */
// Main calculation handler
function calculateTax(country, isBusiness, monthlyAmount) {
    const resultBox = document.getElementById('resultBox');

    if (!country || monthlyAmount <= 0 || Number.isNaN(monthlyAmount)) {
        resultBox.innerHTML = '<p style="color:red;">Please enter all required fields.</p>';
        return;
    }

    const annualAmount = monthlyAmount * 12;
    const countryKey = country.toLowerCase().trim();
    const symbols = {
        'ghana': '₵',
        'nigeria': '₦',
        'kenya': 'KSh',
        'south africa': 'R',
        'egypt': 'EGP',
        'mauritius': 'Rs',
        'rwanda': 'FRW'
    };
    const currency = symbols[countryKey] || '$';
    const formattedMonthly = monthlyAmount.toLocaleString();
    const formattedAnnual = annualAmount.toLocaleString();

    function renderTotals(yearlyTax) {
        const monthlyTax = yearlyTax / 12;
        return `
            <p><strong>Monthly ${isBusiness ? 'Revenue' : 'Salary'}:</strong> ${currency}${formattedMonthly}</p>
            <p><strong>Annual ${isBusiness ? 'Revenue' : 'Salary'}:</strong> ${currency}${formattedAnnual}</p>
            <p><strong>Monthly Tax:</strong> ${currency}${monthlyTax.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</p>
            <h4 style="color:${isBusiness ? 'green' : 'red'}">Yearly Tax: ${currency}${yearlyTax.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</h4>
        `;
    }

    let html = '';
    if (countryKey === 'nigeria') {
        if (isBusiness) {
            const res = calculateNigeriaBusiness(annualAmount);
            html = `
                <h3>Nigeria Business Report</h3>
                <p>Status: <strong>${res.status}</strong></p>
                <p>CIT: ${currency}${res.cit.toLocaleString()}</p>
                <p>Development Levy: ${currency}${res.devLevy.toLocaleString()}</p>
                ${renderTotals(res.totalTax)}
            `;
        } else {
            const res = calculateNigeriaIndividual(monthlyAmount);
            html = `
                <h3>Nigeria Individual Report</h3>
                <p>Rent Relief: ${currency}${res.rentRelief.toLocaleString()}</p>
                <p>Taxable Income: ${currency}${res.taxableIncome.toLocaleString()}</p>
                ${renderTotals(res.tax)}
            `;
        }
    } else if (countryKey === 'ghana') {
        if (isBusiness) {
            const res = calculateGhanaBusiness(annualAmount);
            html = `
                <h3>Ghana Business Report</h3>
                <p>CIT: ${currency}${res.cit.toLocaleString()}</p>
                ${renderTotals(res.totalTax)}
            `;
        } else {
            const res = calculateGhanaIndividual(monthlyAmount);
            html = `
                <h3>Ghana Individual Report</h3>
                ${renderTotals(res.tax)}
            `;
        }
    } else if (countryKey === 'kenya') {
        if (isBusiness) {
            const res = calculateKenyaBusiness(annualAmount);
            html = `
                <h3>Kenya Business Report</h3>
                <p>Status: <strong>${res.status}</strong></p>
                ${renderTotals(res.totalTax)}
            `;
        } else {
            const res = calculateKenyaIndividual(monthlyAmount);
            html = `
                <h3>Kenya Individual Report</h3>
                ${renderTotals(res.tax)}
            `;
        }
    } else if (countryKey === 'south africa') {
        if (isBusiness) {
            const res = calculateSABusiness(annualAmount);
            html = `
                <h3>South Africa Business Report</h3>
                <p>Status: <strong>${res.status}</strong></p>
                <p>CIT Rate: ${res.citRate * 100}%</p>
                ${renderTotals(res.totalTax)}
            `;
        } else {
            const res = calculateSAIndividual(monthlyAmount);
            html = `
                <h3>South Africa Individual Report</h3>
                ${renderTotals(res.tax)}
            `;
        }
    } else if (countryKey === 'egypt') {
        if (isBusiness) {
            const res = calculateEgyptBusiness(annualAmount);
            html = `
                <h3>Egypt Business Report</h3>
                <p>Status: <strong>${res.status}</strong></p>
                ${renderTotals(res.totalTax)}
            `;
        } else {
            const res = calculateEgyptIndividual(monthlyAmount);
            html = `
                <h3>Egypt Individual Report</h3>
                <p>Taxable Income: ${currency}${res.taxableIncome.toLocaleString()}</p>
                ${renderTotals(res.tax)}
            `;
        }
    } else if (countryKey === 'mauritius') {
        if (isBusiness) {
            const res = calculateMauritiusBusiness(annualAmount);
            html = `
                <h3>Mauritius Business Report</h3>
                <p>Status: <strong>${res.status}</strong></p>
                <p>CIT: ${currency}${res.cit.toLocaleString()}</p>
                <p>CCR Levy: ${currency}${res.ccrLevy.toLocaleString()}</p>
                ${renderTotals(res.totalTax)}
            `;
        } else {
            const res = calculateMauritiusIndividual(monthlyAmount);
            html = `
                <h3>Mauritius Individual Report</h3>
                <p>Status: <strong>${res.status || 'Standard Taxpayer'}</strong></p>
                ${renderTotals(res.tax)}
            `;
        }
    } else if (countryKey === 'rwanda') {
        if (isBusiness) {
            const res = calculateRwandaBusiness(annualAmount);
            html = `
                <h3>Rwanda Business Report</h3>
                <p>Status: <strong>${res.status}</strong></p>
                ${renderTotals(res.totalTax)}
            `;
        } else {
            const res = calculateRwandaIndividual(monthlyAmount);
            html = `
                <h3>Rwanda Individual Report</h3>
                ${renderTotals(res.tax)}
            `;
        }
    } else {
        html = '<p style="color:red;">Please enter a valid country from the list.</p>';
    }

    resultBox.innerHTML = html;
}

// Wait for DOM to be ready
document.addEventListener('DOMContentLoaded', () => {
    // 1. DECLARATIONS (Introductions)
    const toggle = document.getElementById('tax-toggle');
    const individualForm = document.getElementById('individual-form'); // Fixed name to match your toggle logic
    const businessForm = document.getElementById('business-form');
    const countryInput = document.getElementById('countries-select');
    const currencyLabel = document.getElementById('currency-label');
    const currencyLabelBusiness = document.getElementById('currency-label-business');
    const calculateButtons = document.querySelectorAll('.calculate-btn');

    // 2. CURRENCY UPDATE LOGIC
    countryInput.addEventListener('input', function() {
        const country = this.value.toLowerCase().trim();
        
        const symbols = {
            'ghana': '(₵)',
            'nigeria': '(₦)',
            'kenya': '(KSh)',
            'south africa': '(R)',
            'egypt': '(E£)',
            'mauritius': '(Rs)',
            'rwanda': '(FRw)'
        };

        const symbol = symbols[country] || '($)';
        
        currencyLabel.textContent = symbol;
        currencyLabelBusiness.textContent = symbol;
    });

    // 3. TOGGLE FUNCTIONALITY
    toggle.addEventListener('change', function() {
        if (this.checked) {
            businessForm.style.display = 'block';
            individualForm.style.display = 'none';
        } else {
            businessForm.style.display = 'none';
            individualForm.style.display = 'block';
        }
    });

    // 4. CALCULATION TRIGGER
    calculateButtons.forEach(button => {
        button.addEventListener('click', () => {
            const country = countryInput.value.trim();
            const isBusiness = toggle.checked;
            let monthlyAmount = 0;

            if (isBusiness) {
                monthlyAmount = parseFloat(document.getElementById('monthlyRevenue').value) || 0;
            } else {
                monthlyAmount = parseFloat(document.getElementById('monthlySalary').value) || 0;
            }

            // Validation
            if (!country) {
                alert('Please enter or select a country');
                return;
            }

            if (monthlyAmount <= 0) {
                alert('Please enter a valid amount');
                return;
            }

            // Call the main brain from logic.js
            calculateTax(country, isBusiness, monthlyAmount,);
        });
    });

    // 5. INITIAL STATE (Set default view)
    individualForm.style.display = 'block';
    businessForm.style.display = 'none';
});

