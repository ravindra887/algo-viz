import { useState } from 'react'
import { usePyodide } from './hooks/usePyodide'
import MonacoEditor from '@monaco-editor/react'

export default function App() {
  const { pyodide, loading } = usePyodide()
  const [code, setCode] = useState(
    'arr = [1,1,2,2,3]\narr = list(set(arr))\narr'
  )
  const [output, setOutput] = useState('')

  async function runCode() {
    if (!pyodide) return
    try {
      const result = await pyodide.runPythonAsync(code)
      setOutput(JSON.stringify(result))
    } catch (err) {
      setOutput(String(err))
    }
  }

  if (loading) return <p>Loading Pyodide...</p>

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
              className="bg-blue-600 hover:bg-blue-500 text-white px-3 py-1.5 text-xs rounded shadow-sm"
            >
              Run
            </button>
            <button
              onClick={() => setOutput('')}
              className="text-xs px-2 py-1 rounded border border-neutral-600 hover:bg-neutral-700 text-neutral-300"
            >
              Clear
            </button>
          </div>
        </div>
        <pre className="flex-1 m-0 p-4 overflow-auto text-left bg-neutral-950 text-sm whitespace-pre-wrap text-neutral-100">
          {output}
        </pre>
      </div>
    </div>
  )
}
