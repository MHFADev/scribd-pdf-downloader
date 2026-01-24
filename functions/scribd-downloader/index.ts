// CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

interface ScribdRequest {
  url: string;
}

interface DocumentMetadata {
  title: string;
  pages: number;
  author?: string;
  description?: string;
}

// Extract document ID from Scribd URL
function extractDocId(url: string): string | null {
  // Support multiple Scribd URL formats
  const patterns = [
    /scribd\.com\/document\/(\d+)/,
    /scribd\.com\/doc\/(\d+)/,
    /scribd\.com\/embeds\/(\d+)/,
  ];
  
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }
  
  return null;
}

// Generate realistic browser headers
function getBrowserHeaders(docId: string) {
  return {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
    'Accept-Language': 'en-US,en;q=0.9',
    'Accept-Encoding': 'gzip, deflate, br',
    'Referer': `https://www.scribd.com/document/${docId}`,
    'DNT': '1',
    'Connection': 'keep-alive',
    'Upgrade-Insecure-Requests': '1',
    'Sec-Fetch-Dest': 'document',
    'Sec-Fetch-Mode': 'navigate',
    'Sec-Fetch-Site': 'same-origin',
    'Cache-Control': 'max-age=0',
  };
}

// Fetch document metadata with enhanced extraction
async function fetchDocumentMetadata(docId: string): Promise<DocumentMetadata> {
  try {
    const response = await fetch(`https://www.scribd.com/document/${docId}`, {
      headers: getBrowserHeaders(docId),
    });

    const html = await response.text();
    
    // Extract title - try multiple patterns
    let title = 'Scribd Document';
    const titlePatterns = [
      /<meta property="og:title" content="([^"]+)"/,
      /<title>([^<]+)<\/title>/,
      /<h1[^>]*>([^<]+)<\/h1>/,
    ];
    
    for (const pattern of titlePatterns) {
      const match = html.match(pattern);
      if (match) {
        title = match[1].split('|')[0].split('-')[0].trim();
        break;
      }
    }
    
    // Extract page count - try multiple patterns
    let pages = 0;
    const pagePatterns = [
      /"num_pages"\s*:\s*(\d+)/,
      /"page_count"\s*:\s*(\d+)/,
      /(\d+)\s+pages?/i,
    ];
    
    for (const pattern of pagePatterns) {
      const match = html.match(pattern);
      if (match) {
        pages = parseInt(match[1]);
        break;
      }
    }

    // Extract author
    let author = undefined;
    const authorMatch = html.match(/<meta name="author" content="([^"]+)"/);
    if (authorMatch) {
      author = authorMatch[1];
    }

    return { title, pages, author };
  } catch (error) {
    console.error('Error fetching metadata:', error);
    return { title: 'Scribd Document', pages: 0 };
  }
}

// Validate if PDF content is valid
function isValidPDF(buffer: ArrayBuffer): boolean {
  if (buffer.byteLength < 5) return false;
  const arr = new Uint8Array(buffer.slice(0, 5));
  // Check for PDF magic number: %PDF-
  return arr[0] === 0x25 && arr[1] === 0x50 && arr[2] === 0x44 && arr[3] === 0x46 && arr[4] === 0x2D;
}

// Main download function using multiple strategies with retry logic
async function downloadScribdPDF(docId: string): Promise<{ success: boolean; pdf?: Uint8Array; error?: string; title?: string; pages?: number; author?: string }> {
  try {
    // Get document metadata first
    const metadata = await fetchDocumentMetadata(docId);
    console.log('Document metadata:', metadata);
    
    const strategies = [
      {
        name: 'Direct Download Endpoint',
        execute: async () => {
          const downloadUrl = `https://www.scribd.com/document_downloads/direct/${docId}?extension=pdf&secret_password=`;
          const response = await fetch(downloadUrl, {
            headers: {
              ...getBrowserHeaders(docId),
              'Accept': 'application/pdf,*/*',
            },
            redirect: 'follow',
          });
          return response;
        },
      },
      {
        name: 'Classic API Endpoint',
        execute: async () => {
          const apiUrl = `https://www.scribd.com/document_downloads/${docId}?extension=pdf`;
          const response = await fetch(apiUrl, {
            headers: {
              ...getBrowserHeaders(docId),
              'Accept': 'application/pdf',
            },
            redirect: 'follow',
          });
          return response;
        },
      },
      {
        name: 'Download Button Endpoint',
        execute: async () => {
          const downloadUrl = `https://www.scribd.com/doc_downloads/download_doc_modal/${docId}?extension=pdf`;
          const response = await fetch(downloadUrl, {
            headers: getBrowserHeaders(docId),
            redirect: 'follow',
          });
          return response;
        },
      },
      {
        name: 'Reader Download Parameter',
        execute: async () => {
          const readerUrl = `https://www.scribd.com/document/${docId}?download=true`;
          const response = await fetch(readerUrl, {
            headers: {
              ...getBrowserHeaders(docId),
              'Accept': 'application/pdf,text/html,*/*',
            },
            redirect: 'follow',
          });
          return response;
        },
      },
      {
        name: 'Embeds Content Endpoint',
        execute: async () => {
          const embedUrl = `https://www.scribd.com/embeds/${docId}/content?download=true`;
          const response = await fetch(embedUrl, {
            headers: getBrowserHeaders(docId),
            redirect: 'follow',
          });
          return response;
        },
      },
      {
        name: 'Archive Endpoint',
        execute: async () => {
          const archiveUrl = `https://www.scribd.com/archive/document/${docId}.pdf`;
          const response = await fetch(archiveUrl, {
            headers: {
              ...getBrowserHeaders(docId),
              'Accept': 'application/pdf',
            },
            redirect: 'follow',
          });
          return response;
        },
      },
    ];

    // Try each strategy
    for (const strategy of strategies) {
      try {
        console.log(`Trying strategy: ${strategy.name}`);
        const response = await strategy.execute();

        if (response.ok) {
          const contentType = response.headers.get('content-type');
          console.log(`${strategy.name} - Status: ${response.status}, Content-Type: ${contentType}`);
          
          // Check if it's a PDF
          if (contentType?.includes('pdf') || contentType?.includes('application/octet-stream')) {
            const pdfBuffer = await response.arrayBuffer();
            
            if (pdfBuffer.byteLength > 0 && isValidPDF(pdfBuffer)) {
              console.log(`✓ ${strategy.name} succeeded - PDF size: ${pdfBuffer.byteLength} bytes`);
              return {
                success: true,
                pdf: new Uint8Array(pdfBuffer),
                title: metadata.title,
                pages: metadata.pages,
                author: metadata.author,
              };
            } else {
              console.log(`✗ ${strategy.name} returned invalid PDF`);
            }
          }
        } else {
          console.log(`✗ ${strategy.name} failed with status: ${response.status}`);
        }
      } catch (e) {
        console.log(`✗ ${strategy.name} threw error:`, e);
      }
    }

    // If all strategies fail, return error with metadata
    return {
      success: false,
      error: 'Unable to download this document. It may require a Scribd subscription, be protected, or not be publicly available. Please verify the document is accessible and try again.',
      title: metadata.title,
      pages: metadata.pages,
      author: metadata.author,
    };
  } catch (error) {
    console.error('Error in downloadScribdPDF:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'An unexpected error occurred while processing the document',
    };
  }
}

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { 
      status: 204,
      headers: corsHeaders 
    });
  }

  try {
    // Validate request method
    if (req.method !== 'POST') {
      return new Response(
        JSON.stringify({ error: 'Method not allowed. Use POST.' }),
        { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { url }: ScribdRequest = await req.json();

    if (!url || typeof url !== 'string') {
      return new Response(
        JSON.stringify({ error: 'Valid URL string is required in request body' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validate Scribd URL
    if (!url.includes('scribd.com')) {
      return new Response(
        JSON.stringify({ error: 'Invalid URL. Please provide a Scribd document URL (e.g., https://www.scribd.com/document/123456789/Title)' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Extract document ID
    const docId = extractDocId(url);
    if (!docId) {
      return new Response(
        JSON.stringify({ error: 'Could not extract document ID from URL. Please provide a valid Scribd document URL (e.g., https://www.scribd.com/document/123456789/Title)' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Processing document ID: ${docId} from URL: ${url}`);

    // Download PDF with retry logic
    const result = await downloadScribdPDF(docId);

    if (!result.success || !result.pdf) {
      console.error('Download failed:', result.error);
      return new Response(
        JSON.stringify({
          error: result.error || 'Failed to download document',
          metadata: {
            title: result.title,
            pages: result.pages,
            author: result.author,
          },
        }),
        { status: 422, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Generate safe filename
    const safeFilename = result.title
      ?.replace(/[^\w\s-]/g, '') // Remove special characters
      .replace(/\s+/g, '_')       // Replace spaces with underscores
      .substring(0, 100)          // Limit length
      || 'scribd_document';

    console.log(`✓ Successfully downloaded PDF: ${safeFilename}.pdf (${result.pdf.byteLength} bytes)`);

    // Return PDF file with proper headers
    return new Response(result.pdf, {
      status: 200,
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${safeFilename}.pdf"`,
        'Content-Length': result.pdf.byteLength.toString(),
        'X-Document-Title': result.title || 'Scribd Document',
        'X-Document-Pages': (result.pages || 0).toString(),
      },
    });
  } catch (error) {
    console.error('Server error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Internal server error';
    return new Response(
      JSON.stringify({ 
        error: errorMessage,
        details: 'An unexpected error occurred while processing your request. Please try again later.',
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
