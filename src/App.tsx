import { useEffect, useState } from 'react'
import { usePyodide } from './hooks/usePyodide'
import MonacoEditor from '@monaco-editor/react'

export default function App() {
  const { pyodide, loading } = usePyodide()
  const [code, setCode] = useState(
    'arr = [1,1,2,2,3]\narr = list(set(arr))\nfor i in range(len(arr)):\n    arr[i] += 1\nprint(arr)'
  )
  const [output, setOutput] = useState('')


  // Initialize a Python helper to capture stdout & errors once Pyodide is ready
  useEffect(() => {
    if (!pyodide) return
    pyodide.runPython(`\ntry:\n    _exec_and_capture\nexcept NameError:\n    import sys, io, traceback, json\n    def _exec_and_capture(source:str):\n        buf = io.StringIO()\n        stdout = sys.stdout\n        sys.stdout = buf\n        error = None\n        try:\n            compiled = compile(source, '<input>', 'exec')\n            exec(compiled, globals())\n        except Exception as e:\n            error = traceback.format_exc()\n        finally:\n            sys.stdout = stdout\n        return {'stdout': buf.getvalue(), 'error': error}\n`)
  }, [pyodide])

  async function runCode() {
    if (!pyodide) return
    try {
      const encoded = JSON.stringify(code)
      const jsonResult = await pyodide.runPythonAsync(
        `import json\njson.dumps(_exec_and_capture(${encoded}))`
      )
      const { stdout, error } = JSON.parse(jsonResult as string)
      if (error) {
        setOutput((stdout || '') + (stdout ? '\n' : '') + error)
      } else {
        setOutput(stdout || '(no output)')
      }
    } catch (err) {
      setOutput(String(err))
    }
  }

  return (
    <div className="flex flex-col md:flex-row h-full w-full bg-neutral-900 text-neutral-200">
      {/* Editor Pane */}
      <div className="flex flex-col h-1/2 md:h-full md:basis-1/2 min-h-0 border-b md:border-b-0 md:border-r border-neutral-700">
        <div className="flex items-center justify-between px-4 py-2.5 border-b border-neutral-700 bg-neutral-850/60">
          <h2 className="font-semibold text-neutral-100">Python Editor</h2>
        </div>
        <div className="flex-1 min-h-0">
          {/* Needed so Monaco gets height inside flex column */}
          <MonacoEditor
            height="100%"
            defaultLanguage="python"
            value={code}
            theme="vs-dark"
            onChange={(value) => setCode(value ?? '')}
            options={{
              minimap: { enabled: false },
              fontSize: 16,
              scrollBeyondLastLine: false,
              scrollbar: {
                vertical: 'hidden',
                horizontal: 'hidden',
                handleMouseWheel: false,
                verticalScrollbarSize: 0,
                horizontalScrollbarSize: 0,
              },
              overviewRulerLanes: 0,
            }}
          />
        </div>
      </div>

      {/* Output Pane */}
      <div className="flex flex-col h-1/2 md:h-full md:basis-1/2 min-h-0">
        <div className="flex items-center justify-between gap-2 px-4 py-2 border-b border-neutral-700 bg-neutral-850/60">
          <h2 className="font-semibold text-neutral-100">Output</h2>
          <div className="flex items-center gap-2">
            <button
              onClick={runCode}
              disabled={loading}
              className="px-3 py-1.5 text-xs rounded shadow-sm disabled:opacity-40 disabled:cursor-not-allowed bg-blue-600 hover:bg-blue-500 text-white"
            >
              Run
            </button>
            <button
              onClick={() => setOutput('')}
              disabled={loading}
              className="text-xs px-2 py-1 rounded border border-neutral-600 hover:bg-neutral-700 text-neutral-300 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Clear
            </button>
          </div>
        </div>
        <div className="flex-1 m-0 p-4 overflow-auto text-left bg-neutral-950 text-sm whitespace-pre-wrap text-neutral-100 relative">
          {loading ? (
            <div className="h-full w-full flex items-center justify-center">
              <div className="flex flex-col items-center gap-3">
                <div className="h-12 w-12 rounded-full border-4 border-neutral-700 border-t-blue-500 animate-spin" />
                <p className="text-sm text-neutral-400">
                  Loading Python runtime...
                </p>
              </div>
            </div>
          ) : (
            <pre className="m-0 whitespace-pre-wrap">{output}</pre>
          )}
        </div>
      </div>
    </div>
  )
}
