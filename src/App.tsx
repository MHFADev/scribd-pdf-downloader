import React from 'react';
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';
import { Downloader } from './components/features/Downloader';
import { Toaster } from 'sonner';

function App() {
  return (
    <div className="min-h-screen flex flex-col bg-background font-sans antialiased">
      <Navbar />
      <main className="flex-1 container max-w-5xl mx-auto px-4 py-12 md:py-24">
        <Downloader />
      </main>
      <Footer />
      <Toaster position="top-center" richColors />
    </div>
  );
}

export default App;
