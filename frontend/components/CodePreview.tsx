'use client';

import { useEffect, useRef } from 'react';
import { useSessionStore } from '@/lib/stores/sessionStore';
import { Eye, RefreshCw } from 'lucide-react';

export default function CodePreview() {
  const { currentSession } = useSessionStore();
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const generatePreviewHTML = (jsx: string, css: string) => {
    return `
      <!DOCTYPE html>
      <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Component Preview</title>
          <script src="https://unpkg.com/react@18/umd/react.development.js"></script>
          <script src="https://unpkg.com/react-dom@18/umd/react-dom.development.js"></script>
          <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
          <style>
            * {
              margin: 0;
              padding: 0;
              box-sizing: border-box;
            }
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
              padding: 20px;
              background: white;
            }
            ${css}
          </style>
        </head>
        <body>
          <div id="root"></div>
          <script type="text/babel">
            const { useState, useEffect } = React;
            
            function Component() {
              return (
                <div>
                  ${jsx}
                </div>
              );
            }
            
            ReactDOM.render(<Component />, document.getElementById('root'));
          </script>
        </body>
      </html>
    `;
  };

  const refreshPreview = () => {
    if (iframeRef.current && currentSession?.generatedCode?.jsx) {
      const html = generatePreviewHTML(
        currentSession.generatedCode.jsx || '',
        currentSession.generatedCode.css || ''
      );
      
      const blob = new Blob([html], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      iframeRef.current.src = url;
    }
  };

  useEffect(() => {
    refreshPreview();
  }, [currentSession?.generatedCode?.jsx, currentSession?.generatedCode?.css]);

  if (!currentSession) {
    return (
      <div className="h-full flex items-center justify-center text-gray-500">
        <div className="text-center">
          <Eye className="w-12 h-12 mx-auto mb-4 text-gray-400" />
          <p>Select a session to see the preview</p>
        </div>
      </div>
    );
  }

  if (!currentSession.generatedCode) {
    return (
      <div className="h-full flex items-center justify-center text-gray-500">
        <div className="text-center">
          <Eye className="w-12 h-12 mx-auto mb-4 text-gray-400" />
          <p>Start chatting to generate a component</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-fit-content mb-4 flex flex-col">
      {/* Preview Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gray-50">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Preview</h2>
          <p className="text-sm text-gray-500">
            Live preview of generated component
          </p>
        </div>
        <button
          onClick={refreshPreview}
          className="flex items-center space-x-2 px-3 py-2 text-black bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
          <span className="text-sm">Refresh</span>
        </button>
      </div>

      {/* Preview Content */}
      <div className="flex-1 relative h-[30rem]">
        <iframe
          ref={iframeRef}
          className="w-full h-full preview-iframe"
          sandbox="allow-scripts allow-same-origin"
          title="Component Preview"
        />
      </div>
    </div>
  );
} 