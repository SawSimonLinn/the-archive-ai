
"use client"

import { useState, useCallback, useEffect, useRef } from "react";
import { useDropzone } from "react-dropzone";
import { Upload, File, X, Fingerprint } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { toast } from "@/hooks/use-toast";

export interface UploadResult {
  documentId: string;
  name: string;
  text: string;
  summary: string;
  suggestedQuestions: string[];
  file: File;
}

interface UploadZoneProps {
  onUploadSuccess?: (result: UploadResult) => void;
  onLimitReached?: () => void;
  compact?: boolean;
}

const LOADING_PHASES = [
  "Reading document",
  "Extracting content",
  "Parsing structure",
  "Generating summary",
  "Analyzing key concepts",
  "Building insights",
];

function AnimatedStatus({ phase }: { phase: string }) {
  const [dots, setDots] = useState("");

  useEffect(() => {
    const id = setInterval(() => {
      setDots(d => {
        if (d === "...") return "";
        return d + ".";
      });
    }, 380);
    return () => clearInterval(id);
  }, []);

  return (
    <span>
      {phase}
      <span className="inline-block w-6 text-left">{dots}</span>
    </span>
  );
}

export function UploadZone({ onUploadSuccess, onLimitReached, compact = false }: UploadZoneProps) {
  const [files, setFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [phaseIndex, setPhaseIndex] = useState(0);
  const progressRef = useRef(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const phaseIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    setFiles(prev => [...prev, ...acceptedFiles]);
  }, []);

  const { getRootProps, getInputProps, isDragActive, open } = useDropzone({
    onDrop,
    noClick: true,
    accept: {
      'application/pdf': ['.pdf'],
      'text/plain': ['.txt'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
    }
  });

  const removeFile = (name: string) => {
    setFiles(files.filter(f => f.name !== name));
  };

  const startProgress = () => {
    progressRef.current = 0;
    setProgress(0);
    setPhaseIndex(0);

    intervalRef.current = setInterval(() => {
      progressRef.current = Math.min(
        progressRef.current + (Math.random() * 1.8 + 0.4),
        88
      );
      setProgress(Math.floor(progressRef.current));
    }, 200);

    phaseIntervalRef.current = setInterval(() => {
      setPhaseIndex(i => (i + 1) % LOADING_PHASES.length);
    }, 2200);
  };

  const stopProgress = (success: boolean) => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    if (phaseIntervalRef.current) clearInterval(phaseIntervalRef.current);
    if (success) {
      setProgress(100);
    }
  };

  const handleUpload = async () => {
    if (files.length === 0) return;
    setUploading(true);
    startProgress();

    const file = files[0];
    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch('/api/extract-text', { method: 'POST', body: formData });

      if (res.status === 402 || res.status === 429) {
        const data = await res.json();
        if (data.error === 'document_limit_reached' || data.error === 'rate_limit_reached') {
          stopProgress(false);
          onLimitReached?.();
          return;
        }
      }

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.message ?? 'Upload failed');
      }
      const data = await res.json();
      stopProgress(true);

      toast({
        title: "File Processed",
        description: `${file.name} added to the Archive.`,
      });

      const result: UploadResult = {
        documentId: data.documentId,
        name: file.name,
        text: data.text,
        summary: data.summary ?? 'No content-specific TL;DR is available for this document yet.',
        suggestedQuestions: data.suggestedQuestions ?? [],
        file,
      };

      window.dispatchEvent(new CustomEvent("archive:documents-changed", {
        detail: { id: result.documentId, name: result.name },
      }));

      if (onUploadSuccess) {
        onUploadSuccess(result);
      }
    } catch (error) {
      stopProgress(false);
      toast({
        variant: "destructive",
        title: "Upload Failed",
        description: error instanceof Error ? error.message : "Could not process the file.",
      });
    } finally {
      setUploading(false);
      setProgress(0);
      setFiles([]);
    }
  };

  return (
    <div className="space-y-6">
      <div
        {...getRootProps()}
        className={cn(
          "border-4 border-dashed rounded-none flex flex-col items-center justify-center transition-all relative",
          compact ? "p-8" : "p-16",
          isDragActive ? "border-primary bg-primary/5 shadow-[8px_8px_0px_0px_rgba(251,191,36,0.2)]" : "border-foreground/20 hover:border-primary/50 hover:bg-muted/50"
        )}
      >
        <div className="absolute top-4 left-4 flex items-center gap-2 font-mono text-[8px] font-black uppercase tracking-[0.3em] opacity-40">
          <Fingerprint className="h-3 w-3" /> Secure System
        </div>
        <input {...getInputProps()} />
        <div className={cn(
          "bg-primary/10 border-2 border-foreground flex items-center justify-center mb-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]",
          compact ? "w-12 h-12" : "w-20 h-20"
        )}>
          <Upload className={cn("text-foreground", compact ? "h-6 w-6" : "h-10 w-10")} />
        </div>
        <h3 className={cn("font-headline font-black uppercase tracking-tighter text-center", compact ? "text-lg" : "text-2xl")}>
          {compact ? "Add Document to Chat" : "Upload Documents"}
        </h3>
        <p className="text-[10px] font-bold text-muted-foreground mt-2 text-center max-w-sm mb-6 uppercase tracking-widest">
          PDF, TXT or DOCX files.
        </p>
        <Button
          variant="outline"
          type="button"
          onClick={open}
          className="h-10 px-6 border-2 border-foreground rounded-none font-black uppercase tracking-tighter hover:bg-foreground hover:text-background transition-all"
        >
          Select File
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
                    <span className="text-xs font-black uppercase tracking-tighter truncate max-w-[200px]">{file.name}</span>
                    <span className="font-mono text-[8px] font-bold uppercase tracking-widest opacity-40">{(file.size / 1024 / 1024).toFixed(2)} MB // Ready</span>
                  </div>
                </div>
                {!uploading && (
                  <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-accent hover:text-accent-foreground border-2 border-transparent hover:border-foreground" onClick={() => removeFile(file.name)}>
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
            ))}
          </div>

          {uploading ? (
            <div className="space-y-3 p-4 border-4 border-foreground bg-muted">
              <div className="flex justify-between items-center font-mono text-[9px] font-black uppercase tracking-widest">
                <AnimatedStatus phase={LOADING_PHASES[phaseIndex]} />
                <span className="text-primary">{progress}%</span>
              </div>
              <Progress value={progress} className="h-3 rounded-none border-2 border-foreground bg-background" />
            </div>
          ) : (
            <Button className="w-full h-14 bg-primary text-foreground border-4 border-foreground rounded-none font-black uppercase text-lg shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all" onClick={handleUpload}>
              Start Analysis ({files.length})
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
