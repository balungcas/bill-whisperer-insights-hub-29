
import { BillData } from "@/types/bill";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatCurrency } from "@/lib/formatters";

interface BillInfoProps {
  billData: BillData;
}

export const BillInfo = ({ billData }: BillInfoProps) => {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-xl">Bill Summary</CardTitle>
          <CardDescription>
            {billData.billingMonth} - Due on {new Date(billData.dueDate).toLocaleDateString()}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Account Number</p>
              <p className="font-medium">{billData.accountNumber}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Customer Name</p>
              <p className="font-medium">{billData.customerName}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Amount</p>
              <p className="font-medium text-lg">{formatCurrency(billData.totalAmount)}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total kWh</p>
              <p className="font-medium">{billData.totalKwh} kWh</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Current Reading</p>
              <p className="font-medium">{billData.currentReading}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Previous Reading</p>
              <p className="font-medium">{billData.previousReading}</p>
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
                <TableCell>Distribution Charge</TableCell>
                <TableCell className="text-right">{formatCurrency(billData.distributionCharge)}</TableCell>
                <TableCell className="text-right">
                  {((billData.distributionCharge / billData.totalAmount) * 100).toFixed(1)}%
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Subsidy Charge</TableCell>
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
    </div>
  );
};
