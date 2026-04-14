
"use client"

import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { Upload, File, X, CheckCircle2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { toast } from "@/hooks/use-toast";

export function UploadZone() {
  const [files, setFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    setFiles(prev => [...prev, ...acceptedFiles]);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'text/plain': ['.txt'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
    }
  });

  const removeFile = (name: string) => {
    setFiles(files.filter(f => f.name !== name));
  };

  const handleUpload = async () => {
    if (files.length === 0) return;
    setUploading(true);
    
    // Simulate upload progress
    for (let i = 0; i <= 100; i += 10) {
      setProgress(i);
      await new Promise(resolve => setTimeout(resolve, 200));
    }

    toast({
      title: "Upload Complete",
      description: `Successfully uploaded ${files.length} documents. They are now being indexed.`,
    });

    setUploading(false);
    setProgress(0);
    setFiles([]);
  };

  return (
    <div className="space-y-4">
      <div
        {...getRootProps()}
        className={cn(
          "border-2 border-dashed rounded-xl p-10 flex flex-col items-center justify-center transition-colors cursor-pointer",
          isDragActive ? "border-primary bg-primary/5" : "border-muted-foreground/20 hover:border-primary/50"
        )}
      >
        <input {...getInputProps()} />
        <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
          <Upload className="h-8 w-8 text-primary" />
        </div>
        <h3 className="font-headline font-bold text-lg text-center">Upload Documents</h3>
        <p className="text-sm text-muted-foreground mt-1 text-center max-w-xs mb-4">
          Drag and drop your PDF, TXT or DOCX files here to index them for AI queries.
        </p>
        <Button variant="outline" type="button" className="pointer-events-none">
          Select Files from Computer
        </Button>
      </div>

      {files.length > 0 && (
        <div className="space-y-2">
          {files.map(file => (
            <div key={file.name} className="flex items-center justify-between p-3 bg-card border rounded-lg">
              <div className="flex items-center gap-3">
                <File className="h-5 w-5 text-primary" />
                <div className="flex flex-col">
                  <span className="text-sm font-medium truncate max-w-[200px] md:max-w-md">{file.name}</span>
                  <span className="text-xs text-muted-foreground">{(file.size / 1024 / 1024).toFixed(2)} MB</span>
                </div>
              </div>
              {!uploading && (
                <Button variant="ghost" size="icon" onClick={() => removeFile(file.name)}>
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          ))}

          {uploading ? (
            <div className="space-y-2 pt-2">
              <div className="flex justify-between text-xs">
                <span>Indexing documents...</span>
                <span>{progress}%</span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>
          ) : (
            <Button className="w-full mt-2 font-bold" onClick={handleUpload}>
              Process {files.length} {files.length === 1 ? 'Document' : 'Documents'}
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
