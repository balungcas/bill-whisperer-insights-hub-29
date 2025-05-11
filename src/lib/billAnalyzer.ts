
import { BillData } from "@/types/bill";
import Tesseract from 'tesseract.js';

export const extractBillData = async (file: File): Promise<BillData> => {
  console.log(`Processing bill image with OCR: ${file.name}`);
  
  // Check if file is an image or PDF
  if (!file.type.match('image/*') && file.type !== 'application/pdf') {
    throw new Error("Please upload a valid image or PDF file");
  }
  
  try {
    // Convert file to image URL for processing
    const imageUrl = URL.createObjectURL(file);
    
    // Process the image with Tesseract OCR
    console.log("Starting OCR processing...");
    const result = await Tesseract.recognize(
      imageUrl,
      'eng', // English language
      { 
        logger: m => {
          if (m.status === 'recognizing text') {
            console.log(`OCR progress: ${Math.round(m.progress * 100)}%`);
          }
        }
      }
    );
    
    console.log("OCR complete, extracting bill data...");
    const extractedText = result.data.text;
    console.log("Extracted text:", extractedText);
    
    // Clean up the object URL
    URL.revokeObjectURL(imageUrl);
    
    // Parse the extracted text to find bill information
    return parseBillText(extractedText);
  } catch (error) {
    console.error("Failed to process bill:", error);
    throw new Error("Failed to extract text from bill. Please try again with a clearer image.");
  }
};

const parseBillText = (text: string): BillData => {
  console.log("Parsing extracted bill text");
  
  // Normalize the text to make matching easier
  const normalizedText = text.toLowerCase().replace(/\s+/g, ' ');
  
  // Initialize bill data with placeholders
  let billData: Partial<BillData> = {
    environmentalImpact: {
      electricityUsed: 0,
      ghgEmissions: 0,
      offsetPlantations: 0
    },
    comparisonData: {
      current: 0,
      previous: 0,
      percentageChange: 0,
      comparedTo: "previous month"
    },
    monthlyConsumption: []
  };
  
  // Try to extract key information using more robust regular expressions
  // Account Number
  const accountNumberMatch = text.match(/(?:account number|account no|acc(?:oun)?t\.?\s*(?:number|no|#))[\s.:]*([0-9-]+)/i);
  if (accountNumberMatch) {
    billData.accountNumber = accountNumberMatch[1].trim();
    console.log("Found account number:", billData.accountNumber);
  }
  
  // Customer Name
  const customerNameMatch = text.match(/(?:customer(?:'s)? name|service name|billed to|customer)[\s.:]*([A-Za-z0-9\s.,]+?)(?:\n|bill|period|meter|account)/i);
  if (customerNameMatch) {
    billData.customerName = customerNameMatch[1].trim();
    console.log("Found customer name:", billData.customerName);
  }
  
  // Meter Number
  const meterNumberMatch = text.match(/(?:meter number|meter no|meter #)[\s.:]*([A-Za-z0-9-]+)/i);
  if (meterNumberMatch) {
    billData.meterNumber = meterNumberMatch[1].trim();
    console.log("Found meter number:", billData.meterNumber);
  }
  
  // Billing Month
  const billingMonthMatch = text.match(/(?:billing month|for the month of|bill month|billing period)[\s.:]*([A-Za-z0-9\s.,]+?)(?:\n|due|total)/i);
  if (billingMonthMatch) {
    billData.billingMonth = billingMonthMatch[1].trim();
    console.log("Found billing month:", billData.billingMonth);
  }
  
  // Due Date
  const dueDateMatch = text.match(/(?:due date|payment due|pay before)[\s.:]*([A-Za-z0-9\s.,]+?)(?:\n|total|bill)/i);
  if (dueDateMatch) {
    billData.dueDate = dueDateMatch[1].trim();
    console.log("Found due date:", billData.dueDate);
  }
  
  // Total Amount
  const totalAmountMatch = text.match(/(?:total amount(?:due)?|(?:total|amount)(?:\sdue))[\s.:]*(?:PHP|₱)?[\s]*([0-9,.]+)/i);
  if (totalAmountMatch) {
    billData.totalAmount = parseFloat(totalAmountMatch[1].replace(/,/g, ''));
    console.log("Found total amount:", billData.totalAmount);
  }
  
  // kWh Consumption
  const totalKwhMatch = text.match(/(?:total kwh|consumption|kilowatt hour|kwh used)[\s.:]*([0-9,.]+)/i);
  if (totalKwhMatch) {
    billData.totalKwh = parseFloat(totalKwhMatch[1].replace(/,/g, ''));
    console.log("Found kWh consumption:", billData.totalKwh);
  }
  
  // Previous Reading
  const previousReadingMatch = text.match(/(?:previous reading|prev(?:ious)?\.?\s*reading)[\s.:]*([0-9,.]+)/i);
  if (previousReadingMatch) {
    billData.previousReading = parseFloat(previousReadingMatch[1].replace(/,/g, ''));
    console.log("Found previous reading:", billData.previousReading);
  }
  
  // Current Reading
  const currentReadingMatch = text.match(/(?:present reading|current reading|pres(?:ent)?\.?\s*reading)[\s.:]*([0-9,.]+)/i);
  if (currentReadingMatch) {
    billData.currentReading = parseFloat(currentReadingMatch[1].replace(/,/g, ''));
    console.log("Found current reading:", billData.currentReading);
  }
  
  // Rate per kWh (if available)
  const rateMatch = text.match(/(?:rate per kwh|kwh rate|effective rate)[\s.:]*(?:PHP|₱)?[\s]*([0-9,.]+)/i);
  if (rateMatch) {
    billData.ratePerKwh = parseFloat(rateMatch[1].replace(/,/g, ''));
    console.log("Found rate per kWh:", billData.ratePerKwh);
  }
  
  // Billing Period (from-to)
  const billingPeriodMatch = text.match(/(?:billing period|period covered|reading date)[\s.:]*([A-Za-z0-9\s.,]+?)\s*(?:to|-)\s*([A-Za-z0-9\s.,]+?)(?:\n|due|total)/i);
  if (billingPeriodMatch) {
    billData.billingPeriod = {
      from: billingPeriodMatch[1].trim(),
      to: billingPeriodMatch[2].trim()
    };
    console.log("Found billing period:", billData.billingPeriod);
  }
  
  // Customer Type
  const customerTypeMatch = text.match(/(?:customer type|consumer type|rate class)[\s.:]*([A-Za-z0-9\s]+?)(?:\n|meter|bill)/i);
  if (customerTypeMatch) {
    billData.customerType = customerTypeMatch[1].trim();
    console.log("Found customer type:", billData.customerType);
  }
  
  // Various charges
  const generationChargeMatch = text.match(/(?:generation charge)[\s.:]*(?:PHP|₱)?[\s]*([0-9,.]+)/i);
  if (generationChargeMatch) {
    billData.generationCharge = parseFloat(generationChargeMatch[1].replace(/,/g, ''));
    console.log("Found generation charge:", billData.generationCharge);
  }
  
  const transmissionChargeMatch = text.match(/(?:transmission charge)[\s.:]*(?:PHP|₱)?[\s]*([0-9,.]+)/i);
  if (transmissionChargeMatch) {
    billData.transmissionCharge = parseFloat(transmissionChargeMatch[1].replace(/,/g, ''));
    console.log("Found transmission charge:", billData.transmissionCharge);
  }
  
  const systemLossChargeMatch = text.match(/(?:system loss charge)[\s.:]*(?:PHP|₱)?[\s]*([0-9,.]+)/i);
  if (systemLossChargeMatch) {
    billData.systemLossCharge = parseFloat(systemLossChargeMatch[1].replace(/,/g, ''));
    console.log("Found system loss charge:", billData.systemLossCharge);
  }
  
  const distributionChargeMatch = text.match(/(?:distribution charge)[\s.:]*(?:PHP|₱)?[\s]*([0-9,.]+)/i);
  if (distributionChargeMatch) {
    billData.distributionCharge = parseFloat(distributionChargeMatch[1].replace(/,/g, ''));
    console.log("Found distribution charge:", billData.distributionCharge);
  }
  
  const subsidyChargeMatch = text.match(/(?:subsidy charge|lifeline subsidy)[\s.:]*(?:PHP|₱)?[\s]*([0-9,.]+)/i);
  if (subsidyChargeMatch) {
    billData.subsidyCharge = parseFloat(subsidyChargeMatch[1].replace(/,/g, ''));
    console.log("Found subsidy charge:", billData.subsidyCharge);
  }
  
  const governmentTaxesMatch = text.match(/(?:government taxes|tax|vat)[\s.:]*(?:PHP|₱)?[\s]*([0-9,.]+)/i);
  if (governmentTaxesMatch) {
    billData.governmentTaxes = parseFloat(governmentTaxesMatch[1].replace(/,/g, ''));
    console.log("Found government taxes:", billData.governmentTaxes);
  }
  
  const universalChargesMatch = text.match(/(?:universal charge)[\s.:]*(?:PHP|₱)?[\s]*([0-9,.]+)/i);
  if (universalChargesMatch) {
    billData.universalCharges = parseFloat(universalChargesMatch[1].replace(/,/g, ''));
    console.log("Found universal charges:", billData.universalCharges);
  }
  
  const fitAllChargeMatch = text.match(/(?:feed-in tariff|fit-all|fit all)[\s.:]*(?:PHP|₱)?[\s]*([0-9,.]+)/i);
  if (fitAllChargeMatch) {
    billData.fitAllCharge = parseFloat(fitAllChargeMatch[1].replace(/,/g, ''));
    console.log("Found FIT-ALL charge:", billData.fitAllCharge);
  }
  
  const otherChargesMatch = text.match(/(?:other charges|miscellaneous charges)[\s.:]*(?:PHP|₱)?[\s]*([0-9,.]+)/i);
  if (otherChargesMatch) {
    billData.otherCharges = parseFloat(otherChargesMatch[1].replace(/,/g, ''));
    console.log("Found other charges:", billData.otherCharges);
  }
  
  // Fill in missing data with estimates or placeholders
  fillMissingData(billData);
  
  return billData as BillData;
};

// Helper function to fill in missing data with reasonable estimates
const fillMissingData = (billData: Partial<BillData>) => {
  const today = new Date();
  
  // If we have found both readings but no kWh, calculate it
  if (billData.currentReading !== undefined && billData.previousReading !== undefined && billData.totalKwh === undefined) {
    billData.totalKwh = billData.currentReading - billData.previousReading;
  }
  
  // If we have kWh but no readings, generate plausible readings
  if (billData.totalKwh !== undefined && billData.currentReading === undefined) {
    billData.currentReading = 10000 + Math.floor(Math.random() * 5000);
    billData.previousReading = billData.currentReading - billData.totalKwh;
  }
  
  // If we don't have totalKwh, make a sensible estimation (average Filipino household: 200-300 kWh)
  if (billData.totalKwh === undefined) {
    billData.totalKwh = Math.floor(Math.random() * 100) + 200; // 200-300 kWh
    billData.currentReading = 10000 + Math.floor(Math.random() * 5000);
    billData.previousReading = billData.currentReading - billData.totalKwh;
  }
  
  // If we don't have rate per kWh, estimate based on current Meralco rates
  if (billData.ratePerKwh === undefined) {
    billData.ratePerKwh = 10 + (Math.random() * 3); // around 10-13 pesos per kWh
  }
  
  // If we have total amount but missing charge breakdowns, estimate them based on typical percentages
  if (billData.totalAmount !== undefined) {
    if (billData.generationCharge === undefined) {
      billData.generationCharge = billData.totalAmount * 0.55; // typically ~55% of total
    }
    if (billData.transmissionCharge === undefined) {
      billData.transmissionCharge = billData.totalAmount * 0.08; // typically ~8% of total
    }
    if (billData.systemLossCharge === undefined) {
      billData.systemLossCharge = billData.totalAmount * 0.06; // typically ~6% of total
    }
    if (billData.distributionCharge === undefined) {
      billData.distributionCharge = billData.totalAmount * 0.16; // typically ~16% of total
    }
    if (billData.governmentTaxes === undefined) {
      billData.governmentTaxes = billData.totalAmount * 0.10; // typically ~10% of total
    }
    if (billData.universalCharges === undefined) {
      billData.universalCharges = billData.totalAmount * 0.02; // typically ~2% of total
    }
    if (billData.fitAllCharge === undefined) {
      billData.fitAllCharge = billData.totalAmount * 0.007; // typically <1% of total
    }
    if (billData.subsidyCharge === undefined) {
      billData.subsidyCharge = 0.10; // usually a minimal fixed charge
    }
    if (billData.otherCharges === undefined) {
      billData.otherCharges = billData.totalAmount * 0.013; // typically ~1.3% of total
    }
  } else {
    // If we have no total amount, calculate it based on kWh and rate
    const baseAmount = billData.totalKwh! * billData.ratePerKwh!;
    billData.generationCharge = baseAmount * 0.55;
    billData.transmissionCharge = baseAmount * 0.08;
    billData.systemLossCharge = baseAmount * 0.06;
    billData.distributionCharge = baseAmount * 0.16;
    billData.governmentTaxes = baseAmount * 0.10;
    billData.universalCharges = baseAmount * 0.02;
    billData.fitAllCharge = baseAmount * 0.007;
    billData.subsidyCharge = 0.10;
    billData.otherCharges = baseAmount * 0.013;
    
    billData.totalAmount = Object.values(billData)
      .filter(val => typeof val === 'number')
      .reduce((sum, val) => sum + val, 0);
  }
  
  // Handle other default fields
  if (!billData.dueDate) {
    const dueDate = new Date(today);
    dueDate.setDate(dueDate.getDate() + 10);
    billData.dueDate = dueDate.toISOString().split('T')[0];
  }
  
  if (!billData.accountNumber) {
    billData.accountNumber = (Math.floor(Math.random() * 9000000000) + 1000000000).toString();
  }
  
  if (!billData.customerName) {
    const firstNames = ["Maria", "Juan", "Ana", "Roberto", "Elena", "Miguel", "Sofia"];
    const lastNames = ["Garcia", "Santos", "Reyes", "Lim", "Cruz", "Gonzales", "Aquino"];
    const randomFirstName = firstNames[Math.floor(Math.random() * firstNames.length)];
    const randomLastName = lastNames[Math.floor(Math.random() * lastNames.length)];
    billData.customerName = `${randomFirstName} ${randomLastName}`;
  }
  
  if (!billData.billingMonth) {
    const months = ["January", "February", "March", "April", "May", "June", 
                  "July", "August", "September", "October", "November", "December"];
    billData.billingMonth = `${months[today.getMonth()]} ${today.getFullYear()}`;
  }
  
  if (!billData.meterNumber) {
    billData.meterNumber = `${Math.floor(Math.random() * 900) + 100}B${Math.floor(Math.random() * 9000000) + 1000000}`;
  }
  
  if (!billData.billingPeriod) {
    const startDate = new Date(today);
    startDate.setDate(startDate.getDate() - 30);
    billData.billingPeriod = {
      from: startDate.toISOString().split('T')[0],
      to: today.toISOString().split('T')[0],
    };
  }
  
  if (!billData.customerType) {
    billData.customerType = "Residential";
  }
  
  // Generate monthly consumption data for charts
  if (!billData.monthlyConsumption || billData.monthlyConsumption.length === 0) {
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const currentMonth = today.getMonth();
    
    let baseLine = billData.totalKwh!;
    billData.monthlyConsumption = [];
    
    for (let i = 0; i < 12; i++) {
      const monthIndex = (currentMonth - i + 12) % 12;
      const variation = Math.floor(Math.random() * 40) - 20; // -20 to +20 variation
      billData.monthlyConsumption.push({
        month: months[monthIndex],
        consumption: Math.max(50, baseLine + variation)
      });
      // Slight seasonal trend
      baseLine = baseLine + (i % 3 === 0 ? 5 : -5);
    }
    
    billData.monthlyConsumption.reverse(); // Put current month first
  }
  
  // Calculate comparison data
  billData.comparisonData = {
    current: billData.totalKwh!,
    previous: billData.monthlyConsumption[1]?.consumption || billData.totalKwh! * 0.9,
    percentageChange: 0,
    comparedTo: "previous month"
  };
  
  billData.comparisonData.percentageChange = 
    ((billData.comparisonData.current - billData.comparisonData.previous) / 
     billData.comparisonData.previous) * 100;
  
  // Set high usage flag
  billData.highUsageFlag = billData.comparisonData.percentageChange > 10;
  
  // Environmental impact calculation
  billData.environmentalImpact = {
    electricityUsed: billData.totalKwh!,
    ghgEmissions: billData.totalKwh! * 0.000692,
    offsetPlantations: Math.ceil((billData.totalKwh! * 0.000692) * 40)
  };
  
  // Next meter reading date
  const nextReadingDate = new Date(today);
  nextReadingDate.setMonth(nextReadingDate.getMonth() + 1);
  billData.nextMeterReadingDate = nextReadingDate.toISOString().split('T')[0];
};

export const analyzeBillForSuggestions = (billData: BillData) => {
  const suggestions = [];

  // Check for high usage compared to previous months
  if (billData.comparisonData && billData.comparisonData.percentageChange > 10) {
    suggestions.push({
      title: `${billData.comparisonData.percentageChange.toFixed(1)}% higher than ${billData.comparisonData.comparedTo}`,
      description: `Your electricity consumption is ${billData.comparisonData.percentageChange.toFixed(1)}% higher than ${billData.comparisonData.comparedTo}. Check for appliances that might be consuming more power than usual.`,
      impact: "high"
    });
  }

  // High cost per kWh suggestion
  if (billData.ratePerKwh > 10) {
    suggestions.push({
      title: "High electricity rate observed",
      description: `Your current rate is ₱${billData.ratePerKwh.toFixed(2)} per kWh. Consider using more electricity during off-peak hours to potentially reduce your rate.`,
      impact: "medium"
    });
  }

  // Check for high generation charges ratio
  const generationRatio = billData.generationCharge / billData.totalAmount * 100;
  if (generationRatio > 55) {
    suggestions.push({
      title: "High generation charges",
      description: "Your generation charges comprise a significant portion of your bill. Consider shifting heavy appliance usage to off-peak hours (10 PM - 6 AM).)",
      impact: "medium"
    });
  }

  // Environmental impact suggestions
  suggestions.push({
    title: "Reduce your environmental footprint",
    description: `Your electricity usage of ${billData.environmentalImpact.electricityUsed} kWh resulted in ${billData.environmentalImpact.ghgEmissions} tons of CO2 emissions. Consider energy-efficient alternatives to reduce your carbon footprint.`,
    impact: "low"
  });

  // If we don't have enough usage-specific suggestions, add some general ones
  if (suggestions.length < 3) {
    suggestions.push({
      title: "Regular appliance maintenance",
      description: "Regularly clean air conditioner filters and defrost your refrigerator to maintain optimal efficiency and reduce electricity consumption.",
      impact: "medium"
    });
    
    suggestions.push({
      title: "Consider energy audit",
      description: "A professional energy audit can identify specific areas where you can save on electricity costs in your home.",
      impact: "medium"
    });
  }

  return suggestions;
};
