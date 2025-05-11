
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
  otherCharges: number;
  totalKwh: number;
  previousReading: number;
  currentReading: number;
  monthlyConsumption: {
    month: string;
    consumption: number;
  }[];
  highUsageFlag: boolean;
}
