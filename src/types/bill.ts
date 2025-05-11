
export interface BillData {
  accountNumber: string;
  billingMonth: string;
  customerName: string;
  totalAmount: number;
  dueDate: string;
  generationCharge: number;
  transmissionCharge: number;
  systemLossCharge: number;
  distributionCharge: number;
  subsidyCharge: number;
  governmentTaxes: number;
  universalCharges: number;
  fitAllCharge: number;
  otherCharges: number;
  totalKwh: number;
  previousReading: number;
  currentReading: number;
  ratePerKwh: number;
  billingPeriod: {
    from: string;
    to: string;
  };
  meterNumber: string;
  nextMeterReadingDate: string;
  customerType: string;
  monthlyConsumption: {
    month: string;
    consumption: number;
  }[];
  highUsageFlag: boolean;
  comparisonData: {
    current: number;
    previous: number;
    percentageChange: number;
    comparedTo: string;
  };
  environmentalImpact: {
    electricityUsed: number;
    ghgEmissions: number;
    offsetPlantations: number;
  };
}

