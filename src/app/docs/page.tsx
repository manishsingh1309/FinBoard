import { Button } from "@/components/ui/button"

export default function DocsPage() {
  return (
    <main className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold text-balance">FinBoard Docs</h1>
        <Button asChild>
          <a href="/">Back to Dashboard</a>
        </Button>
      </div>

      <section className="space-y-4 max-w-3xl">
        <h2 className="text-lg font-semibold">Quick Start</h2>
        <ol className="list-decimal pl-6 space-y-1 text-sm leading-6">
          <li>Add your API keys in Project Settings: ALPHA_VANTAGE_API_KEY and/or FINNHUB_API_KEY.</li>
          <li>Open the app and click “Add Widget”.</li>
          <li>Choose Provider, Endpoint and Symbol, then click “Test Fetch”.</li>
          <li>In JSON Explorer, click keys to add paths. Map fields on the “Field Mapping” tab.</li>
          <li>Select refresh interval, name the widget, and press “Add Widget”.</li>
          <li>Drag-and-drop widgets to rearrange. Use Export/Import to backup or restore your layout.</li>
          <li>Use the Sun/Moon icon to toggle light/dark mode.</li>
        </ol>

        <h3 className="font-medium mt-6">Screens in the flow</h3>
      

        <h2 className="text-lg font-semibold mt-10">Using Finnhub</h2>
        <p className="text-sm text-muted-foreground">
          Finnhub provides stock, forex and crypto data. Create a free API key at{" "}
          <a className="text-primary hover:underline" href="https://finnhub.io" target="_blank" rel="noreferrer">
            finnhub.io
          </a>
          .
        </p>
        <ol className="list-decimal pl-6 space-y-1 text-sm leading-6">
          <li>Sign up and get your API key from the Finnhub dashboard.</li>
          <li>
            Add it in Project Settings as <span className="font-mono">FINNHUB_API_KEY</span>.
          </li>
          <li>
            Endpoints (base: <span className="font-mono">https://finnhub.io/api/v1</span>):
            <ul className="list-disc pl-6 mt-1">
              <li>
                Quote: <span className="font-mono">GET /quote?symbol=AAPL</span> → single bar {`{ o,h,l,c,t }`}
              </li>
              <li>
                Candles:{" "}
                <span className="font-mono">
                  GET /stock/candle?symbol=AAPL&amp;resolution=D&amp;from=UNIX&amp;to=UNIX
                </span>{" "}
                → arrays {`{ t,o,h,l,c,v }`}
              </li>
              <li>
                Search: <span className="font-mono">GET /search?q=apple</span>
              </li>
            </ul>
          </li>
          <li>
            In “Add Widget”, set Provider to Finnhub and for Candles just type{" "}
            <span className="font-mono">/stock/candle</span>. The form auto-fills{" "}
            <span className="font-mono">resolution=D</span> and a recent <span className="font-mono">from/to</span>{" "}
            window when you click “Test Fetch”. Those same params are saved into the widget so charts refresh correctly.
          </li>
        </ol>

        <div className="flex gap-2 mt-2">
          <Button asChild variant="outline">
            <a href="https://finnhub.io/docs/api" target="_blank" rel="noreferrer">
              Open Finnhub Docs
            </a>
          </Button>
          <Button asChild variant="outline">
            <a href="/" rel="noreferrer">
              Back to Dashboard
            </a>
          </Button>
        </div>

        <h2 className="text-lg font-semibold mt-10">Tips</h2>
        <ul className="list-disc pl-6 text-sm leading-6">
          <li>Rate Limits: If a provider throttles, the widget surfaces the error and pauses until the next cycle.</li>
          <li>
            Field Formats: Use currency/percent/number for cards; tables accept column paths; charts use x/y paths.
          </li>
          <li>Security: API keys are read on the server in /api/proxy; never paste them in the browser.</li>
        </ul>
      </section>
    </main>
  )
}
