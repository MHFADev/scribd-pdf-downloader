import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { FileDown, Loader2, Link as LinkIcon, AlertCircle, CheckCircle2, FileText, Download, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';

const API_URL = import.meta.env.VITE_API_URL || 'https://zy5iy33q--scribd-downloader.functions.blink.new';

interface DocumentInfo {
  title: string;
  pages: number;
  author?: string;
}

export function Downloader() {
  const [url, setUrl] = useState('');
  const [status, setStatus] = useState<'idle' | 'downloading' | 'completed' | 'error'>('idle');
  const [progress, setProgress] = useState(0);
  const [errorMsg, setErrorMsg] = useState('');
  const [docInfo, setDocInfo] = useState<DocumentInfo | null>(null);
  const [pdfBlob, setPdfBlob] = useState<Blob | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const abortControllerRef = useRef<AbortController | null>(null);

  const handleDownload = async (e?: React.FormEvent, isRetry = false) => {
    if (e) e.preventDefault();
    
    // Cancel any ongoing request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    
    setErrorMsg('');
    setDocInfo(null);
    setPdfBlob(null);
    setProgress(0);
    
    // Validate URL format
    const urlPattern = /scribd\.com\/(document|doc|embeds)\/\d+/;
    if (!urlPattern.test(url)) {
      setStatus('error');
      setErrorMsg('Invalid Scribd URL format. Please enter a valid URL like: https://www.scribd.com/document/123456789/Title');
      toast.error('Invalid URL', {
        description: 'Please provide a valid Scribd document URL',
      });
      return;
    }

    setStatus('downloading');
    if (!isRetry) {
      setRetryCount(0);
    }
    
    // Create new abort controller
    abortControllerRef.current = new AbortController();
    
    // Simulate progress with realistic increments
    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 90) return 90;
        const increment = Math.random() * 10 + 3;
        return Math.min(prev + increment, 90);
      });
    }, 300);

    try {
      console.log('Sending download request to:', API_URL);
      console.log('Document URL:', url);
      
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url }),
        signal: abortControllerRef.current.signal,
      });

      clearInterval(progressInterval);

      if (!response.ok) {
        const contentType = response.headers.get('content-type');
        let errorData: any = {};
        
        try {
          if (contentType?.includes('application/json')) {
            errorData = await response.json();
          } else {
            errorData = { error: `Server returned status ${response.status}` };
          }
        } catch {
          errorData = { error: `Server error: ${response.statusText}` };
        }
        
        setStatus('error');
        setErrorMsg(errorData.error || 'Failed to download document');
        
        // If we have metadata despite the error, show it
        if (errorData.metadata) {
          setDocInfo(errorData.metadata);
        }
        
        toast.error('Download failed', {
          description: errorData.error || 'Unable to download the document',
          duration: 5000,
        });
        return;
      }

      // Check if response is PDF
      const contentType = response.headers.get('content-type');
      if (contentType?.includes('application/pdf')) {
        setProgress(95);
        
        const blob = await response.blob();
        
        // Validate PDF blob
        if (blob.size === 0) {
          throw new Error('Received empty PDF file');
        }
        
        setPdfBlob(blob);
        
        // Extract metadata from response headers
        const disposition = response.headers.get('content-disposition');
        const filenameMatch = disposition?.match(/filename="?(.+?\.pdf)"?$/i);
        const filename = filenameMatch ? filenameMatch[1].replace('.pdf', '') : 'document';
        
        const titleHeader = response.headers.get('x-document-title');
        const pagesHeader = response.headers.get('x-document-pages');
        
        setDocInfo({
          title: titleHeader || filename.replace(/_/g, ' '),
          pages: pagesHeader ? parseInt(pagesHeader) : 0,
        });
        
        setProgress(100);
        setStatus('completed');
        
        toast.success('Download completed!', {
          description: `PDF ready to save (${(blob.size / 1024 / 1024).toFixed(2)} MB)`,
          duration: 4000,
        });
      } else {
        throw new Error('Server did not return a PDF file');
      }
    } catch (error) {
      clearInterval(progressInterval);
      
      // Check if it was aborted
      if (error instanceof Error && error.name === 'AbortError') {
        setStatus('idle');
        setProgress(0);
        toast.info('Download cancelled');
        return;
      }
      
      setStatus('error');
      const message = error instanceof Error ? error.message : 'Network error occurred';
      setErrorMsg(message);
      
      // Auto-retry logic (max 2 retries)
      if (!isRetry && retryCount < 2) {
        setRetryCount(prev => prev + 1);
        toast.error('Download failed, retrying...', {
          description: `Attempt ${retryCount + 2}/3`,
        });
        setTimeout(() => handleDownload(undefined, true), 2000);
      } else {
        toast.error('Connection failed', {
          description: message,
          duration: 5000,
        });
      }
    }
  };

  const downloadFile = () => {
    if (!pdfBlob || !docInfo) {
      toast.error('No file available', {
        description: 'Please download a document first',
      });
      return;
    }
    
    try {
      // Create safe filename
      const safeFilename = docInfo.title
        .replace(/[^\w\s-]/g, '') // Remove special characters
        .replace(/\s+/g, '_')     // Replace spaces with underscores
        .trim() || 'scribd_document';
      
      // Create blob URL and trigger download
      const downloadUrl = URL.createObjectURL(pdfBlob);
      const a = document.createElement('a');
      a.href = downloadUrl;
      a.download = `${safeFilename}.pdf`;
      a.style.display = 'none';
      
      document.body.appendChild(a);
      a.click();
      
      // Cleanup
      setTimeout(() => {
        document.body.removeChild(a);
        URL.revokeObjectURL(downloadUrl);
      }, 100);
      
      toast.success('File saved!', {
        description: `${safeFilename}.pdf has been downloaded to your device`,
        duration: 3000,
      });
    } catch (error) {
      console.error('Download error:', error);
      toast.error('Download failed', {
        description: 'Failed to save the PDF file. Please try again.',
      });
    }
  };

  const cancelDownload = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
  };

  const reset = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    setUrl('');
    setStatus('idle');
    setProgress(0);
    setDocInfo(null);
    setPdfBlob(null);
    setErrorMsg('');
    setRetryCount(0);
  };

  return (
    <div className="w-full max-w-2xl mx-auto space-y-8 animate-fade-in">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
          Scribd PDF Downloader
        </h1>
        <p className="text-xl text-muted-foreground max-w-[600px] mx-auto">
          Download your favorite documents instantly. Simple, fast, and free.
        </p>
      </div>

      <Card className="border-2 shadow-lg">
        <CardHeader>
          <CardTitle>Document URL</CardTitle>
          <CardDescription>Paste the Scribd document URL below to start.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleDownload} className="space-y-4">
            <div className="flex gap-2">
              <div className="relative flex-1">
                <LinkIcon className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="https://www.scribd.com/document/..."
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  className="pl-9 h-10"
                  disabled={status === 'downloading'}
                />
              </div>
              <Button type="submit" disabled={!url || status === 'downloading'}>
                {status === 'downloading' ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <FileDown className="mr-2 h-4 w-4" />
                )}
                {status === 'downloading' ? 'Downloading...' : 'Download'}
              </Button>
            </div>
          </form>

          {status === 'error' && (
            <Alert variant="destructive" className="mt-4">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>
                <p className="mb-2">{errorMsg}</p>
                {retryCount < 2 && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDownload(undefined, true)}
                    className="mt-2"
                  >
                    <RefreshCw className="h-3 w-3 mr-2" />
                    Retry Download
                  </Button>
                )}
              </AlertDescription>
            </Alert>
          )}

          {status === 'downloading' && (
            <div className="mt-6 space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>
                    {retryCount > 0 ? `Retrying (${retryCount}/3)...` : 'Downloading document from Scribd...'}
                  </span>
                  <span>{Math.round(progress)}%</span>
                </div>
                <Progress value={progress} className="h-2" />
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={cancelDownload}
                className="text-muted-foreground"
              >
                Cancel
              </Button>
            </div>
          )}

          {status === 'completed' && docInfo && pdfBlob && (
            <div className="mt-6 p-4 bg-muted/50 rounded-lg border flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 animate-fade-in">
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <div className="h-12 w-12 bg-primary/10 rounded-full flex items-center justify-center text-primary flex-shrink-0">
                  <FileText className="h-6 w-6" />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-sm line-clamp-1" title={docInfo.title}>
                    {docInfo.title}
                  </h4>
                  <p className="text-xs text-muted-foreground">
                    {docInfo.pages > 0 ? `${docInfo.pages} pages` : 'PDF'} • {(pdfBlob.size / 1024 / 1024).toFixed(2)} MB
                    {docInfo.author && ` • ${docInfo.author}`}
                  </p>
                </div>
              </div>
              <Button onClick={downloadFile} variant="default" size="sm" className="gap-2 flex-shrink-0">
                <Download className="h-4 w-4" />
                Save to Device
              </Button>
            </div>
          )}
        </CardContent>
        {status === 'completed' && (
             <CardFooter className="justify-center border-t p-4 bg-muted/20">
                <Button variant="ghost" size="sm" onClick={reset} className="text-muted-foreground">
                    Download another document
                </Button>
            </CardFooter>
        )}
      </Card>

      <div className="grid gap-6 md:grid-cols-3 text-center">
        <div className="space-y-2 p-4 rounded-lg bg-card border shadow-sm">
          <div className="mx-auto w-12 h-12 rounded-full bg-primary/5 flex items-center justify-center">
            <CheckCircle2 className="h-6 w-6 text-primary" />
          </div>
          <h3 className="font-bold">Instant Download</h3>
          <p className="text-sm text-muted-foreground">Get your files in seconds without waiting.</p>
        </div>
        <div className="space-y-2 p-4 rounded-lg bg-card border shadow-sm">
          <div className="mx-auto w-12 h-12 rounded-full bg-primary/5 flex items-center justify-center">
            <FileText className="h-6 w-6 text-primary" />
          </div>
          <h3 className="font-bold">High Quality</h3>
          <p className="text-sm text-muted-foreground">Downloads in original PDF quality.</p>
        </div>
        <div className="space-y-2 p-4 rounded-lg bg-card border shadow-sm">
          <div className="mx-auto w-12 h-12 rounded-full bg-primary/5 flex items-center justify-center">
            <FileDown className="h-6 w-6 text-primary" />
          </div>
          <h3 className="font-bold">Free to Use</h3>
          <p className="text-sm text-muted-foreground">No registration or payment required.</p>
        </div>
      </div>
    </div>
  );
}
