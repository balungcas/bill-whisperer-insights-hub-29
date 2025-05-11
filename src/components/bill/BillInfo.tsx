
import { BillData } from "@/types/bill";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatCurrency } from "@/lib/formatters";
import { parseISO, isValid, format } from "date-fns";

interface BillInfoProps {
  billData: BillData;
}

// Helper function to safely format dates
const safeFormatDate = (dateString: string) => {
  if (!dateString || dateString === "Not found") {
    return "Not available";
  }
  
  try {
    // Try to parse the date
    const date = parseISO(dateString);
    if (isValid(date)) {
      return format(date, "dd MMM yyyy");
    } else {
      // If parseISO fails, try direct Date constructor
      const fallbackDate = new Date(dateString);
      if (isValid(fallbackDate)) {
        return format(fallbackDate, "dd MMM yyyy");
      }
    }
    return dateString; // Return original string if parsing fails
  } catch (e) {
    console.log("Date parsing error:", e);
    return dateString; // Return original string if parsing fails
  }
};

export const BillInfo = ({ billData }: BillInfoProps) => {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-xl">Bill Summary</CardTitle>
          <CardDescription>
            Billing Period: {safeFormatDate(billData.billingPeriod.from)} to {safeFormatDate(billData.billingPeriod.to)}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Customer Account Number</p>
              <p className="font-medium">{billData.accountNumber}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Customer Name</p>
              <p className="font-medium">{billData.customerName}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Amount Due</p>
              <p className="font-medium text-lg">{formatCurrency(billData.totalAmount)}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Due Date</p>
              <p className="font-medium">{safeFormatDate(billData.dueDate)}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Customer Type</p>
              <p className="font-medium">{billData.customerType}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Rate per kWh</p>
              <p className="font-medium">₱{billData.ratePerKwh.toFixed(2)}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Consumption</p>
              <p className="font-medium">{billData.totalKwh} kWh</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Meter Number</p>
              <p className="font-medium">{billData.meterNumber}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Next Reading Date</p>
              <p className="font-medium">{safeFormatDate(billData.nextMeterReadingDate)}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-xl">Charges Breakdown</CardTitle>
          <CardDescription>
            Detailed breakdown of your electricity bill charges
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Charge Type</TableHead>
                <TableHead className="text-right">Amount</TableHead>
                <TableHead className="text-right">% of Total</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell>Generation Charge</TableCell>
                <TableCell className="text-right">{formatCurrency(billData.generationCharge)}</TableCell>
                <TableCell className="text-right">
                  {((billData.generationCharge / billData.totalAmount) * 100).toFixed(1)}%
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Transmission Charge</TableCell>
                <TableCell className="text-right">{formatCurrency(billData.transmissionCharge)}</TableCell>
                <TableCell className="text-right">
                  {((billData.transmissionCharge / billData.totalAmount) * 100).toFixed(1)}%
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell>System Loss Charge</TableCell>
                <TableCell className="text-right">{formatCurrency(billData.systemLossCharge)}</TableCell>
                <TableCell className="text-right">
                  {((billData.systemLossCharge / billData.totalAmount) * 100).toFixed(1)}%
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Distribution (Meralco)</TableCell>
                <TableCell className="text-right">{formatCurrency(billData.distributionCharge)}</TableCell>
                <TableCell className="text-right">
                  {((billData.distributionCharge / billData.totalAmount) * 100).toFixed(1)}%
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Subsidies</TableCell>
                <TableCell className="text-right">{formatCurrency(billData.subsidyCharge)}</TableCell>
                <TableCell className="text-right">
                  {((billData.subsidyCharge / billData.totalAmount) * 100).toFixed(1)}%
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Government Taxes</TableCell>
                <TableCell className="text-right">{formatCurrency(billData.governmentTaxes)}</TableCell>
                <TableCell className="text-right">
                  {((billData.governmentTaxes / billData.totalAmount) * 100).toFixed(1)}%
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Universal Charges</TableCell>
                <TableCell className="text-right">{formatCurrency(billData.universalCharges)}</TableCell>
                <TableCell className="text-right">
                  {((billData.universalCharges / billData.totalAmount) * 100).toFixed(1)}%
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell>FIT-All (Renewable)</TableCell>
                <TableCell className="text-right">{formatCurrency(billData.fitAllCharge)}</TableCell>
                <TableCell className="text-right">
                  {((billData.fitAllCharge / billData.totalAmount) * 100).toFixed(1)}%
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Other Charges</TableCell>
                <TableCell className="text-right">{formatCurrency(billData.otherCharges)}</TableCell>
                <TableCell className="text-right">
                  {((billData.otherCharges / billData.totalAmount) * 100).toFixed(1)}%
                </TableCell>
              </TableRow>
              <TableRow className="font-medium">
                <TableCell>Total</TableCell>
                <TableCell className="text-right">{formatCurrency(billData.totalAmount)}</TableCell>
                <TableCell className="text-right">100%</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-xl">Meter Reading Information</CardTitle>
          <CardDescription>
            Current and previous meter readings
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Previous Reading</p>
              <p className="font-medium">{billData.previousReading}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Current Reading</p>
              <p className="font-medium">{billData.currentReading}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Consumption</p>
              <p className="font-medium">{billData.totalKwh} kWh</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-xl">Environmental Impact</CardTitle>
          <CardDescription>
            Impact of your electricity usage on the environment
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="border rounded-lg p-4 flex flex-col items-center">
              <p className="text-sm text-muted-foreground">Electricity Used</p>
              <p className="font-medium text-xl">{billData.environmentalImpact.electricityUsed} kWh</p>
            </div>
            <div className="border rounded-lg p-4 flex flex-col items-center">
              <p className="text-sm text-muted-foreground">GHG Emissions</p>
              <p className="font-medium text-xl">{billData.environmentalImpact.ghgEmissions} tons</p>
            </div>
            <div className="border rounded-lg p-4 flex flex-col items-center">
              <p className="text-sm text-muted-foreground">Offset Plantations</p>
              <p className="font-medium text-xl">{billData.environmentalImpact.offsetPlantations} trees</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
