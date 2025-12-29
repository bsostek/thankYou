import { useState } from "react";
import { OrderInput } from "./OrderInput";
import { OrderDisplay } from "./OrderDisplay";
import { parsePhoneOrder } from "./openaiService";
import { calculateOrderTotal, generateReadbackScript } from "./utils";
import type { ParsedOrder } from "./types";

function App() {
  const [parsedOrder, setParsedOrder] = useState<ParsedOrder | null>(null);
  const [readbackScript, setReadbackScript] = useState<string>("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleOrderSubmit = async (transcript: string) => {
    setIsProcessing(true);
    setError(null);

    try {
      const parsedResponse = await parsePhoneOrder(transcript);
      const order = calculateOrderTotal(parsedResponse);
      const script = generateReadbackScript(order);

      setParsedOrder(order);
      setReadbackScript(script);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "An error occurred while processing the order"
      );
      console.error("Error processing order:", err);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-1">TYSM</h1>
          <p className="text-gray-600">
            Restaurant phone order assistant powered by AI
          </p>
        </header>

        {/* Error Message */}
        {error && (
          <div className="mb-6 bg-red-100 border-l-4 border-red-500 p-4">
            <p className="font-bold text-red-800">Error</p>
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column - Input */}
          <OrderInput
            onSubmit={handleOrderSubmit}
            isProcessing={isProcessing}
          />

          {/* Right Column - Output */}
          <div>
            {parsedOrder ? (
              <OrderDisplay
                order={parsedOrder}
                readbackScript={readbackScript}
              />
            ) : (
              <div className="bg-white border border-gray-300 p-8 text-center">
                <h3 className="text-lg font-semibold text-gray-700 mb-2">
                  No Order Yet
                </h3>
                <p className="text-gray-600">
                  Enter or record a phone order to see the results
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <footer className="mt-12 text-sm text-gray-600 border-t border-gray-300 pt-6">
          <p>Brian Sostek</p>
        </footer>
      </div>
    </div>
  );
}

export default App;
