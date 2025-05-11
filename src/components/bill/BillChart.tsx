
import { BillData } from "@/types/bill";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip, Cell, PieChart, Pie, Legend } from 'recharts';

interface BillChartProps {
  billData: BillData;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d', '#ff7300', '#d62728', '#9467bd'];

interface ChargeData {
  name: string;
  value: number;
}

export const BillChart = ({ billData }: BillChartProps) => {
  // Reverse the data to display in chronological order (oldest to newest)
  const consumptionData = [...billData.monthlyConsumption].reverse();
  
  const barColors = consumptionData.map((entry, index) => {
    // Use a different color for the last month (current month)
    const isCurrentMonth = index === consumptionData.length - 1;
    return isCurrentMonth ? "#0088FE" : "#82ca9d";
  });

  const chargesData: ChargeData[] = [
    { name: "Generation", value: billData.generationCharge },
    { name: "Transmission", value: billData.transmissionCharge },
    { name: "System Loss", value: billData.systemLossCharge },
    { name: "Distribution", value: billData.distributionCharge },
    { name: "Subsidy", value: billData.subsidyCharge },
    { name: "Govt. Taxes", value: billData.governmentTaxes },
    { name: "Universal Charges", value: billData.universalCharges },
    { name: "FIT-All", value: billData.fitAllCharge },
    { name: "Others", value: billData.otherCharges },
  ];

  // Add average line to consumption chart
  const avgConsumption = consumptionData.reduce((sum, item) => sum + item.consumption, 0) / consumptionData.length;

  return (
    <div className="grid grid-cols-1 gap-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Monthly Consumption</CardTitle>
          <CardDescription>
            Your electricity usage over the past year in kWh
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="aspect-[4/3] w-full">
            <ChartContainer 
              config={{ 
                bar: { theme: { light: '#0088FE', dark: '#0088FE' } },
                previousBar: { theme: { light: '#82ca9d', dark: '#82ca9d' } }
              }}
            >
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={consumptionData}
                  margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis domain={[0, 'dataMax + 30']} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="consumption" name="kWh Usage">
                    {consumptionData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={barColors[index]} />
                    ))}
                  </Bar>
                  {/* Reference line for average consumption */}
                  <Tooltip />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
            <div className="flex items-center justify-center mt-2 text-sm">
              <div className="flex items-center mr-4">
                <div className="w-3 h-3 bg-[#82ca9d] mr-1"></div>
                <span>Previous Months</span>
              </div>
              <div className="flex items-center mr-4">
                <div className="w-3 h-3 bg-[#0088FE] mr-1"></div>
                <span>Current Month</span>
              </div>
              <div className="flex items-center">
                <div className="w-5 h-0.5 bg-red-500 mr-1"></div>
                <span>Avg: {avgConsumption.toFixed(0)} kWh</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Charges Breakdown</CardTitle>
          <CardDescription>
            Percentage distribution of your electricity bill charges
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="aspect-[4/3] w-full">
            <ChartContainer
              config={{
                pie: { theme: { light: '#0088FE', dark: '#0088FE' } }
              }}
            >
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={chargesData}
                    cx="50%"
                    cy="50%"
                    labelLine
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    nameKey="name"
                    label={renderCustomizedLabel}
                  >
                    {chargesData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => `₱${value.toFixed(2)}`} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </ChartContainer>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Current vs. Previous Month</CardTitle>
          <CardDescription>
            Comparison of your current month's consumption with the previous month
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row items-center justify-center gap-6 py-4">
            <div className="text-center p-4 border rounded-lg w-full md:w-1/3">
              <p className="text-muted-foreground text-sm">Previous Month</p>
              <p className="text-3xl font-bold mt-2">{billData.comparisonData.previous} kWh</p>
            </div>
            
            <div className="flex flex-col items-center">
              <div className={`text-lg font-semibold ${billData.comparisonData.percentageChange > 0 ? 'text-red-500' : 'text-green-500'}`}>
                {billData.comparisonData.percentageChange > 0 ? '+' : ''}
                {billData.comparisonData.percentageChange.toFixed(1)}%
              </div>
              <div className="text-xs text-muted-foreground">Change</div>
            </div>
            
            <div className="text-center p-4 border rounded-lg border-blue-500 bg-blue-50 w-full md:w-1/3">
              <p className="text-blue-600 text-sm">Current Month</p>
              <p className="text-3xl font-bold mt-2">{billData.comparisonData.current} kWh</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-background border border-border rounded-md p-2 shadow-md">
        <p className="font-medium">{label}</p>
        <p className="text-sm">{`Usage: ${payload[0].value} kWh`}</p>
      </div>
    );
  }
  return null;
};

const renderCustomizedLabel = ({
  cx,
  cy,
  midAngle,
  innerRadius,
  outerRadius,
  percent,
  name,
}: any) => {
  const RADIAN = Math.PI / 180;
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);

  return (
    <text
      x={x}
      y={y}
      fill="white"
      textAnchor={x > cx ? 'start' : 'end'}
      dominantBaseline="central"
      fontSize={12}
    >
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  );
};

