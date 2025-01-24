'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import Editor, { OnChange, Monaco } from '@monaco-editor/react'; // Import Monaco type from @monaco-editor/react
import { useDebounceHook } from '../../lib/useDebouncer';

interface CodeEditorProps {
  value: string;
  onChange: (value: string) => void;
}

declare global {
  interface Window {
    loadPyodide: (options: { indexURL: string }) => Promise<PyodideInterface>;
  }
}

interface PyodideInterface {
  runPython: (code: string) => any;
  runPythonAsync: (code: string) => Promise<any>;
  globals: {
    set: (key: string, value: any) => void;
  };
}

export function CodeEditor({ value, onChange }: CodeEditorProps) {
  const [pyodide, setPyodide] = useState<PyodideInterface | null>(null);
  
  const monacoRef = useRef<Monaco | null>(null); 
  const editorRef = useRef<any>(null);
  useEffect(() => {
    const initpy = async () => {
      try {
        if (!window.loadPyodide) {
    
          await new Promise<void>((resolve, reject) => {
            const script = document.createElement('script');
            script.src = 'https://cdn.jsdelivr.net/pyodide/v0.25.0/full/pyodide.js';
            script.async = true;
            script.onload = () => resolve();
            script.onerror = () => reject(new Error('Failed to load Pyodide'));
            document.body.appendChild(script);
          });
        }
        const pyinstance = await window.loadPyodide({
          indexURL: "https://cdn.jsdelivr.net/pyodide/v0.25.0/full/"
        });

        pyinstance.runPython(`
          def validate_code(code):
            try:
              compile(code, '<string>', 'exec')
              return None
            except Exception as e:
              return str(e)
        `);
  
        setPyodide(pyinstance);
      } catch (error) {
        console.error('Error loading Pyodide:', error);
      }
    };
  
    initpy();
  }, []);

  const validater = useCallback(async (code: string) => {
    if (!pyodide){
      console.log(`can't validate mad because ${pyodide}`)
      return { isValid: true };
    }
    try {
      pyodide.globals.set('user_code', code);
      const error = await pyodide.runPythonAsync('validate_code(user_code)');
      if (error) throw new Error(error);
      return { isValid: true };
    } catch (e: any) {
      const match = /line (\d+)/.exec(e.message);
      console.log(e.message)
      return {
        isValid: false,
        error: {
          message: e.message,
          line: match ? parseInt(match[1], 10) : 1,
        },
      };
    }
  }, [pyodide]);


  const debouncedValidation = useDebounceHook(async (value: string) => {
    if (!value) return;
    
    const result = await validater(value);
    const model = editorRef.current?.getModel();
    if (!model || !monacoRef.current) return;

    monacoRef.current.editor.setModelMarkers(
      model,
      'python',
      result.isValid ? [] : [{
        startLineNumber: result.error!.line,
        startColumn: 1,
        endLineNumber: result.error!.line,
        endColumn: value.split('\n')[result.error!.line - 1]?.length || 1,
        message: result.error!.message,
        severity: monacoRef.current.MarkerSeverity.Error,
      }]
    );
  }, 500);

  // Handle editor changes
  const handleEditorChange: OnChange = (value = '') => {
    onChange(value);
    debouncedValidation(value);
  };

  // Handle editor beforeMount to define custom theme
  const handleEditorWillMount = (monacoInstance: Monaco) => {
    monacoRef.current = monacoInstance; // Store the Monaco instance
    monacoInstance.editor.defineTheme('backdrop-dark', {
      base: 'vs-dark',
      inherit: true,
      rules: [],
      colors: {
        'editor.background': '#09090b',
        'editor.foreground': '#fafafa',
        'editor.lineHighlightBackground': '#27272a',
        'editorGutter.background': '#09090b00',
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
      onMount={(editor) => { editorRef.current = editor; }}
      onChange={handleEditorChange}
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
        folding: false,
        lineNumbersMinChars: 2,
        bracketPairColorization: {
          enabled: true
        },
      }}
    />
  );
}