// Core Medicine Calculation System
// Shared logic for both outpatient and inpatient medicine calculations

export interface MedicineCalculationResult {
  totalQuantity: number;
  totalPrice: number;
  quantityUnit: string;
  pricePerUnit: number;
  isPartialAllowed: boolean;
  calculationDetails: string;
}

export interface DosageInput {
  dosePrescribed: string;
  medType: string;
  doseFrequency: string;
  totalDays: number;
  basePrice: number;
  isInpatient?: boolean;
  isDischargeMedicine?: boolean;
}

// Core conversion rates
export const CONVERSION_RATES = {
  // Volume conversions (all to ml)
  'ml/cc': 1,     // 1cc = 1ml
  'tsp': 5,       // 1tsp = 5ml
  'tbsp': 15,     // 1tbsp = 15ml = 3tsp
} as const;

// Medicine type rules
export const MEDICINE_RULES = {
  // Solid forms
  'Tablet': {
    canBePartial: true,
    breakableFractions: [0.25, 0.5, 0.75, 1], // Can be broken into 1/4, 1/2, 3/4, full
    canBeMultiplied: true,
    unit: 'tablet'
  },
  'Capsule': {
    canBePartial: false, // Capsules cannot be broken
    breakableFractions: [1], // Only full capsules
    canBeMultiplied: true,
    unit: 'capsule'
  },
  
  // Liquid forms - bottles
  'Syrup': {
    canBePartial: false, // Full bottle needed for outpatient
    canBePartialInpatient: true, // Can be partial for inpatient ward medicine
    unit: 'bottle',
    standardBottleSize: 100 // ml per bottle
  },
  'Solution': {
    canBePartial: false,
    canBePartialInpatient: true,
    unit: 'bottle',
    standardBottleSize: 100
  },
  
  // Volume forms
  'ml/cc': {
    canBePartial: true,
    unit: 'ml'
  },
  'tsp': {
    canBePartial: true,
    unit: 'tsp'
  },
  'tbsp': {
    canBePartial: true,
    unit: 'tbsp'
  },
  
  // Weight forms
  'Mg': {
    canBePartial: true,
    unit: 'mg'
  },
  'mcg': {
    canBePartial: true,
    unit: 'mcg'
  },
  'meq': {
    canBePartial: true,
    unit: 'meq'
  },
  
  // Special forms
  'amp': {
    canBePartial: false, // Ampoules cannot be partial
    unit: 'ampoule'
  },
  'tube': {
    canBePartial: false, // Full tube needed
    unit: 'tube'
  },
  'formula': {
    canBePartial: false, // Full formula pack needed
    unit: 'pack'
  },
  'Qty': {
    canBePartial: false, // Generic quantity - no partial
    unit: 'unit'
  }
} as const;

// Get daily frequency multiplier
export function getDailyFrequencyMultiplier(frequency: string): number {
  switch (frequency) {
    case 'QD': return 1;      // Once daily
    case 'BID': return 2;     // Twice daily
    case 'TID': return 3;     // Three times daily
    case 'QID': return 4;     // Four times daily
    case 'QOD': return 0.5;   // Every other day
    case 'QWEEK': return 1/7; // Weekly
    default: return 1;
  }
}

// Convert volume to ml for calculations
export function convertToMl(amount: number, unit: string): number {
  if (unit in CONVERSION_RATES) {
    return amount * CONVERSION_RATES[unit as keyof typeof CONVERSION_RATES];
  }
  return amount; // Return as-is for non-volume units
}

// Calculate tablet/capsule quantity with breaking rules
export function calculateSolidMedicineQuantity(
  dosePrescribed: number,
  medType: string,
  dailyFrequency: number,
  totalDays: number
): { quantity: number; unit: string; details: string } {
  const rule = MEDICINE_RULES[medType as keyof typeof MEDICINE_RULES];
  
  if (!rule || !('breakableFractions' in rule)) {
    throw new Error(`Invalid solid medicine type: ${medType}`);
  }
  
  const dailyQuantity = dosePrescribed * dailyFrequency;
  const totalNeeded = dailyQuantity * totalDays;
  
  let finalQuantity: number;
  let details: string;
  
  if (rule.canBePartial && medType === 'Tablet') {
    // For tablets, find the closest breakable fraction
    const closestFraction = rule.breakableFractions.reduce((prev, curr) => 
      Math.abs(curr - (dosePrescribed % 1)) < Math.abs(prev - (dosePrescribed % 1)) ? curr : prev
    );
    
    finalQuantity = Math.ceil(totalNeeded);
    details = `${dosePrescribed} ${rule.unit} × ${dailyFrequency} times daily × ${totalDays} days = ${totalNeeded.toFixed(2)} ${rule.unit}s (rounded up to ${finalQuantity})`;
  } else {
    // For capsules or non-breakable items, always round up
    finalQuantity = Math.ceil(totalNeeded);
    details = `${dosePrescribed} ${rule.unit} × ${dailyFrequency} times daily × ${totalDays} days = ${finalQuantity} ${rule.unit}s (rounded up, no partial allowed)`;
  }
  
  return {
    quantity: finalQuantity,
    unit: rule.unit,
    details
  };
}

// Calculate liquid medicine quantity (bottles vs ml)
export function calculateLiquidMedicineQuantity(
  dosePrescribed: number,
  medType: string,
  dailyFrequency: number,
  totalDays: number,
  isInpatient: boolean = false,
  isDischargeMedicine: boolean = false
): { quantity: number; unit: string; details: string } {
  const rule = MEDICINE_RULES[medType as keyof typeof MEDICINE_RULES];
  
  if (!rule) {
    throw new Error(`Invalid liquid medicine type: ${medType}`);
  }
  
  const dailyQuantity = dosePrescribed * dailyFrequency;
  const totalMlNeeded = convertToMl(dailyQuantity * totalDays, medType);
  
  // Check if this is a bottled medicine
  if ('standardBottleSize' in rule) {
    const canBePartial = isInpatient && !isDischargeMedicine && rule.canBePartialInpatient;
    
    if (canBePartial) {
      // Inpatient ward medicine - can give partial bottles
      const bottlesNeeded = totalMlNeeded / rule.standardBottleSize;
      return {
        quantity: Math.round(bottlesNeeded * 100) / 100, // Round to 2 decimal places
        unit: 'bottle',
        details: `${dosePrescribed}${medType} × ${dailyFrequency} times daily × ${totalDays} days = ${totalMlNeeded}ml = ${bottlesNeeded.toFixed(2)} bottles (partial allowed for inpatient)`
      };
    } else {
      // Outpatient or discharge medicine - full bottles only
      const bottlesNeeded = Math.ceil(totalMlNeeded / rule.standardBottleSize);
      return {
        quantity: bottlesNeeded,
        unit: 'bottle',
        details: `${dosePrescribed}${medType} × ${dailyFrequency} times daily × ${totalDays} days = ${totalMlNeeded}ml = ${bottlesNeeded} bottles (full bottles required)`
      };
    }
  } else {
    // Volume-based medicine (ml, tsp, tbsp)
    return {
      quantity: Math.round(totalMlNeeded * 100) / 100,
      unit: medType,
      details: `${dosePrescribed}${medType} × ${dailyFrequency} times daily × ${totalDays} days = ${totalMlNeeded}${medType === 'ml/cc' ? 'ml' : medType}`
    };
  }
}

// Main calculation function
export function calculateMedicineDosage(input: DosageInput): MedicineCalculationResult {
  const {
    dosePrescribed,
    medType,
    doseFrequency,
    totalDays,
    basePrice,
    isInpatient = false,
    isDischargeMedicine = false
  } = input;
  
  const dose = parseFloat(dosePrescribed);
  if (isNaN(dose) || dose <= 0) {
    throw new Error('Invalid dose prescribed');
  }
  
  const dailyFrequency = getDailyFrequencyMultiplier(doseFrequency);
  
  let calculationResult: { quantity: number; unit: string; details: string };
  
  // Determine calculation method based on medicine type
  if (['Tablet', 'Capsule'].includes(medType)) {
    calculationResult = calculateSolidMedicineQuantity(dose, medType, dailyFrequency, totalDays);
  } else if (['Syrup', 'Solution'].includes(medType)) {
    calculationResult = calculateLiquidMedicineQuantity(dose, medType, dailyFrequency, totalDays, isInpatient, isDischargeMedicine);
  } else if (['ml/cc', 'tsp', 'tbsp'].includes(medType)) {
    calculationResult = calculateLiquidMedicineQuantity(dose, medType, dailyFrequency, totalDays, isInpatient, isDischargeMedicine);
  } else {
    // For other types (Mg, mcg, meq, amp, tube, formula, Qty)
    const dailyQuantity = dose * dailyFrequency;
    const totalQuantity = dailyQuantity * totalDays;
    const rule = MEDICINE_RULES[medType as keyof typeof MEDICINE_RULES];
    const unit = rule?.unit || medType.toLowerCase();
    
    calculationResult = {
      quantity: Math.ceil(totalQuantity), // Round up for safety
      unit,
      details: `${dose} ${unit} × ${dailyFrequency} times daily × ${totalDays} days = ${totalQuantity.toFixed(2)} ${unit}s (rounded up to ${Math.ceil(totalQuantity)})`
    };
  }
  
  const totalPrice = basePrice * calculationResult.quantity;
  const rule = MEDICINE_RULES[medType as keyof typeof MEDICINE_RULES];
  
  return {
    totalQuantity: calculationResult.quantity,
    totalPrice,
    quantityUnit: calculationResult.unit,
    pricePerUnit: basePrice,
    isPartialAllowed: rule ? ('canBePartial' in rule ? rule.canBePartial : false) : true,
    calculationDetails: calculationResult.details
  };
}

// Format dosage for bill display
export function formatDosageForBill(
  medicineName: string,
  dosePrescribed: string,
  medType: string,
  doseFrequency: string,
  totalDays: number,
  calculationResult: MedicineCalculationResult
): string {
  const frequencyLabels = {
    'QD': 'Once daily',
    'BID': 'Twice daily', 
    'TID': 'Three times daily',
    'QID': 'Four times daily',
    'QOD': 'Every other day',
    'QWEEK': 'Weekly'
  };
  
  const frequencyLabel = frequencyLabels[doseFrequency as keyof typeof frequencyLabels] || doseFrequency;
  
  return `${medicineName} - ${dosePrescribed} ${medType}, ${frequencyLabel}, ${totalDays} days (Total: ${calculationResult.totalQuantity} ${calculationResult.quantityUnit})`;
}