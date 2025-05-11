
import { BillData } from "@/types/bill";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip, Cell, PieChart, Pie, Legend } from 'recharts';

interface BillChartProps {
  billData: BillData;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d', '#ff7300'];

interface ChargeData {
  name: string;
  value: number;
}

export const BillChart = ({ billData }: BillChartProps) => {
  const barColors = billData.monthlyConsumption.map((entry, index) => {
    const isCurrentMonth = index === billData.monthlyConsumption.length - 1;
    return isCurrentMonth ? "#0088FE" : "#82ca9d";
  });

  const chargesData: ChargeData[] = [
    { name: "Generation", value: billData.generationCharge },
    { name: "Transmission", value: billData.transmissionCharge },
    { name: "System Loss", value: billData.systemLossCharge },
    { name: "Distribution", value: billData.distributionCharge },
    { name: "Subsidy", value: billData.subsidyCharge },
    { name: "Govt. Taxes", value: billData.governmentTaxes },
    { name: "Others", value: billData.otherCharges },
  ];

  return (
    <div className="grid grid-cols-1 gap-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Monthly Consumption</CardTitle>
          <CardDescription>
            Your electricity usage over the past 6 months in kWh
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
                  data={billData.monthlyConsumption}
                  margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="consumption" name="kWh Usage" fill="#8884d8">
                    {billData.monthlyConsumption.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={barColors[index]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
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
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </ChartContainer>
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
