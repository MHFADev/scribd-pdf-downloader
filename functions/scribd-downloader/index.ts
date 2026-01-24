import { createClient } from 'jsr:@supabase/supabase-js@2';

// CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

interface ScribdRequest {
  url: string;
}

// Extract document ID from Scribd URL
function extractDocId(url: string): string | null {
  const match = url.match(/scribd\.com\/document\/(\d+)/);
  return match ? match[1] : null;
}

// Fetch document metadata
async function fetchDocumentMetadata(docId: string): Promise<{ title: string; pages: number }> {
  try {
    const response = await fetch(`https://www.scribd.com/document/${docId}`, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
      },
    });

    const html = await response.text();
    
    // Extract title
    const titleMatch = html.match(/<title>([^<]+)<\/title>/);
    const title = titleMatch ? titleMatch[1].split('|')[0].trim() : 'Scribd Document';
    
    // Extract page count
    const pageMatch = html.match(/(\d+)\s+pages?/i);
    const pages = pageMatch ? parseInt(pageMatch[1]) : 0;

    return { title, pages };
  } catch (error) {
    console.error('Error fetching metadata:', error);
    return { title: 'Scribd Document', pages: 0 };
  }
}

// Main download function using multiple strategies
async function downloadScribdPDF(docId: string): Promise<{ success: boolean; pdf?: Uint8Array; error?: string; title?: string; pages?: number }> {
  try {
    // Get document metadata first
    const metadata = await fetchDocumentMetadata(docId);
    
    // Strategy 1: Try direct download endpoint (most common for public docs)
    try {
      const downloadUrl = `https://www.scribd.com/document_downloads/direct/${docId}?extension=pdf&secret_password=`;
      const response = await fetch(downloadUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Referer': `https://www.scribd.com/document/${docId}`,
          'Accept': 'application/pdf,*/*',
          'Accept-Language': 'en-US,en;q=0.9',
        },
        redirect: 'follow',
      });

      if (response.ok) {
        const contentType = response.headers.get('content-type');
        if (contentType?.includes('pdf')) {
          const pdfBuffer = await response.arrayBuffer();
          if (pdfBuffer.byteLength > 0) {
            return {
              success: true,
              pdf: new Uint8Array(pdfBuffer),
              title: metadata.title,
              pages: metadata.pages,
            };
          }
        }
      }
    } catch (e) {
      console.log('Strategy 1 failed:', e);
    }

    // Strategy 2: Try classic API endpoint
    try {
      const apiUrl = `https://www.scribd.com/document_downloads/${docId}?extension=pdf`;
      const response = await fetch(apiUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          'Referer': `https://www.scribd.com/document/${docId}`,
          'Accept': 'application/pdf',
        },
      });

      if (response.ok && response.headers.get('content-type')?.includes('pdf')) {
        const pdfBuffer = await response.arrayBuffer();
        if (pdfBuffer.byteLength > 0) {
          return {
            success: true,
            pdf: new Uint8Array(pdfBuffer),
            title: metadata.title,
            pages: metadata.pages,
          };
        }
      }
    } catch (e) {
      console.log('Strategy 2 failed:', e);
    }

    // Strategy 3: Try reader endpoint with download parameter
    try {
      const readerUrl = `https://www.scribd.com/document/${docId}?download=true`;
      const response = await fetch(readerUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          'Accept': 'application/pdf,text/html,*/*',
        },
        redirect: 'follow',
      });

      if (response.ok) {
        const contentType = response.headers.get('content-type');
        if (contentType?.includes('pdf')) {
          const pdfBuffer = await response.arrayBuffer();
          if (pdfBuffer.byteLength > 0) {
            return {
              success: true,
              pdf: new Uint8Array(pdfBuffer),
              title: metadata.title,
              pages: metadata.pages,
            };
          }
        }
      }
    } catch (e) {
      console.log('Strategy 3 failed:', e);
    }

    // Strategy 4: Try embeds endpoint
    try {
      const embedUrl = `https://www.scribd.com/embeds/${docId}/content`;
      const response = await fetch(embedUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          'Referer': `https://www.scribd.com/document/${docId}`,
        },
      });

      if (response.ok) {
        const contentType = response.headers.get('content-type');
        if (contentType?.includes('pdf')) {
          const pdfBuffer = await response.arrayBuffer();
          if (pdfBuffer.byteLength > 0) {
            return {
              success: true,
              pdf: new Uint8Array(pdfBuffer),
              title: metadata.title,
              pages: metadata.pages,
            };
          }
        }
      }
    } catch (e) {
      console.log('Strategy 4 failed:', e);
    }

    // If all strategies fail, return error with metadata
    return {
      success: false,
      error: 'This document requires a Scribd subscription or is not publicly available for download. Please ensure the document is set to public and try again.',
      title: metadata.title,
      pages: metadata.pages,
    };
  } catch (error) {
    console.error('Error in downloadScribdPDF:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    };
  }
}

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { url }: ScribdRequest = await req.json();

    if (!url) {
      return new Response(
        JSON.stringify({ error: 'URL is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Extract document ID
    const docId = extractDocId(url);
    if (!docId) {
      return new Response(
        JSON.stringify({ error: 'Invalid Scribd URL. Please provide a valid document URL.' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Download PDF
    const result = await downloadScribdPDF(docId);

    if (!result.success || !result.pdf) {
      return new Response(
        JSON.stringify({
          error: result.error || 'Failed to download document',
          metadata: {
            title: result.title,
            pages: result.pages,
          },
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Return PDF file
    return new Response(result.pdf, {
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${result.title?.replace(/[^a-z0-9]/gi, '_')}.pdf"`,
      },
    });
  } catch (error) {
    console.error('Server error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
