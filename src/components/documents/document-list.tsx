
"use client"

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { FileText, MoreVertical, Trash2, RefreshCw, Layers } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Document } from "@/lib/types";
import { cn } from "@/lib/utils";

interface DocumentListProps {
  documents: Document[];
}

export function DocumentList({ documents }: DocumentListProps) {
  if (documents.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-32 text-center border-8 border-dashed border-foreground/10 bg-muted/20">
        <div className="w-24 h-24 bg-muted border-4 border-foreground/20 flex items-center justify-center mb-8 shadow-[8px_8px_0px_0px_rgba(0,0,0,0.05)]">
          <Layers className="h-12 w-12 text-muted-foreground" />
        </div>
        <h3 className="font-headline font-black text-4xl uppercase tracking-tighter">No Files Found</h3>
        <p className="text-lg font-bold text-muted-foreground mt-4 uppercase tracking-widest">You haven't uploaded any documents yet.</p>
      </div>
    );
  }

  return (
    <div className="bg-card border-4 border-foreground shadow-[20px_20px_0px_0px_rgba(0,0,0,1)] overflow-hidden">
      <Table>
        <TableHeader className="bg-foreground">
          <TableRow className="hover:bg-foreground border-none">
            <TableHead className="h-16 text-background font-black uppercase tracking-[0.2em] text-xs px-8">File Name</TableHead>
            <TableHead className="h-16 text-background font-black uppercase tracking-[0.2em] text-xs px-8">Status</TableHead>
            <TableHead className="h-16 text-background font-black uppercase tracking-[0.2em] text-xs px-8">Size</TableHead>
            <TableHead className="h-16 text-background font-black uppercase tracking-[0.2em] text-xs px-8">Date Added</TableHead>
            <TableHead className="w-[80px]"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {documents.map((doc) => (
            <TableRow key={doc.id} className="border-b-4 border-foreground/10 hover:bg-primary/10 transition-colors">
              <TableCell className="px-8 py-8">
                <div className="flex items-center gap-4">
                  <div className="p-2 border-2 border-foreground bg-muted shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                    <FileText className="h-6 w-6 text-primary" />
                  </div>
                  <span className="font-black uppercase tracking-tighter text-lg">{doc.name}</span>
                </div>
              </TableCell>
              <TableCell className="px-8">
                <div className={cn(
                  "inline-flex items-center justify-center h-10 px-4 border-2 border-foreground font-black uppercase text-[10px] tracking-widest transition-colors",
                  doc.status === 'ready' 
                    ? "bg-primary text-foreground" 
                    : "bg-background text-foreground animate-pulse"
                )}>
                  {doc.status === 'ready' ? 'Ready' : 'Processing'}
                </div>
              </TableCell>
              <TableCell className="px-8 font-mono text-sm font-black uppercase opacity-60">
                {(doc.size / 1024 / 1024).toFixed(2)} MB
              </TableCell>
              <TableCell className="px-8 font-mono text-sm font-black uppercase opacity-60">
                {doc.createdAt}
              </TableCell>
              <TableCell className="px-8">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-12 w-12 border-2 border-transparent hover:border-foreground hover:bg-muted rounded-none">
                      <MoreVertical className="h-6 w-6" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56 border-4 border-foreground rounded-none shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] p-0">
                    <DropdownMenuItem className="gap-3 font-black uppercase tracking-tighter text-sm p-4 focus:bg-primary rounded-none border-b-2 border-foreground">
                      <RefreshCw className="h-5 w-5" /> Refresh
                    </DropdownMenuItem>
                    <DropdownMenuItem className="gap-3 font-black uppercase tracking-tighter text-sm p-4 focus:bg-accent focus:text-accent-foreground text-accent rounded-none">
                      <Trash2 className="h-5 w-5" /> Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
