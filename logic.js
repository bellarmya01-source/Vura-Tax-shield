
// logic.js
/**
 * logic.js - The "Brain"
 * Contains 2026 Tax Rules .
 * No UI code here, just pure math.
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
        citRate = 0.20; // 20% CIT
        devLevyRate = 0;
    } else {
        status = "Large Company";
        citRate = 0.30; // 30% CIT
        devLevyRate = 0.04; // 4% Development Levy
    }

    const cit = annualRevenue * citRate;
    const devLevy = annualRevenue * devLevyRate;
    
    return {
        status,
        cit,
        devLevy,
        totalTax: cit + devLevy
    };
}

// 2. NIGERIA INDIVIDUAL LOGIC (NTA 2026)
function calculateNigeriaIndividual(monthlySalary) {
    const annual = monthlySalary * 12;
    // 2026 Rent Relief: 20% of gross, capped at ₦500,000
    const rentRelief = Math.min( 500000);
    const taxableIncome = Math.max(0, annual - rentRelief);
    
    let tax = 0;
    // 2026 Progressive Bands
    if (taxableIncome > 800000) {
        let remaining = taxableIncome - 800000;
        
        // Next 2.2M @ 15%
        const band1 = Math.min(remaining, 2200000);
        tax += band1 * 0.15;
        remaining -= band1;

        // Next 9M @ 18%
        if (remaining > 0) {
            const band2 = Math.min(remaining, 9000000);
            tax += band2 * 0.18;
            remaining -= band2;
        }
        // Next 13M @ 21%
        if (remaining > 0) {
            const band3 = Math.min(remaining, 13000000);
            tax += band3 * 0.21;
            remaining -= band3;
        }
        // Above that @ 25% (Simplified for demo)
        if (remaining > 0) {
            tax += remaining * 0.25;
        }
    }

    return { annual, rentRelief, taxableIncome, tax };
}

// 3. GHANA BUSINESS LOGIC (2026)
function calculateGhanaBusiness(annualRevenue) {
    // Standard CIT is 25%. COVID Levy abolished in 2026.
    const cit = annualRevenue * 0.25;
    return { cit, covidLevy: 0, totalTax: cit };
}

// 4. GHANA INDIVIDUAL LOGIC (2026)
function calculateGhanaIndividual(monthlySalary) {
    const annual = monthlySalary * 12;
    let tax = 0;
    let remaining = annual;

    // Ghana 2026 Progressive Scale
    const bands = [
        { limit: 5880, rate: 0 },
        { limit: 1320, rate: 0.05 },
        { limit: 1560, rate: 0.10 },
        { limit: 38000, rate: 0.175 },
        { limit: 192000, rate: 0.25 },
        { limit: 366240, rate: 0.30 },
        { limit: Infinity, rate: 0.35 }
    ];

    for (let band of bands) {
        const taxableInThisBand = Math.min(remaining, band.limit);
        tax += taxableInThisBand * band.rate;
        remaining -= taxableInThisBand;
        if (remaining <= 0) break;
    }

    return { annual, tax };
}
/**
 * logic.js - Extended "Brain" for Vura Tax-Shield
 * Added: Kenya, South Africa, Egypt, Mauritius, Rwanda (2026 Rules)
 */

// --- 5. KENYA BUSINESS LOGIC (2026) ---
function calculateKenyaBusiness(annualRevenue, isSME = true) {
    let status = "";
    let totalTax = 0;
    
    // Turnover Tax (ToT) is for SMEs between 1M and 25M KES
    if (isSME && annualRevenue >= 1000000 && annualRevenue <= 25000000) {
        status = "Turnover Tax (ToT) Eligible";
        totalTax = annualRevenue * 0.03; // 3% on gross receipts
    } else {
        status = "Standard Corporate";
        totalTax = annualRevenue * 0.30; // 30% CIT
    }
    
    return { status, totalTax };
}

// --- 6. SOUTH AFRICA BUSINESS LOGIC (2026) ---
function calculateSABusiness(annualRevenue) {
    // Standard CIT in South Africa for 2026 is 27%
    const citRate = 0.27;
    const totalTax = annualRevenue * citRate;
    return { status: "Standard Company", citRate, totalTax };
}

// --- 7. EGYPT BUSINESS LOGIC (2026) ---
function calculateEgyptBusiness(annualRevenue) {
    // Egypt standard CIT is 22.5%
    const citRate = 0.225;
    const totalTax = annualRevenue * citRate;
    return { status: "Standard Company", totalTax };
}

// --- 8. MAURITIUS BUSINESS LOGIC (2026) ---
function calculateMauritiusBusiness(annualRevenue) {
    // Mauritius is a low-tax hub: 15% standard
    const citRate = 0.15;
    // Plus a 2% Corporate Climate Responsibility (CCR) levy introduced in 2025/26
    const ccrLevy = annualRevenue * 0.02; 
    const cit = annualRevenue * citRate;
    
    return { 
        status: "Standard Company", 
        cit, 
        ccrLevy, 
        totalTax: cit + ccrLevy 
    };
}

// --- 9. RWANDA BUSINESS LOGIC (2026) ---
function calculateRwandaBusiness(annualRevenue) {
    // Rwanda's standard rate for 2026 is 28%
    const citRate = 0.28;
    const totalTax = annualRevenue * citRate;
    return { status: "Standard Company", totalTax };
}

// --- INDIVIDUAL SALARY LOGIC (2026) ---

function calculateKenyaIndividual(monthlySalary) {
    const annual = monthlySalary * 12;
    // Kenya top rate is 35% for high earners in 2026
    let tax = 0;
    if (annual <= 288000) tax = annual * 0.10;
    else if (annual <= 388000) tax = (annual - 288000) * 0.25 + 28800;
    else tax = (annual - 388000) * 0.35 + 53800; // Simplified bands
    return { annual, tax };
}

function calculateMauritiusIndividual(monthlySalary) {
    const annual = monthlySalary * 12;
    let tax = 0;
    
    // 2026 Special: 18-28 year olds exempt up to 1M MUR (This is perfect for you!)
    const isYoungDev = true; // Hardcoded for demo
    if (isYoungDev && annual <= 1000000) {
        return { annual, tax: 0, status: "Youth Exemption Applied" };
    }

    // New 2026 Progressive scale
    if (annual > 500000) {
        const taxable = annual - 500000;
        tax = Math.min(taxable, 500000) * 0.10; // 10% for next 500k
        if (taxable > 500000) {
            tax += (taxable - 500000) * 0.20; // 20% for above 1M
        }
    }
    return { annual, tax };
}

function calculateSAIndividual(monthlySalary) {
    const annual = monthlySalary * 12;
    let tax = 0;

    if (annual <= 237100) {
        tax = annual * 0.18;
    } else if (annual <= 370500) {
        tax = 42678 + (annual - 237100) * 0.26;
    } else if (annual <= 512800) {
        tax = 77362 + (annual - 370500) * 0.31;
    } else {
        // Top bracket simplification
        tax = 644489 + (Math.max(0, annual - 1817000) * 0.45);
    }
    return { annual, tax };
}

function calculateEgyptIndividual(monthlySalary) {
    const annual = monthlySalary * 12;
    const taxableIncome = Math.max(0, annual - 20000); // Personal Exemption
    
    let tax = 0;
    if (taxableIncome > 40000) {
        if (taxableIncome <= 200000) tax = (taxableIncome - 40000) * 0.20;
        else if (taxableIncome <= 400000) tax = 32000 + (taxableIncome - 200000) * 0.225;
        else tax = 77000 + (taxableIncome - 400000) * 0.25; // Standard high rate
    }
    return { annual, taxableIncome, tax };
}

function calculateRwandaIndividual(monthlySalary) {
    const annual = monthlySalary * 12;
    // Rwanda has a 0% band for very low earners, then jumps to 20% and 30%
    let tax = 0;
    if (annual > 360000) { // Approx threshold
        tax = (annual - 360000) * 0.30; 
    }
    return { annual, tax };
}

