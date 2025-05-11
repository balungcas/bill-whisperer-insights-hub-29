
import { ChangeEvent, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { BillData } from "@/types/bill";
import { extractBillData } from "@/lib/billAnalyzer";
import { cn } from "@/lib/utils";

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

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      onError("Please select a file to upload");
      return;
    }

    onProcessingStart();

    try {
      // In a real app, we would send the file to a server for OCR processing
      // Here we'll simulate the process with a mock function
      const data = await extractBillData(file);
      onBillProcessed(data);
    } catch (error) {
      onError(error instanceof Error ? error.message : "Failed to process bill");
    }
  };

  return (
    <div className={cn("space-y-4", className)}>
      <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
        <Input
          type="file"
          accept="image/png, image/jpeg, application/pdf"
          onChange={handleFileChange}
          className="hidden"
          id="bill-upload"
        />
        <label
          htmlFor="bill-upload"
          className="cursor-pointer block"
        >
          <div className="flex flex-col items-center justify-center">
            <svg
              className="w-12 h-12 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
              ></path>
            </svg>
            <p className="mt-2 text-sm text-gray-600">
              Click to upload or drag and drop
            </p>
            <p className="text-xs text-gray-500">
              PNG, JPG or PDF (Max. 10MB)
            </p>
          </div>
        </label>
      </div>

      {file && (
        <p className="text-sm text-center">
          Selected file: <span className="font-medium">{file.name}</span>
        </p>
      )}

      <Button
        onClick={handleUpload}
        disabled={!file || isProcessing}
        className="w-full"
      >
        {isProcessing ? "Processing..." : "Analyze Bill"}
      </Button>
    </div>
  );
};
