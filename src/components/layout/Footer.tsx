import React from 'react';

export function Footer() {
  return (
    <footer className="border-t bg-muted/40 py-6 md:py-0">
      <div className="container flex flex-col items-center justify-between gap-4 md:h-24 md:flex-row max-w-5xl mx-auto px-4">
        <div className="flex flex-col items-center gap-4 px-8 md:flex-row md:gap-2 md:px-0">
          <p className="text-center text-sm leading-loose text-muted-foreground md:text-left">
            Built by{" "}
            <a
              href="#"
              className="font-medium underline underline-offset-4"
            >
              MHFADev
            </a>
            . The source code is available on GitHub.
          </p>
        </div>
        <div className="flex gap-4">
            <span className="text-xs text-muted-foreground">Disclaimer: This tool is for educational purposes only.</span>
        </div>
      </div>
    </footer>
  );
}
