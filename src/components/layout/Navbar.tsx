import React from 'react';

export function Navbar() {
  return (
    <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
      <div className="container flex h-16 items-center max-w-5xl mx-auto px-4">
        <div className="flex items-center gap-2 font-bold text-xl tracking-tighter">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-6 w-6"
          >
            <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20" />
            <path d="M12 11h.01" />
            <path d="M12 7h.01" />
            <path d="M12 15h.01" />
          </svg>
          ScribdDL
        </div>
        <div className="ml-auto flex items-center gap-4">
          <a
            href="https://github.com/mhfadev"
            target="_blank"
            rel="noreferrer"
            className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            By MHFADev
          </a>
        </div>
      </div>
    </nav>
  );
}
