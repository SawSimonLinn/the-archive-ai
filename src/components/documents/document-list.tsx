
"use client"

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FileText, MoreVertical, Trash2, RefreshCw, Layers } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Document } from "@/lib/types";

interface DocumentListProps {
  documents: Document[];
}

export function DocumentList({ documents }: DocumentListProps) {
  if (documents.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center border-4 border-dashed border-foreground/20 bg-muted/20">
        <div className="w-20 h-20 bg-muted border-2 border-foreground/20 flex items-center justify-center mb-6">
          <Layers className="h-10 w-10 text-muted-foreground" />
        </div>
        <h3 className="font-headline font-black text-2xl uppercase tracking-tighter">Vault is Empty</h3>
        <p className="text-sm font-bold text-muted-foreground mt-2 uppercase tracking-tight">No data units found in the neural index.</p>
      </div>
    );
  }

  return (
    <div className="bg-card border-4 border-foreground shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] overflow-hidden">
      <Table>
        <TableHeader className="bg-foreground text-background">
          <TableRow className="hover:bg-foreground border-b-4 border-foreground">
            <TableHead className="text-background font-black uppercase tracking-widest text-[10px]">Data Unit</TableHead>
            <TableHead className="text-background font-black uppercase tracking-widest text-[10px]">Index Status</TableHead>
            <TableHead className="text-background font-black uppercase tracking-widest text-[10px]">Weight</TableHead>
            <TableHead className="text-background font-black uppercase tracking-widest text-[10px]">Timestamp</TableHead>
            <TableHead className="w-[50px]"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {documents.map((doc) => (
            <TableRow key={doc.id} className="border-b-2 border-foreground/10 hover:bg-primary/5 transition-colors">
              <TableCell className="font-bold">
                <div className="flex items-center gap-3">
                  <div className="p-1 border border-foreground bg-muted">
                    <FileText className="h-4 w-4 text-primary" />
                  </div>
                  <span className="uppercase tracking-tighter text-sm">{doc.name}</span>
                </div>
              </TableCell>
              <TableCell>
                <Badge variant={doc.status === 'ready' ? 'default' : 'secondary'} className={doc.status === 'ready' ? 'bg-primary border-2 border-foreground text-foreground font-black uppercase text-[9px] rounded-none' : 'rounded-none border-2 border-foreground font-black uppercase text-[9px]'}>
                  {doc.status === 'ready' ? 'SYNCHRONIZED' : 'PROCESSING'}
                </Badge>
              </TableCell>
              <TableCell className="font-mono text-[10px] font-bold opacity-60">{(doc.size / 1024 / 1024).toFixed(2)} MB</TableCell>
              <TableCell className="font-mono text-[10px] font-bold opacity-60">{doc.createdAt}</TableCell>
              <TableCell>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-10 w-10 border-2 border-transparent hover:border-foreground hover:bg-muted rounded-none">
                      <MoreVertical className="h-5 w-5" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="border-4 border-foreground rounded-none shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                    <DropdownMenuItem className="gap-2 font-black uppercase tracking-tighter text-xs p-3 focus:bg-primary">
                      <RefreshCw className="h-4 w-4" /> RE-INDEX
                    </DropdownMenuItem>
                    <DropdownMenuItem className="gap-2 font-black uppercase tracking-tighter text-xs p-3 focus:bg-accent focus:text-accent-foreground text-accent">
                      <Trash2 className="h-4 w-4" /> PURGE
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
