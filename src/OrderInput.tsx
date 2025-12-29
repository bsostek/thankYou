/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState } from "react";

interface OrderInputProps {
  onSubmit: (transcript: string) => void;
  isProcessing: boolean;
}

export const OrderInput: React.FC<OrderInputProps> = ({
  onSubmit,
  isProcessing,
}) => {
  const [transcript, setTranscript] = useState("");
  const [isRecording, setIsRecording] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (transcript.trim()) {
      onSubmit(transcript);
    }
  };

  const handleStartRecording = () => {
    // Check if browser supports Web Speech API
    const SpeechRecognition =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert(
        "Speech recognition is not supported in your browser. Please type the order instead."
      );
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = "en-US";

    recognition.onstart = () => {
      setIsRecording(true);
    };

    recognition.onresult = (event: any) => {
      const speechToText = event.results[0][0].transcript;
      setTranscript(speechToText);
      setIsRecording(false);
    };

    recognition.onerror = () => {
      setIsRecording(false);
      alert("Error during recording. Please try typing instead.");
    };

    recognition.onend = () => {
      setIsRecording(false);
    };

    recognition.start();
  };

  const sampleOrders = [
    "Hi, I'd like to order two large pepperoni pizzas, one with extra cheese and one without mushrooms. Also, can I get an order of buffalo wings with medium sauce? And a large Coke.",
    "Yeah, can I get a medium margherita pizza, well done, and some garlic breadsticks with extra marinara sauce?",
    "I'll take a small supreme pizza, no onions, and a medium lemonade. Oh, and throw in some chocolate chip cookies too.",
  ];

  return (
    <div className="bg-white border border-gray-300 p-6">
      <h2 className="text-xl font-bold mb-4 text-gray-900">
        Phone Order Input
      </h2>

      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label
            htmlFor="transcript"
            className="block font-medium text-gray-700 mb-2"
          >
            Customer Order
          </label>
          <textarea
            id="transcript"
            rows={6}
            className="w-full px-3 py-2 border border-gray-300 focus:border-blue-500 focus:outline-none"
            placeholder='Example: "Hi, Id like to order two large pepperoni pizzas..."'
            value={transcript}
            onChange={(e) => setTranscript(e.target.value)}
            disabled={isProcessing || isRecording}
          />
        </div>

        <div className="flex gap-3 mb-4">
          <button
            type="button"
            onClick={handleStartRecording}
            disabled={isProcessing || isRecording}
            className="flex-1 py-2 px-4 border border-gray-400 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isRecording ? "Recording..." : "Record Order"}
          </button>

          <button
            type="submit"
            disabled={isProcessing || !transcript.trim() || isRecording}
            className="flex-1 bg-blue-600 text-white py-2 px-4 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isProcessing ? "Processing..." : "Parse Order"}
          </button>
        </div>
      </form>

      <div className="border-t border-gray-200 pt-4">
        <p className="font-medium text-gray-700 mb-2">Sample Orders</p>
        <div className="space-y-2">
          {sampleOrders.map((sample, index) => (
            <button
              key={index}
              onClick={() => setTranscript(sample)}
              disabled={isProcessing || isRecording}
              className="w-full text-left p-3 text-sm border border-gray-300 hover:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span className="font-semibold text-gray-900">
                Sample {index + 1}
              </span>
              <br />
              <span className="text-gray-600">
                {sample.substring(0, 80)}...
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
