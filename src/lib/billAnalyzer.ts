import { BillData } from "@/types/bill";

export const extractBillData = async (file: File): Promise<BillData> => {
  // In a real implementation, this would use OCR services like Tesseract.js or a backend API
  // For demo purposes, we'll simulate detection of any Meralco bill
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      try {
        // Simulate bill parsing process
        console.log(`Processing bill image: ${file.name}`);
        
        // Check if file is an image or PDF
        if (!file.type.match('image/*') && file.type !== 'application/pdf') {
          throw new Error("Please upload a valid image or PDF file");
        }
        
        // Generate randomized data to simulate analyzing different bills
        const currentDate = new Date();
        const previousMonth = new Date(currentDate);
        previousMonth.setMonth(currentDate.getMonth() - 1);
        
        const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        
        // Random consumption between 100-300 kWh
        const totalKwh = Math.floor(Math.random() * 200) + 100;
        
        // Generate realistic rate (between 10-13 pesos per kWh)
        const ratePerKwh = 10 + (Math.random() * 3);
        
        // Calculate charges based on kWh
        const generationCharge = totalKwh * ratePerKwh * 0.55;
        const transmissionCharge = totalKwh * ratePerKwh * 0.08;
        const systemLossCharge = totalKwh * ratePerKwh * 0.06;
        const distributionCharge = totalKwh * ratePerKwh * 0.16;
        const governmentTaxes = totalKwh * ratePerKwh * 0.10;
        const universalCharges = totalKwh * ratePerKwh * 0.02;
        const fitAllCharge = totalKwh * ratePerKwh * 0.007;
        const otherCharges = totalKwh * ratePerKwh * 0.013;
        const subsidyCharge = 0.10;
        
        // Calculate total amount
        const totalAmount = generationCharge + transmissionCharge + systemLossCharge + 
                           distributionCharge + governmentTaxes + universalCharges + 
                           fitAllCharge + otherCharges + subsidyCharge;
        
        // Generate random previous reading and calculate current reading
        const previousReading = Math.floor(Math.random() * 5000) + 10000;
        const currentReading = previousReading + totalKwh;
        
        // Generate monthly consumption data with realistic variations
        const monthlyConsumption = [];
        let baseLine = totalKwh;
        
        for (let i = 0; i < 12; i++) {
          const monthIndex = (currentDate.getMonth() - i + 12) % 12;
          const variation = Math.floor(Math.random() * 50) - 25; // -25 to +25 variation
          monthlyConsumption.push({
            month: months[monthIndex],
            consumption: Math.max(50, baseLine + variation)
          });
          // Slight seasonal trend
          baseLine = baseLine + (i % 3 === 0 ? 10 : -10);
        }
        
        // Calculate comparison with previous month
        const current = totalKwh;
        const previous = monthlyConsumption[1].consumption;
        const percentageChange = ((current - previous) / previous) * 100;
        
        // Format dates
        const today = new Date();
        const billingPeriodEnd = new Date(today);
        const billingPeriodStart = new Date(today);
        billingPeriodStart.setDate(billingPeriodStart.getDate() - 30);
        
        const dueDate = new Date(today);
        dueDate.setDate(dueDate.getDate() + 10);
        
        const nextMeterReading = new Date(billingPeriodEnd);
        nextMeterReading.setMonth(nextMeterReading.getMonth() + 1);

        // Random names to simulate different users
        const firstNames = ["Maria", "Juan", "Ana", "Roberto", "Elena", "Miguel", "Sofia", "Rafael", "Isabella", "Carlos"];
        const lastNames = ["Garcia", "Santos", "Reyes", "Lim", "Cruz", "Gonzales", "Aquino", "Diaz", "Mendoza", "Torres"];
        
        const randomFirstName = firstNames[Math.floor(Math.random() * firstNames.length)];
        const randomLastName = lastNames[Math.floor(Math.random() * lastNames.length)];
        const randomMiddleInitial = String.fromCharCode(65 + Math.floor(Math.random() * 26));
        
        const customerName = `${randomFirstName} ${randomMiddleInitial}. ${randomLastName}`;
        
        // Generate random account number
        const accountNumber = Math.floor(Math.random() * 9000000000) + 1000000000;
        
        // Generate random meter number
        const meterNumber = `${Math.floor(Math.random() * 900) + 100}B${Math.floor(Math.random() * 9000000) + 1000000}`;
        
        // Environmental impact calculation
        const ghgEmissions = totalKwh * 0.000692;
        const offsetPlantations = Math.ceil(ghgEmissions * 40);
        
        // Generate the mock data with the randomized values
        const mockData: BillData = {
          accountNumber: accountNumber.toString(),
          billingMonth: `${months[currentDate.getMonth()]} ${currentDate.getFullYear()}`,
          customerName: customerName,
          totalAmount: parseFloat(totalAmount.toFixed(2)),
          dueDate: dueDate.toISOString().split('T')[0],
          generationCharge: parseFloat(generationCharge.toFixed(2)),
          transmissionCharge: parseFloat(transmissionCharge.toFixed(2)),
          systemLossCharge: parseFloat(systemLossCharge.toFixed(2)),
          distributionCharge: parseFloat(distributionCharge.toFixed(2)),
          subsidyCharge: parseFloat(subsidyCharge.toFixed(2)),
          governmentTaxes: parseFloat(governmentTaxes.toFixed(2)),
          universalCharges: parseFloat(universalCharges.toFixed(2)),
          fitAllCharge: parseFloat(fitAllCharge.toFixed(2)),
          otherCharges: parseFloat(otherCharges.toFixed(2)),
          totalKwh: totalKwh,
          previousReading: previousReading,
          currentReading: currentReading,
          ratePerKwh: parseFloat(ratePerKwh.toFixed(2)),
          billingPeriod: {
            from: billingPeriodStart.toISOString().split('T')[0],
            to: billingPeriodEnd.toISOString().split('T')[0]
          },
          meterNumber: meterNumber,
          nextMeterReadingDate: nextMeterReading.toISOString().split('T')[0],
          customerType: "Residential",
          monthlyConsumption: monthlyConsumption.reverse(), // Put current month first
          highUsageFlag: percentageChange > 10,
          comparisonData: {
            current: current,
            previous: previous,
            percentageChange: parseFloat(percentageChange.toFixed(2)),
            comparedTo: "previous month"
          },
          environmentalImpact: {
            electricityUsed: totalKwh,
            ghgEmissions: parseFloat(ghgEmissions.toFixed(4)),
            offsetPlantations: offsetPlantations
          }
        };

        console.log("Bill successfully processed:", mockData.customerName);
        resolve(mockData);
      } catch (error) {
        console.error("Failed to process bill:", error);
        reject(error);
      }
    }, 1500);
  });
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
