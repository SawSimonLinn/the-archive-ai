
"use client"

import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { Upload, File, X, CheckCircle2, Loader2, Fingerprint } from "lucide-react";
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
    
    for (let i = 0; i <= 100; i += 10) {
      setProgress(i);
      await new Promise(resolve => setTimeout(resolve, 200));
    }

    toast({
      title: "INJECTION SUCCESSFUL",
      description: `${files.length} UNIT(S) INDEXED IN THE VAULT.`,
    });

    setUploading(false);
    setProgress(0);
    setFiles([]);
  };

  return (
    <div className="space-y-6">
      <div
        {...getRootProps()}
        className={cn(
          "border-4 border-dashed rounded-none p-16 flex flex-col items-center justify-center transition-all cursor-pointer relative",
          isDragActive ? "border-primary bg-primary/5 shadow-[8px_8px_0px_0px_rgba(251,191,36,0.2)]" : "border-foreground/20 hover:border-primary/50 hover:bg-muted/50"
        )}
      >
        <div className="absolute top-4 left-4 flex items-center gap-2 font-mono text-[8px] font-black uppercase tracking-[0.3em] opacity-40">
          <Fingerprint className="h-3 w-3" /> Secure Intake
        </div>
        <input {...getInputProps()} />
        <div className="w-20 h-20 bg-primary/10 border-2 border-foreground flex items-center justify-center mb-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
          <Upload className="h-10 w-10 text-foreground" />
        </div>
        <h3 className="font-headline font-black text-2xl uppercase tracking-tighter text-center">Protocol: Data Ingestion</h3>
        <p className="text-sm font-bold text-muted-foreground mt-2 text-center max-w-sm mb-8 uppercase tracking-tight">
          Drop PDF, TXT or DOCX units for neural vectorization.
        </p>
        <Button variant="outline" type="button" className="h-12 px-8 border-2 border-foreground rounded-none font-black uppercase tracking-tighter hover:bg-foreground hover:text-background transition-all">
          Browse Filesystem
        </Button>
      </div>

      {files.length > 0 && (
        <div className="space-y-4">
          <div className="grid gap-2">
            {files.map(file => (
              <div key={file.name} className="flex items-center justify-between p-4 bg-card border-2 border-foreground shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                <div className="flex items-center gap-4">
                  <div className="p-2 border border-foreground bg-muted">
                    <File className="h-5 w-5 text-foreground" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-black uppercase tracking-tighter truncate max-w-[200px] md:max-w-md">{file.name}</span>
                    <span className="font-mono text-[9px] font-bold uppercase tracking-widest opacity-40">{(file.size / 1024 / 1024).toFixed(2)} MB // READY</span>
                  </div>
                </div>
                {!uploading && (
                  <Button variant="ghost" size="icon" className="hover:bg-accent hover:text-accent-foreground border-2 border-transparent hover:border-foreground" onClick={() => removeFile(file.name)}>
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
            ))}
          </div>

          {uploading ? (
            <div className="space-y-4 p-6 border-4 border-foreground bg-muted">
              <div className="flex justify-between items-center font-mono text-xs font-black uppercase tracking-widest">
                <span>VECTORIZING_DATA...</span>
                <span className="text-primary">{progress}%</span>
              </div>
              <Progress value={progress} className="h-4 rounded-none border-2 border-foreground bg-background" />
            </div>
          ) : (
            <Button className="w-full h-16 bg-primary text-primary-foreground border-4 border-foreground rounded-none font-black uppercase text-xl shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all" onClick={handleUpload}>
              Initialize Injection ({files.length})
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
