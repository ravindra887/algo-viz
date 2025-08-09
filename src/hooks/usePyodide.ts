import { useEffect, useState } from 'react'
import * as pyo from 'pyodide'

export function usePyodide() {
  const [pyodide, setPyodide] = useState<pyo.PyodideAPI>()
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    (async () => {
      setLoading(true)
      const pyodideModule = await pyo.loadPyodide({
        indexURL: 'https://cdn.jsdelivr.net/pyodide/v0.28.1/full/',
      })
      setPyodide(pyodideModule)
      setLoading(false)
    })()
  }, [])

  return { pyodide, loading }
}
