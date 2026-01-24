import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { FileDown, Loader2, Link as LinkIcon, AlertCircle, CheckCircle2, FileText, Download } from 'lucide-react';
import { toast } from 'sonner';

const API_URL = 'https://zy5iy33q--scribd-downloader.functions.blink.new';

export function Downloader() {
  const [url, setUrl] = useState('');
  const [status, setStatus] = useState<'idle' | 'downloading' | 'completed' | 'error'>('idle');
  const [progress, setProgress] = useState(0);
  const [errorMsg, setErrorMsg] = useState('');
  const [docInfo, setDocInfo] = useState<{ title: string; pages: number } | null>(null);
  const [pdfBlob, setPdfBlob] = useState<Blob | null>(null);

  const handleDownload = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setDocInfo(null);
    setPdfBlob(null);
    setProgress(0);
    
    if (!url.includes('scribd.com/document/')) {
      setStatus('error');
      setErrorMsg('Invalid Scribd URL. Please enter a valid URL (e.g., https://www.scribd.com/document/123456789/Title).');
      return;
    }

    setStatus('downloading');
    
    // Simulate progress
    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 90) return 90;
        return prev + 5;
      });
    }, 200);

    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url }),
      });

      clearInterval(progressInterval);

      if (!response.ok) {
        const errorData = await response.json();
        setStatus('error');
        setErrorMsg(errorData.error || 'Failed to download document');
        
        // If we have metadata despite the error, show it
        if (errorData.metadata) {
          setDocInfo(errorData.metadata);
        }
        
        toast.error('Download failed', {
          description: errorData.error || 'Unable to download the document',
        });
        return;
      }

      // Check if response is PDF
      const contentType = response.headers.get('content-type');
      if (contentType?.includes('application/pdf')) {
        const blob = await response.blob();
        setPdfBlob(blob);
        
        // Extract title from Content-Disposition header
        const disposition = response.headers.get('content-disposition');
        const filenameMatch = disposition?.match(/filename="?(.+?)"?$/);
        const filename = filenameMatch ? filenameMatch[1] : 'document.pdf';
        
        setDocInfo({
          title: filename.replace('.pdf', '').replace(/_/g, ' '),
          pages: 0, // We don't know the exact page count from the blob
        });
        
        setProgress(100);
        setStatus('completed');
        
        toast.success('Download completed!', {
          description: 'Your PDF is ready to save',
        });
      } else {
        const errorData = await response.json();
        setStatus('error');
        setErrorMsg(errorData.error || 'Received non-PDF response');
        toast.error('Download failed', {
          description: 'The server did not return a PDF file',
        });
      }
    } catch (error) {
      clearInterval(progressInterval);
      setStatus('error');
      const message = error instanceof Error ? error.message : 'Network error occurred';
      setErrorMsg(message);
      toast.error('Connection failed', {
        description: message,
      });
    }
  };

  const downloadFile = () => {
    if (!pdfBlob || !docInfo) return;
    
    const downloadUrl = URL.createObjectURL(pdfBlob);
    const a = document.createElement('a');
    a.href = downloadUrl;
    a.download = `${docInfo.title.replace(/\s+/g, '_')}.pdf`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(downloadUrl);
    
    toast.success('File saved!', {
      description: 'PDF has been downloaded to your device',
    });
  };

  const reset = () => {
    setUrl('');
    setStatus('idle');
    setProgress(0);
    setDocInfo(null);
    setPdfBlob(null);
    setErrorMsg('');
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
              <AlertDescription>{errorMsg}</AlertDescription>
            </Alert>
          )}

          {(status === 'downloading' || (status === 'completed' && progress < 100)) && (
            <div className="mt-6 space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>Downloading document from Scribd...</span>
                  <span>{Math.round(progress)}%</span>
                </div>
                <Progress value={progress} className="h-2" />
              </div>
            </div>
          )}

          {status === 'completed' && docInfo && (
            <div className="mt-6 p-4 bg-muted/50 rounded-lg border flex items-center justify-between animate-fade-in">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 bg-primary/10 rounded-full flex items-center justify-center text-primary">
                    <FileText className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="font-medium text-sm line-clamp-1">{docInfo.title}</h4>
                  <p className="text-xs text-muted-foreground">{docInfo.pages} pages • PDF</p>
                </div>
              </div>
              <Button onClick={downloadFile} variant="default" size="sm" className="gap-2">
                <Download className="h-4 w-4" />
                Save PDF
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
