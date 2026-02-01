'use client';

import { POST_CATEGORY_OPTIONS, type PostCategory } from '@repo/shared';
import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Textarea,
  toast,
} from '@repo/ui';
import { FileText, Loader2, Sparkles, Upload, X } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';

// =============================================================================
// Types
// =============================================================================

interface AiGenerateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onGenerated: (result: { title: string; content: string; excerpt: string }) => void;
  defaultCategory?: PostCategory;
}

interface GenerationJob {
  id: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  result?: {
    title?: string;
    content?: string;
    excerpt?: string;
  };
  errorMessage?: string;
}

type DialogState = 'form' | 'processing';

// =============================================================================
// Constants
// =============================================================================

const POLL_INTERVAL = 2000; // 2 seconds
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ACCEPTED_FILE_TYPES = [
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'image/jpeg',
  'image/png',
];

// =============================================================================
// Component
// =============================================================================

export function AiGenerateDialog({
  open,
  onOpenChange,
  onGenerated,
  defaultCategory = 'aktualnosti',
}: AiGenerateDialogProps) {
  // Form state
  const [instructions, setInstructions] = useState('');
  const [category, setCategory] = useState<PostCategory>(defaultCategory);
  const [file, setFile] = useState<File | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Processing state
  const [dialogState, setDialogState] = useState<DialogState>('form');
  const [jobId, setJobId] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState('');

  // Reset form when dialog closes
  useEffect(() => {
    if (!open) {
      setInstructions('');
      setCategory(defaultCategory);
      setFile(null);
      setDialogState('form');
      setJobId(null);
      setStatusMessage('');
    }
  }, [open, defaultCategory]);

  // Poll for job completion
  useEffect(() => {
    if (!jobId || dialogState !== 'processing') return;

    const pollJob = async () => {
      try {
        const response = await fetch(`/api/ai/queue/${jobId}`);
        const data = (await response.json()) as { success: boolean; data?: GenerationJob };

        if (!data.success || !data.data) return;

        const job = data.data;

        if (job.status === 'processing') {
          setStatusMessage('Generiram sadržaj...');
        } else if (job.status === 'completed') {
          if (job.result?.title && job.result?.content && job.result?.excerpt) {
            onGenerated({
              title: job.result.title,
              content: job.result.content,
              excerpt: job.result.excerpt,
            });
            toast({
              title: 'Uspjeh',
              description: 'Članak je uspješno generiran',
              variant: 'success',
            });
            onOpenChange(false);
          } else {
            toast({
              title: 'Greška',
              description: 'AI nije vratio očekivani format',
              variant: 'destructive',
            });
            setDialogState('form');
          }
        } else if (job.status === 'failed') {
          toast({
            title: 'Greška',
            description: job.errorMessage || 'Generiranje nije uspjelo',
            variant: 'destructive',
          });
          setDialogState('form');
        }
      } catch (error) {
        console.error('Failed to poll job:', jobId, error);
      }
    };

    const interval = setInterval(() => void pollJob(), POLL_INTERVAL);
    void pollJob(); // Initial poll

    return () => clearInterval(interval);
  }, [jobId, dialogState, onGenerated, onOpenChange]);

  // File handling
  const handleFileSelect = useCallback((selectedFile: File) => {
    if (selectedFile.size > MAX_FILE_SIZE) {
      toast({
        title: 'Greška',
        description: 'Datoteka je prevelika (max 10MB)',
        variant: 'destructive',
      });
      return;
    }

    if (!ACCEPTED_FILE_TYPES.includes(selectedFile.type)) {
      toast({
        title: 'Greška',
        description: 'Nepodržani format. Dozvoljeni: PDF, DOCX, JPG, PNG',
        variant: 'destructive',
      });
      return;
    }

    setFile(selectedFile);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragActive(false);

      const droppedFile = e.dataTransfer.files[0];
      if (droppedFile) {
        handleFileSelect(droppedFile);
      }
    },
    [handleFileSelect]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
  }, []);

  const handleFileInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const selectedFile = e.target.files?.[0];
      if (selectedFile) {
        handleFileSelect(selectedFile);
      }
    },
    [handleFileSelect]
  );

  const removeFile = useCallback(() => {
    setFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, []);

  // Submit handler
  const handleSubmit = async () => {
    if (!instructions.trim()) {
      toast({
        title: 'Greška',
        description: 'Upute za članak su obavezne',
        variant: 'destructive',
      });
      return;
    }

    setDialogState('processing');
    setStatusMessage(file ? 'Obrađujem dokument...' : 'Šaljem zahtjev...');

    try {
      const formData = new FormData();
      formData.append('instructions', instructions);
      formData.append('category', category);
      if (file) {
        formData.append('document', file);
      }

      const response = await fetch('/api/ai/generate-post', {
        method: 'POST',
        body: formData,
      });

      const data = (await response.json()) as {
        success: boolean;
        data?: { jobId: string };
        error?: { message: string };
      };

      if (!data.success) {
        throw new Error(data.error?.message || 'Greška pri slanju zahtjeva');
      }

      setJobId(data.data!.jobId);
      setStatusMessage('Čekam u redu...');
    } catch (error) {
      toast({
        title: 'Greška',
        description: error instanceof Error ? error.message : 'Greška pri slanju zahtjeva',
        variant: 'destructive',
      });
      setDialogState('form');
    }
  };

  // Cancel handler
  const handleCancel = () => {
    if (dialogState === 'processing' && jobId) {
      // Could cancel the job here if needed
      void fetch(`/api/ai/queue/${jobId}`, { method: 'DELETE' });
    }
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary-600" aria-hidden="true" />
            Generiraj članak s AI
          </DialogTitle>
          <DialogDescription>
            Opišite što želite napisati, a AI će generirati naslov, sadržaj i sažetak.
          </DialogDescription>
        </DialogHeader>

        {dialogState === 'form' ? (
          <>
            <div className="space-y-4 py-4">
              {/* Instructions textarea */}
              <div className="space-y-2">
                <Label htmlFor="instructions" required>
                  Upute za članak
                </Label>
                <Textarea
                  id="instructions"
                  placeholder="Napiši vijest o otvaranju novog dječjeg parka. Naglasi ulaganje općine i pogodnosti za mlade obitelji..."
                  rows={5}
                  value={instructions}
                  onChange={(e) => setInstructions(e.target.value)}
                  maxLength={2000}
                />
                <p className="text-xs text-neutral-500">
                  Opišite temu, kut članka i ključne informacije ({instructions.length}/2000)
                </p>
              </div>

              {/* Category select */}
              <div className="space-y-2">
                <Label htmlFor="category" required>
                  Kategorija
                </Label>
                <Select value={category} onValueChange={(v) => setCategory(v as PostCategory)}>
                  <SelectTrigger id="category">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {POST_CATEGORY_OPTIONS.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* File upload */}
              <div className="space-y-2">
                <Label>Dokument (opcionalno)</Label>
                {file ? (
                  <div className="flex items-center gap-2 rounded-lg border border-neutral-200 bg-neutral-50 p-3">
                    <FileText className="h-5 w-5 text-neutral-600" aria-hidden="true" />
                    <span className="flex-1 truncate text-sm">{file.name}</span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={removeFile}
                      className="h-8 w-8 p-0"
                      aria-label="Ukloni datoteku"
                    >
                      <X className="h-4 w-4" aria-hidden="true" />
                    </Button>
                  </div>
                ) : (
                  <div
                    className={`flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed p-6 transition-colors ${
                      dragActive
                        ? 'border-primary-500 bg-primary-50'
                        : 'border-neutral-300 hover:border-neutral-400'
                    }`}
                    role="button"
                    tabIndex={0}
                    onDrop={handleDrop}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onClick={() => fileInputRef.current?.click()}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        fileInputRef.current?.click();
                      }
                    }}
                  >
                    <Upload className="mb-2 h-8 w-8 text-neutral-400" aria-hidden="true" />
                    <p className="text-sm text-neutral-600">
                      Povucite datoteku ili kliknite za odabir
                    </p>
                    <p className="mt-1 text-xs text-neutral-500">
                      PDF, DOCX, JPG, PNG (max 10MB)
                    </p>
                    <input
                      ref={fileInputRef}
                      type="file"
                      className="hidden"
                      accept=".pdf,.docx,.jpg,.jpeg,.png"
                      onChange={handleFileInputChange}
                    />
                  </div>
                )}
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={handleCancel}>
                Odustani
              </Button>
              <Button
                type="button"
                onClick={() => void handleSubmit()}
                disabled={!instructions.trim()}
              >
                <Sparkles className="mr-2 h-4 w-4" aria-hidden="true" />
                Generiraj
              </Button>
            </DialogFooter>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center py-12">
            <Loader2 className="mb-4 h-12 w-12 animate-spin text-primary-600" aria-hidden="true" />
            <p className="text-lg font-medium" aria-live="polite">{statusMessage}</p>
            <p className="mt-2 text-sm text-neutral-500">
              Ovo može potrajati do minutu...
            </p>
            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
              className="mt-6"
            >
              Odustani
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
