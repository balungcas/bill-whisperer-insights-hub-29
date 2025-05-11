
import { ChangeEvent, useState, useRef, DragEvent } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { BillData } from "@/types/bill";
import { extractBillData } from "@/lib/billAnalyzer";
import { cn } from "@/lib/utils";
import { Progress } from "@/components/ui/progress";
import { FileImage, Receipt, ScanLine } from "lucide-react";

interface UploadProps {
  onProcessingStart: () => void;
  onBillProcessed: (data: BillData) => void;
  onError: (message: string) => void;
  isProcessing: boolean;
  className?: string;
}

export const Upload = ({ 
  onProcessingStart,
  onBillProcessed,
  onError,
  isProcessing,
  className
}: UploadProps) => {
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [progress, setProgress] = useState(0);
  const [processingStep, setProcessingStep] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      validateAndSetFile(e.target.files[0]);
    }
  };

  const validateAndSetFile = (file: File) => {
    // Check file type
    if (!file.type.match('image/*') && file.type !== 'application/pdf') {
      onError("Please select a valid image or PDF file");
      return;
    }
    
    // Check file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      onError("File size exceeds 10MB limit");
      return;
    }
    
    setFile(file);
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      validateAndSetFile(e.dataTransfer.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      onError("Please select a file to upload");
      return;
    }

    onProcessingStart();
    setProgress(0);
    setProcessingStep("Initializing OCR scanner...");
    
    // Set up progress tracker for better user feedback during processing
    const progressInterval = setInterval(() => {
      setProgress(prev => {
        // Update progress steps for better user feedback
        if (prev < 20) {
          setProcessingStep("Preparing image for analysis...");
        } else if (prev < 40) {
          setProcessingStep("Reading bill with OCR...");
        } else if (prev < 65) {
          setProcessingStep("Extracting text from bill...");
        } else if (prev < 85) {
          setProcessingStep("Identifying bill data fields...");
        } else {
          setProcessingStep("Finalizing bill analysis...");
        }
        
        const increment = Math.random() * 10;
        const newProgress = Math.min(prev + increment, 95);
        return newProgress;
      });
    }, 800);

    try {
      const data = await extractBillData(file);
      clearInterval(progressInterval);
      setProgress(100);
      setProcessingStep("Bill successfully scanned!");
      
      // Add a delay before sending the data to prevent UI glitches
      setTimeout(() => {
        onBillProcessed(data);
      }, 500);
    } catch (error) {
      clearInterval(progressInterval);
      setProgress(0);
      setProcessingStep("");
      onError(error instanceof Error ? error.message : "Failed to process bill");
    }
  };

  const handleBrowseClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  return (
    <div className={cn("space-y-4", className)}>
      <div 
        className={cn(
          "border-2 border-dashed rounded-lg p-6 text-center transition-colors",
          isDragging ? "border-primary bg-primary/5" : "border-gray-300",
          isProcessing ? "bg-gray-100 pointer-events-none" : "hover:bg-gray-50"
        )}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <Input
          type="file"
          accept="image/png, image/jpeg, image/jpg, application/pdf"
          onChange={handleFileChange}
          className="hidden"
          id="bill-upload"
          ref={fileInputRef}
          disabled={isProcessing}
        />
        <label
          htmlFor="bill-upload"
          className={cn("block", isProcessing ? "cursor-not-allowed" : "cursor-pointer")}
        >
          <div className="flex flex-col items-center justify-center">
            {isProcessing ? (
              <div className="w-full space-y-3">
                <ScanLine className="w-12 h-12 text-primary mx-auto animate-pulse" />
                <p className="text-sm text-gray-600">{processingStep}</p>
                <Progress value={progress} className="h-2 w-full" />
                <p className="text-xs text-gray-500">Scanning your Meralco bill using OCR technology</p>
              </div>
            ) : (
              <>
                <Receipt
                  className="w-12 h-12 text-gray-400"
                  aria-hidden="true"
                />
                <p className="mt-2 text-sm text-gray-600">
                  Drag and drop your Meralco bill here
                </p>
                <div className="mt-2">
                  <Button 
                    type="button" 
                    variant="secondary" 
                    size="sm"
                    onClick={handleBrowseClick}
                  >
                    Browse Files
                  </Button>
                </div>
                <p className="mt-1 text-xs text-gray-500">
                  PNG, JPG or PDF (Max. 10MB)
                </p>
              </>
            )}
          </div>
        </label>
      </div>

      {file && !isProcessing && (
        <div className="text-sm text-center p-2 bg-gray-50 rounded border border-gray-200">
          <p className="font-medium text-gray-900">Selected file:</p>
          <p className="text-gray-600 truncate">{file.name}</p>
          <p className="text-xs text-gray-500">
            {(file.size / 1024 / 1024).toFixed(2)} MB
          </p>
        </div>
      )}

      <Button
        onClick={handleUpload}
        disabled={!file || isProcessing}
        className="w-full"
      >
        {isProcessing ? "Scanning Bill..." : "Scan Meralco Bill"}
      </Button>
    </div>
  );
};
