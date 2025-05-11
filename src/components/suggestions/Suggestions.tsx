
import { BillData } from "@/types/bill";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ArrowUp, Info, TrendingUp, TrendingDown } from "lucide-react";
import { analyzeBillForSuggestions } from "@/lib/billAnalyzer";

interface SuggestionsProps {
  billData: BillData;
}

export const Suggestions = ({ billData }: SuggestionsProps) => {
  const suggestions = analyzeBillForSuggestions(billData);

  // Calculate if current month is higher than previous
  const currentMonthData = billData.monthlyConsumption[billData.monthlyConsumption.length - 1];
  const previousMonthData = billData.monthlyConsumption[billData.monthlyConsumption.length - 2];
  const percentageChange = previousMonthData 
    ? ((currentMonthData.consumption - previousMonthData.consumption) / previousMonthData.consumption) * 100
    : 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl">Energy Usage Insights</CardTitle>
        <CardDescription>
          Personalized suggestions to help you save on your electricity bill
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm text-muted-foreground">Current Usage</p>
                  <p className="text-2xl font-bold">{currentMonthData.consumption} kWh</p>
                </div>
                <div className={`flex items-center ${percentageChange > 0 ? 'text-red-500' : 'text-green-500'}`}>
                  {percentageChange > 0 ? (
                    <TrendingUp className="mr-1 h-4 w-4" />
                  ) : (
                    <TrendingDown className="mr-1 h-4 w-4" />
                  )}
                  <span className="font-medium">{Math.abs(percentageChange).toFixed(1)}%</span>
                </div>
              </div>
              <p className="text-xs mt-2 text-muted-foreground">
                {percentageChange > 0 
                  ? `Your usage increased by ${percentageChange.toFixed(1)}% compared to last month`
                  : `Your usage decreased by ${Math.abs(percentageChange).toFixed(1)}% compared to last month`}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <p className="text-sm text-muted-foreground">Average Cost per kWh</p>
              <p className="text-2xl font-bold">
                ₱{(billData.totalAmount / billData.totalKwh).toFixed(2)}
              </p>
              <p className="text-xs mt-2 text-muted-foreground">
                Based on your total bill amount and consumption
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-medium">Recommendations</h3>
          
          {suggestions.map((suggestion, index) => (
            <Alert key={index} className={suggestion.impact === 'high' ? 'border-red-500' : suggestion.impact === 'medium' ? 'border-yellow-500' : 'border-green-500'}>
              <Info className="h-4 w-4" />
              <AlertTitle>{suggestion.title}</AlertTitle>
              <AlertDescription>
                {suggestion.description}
              </AlertDescription>
            </Alert>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
