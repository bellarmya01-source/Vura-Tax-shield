/**
 * logic.js - The "Brain"
 * Contains 2026 Tax Rules.
 * Pure mathematical tax engine.
 */

// 1. NIGERIA BUSINESS LOGIC (NTA 2026)
function calculateNigeriaBusiness(annualRevenue) {
    let citRate = 0;
    let devLevyRate = 0;
    let status = "";

    if (annualRevenue <= 50000000) {
        status = "Small Company";
        citRate = 0;
        devLevyRate = 0;
    } else if (annualRevenue <= 100000000) {
        status = "Medium Company";
        citRate = 0.20;
        devLevyRate = 0;
    } else {
        status = "Large Company";
        citRate = 0.30;
        devLevyRate = 0.04;
    }

    const cit = annualRevenue * citRate;
    const devLevy = annualRevenue * devLevyRate;
    return { status, cit, devLevy, totalTax: cit + devLevy };
}

// 2. NIGERIA INDIVIDUAL LOGIC (NTA 2026)
function calculateNigeriaIndividual(monthlySalary) {
    const annual = monthlySalary * 12;
    const rentRelief = Math.min(annual * 0.20, 500000);
    const taxableIncome = Math.max(0, annual - rentRelief);

    let tax = 0;
    if (taxableIncome > 800000) {
        let remaining = taxableIncome - 800000;

        const band1 = Math.min(remaining, 2200000);
        tax += band1 * 0.15;
        remaining -= band1;

        if (remaining > 0) {
            const band2 = Math.min(remaining, 9000000);
            tax += band2 * 0.18;
            remaining -= band2;
        }
        if (remaining > 0) {
            const band3 = Math.min(remaining, 13000000);
            tax += band3 * 0.21;
            remaining -= band3;
        }
        if (remaining > 0) {
            tax += remaining * 0.25;
        }
    }

    return { annual, rentRelief, taxableIncome, tax };
}

// 3. GHANA BUSINESS LOGIC (2026)
function calculateGhanaBusiness(annualRevenue) {
    const cit = annualRevenue * 0.25;
    return { cit, covidLevy: 0, totalTax: cit };
}

// 4. GHANA INDIVIDUAL LOGIC (2026)
function calculateGhanaIndividual(monthlySalary) {
    const annual = monthlySalary * 12;
    let tax = 0;
    let remaining = annual;

    const bands = [
        { limit: 5880,     rate: 0 },
        { limit: 1320,     rate: 0.05 },
        { limit: 1560,     rate: 0.10 },
        { limit: 38000,    rate: 0.175 },
        { limit: 192000,   rate: 0.25 },
        { limit: 366240,   rate: 0.30 },
        { limit: Infinity, rate: 0.35 }
    ];

    for (let band of bands) {
        const taxable = Math.min(remaining, band.limit);
        tax += taxable * band.rate;
        remaining -= taxable;
        if (remaining <= 0) break;
    }

    return { annual, tax };
}

// 5. KENYA BUSINESS LOGIC (2026)
function calculateKenyaBusiness(annualRevenue, isSME = true) {
    let status = "";
    let totalTax = 0;

    if (isSME && annualRevenue >= 1000000 && annualRevenue <= 25000000) {
        status = "Turnover Tax (ToT) Eligible";
        totalTax = annualRevenue * 0.03;
    } else {
        status = "Standard Corporate";
        totalTax = annualRevenue * 0.30;
    }

    return { status, totalTax };
}

// 6. KENYA INDIVIDUAL LOGIC (2026)
function calculateKenyaIndividual(monthlySalary) {
    const annual = monthlySalary * 12;
    let tax = 0;
    if (annual <= 288000)      tax = annual * 0.10;
    else if (annual <= 388000) tax = (annual - 288000) * 0.25 + 28800;
    else                       tax = (annual - 388000) * 0.35 + 53800;
    return { annual, tax };
}

// 7. SOUTH AFRICA BUSINESS LOGIC (2026)
function calculateSABusiness(annualRevenue) {
    const citRate = 0.27;
    const totalTax = annualRevenue * citRate;
    return { status: "Standard Company", citRate, totalTax };
}

// 8. SOUTH AFRICA INDIVIDUAL LOGIC (2026)
function calculateSAIndividual(monthlySalary) {
    const annual = monthlySalary * 12;
    let tax = 0;

    if (annual <= 237100)      tax = annual * 0.18;
    else if (annual <= 370500) tax = 42678  + (annual - 237100)  * 0.26;
    else if (annual <= 512800) tax = 77362  + (annual - 370500)  * 0.31;
    else                       tax = 644489 + (Math.max(0, annual - 1817000) * 0.45);

    return { annual, tax };
}

// 9. EGYPT BUSINESS LOGIC (2026)
function calculateEgyptBusiness(annualRevenue) {
    const totalTax = annualRevenue * 0.225;
    return { status: "Standard Company", totalTax };
}

// 10. EGYPT INDIVIDUAL LOGIC (2026)
function calculateEgyptIndividual(monthlySalary) {
    const annual = monthlySalary * 12;
    const taxableIncome = Math.max(0, annual - 20000);

    let tax = 0;
    if (taxableIncome > 40000) {
        if      (taxableIncome <= 200000) tax = (taxableIncome - 40000)  * 0.20;
        else if (taxableIncome <= 400000) tax = 32000 + (taxableIncome - 200000) * 0.225;
        else                              tax = 77000 + (taxableIncome - 400000) * 0.25;
    }
    return { annual, taxableIncome, tax };
}

// 11. MAURITIUS BUSINESS LOGIC (2026)
function calculateMauritiusBusiness(annualRevenue) {
    const cit     = annualRevenue * 0.15;
    const ccrLevy = annualRevenue * 0.02;
    return { status: "Standard Company", cit, ccrLevy, totalTax: cit + ccrLevy };
}

// 12. MAURITIUS INDIVIDUAL LOGIC (2026)
function calculateMauritiusIndividual(monthlySalary) {
    const annual = monthlySalary * 12;
    let tax = 0;

    if (annual <= 1000000) {
        return { annual, tax: 0, status: "Youth Exemption Applied" };
    }
    if (annual > 500000) {
        const taxable = annual - 500000;
        tax = Math.min(taxable, 500000) * 0.10;
        if (taxable > 500000) tax += (taxable - 500000) * 0.20;
    }
    return { annual, tax };
}

// 13. RWANDA BUSINESS LOGIC (2026)
function calculateRwandaBusiness(annualRevenue) {
    const totalTax = annualRevenue * 0.28;
    return { status: "Standard Company", totalTax };
}

// 14. RWANDA INDIVIDUAL LOGIC (2026)
function calculateRwandaIndividual(monthlySalary) {
    const annual = monthlySalary * 12;
    let tax = 0;
    if (annual > 360000) {
        tax = (annual - 360000) * 0.30;
    }
    return { annual, tax };
}

// 15. EQUATORIAL GUINEA BUSINESS LOGIC (2026)
function calculateEquatorialGuineaBusiness(annualRevenue) {
    let citRate     = 0;
    let devLevyRate = 0;
    let status      = "";

    if (annualRevenue <= 50000000) {
        status      = "Small Company";
        citRate     = 0;
        devLevyRate = 0;
    } else if (annualRevenue >= 100000000) {
        status      = "Medium Company";
        citRate     = 0.25;
        devLevyRate = 0.04;
    } else {
        status      = "Standard Company";
        citRate     = 0.25;
        devLevyRate = 0;
    }

    const cit     = annualRevenue * citRate;
    const devLevy = annualRevenue * devLevyRate;
    return { status, cit, devLevy, totalTax: cit + devLevy };
}

// 16. EQUATORIAL GUINEA INDIVIDUAL LOGIC (2026)
function calculateEquatorialGuineaIndividual(monthlySalary) {
    const annual = monthlySalary * 12;
    let tax = 0;

    if      (annual <= 5000000)  tax = 0;
    else if (annual <= 10000000) tax = (annual - 5000000)  * 0.15;
    else if (annual <= 15000000) tax = (5000000 * 0.15) + (annual - 10000000) * 0.20;
    else                         tax = (5000000 * 0.15) + (5000000 * 0.20) + (annual - 15000000) * 0.25;

    return { annual, tax };
}
