
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Upload } from "@/components/upload/Upload";
import { BillInfo } from "@/components/bill/BillInfo";
import { BillChart } from "@/components/bill/BillChart";
import { Suggestions } from "@/components/suggestions/Suggestions";
import { BillData } from "@/types/bill";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ChartBar, Info, Receipt } from "lucide-react";
import { toast } from "@/components/ui/sonner";

const Index = () => {
  const [billData, setBillData] = useState<BillData | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleBillProcessed = (data: BillData) => {
    try {
      // Ensure all required fields have default values
      const safeData: BillData = {
        ...data,
        accountNumber: data.accountNumber || "Not found",
        billingMonth: data.billingMonth || "Not found",
        customerName: data.customerName || "Not found",
        totalAmount: data.totalAmount || 0,
        dueDate: data.dueDate || "Not found",
        totalKwh: data.totalKwh || 0,
        previousReading: data.previousReading || 0,
        currentReading: data.currentReading || 0,
        ratePerKwh: data.ratePerKwh || 0,
        billingPeriod: data.billingPeriod || { from: "Not found", to: "Not found" },
        meterNumber: data.meterNumber || "Not found",
        nextMeterReadingDate: data.nextMeterReadingDate || "Not found",
        customerType: data.customerType || "Residential",
        environmentalImpact: data.environmentalImpact || { 
          electricityUsed: 0,
          ghgEmissions: 0,
          offsetPlantations: 0 
        },
        comparisonData: data.comparisonData || {
          current: 0,
          previous: 0,
          percentageChange: 0,
          comparedTo: "previous month"
        },
        monthlyConsumption: data.monthlyConsumption || []
      };
      
      setBillData(safeData);
      setIsProcessing(false);
      toast.success("Bill analysis complete!");
    } catch (err) {
      console.error("Error processing bill data:", err);
      setError("Failed to process bill data. Please try again.");
      setIsProcessing(false);
      toast.error("Failed to analyze bill");
    }
  };

  const handleProcessingStart = () => {
    setIsProcessing(true);
    setError(null);
  };

  const handleError = (errorMessage: string) => {
    setError(errorMessage);
    setIsProcessing(false);
    toast.error("Failed to analyze bill");
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-primary text-white py-6">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl font-bold">Meralco Bill Analyzer</h1>
          <p className="opacity-80">Upload your bill for instant analysis and saving suggestions</p>
        </div>
      </header>
      
      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <Receipt className="h-5 w-5" />
                Upload Meralco Bill
              </h2>
              
              <Upload 
                onProcessingStart={handleProcessingStart}
                onBillProcessed={handleBillProcessed}
                onError={handleError}
                isProcessing={isProcessing}
                className=""
              />
              
              {error && (
                <Alert variant="destructive" className="mt-4">
                  <Info className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              
              {billData && (
                <div className="mt-6">
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => setBillData(null)}
                  >
                    Upload New Bill
                  </Button>
                </div>
              )}
            </div>
          </div>
          
          <div className="lg:col-span-2">
            {billData ? (
              <div className="space-y-8">
                <BillInfo billData={billData} />
                <BillChart billData={billData} />
                <Suggestions billData={billData} />
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow-md p-6 flex flex-col items-center justify-center min-h-[400px]">
                <ChartBar className="h-16 w-16 text-muted-foreground mb-4" />
                <h3 className="text-xl font-medium text-center">Upload your Meralco bill to see the analysis</h3>
                <p className="text-muted-foreground text-center mt-2">
                  Our OCR technology will scan your bill and provide detailed insights
                </p>
              </div>
            )}
          </div>
        </div>
      </main>
      
      <footer className="bg-muted py-4 mt-8">
        <div className="container mx-auto px-4 text-center text-muted-foreground">
          <p>© {new Date().getFullYear()} Meralco Bill Analyzer</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
