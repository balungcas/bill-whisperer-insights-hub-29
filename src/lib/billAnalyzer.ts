
import { BillData } from "@/types/bill";

export const extractBillData = async (file: File): Promise<BillData> => {
  // In a real implementation, this would use OCR services like Tesseract.js or a backend API
  // For demo purposes, we'll return mock data after a short delay
  return new Promise((resolve) => {
    setTimeout(() => {
      // This would be replaced with actual OCR and data extraction logic
      const mockData: BillData = {
        accountNumber: "123456789012",
        billingMonth: "May 2025",
        customerName: "John Doe",
        totalAmount: 5423.45,
        dueDate: "2025-05-25",
        generationCharge: 2850.75,
        transmissionCharge: 523.45,
        systemLossCharge: 203.56,
        distributionCharge: 1023.75,
        subsidyCharge: 45.20,
        governmentTaxes: 645.67,
        otherCharges: 131.07,
        totalKwh: 523,
        previousReading: 4578,
        currentReading: 5101,
        monthlyConsumption: [
          { month: "Dec", consumption: 412 },
          { month: "Jan", consumption: 425 },
          { month: "Feb", consumption: 437 },
          { month: "Mar", consumption: 481 },
          { month: "Apr", consumption: 498 },
          { month: "May", consumption: 523 }
        ],
        highUsageFlag: true
      };

      resolve(mockData);
    }, 1500);
  });
};

export const analyzeBillForSuggestions = (billData: BillData) => {
  const suggestions = [];

  // Check for high usage compared to previous months
  const currentMonth = billData.monthlyConsumption[billData.monthlyConsumption.length - 1];
  const previousMonth = billData.monthlyConsumption[billData.monthlyConsumption.length - 2];
  
  if (currentMonth && previousMonth) {
    const percentageIncrease = ((currentMonth.consumption - previousMonth.consumption) / previousMonth.consumption) * 100;
    
    if (percentageIncrease > 10) {
      suggestions.push({
        title: "Significant usage increase detected",
        description: `Your electricity consumption has increased by ${percentageIncrease.toFixed(1)}% compared to last month. Consider checking for appliances that might be malfunctioning or using more power.`,
        impact: "high"
      });
    }
  }

  // Check for high consumption patterns
  const avgConsumption = billData.monthlyConsumption.reduce((sum, month) => sum + month.consumption, 0) / 
    billData.monthlyConsumption.length;

  if (billData.totalKwh > (avgConsumption * 1.2)) {
    suggestions.push({
      title: "Above average consumption",
      description: "Your consumption is higher than your typical average. This might be due to seasonal changes or new appliances.",
      impact: "medium"
    });
  }

  // Check for high generation charges ratio
  const generationRatio = billData.generationCharge / billData.totalAmount * 100;
  if (generationRatio > 55) {
    suggestions.push({
      title: "High generation charges",
      description: "Your generation charges are particularly high this month. Consider using heavy appliances during off-peak hours.",
      impact: "medium"
    });
  }

  // General energy saving tips
  suggestions.push({
    title: "Energy saving tips",
    description: "Consider switching to LED bulbs, unplugging devices when not in use, and setting your air conditioner to 25°C for optimal efficiency.",
    impact: "low"
  });

  // If we don't have enough usage-specific suggestions, add some general ones
  if (suggestions.length < 3) {
    suggestions.push({
      title: "Regular appliance maintenance",
      description: "Regularly clean air conditioner filters and defrost your refrigerator to maintain optimal efficiency.",
      impact: "medium"
    });
    
    suggestions.push({
      title: "Consider energy audit",
      description: "A professional energy audit can identify specific areas where you can save on electricity costs.",
      impact: "medium"
    });
  }

  return suggestions;
};
