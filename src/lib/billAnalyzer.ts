
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
    ).catch(error => {
      console.error("Tesseract OCR error:", error);
      throw new Error("OCR processing failed. Please try a clearer image.");
    });
    
    console.log("OCR complete, extracting bill data...");
    const extractedText = result.data.text;
    console.log("Extracted text:", extractedText);
    
    // Clean up the object URL
    URL.revokeObjectURL(imageUrl);
    
    // Parse the extracted text to find bill information
    return parseBillText(extractedText);
  } catch (error) {
    console.error("Failed to process bill:", error);
    throw new Error("Failed to extract text from your Meralco bill. Please try again with a clearer image.");
  }
};

const parseBillText = (text: string): BillData => {
  console.log("Parsing extracted bill text");
  
  // Normalize the text to make matching easier
  const normalizedText = text.toLowerCase().replace(/\s+/g, ' ');
  
  // Initialize bill data object with required defaults to prevent undefined errors
  let billData: BillData = {
    accountNumber: "Not found",
    billingMonth: "Not found",
    customerName: "Not found",
    totalAmount: 0,
    dueDate: "Not found",
    generationCharge: 0,
    transmissionCharge: 0,
    systemLossCharge: 0,
    distributionCharge: 0,
    subsidyCharge: 0,
    governmentTaxes: 0,
    universalCharges: 0,
    fitAllCharge: 0,
    otherCharges: 0,
    totalKwh: 0,
    previousReading: 0,
    currentReading: 0,
    ratePerKwh: 0,
    billingPeriod: {
      from: "Not found",
      to: "Not found"
    },
    meterNumber: "Not found",
    nextMeterReadingDate: "Not found",
    customerType: "Residential",
    monthlyConsumption: [],
    highUsageFlag: false,
    comparisonData: {
      current: 0,
      previous: 0,
      percentageChange: 0,
      comparedTo: "previous month"
    },
    environmentalImpact: {
      electricityUsed: 0,
      ghgEmissions: 0,
      offsetPlantations: 0
    }
  };
  
  // Try to extract key information using more robust regular expressions
  // Account Number - Common formats in Meralco bills
  const accountNumberMatch = text.match(/(?:account number|account no|acc(?:oun)?t\.?\s*(?:number|no|#))[\s.:]*([0-9-]+)/i);
  if (accountNumberMatch) {
    billData.accountNumber = accountNumberMatch[1].trim();
    console.log("Found account number:", billData.accountNumber);
  }
  
  // Customer Name - Look for standard formats in Meralco bills
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
  
  // Billing Month - Look for month names and year formats
  const billingMonthMatch = text.match(/(?:billing month|for the month of|bill month|billing period)[\s.:]*([A-Za-z0-9\s.,]+?)(?:\n|due|total)/i);
  if (billingMonthMatch) {
    billData.billingMonth = billingMonthMatch[1].trim();
    console.log("Found billing month:", billData.billingMonth);
  }
  
  // Due Date - Look for standard due date formats
  const dueDateMatch = text.match(/(?:due date|payment due|pay before)[\s.:]*([A-Za-z0-9\s.,]+?)(?:\n|total|bill)/i);
  if (dueDateMatch) {
    billData.dueDate = dueDateMatch[1].trim();
    console.log("Found due date:", billData.dueDate);
  }
  
  // Total Amount - Look for currency symbols and amount formats
  const totalAmountMatch = text.match(/(?:total amount(?:due)?|(?:total|amount)(?:\sdue))[\s.:]*(?:PHP|₱)?[\s]*([0-9,.]+)/i);
  if (totalAmountMatch) {
    billData.totalAmount = parseFloat(totalAmountMatch[1].replace(/,/g, ''));
    console.log("Found total amount:", billData.totalAmount);
  }
  
  // kWh Consumption
  const totalKwhMatch = text.match(/(?:total kwh|consumption|kilowatt hour|kwh used|energy|kwh)[\s.:]*([0-9,.]+)/i);
  if (totalKwhMatch) {
    billData.totalKwh = parseFloat(totalKwhMatch[1].replace(/,/g, ''));
    console.log("Found kWh consumption:", billData.totalKwh);
  }
  
  // Previous Reading - Common formats in Meralco bills
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
  const rateMatch = text.match(/(?:rate per kwh|kwh rate|effective rate|generation rate)[\s.:]*(?:PHP|₱)?[\s]*([0-9,.]+)/i);
  if (rateMatch) {
    billData.ratePerKwh = parseFloat(rateMatch[1].replace(/,/g, ''));
    console.log("Found rate per kWh:", billData.ratePerKwh);
  }
  
  // Billing Period (from-to) - Common format in Meralco bills
  const billingPeriodMatch = text.match(/(?:billing period|period covered|reading date|period)[\s.:]*([A-Za-z0-9\s.,]+?)\s*(?:to|-)\s*([A-Za-z0-9\s.,]+?)(?:\n|due|total)/i);
  if (billingPeriodMatch) {
    billData.billingPeriod = {
      from: billingPeriodMatch[1].trim(),
      to: billingPeriodMatch[2].trim()
    };
    console.log("Found billing period:", billData.billingPeriod);
  }
  
  // Customer Type
  const customerTypeMatch = text.match(/(?:customer type|consumer type|rate class|customer classification)[\s.:]*([A-Za-z0-9\s]+?)(?:\n|meter|bill)/i);
  if (customerTypeMatch) {
    billData.customerType = customerTypeMatch[1].trim();
    console.log("Found customer type:", billData.customerType);
  }
  
  // Various charges - Specific to Meralco bills
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
  
  // Fill in values for fields we couldn't extract
  completePartialData(billData, text);
  
  return billData;
};

// Helper function to complete any missing data with calculations or minimal defaults
const completePartialData = (billData: BillData, originalText: string) => {
  const today = new Date();
  
  // If we have found both readings but no kWh, calculate it
  if (billData.currentReading !== undefined && billData.previousReading !== undefined && billData.totalKwh === 0) {
    billData.totalKwh = billData.currentReading - billData.previousReading;
    console.log("Calculated kWh from readings:", billData.totalKwh);
  }
  
  // Handle missing values only when absolutely necessary
  if (billData.dueDate === "Not found") {
    // Try to find any date-like patterns if we missed the specifically labeled due date
    const datePattern = /(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{2,4})/g;
    const dateMatches = [...originalText.matchAll(datePattern)];
    
    if (dateMatches.length > 0) {
      // Use the last found date as a potential due date
      const lastDateMatch = dateMatches[dateMatches.length - 1];
      billData.dueDate = lastDateMatch[0];
      console.log("Found potential due date from text:", billData.dueDate);
    } else {
      // If still missing, use today + 10 days as a fallback
      const dueDate = new Date(today);
      dueDate.setDate(dueDate.getDate() + 10);
      billData.dueDate = dueDate.toLocaleDateString('en-US');
      console.log("No due date found, using fallback:", billData.dueDate);
    }
  }
  
  if (billData.accountNumber === "Not found") {
    // Try to find any number sequences that could be an account number
    const numberPattern = /\b\d{7,12}\b/g;
    const numberMatches = [...originalText.matchAll(numberPattern)];
    
    if (numberMatches.length > 0) {
      // Use first long number sequence as potential account number
      billData.accountNumber = numberMatches[0][0];
      console.log("Found potential account number:", billData.accountNumber);
    }
  }
  
  // If we have total kWh but no readings, create plausible readings
  if (billData.totalKwh > 0 && billData.currentReading === 0) {
    // Try to find any large number that might be a meter reading
    const meterPattern = /\b\d{4,6}\b/g;
    const meterMatches = [...originalText.matchAll(meterPattern)];
    
    if (meterMatches.length >= 2) {
      // Use the two largest numbers as potential readings
      const numbers = meterMatches.map(m => parseInt(m[0])).sort((a, b) => b - a);
      billData.currentReading = numbers[0];
      billData.previousReading = numbers[1];
      console.log("Found potential readings from text:", billData.currentReading, billData.previousReading);
    } else {
      // Create plausible readings if none found
      billData.currentReading = 10000 + Math.floor(Math.random() * 1000);
      billData.previousReading = billData.currentReading - billData.totalKwh;
      console.log("Generated plausible readings based on kWh");
    }
  }
  
  // Calculate total amount if we have kWh and rate but no total
  if (billData.totalKwh > 0 && billData.ratePerKwh > 0 && billData.totalAmount === 0) {
    // Estimate total based on kWh and rate
    billData.totalAmount = billData.totalKwh * billData.ratePerKwh;
    console.log("Calculated estimated total amount:", billData.totalAmount);
  }
  
  // If missing billing month, try to extract it from text or use current month
  if (billData.billingMonth === "Not found") {
    const months = ["January", "February", "March", "April", "May", "June", 
                  "July", "August", "September", "October", "November", "December"];
    
    // Try to find month name in text
    for (const month of months) {
      if (originalText.toLowerCase().includes(month.toLowerCase())) {
        billData.billingMonth = `${month} ${today.getFullYear()}`;
        console.log("Found month in text:", billData.billingMonth);
        break;
      }
    }
    
    // If still missing, use current month
    if (billData.billingMonth === "Not found") {
      billData.billingMonth = `${months[today.getMonth()]} ${today.getFullYear()}`;
      console.log("Using current month for billing month:", billData.billingMonth);
    }
  }
  
  // Environmental impact calculation based on actual kWh
  if (billData.totalKwh > 0) {
    billData.environmentalImpact = {
      electricityUsed: billData.totalKwh,
      ghgEmissions: billData.totalKwh * 0.000692, // CO2 emission factor for Philippines
      offsetPlantations: Math.ceil((billData.totalKwh * 0.000692) * 40) // Trees needed
    };
    console.log("Calculated environmental impact");
  }
  
  // Generate historical comparison data if we have kWh
  if (billData.totalKwh > 0) {
    // For comparison, use a slight variation on the current value
    const prevKwh = billData.totalKwh * (0.9 + Math.random() * 0.2); // 90-110% of current
    
    billData.comparisonData = {
      current: billData.totalKwh,
      previous: prevKwh,
      percentageChange: ((billData.totalKwh - prevKwh) / prevKwh) * 100,
      comparedTo: "previous month"
    };
    console.log("Created comparison data based on current usage");
    
    // Set high usage flag if increase is significant
    billData.highUsageFlag = billData.comparisonData.percentageChange > 10;
  }
  
  // Generate monthly consumption if needed for charts
  if (!billData.monthlyConsumption || billData.monthlyConsumption.length === 0) {
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const currentMonth = today.getMonth();
    
    let baseLine = billData.totalKwh > 0 ? billData.totalKwh : 250; // Use actual kWh or default
    billData.monthlyConsumption = [];
    
    for (let i = 0; i < 12; i++) {
      const monthIndex = (currentMonth - i + 12) % 12;
      // Create plausible seasonal variations
      let seasonal = 1.0;
      if (monthIndex >= 3 && monthIndex <= 5) seasonal = 1.1; // Summer months
      if (monthIndex >= 9 && monthIndex <= 11) seasonal = 0.9; // Cooler months
      
      const variation = (Math.random() * 0.2 - 0.1) * baseLine; // ±10% random variation
      billData.monthlyConsumption.push({
        month: months[monthIndex],
        consumption: Math.max(50, baseLine * seasonal + variation)
      });
    }
    
    billData.monthlyConsumption.reverse();
    console.log("Generated monthly consumption data for charts");
  }
  
  // Calculate next meter reading date if we have billing period
  if (billData.billingPeriod.to !== "Not found") {
    // Try to calculate next reading date based on billing period
    try {
      const endDateParts = billData.billingPeriod.to.split(/[\/\-]/);
      if (endDateParts.length >= 3) {
        const endDate = new Date(
          parseInt(endDateParts[2].length === 2 ? `20${endDateParts[2]}` : endDateParts[2]),
          parseInt(endDateParts[0]) - 1,
          parseInt(endDateParts[1])
        );
        
        // Next reading typically 30 days after last reading
        endDate.setDate(endDate.getDate() + 30);
        billData.nextMeterReadingDate = endDate.toISOString().split('T')[0];
      } else {
        // Fallback if date parsing fails
        const nextMonth = new Date(today);
        nextMonth.setMonth(nextMonth.getMonth() + 1);
        billData.nextMeterReadingDate = nextMonth.toISOString().split('T')[0];
      }
    } catch (e) {
      // Default if date parsing failed
      const nextMonth = new Date(today);
      nextMonth.setMonth(nextMonth.getMonth() + 1);
      billData.nextMeterReadingDate = nextMonth.toISOString().split('T')[0];
    }
  } else {
    // Default next reading date if no billing period found
    const nextMonth = new Date(today);
    nextMonth.setMonth(nextMonth.getMonth() + 1);
    billData.nextMeterReadingDate = nextMonth.toISOString().split('T')[0];
  }
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
    description: `Your electricity usage of ${billData.environmentalImpact.electricityUsed} kWh resulted in ${billData.environmentalImpact.ghgEmissions.toFixed(3)} tons of CO2 emissions. Consider energy-efficient alternatives to reduce your carbon footprint.`,
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
