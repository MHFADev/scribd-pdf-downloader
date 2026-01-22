import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { FileDown, Loader2, Link as LinkIcon, AlertCircle, CheckCircle2, FileText, Download } from 'lucide-react';

export function Downloader() {
  const [url, setUrl] = useState('');
  const [status, setStatus] = useState<'idle' | 'analyzing' | 'processing' | 'completed' | 'error'>('idle');
  const [progress, setProgress] = useState(0);
  const [errorMsg, setErrorMsg] = useState('');
  const [docInfo, setDocInfo] = useState<{ title: string; pages: number } | null>(null);

  const simulateProgress = () => {
    setProgress(0);
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 90) {
          clearInterval(interval);
          return 90;
        }
        return prev + Math.random() * 10;
      });
    }, 500);
    return interval;
  };

  const handleAnalyze = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setDocInfo(null);
    
    if (!url.includes('scribd.com/document/')) {
      setStatus('error');
      setErrorMsg('Invalid Scribd URL. Please enter a valid URL (e.g., https://www.scribd.com/document/123456789/Title).');
      return;
    }

    setStatus('analyzing');
    
    // Simulate API call
    setTimeout(() => {
      setStatus('processing');
      const progressInterval = simulateProgress();
      
      // Extract rough title from URL if possible
      const match = url.match(/\/document\/\d+\/(.+)/);
      const title = match ? match[1].replace(/-/g, ' ') : 'Scribd Document';
      
      setTimeout(() => {
        clearInterval(progressInterval);
        setProgress(100);
        setDocInfo({
            title: title.charAt(0).toUpperCase() + title.slice(1),
            pages: Math.floor(Math.random() * 50) + 10
        });
        setStatus('completed');
      }, 3000);
    }, 1500);
  };

  const downloadFile = () => {
    if (!docInfo) return;
    
    // Create a dummy PDF file
    const content = `Title: ${docInfo.title}\n\nThis is a simulated PDF download for demonstration purposes.\nOriginal Source: ${url}\n\nDownloaded via ScribdDL by MHFADev.`;
    const blob = new Blob([content], { type: 'application/pdf' });
    const downloadUrl = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = downloadUrl;
    a.download = `${docInfo.title.replace(/\s+/g, '_')}.pdf`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(downloadUrl);
  };

  const reset = () => {
    setUrl('');
    setStatus('idle');
    setProgress(0);
    setDocInfo(null);
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
          <form onSubmit={handleAnalyze} className="space-y-4">
            <div className="flex gap-2">
              <div className="relative flex-1">
                <LinkIcon className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="https://www.scribd.com/document/..."
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  className="pl-9 h-10"
                  disabled={status === 'analyzing' || status === 'processing'}
                />
              </div>
              <Button type="submit" disabled={!url || status === 'analyzing' || status === 'processing'}>
                {status === 'analyzing' ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <FileDown className="mr-2 h-4 w-4" />
                )}
                {status === 'analyzing' ? 'Analyzing...' : 'Download'}
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

          {(status === 'processing' || status === 'completed') && (
            <div className="mt-6 space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>Processing document...</span>
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
