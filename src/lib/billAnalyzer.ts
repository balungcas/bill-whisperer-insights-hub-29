
import { BillData } from "@/types/bill";

export const extractBillData = async (file: File): Promise<BillData> => {
  // In a real implementation, this would use OCR services like Tesseract.js or a backend API
  // For demo purposes, we'll return mock data based on the uploaded Meralco bill image
  return new Promise((resolve) => {
    setTimeout(() => {
      // Mock data based on the uploaded Meralco bill image
      const mockData: BillData = {
        accountNumber: "1540181739",
        billingMonth: "January 2025",
        customerName: "APOLONIO P. LIBRADO",
        totalAmount: 2179.63,
        dueDate: "2025-01-22",
        generationCharge: 1250.93,
        transmissionCharge: 160.67,
        systemLossCharge: 116.39,
        distributionCharge: 353.20,
        subsidyCharge: 0.17,
        governmentTaxes: 213.10,
        universalCharges: 41.17,
        fitAllCharge: 15.34,
        otherCharges: 28.66,
        totalKwh: 183,
        previousReading: 18622,
        currentReading: 18805,
        ratePerKwh: 11.75,
        billingPeriod: {
          from: "2024-12-11",
          to: "2025-01-10"
        },
        meterNumber: "119B4071303",
        nextMeterReadingDate: "2025-02-10",
        customerType: "Residential",
        monthlyConsumption: [
          { month: "Jan", consumption: 183 },
          { month: "Dec", consumption: 157 },
          { month: "Nov", consumption: 160 },
          { month: "Oct", consumption: 153 },
          { month: "Sep", consumption: 174 },
          { month: "Aug", consumption: 168 },
          { month: "Jul", consumption: 176 },
          { month: "Jun", consumption: 221 },
          { month: "May", consumption: 203 },
          { month: "Apr", consumption: 201 },
          { month: "Mar", consumption: 142 },
          { month: "Feb", consumption: 160 }
        ],
        highUsageFlag: true,
        comparisonData: {
          current: 183,
          previous: 157,
          percentageChange: 16.56,
          comparedTo: "previous month"
        },
        environmentalImpact: {
          electricityUsed: 183,
          ghgEmissions: 0.1269,
          offsetPlantations: 5
        }
      };

      resolve(mockData);
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

