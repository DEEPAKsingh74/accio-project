'use client';

import { useState } from 'react';
import { useSessionStore } from '@/lib/stores/sessionStore';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { tomorrow } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { Copy, Download, FileCode, FileText } from 'lucide-react';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';

type TabType = 'jsx' | 'css';

export default function CodeTabs() {
  const { currentSession } = useSessionStore();
  const [activeTab, setActiveTab] = useState<TabType>('jsx');

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      // You could add a toast notification here
    } catch (error) {
      console.error('Failed to copy to clipboard:', error);
    }
  };

  const downloadCode = async () => {
    if (!currentSession?.generatedCode?.jsx) return;

    const zip = new JSZip();

    // Add JSX file
    zip.file('component.jsx', currentSession.generatedCode.jsx);

    // Add CSS file
    zip.file('styles.css', currentSession.generatedCode.css);

    // Add package.json for React project
    const packageJson = {
      name: `${currentSession.name.toLowerCase().replace(/\s+/g, '-')}-component`,
      version: '1.0.0',
      description: 'Generated React component',
      main: 'component.jsx',
      dependencies: {
        react: '^18.2.0',
        'react-dom': '^18.2.0',
      },
    };

    zip.file('package.json', JSON.stringify(packageJson, null, 2));

    // Add README
    const readme = `# ${currentSession.name}

This component was generated using Accio AI.

## Files
- \`component.jsx\` - The React component
- \`styles.css\` - The component styles

## Usage
Import the component and styles into your React project.

\`\`\`jsx
import Component from './component.jsx';
import './styles.css';

function App() {
  return <Component />;
}
\`\`\`
`;

    zip.file('README.md', readme);

    const blob = await zip.generateAsync({ type: 'blob' });
    saveAs(blob, `${currentSession.name.toLowerCase().replace(/\s+/g, '-')}.zip`);
  };

  if (!currentSession) {
    return (
      <div className="h-full flex items-center justify-center text-gray-500">
        <div className="text-center">
          <FileCode className="w-12 h-12 mx-auto mb-4 text-gray-400" />
          <p>Select a session to see the code</p>
        </div>
      </div>
    );
  }

  if (!currentSession.generatedCode) {
    return (
      <div className="h-full flex items-center justify-center text-gray-500">
        <div className="text-center">
          <FileCode className="w-12 h-12 mx-auto mb-4 text-gray-400" />
          <p>Start chatting to generate code</p>
        </div>
      </div>
    );
  }

  const { jsx = '', css = '' } = currentSession?.generatedCode || {};

  return (
    <div className="h-full flex flex-col">
      {/* Tabs Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gray-50">
        <div className="flex space-x-1">
          <button
            onClick={() => setActiveTab('jsx')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === 'jsx'
                ? 'bg-primary-500 text-white'
                : 'bg-white text-gray-600 hover:bg-gray-100'
              }`}
          >
            <div className="flex items-center space-x-2">
              <FileCode className="w-4 h-4" />
              <span>JSX</span>
            </div>
          </button>
          <button
            onClick={() => setActiveTab('css')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === 'css'
                ? 'bg-primary-500 text-white'
                : 'bg-white text-gray-600 hover:bg-gray-100'
              }`}
          >
            <div className="flex items-center space-x-2">
              <FileText className="w-4 h-4" />
              <span>CSS</span>
            </div>
          </button>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => copyToClipboard(activeTab === 'jsx' ? (jsx || '') : (css || ''))}
            className="flex items-center text-black space-x-2 px-3 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            title="Copy code"
          >
            <Copy className="w-4 h-4" />
            <span className="text-sm">Copy</span>
          </button>
          <button
            onClick={downloadCode}
            className="flex items-center space-x-2 px-3 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors"
            title="Download as ZIP"
          >
            <Download className="w-4 h-4" />
            <span className="text-sm">Download</span>
          </button>
        </div>
      </div>

      {/* Code Content */}
      <div className="flex-1 overflow-hidden">
        <div className="h-full overflow-auto">
          <SyntaxHighlighter
            language={activeTab === 'jsx' ? 'jsx' : 'css'}
            style={tomorrow}
            customStyle={{
              margin: 0,
              fontSize: '14px',
              fontFamily: 'Fira Code, monospace',
            }}
            showLineNumbers
            wrapLines
          >
            {activeTab === 'jsx' ? (jsx || '') : (css || '')}
          </SyntaxHighlighter>
        </div>
      </div>

    </div>
  );
} 