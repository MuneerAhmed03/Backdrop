'use client';

import Editor from '@monaco-editor/react';

interface CodeEditorProps {
  value: string;
  onChange: (value: string) => void;
}

export function CodeEditor({ value, onChange }: CodeEditorProps) {
  function handleEditorValidation(markers:any) {
    
    markers.forEach((marker:any) => console.log('onValidate:', marker.message));
  }


  const handleEditorWillMount = (monaco: any) => {
    monaco.editor.defineTheme('backdrop-dark', {
      base: 'vs-dark',
      inherit: true,
      rules: [],
      colors: {
        'editor.background': '#09090b',
        'editor.foreground': '#fafafa',
        'editor.lineHighlightBackground': '#27272a',
        'editorGutter.background': '#09090b00', // Transparent background
        'editorGutter.modifiedBackground': '#09090b00',
        'editorGutter.addedBackground': '#09090b00',
        'editorGutter.deletedBackground': '#09090b00',
        'editor.selectionBackground': '#3f3f46',
        'editor.inactiveSelectionBackground': '#27272a',
        'editorLineNumber.foreground': '#52525b',
        'editorLineNumber.activeForeground': '#a1a1aa',
        'editor.selectionHighlightBackground': '#3f3f46',
        'editor.wordHighlightBackground': '#3f3f46',
        'editor.wordHighlightStrongBackground': '#3f3f46',
        'editorCursor.foreground': '#fafafa',
        'editorWhitespace.foreground': '#27272a',
        'editorIndentGuide.background': '#27272a',
        'editorIndentGuide.activeBackground': '#3f3f46',
      }
    });
  };

  return (
    <Editor
      height="100%"
      defaultLanguage="python"
      theme="backdrop-dark"
      value={value}
      onValidate={handleEditorValidation}
      onChange={(value) => onChange(value || '')}
      beforeMount={handleEditorWillMount}
      options={{
        minimap: { enabled: false },
        fontSize: 14,
        fontFamily: 'JetBrains Mono, monospace',
        lineNumbers: 'on',
        roundedSelection: true,
        scrollBeyondLastLine: false,
        automaticLayout: true,
        padding: { top: 16, bottom: 16 },
        tabSize: 4,
        insertSpaces: true,
        cursorBlinking: 'smooth',
        cursorSmoothCaretAnimation: 'on',
        smoothScrolling: true,
        contextmenu: true,
        mouseWheelZoom: true,
        folding:false,
        lineNumbersMinChars: 2,
        bracketPairColorization: {
          enabled: true
        },
        
      }}
    />
  );
} 