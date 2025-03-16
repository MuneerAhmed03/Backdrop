'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import Editor, { OnChange, Monaco } from '@monaco-editor/react'; 
import { useDebounceHook } from '../../lib/useDebouncer';

interface CodeEditorProps {
  value: string;
  onChange: (value: string) => void;
  onValidationChange: (result: { isValid: boolean; error?: { message: string; line: number } }) => void;
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

export function CodeEditor({ value, onChange, onValidationChange }: CodeEditorProps) {
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

    onValidationChange(result);

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

  const handleEditorChange: OnChange = (value = '') => {
    onChange(value);
    debouncedValidation(value);
  };

  const handleEditorWillMount = (monacoInstance: Monaco) => {
    monacoRef.current = monacoInstance; // Store 
    monacoInstance.editor.defineTheme('backdrop-dark', {
      base: 'vs-dark',
      inherit: true,
      rules: [
        { token: 'comment', foreground: '506685', fontStyle: 'italic' },
        { token: 'keyword', foreground: 'c792ea' },
        { token: 'string', foreground: '89ca78' },
        { token: 'number', foreground: 'f78c6c' },
        { token: 'operator', foreground: '89ddff' },
        { token: 'function', foreground: '82aaff' },
        { token: 'type', foreground: 'ffcb6b' },
        { token: 'class', foreground: 'ffcb6b' },
        { token: 'variable', foreground: 'bfc7d5' },
        { token: 'parameter', foreground: 'f78c6c' }
      ],
      colors: {
        'editor.background': '#030917',
        'editor.foreground': '#bfc7d5',
        'editor.lineHighlightBackground': '#0a1428',
        'editorGutter.background': '#03091700',
        'editorGutter.modifiedBackground': '#03091700',
        'editorGutter.addedBackground': '#03091700',
        'editorGutter.deletedBackground': '#03091700',
        'editor.selectionBackground': '#162033',
        'editor.inactiveSelectionBackground': '#0a1428',
        'editorLineNumber.foreground': '#3b4b66',
        'editorLineNumber.activeForeground': '#5b6b86',
        'editor.selectionHighlightBackground': '#162033',
        'editor.wordHighlightBackground': '#162033',
        'editor.wordHighlightStrongBackground': '#162033',
        'editorCursor.foreground': '#bfc7d5',
        'editorWhitespace.foreground': '#0a1428',
        'editorIndentGuide.background': '#0a1428',
        'editorIndentGuide.activeBackground': '#162033',
        'editor.findMatchBackground': '#162033',
        'editor.findMatchHighlightBackground': '#0a142880',
        'editorOverviewRuler.border': '#03091700',
        'scrollbarSlider.background': '#0a142880',
        'scrollbarSlider.hoverBackground': '#162033aa',
        'scrollbarSlider.activeBackground': '#162033cc'
      }
    });
  };

  return (
    <Editor
      height="100%"
      className="focus:outline-none"
      defaultLanguage="python"
      theme="backdrop-dark"
      value={value}
      onMount={(editor) => { editorRef.current = editor; }}
      onChange={handleEditorChange}
      beforeMount={handleEditorWillMount}
      options={{
        wordWrap: "on",
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