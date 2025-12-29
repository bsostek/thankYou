import React from "react";
import type { ParsedOrder } from "./types";

interface OrderDisplayProps {
  order: ParsedOrder;
  readbackScript: string;
}

export const OrderDisplay: React.FC<OrderDisplayProps> = ({
  order,
  readbackScript,
}) => {
  return (
    <div className="bg-white border border-gray-300 p-6">
      <h2 className="text-xl font-bold text-gray-900 mb-6">Parsed Order</h2>

      {/* Order Items */}
      <div className="mb-6">
        <h3 className="font-semibold text-gray-900 mb-3">Items</h3>
        <div className="space-y-3">
          {order.items.map((item, index) => (
            <div key={index} className="border border-gray-300 p-3">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <p className="font-medium text-gray-900">
                    {item.quantity}x {item.size ? `${item.size} ` : ""}
                    {item.menuItem.name}
                  </p>
                  {item.modifications.length > 0 && (
                    <p className="text-sm text-gray-600 mt-1">
                      Modifications: {item.modifications.join(", ")}
                    </p>
                  )}
                  {item.specialInstructions && (
                    <p className="text-sm text-gray-700 mt-1">
                      Note: {item.specialInstructions}
                    </p>
                  )}
                </div>
                <p className="font-semibold text-gray-900">
                  ${item.price.toFixed(2)}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Pricing Summary */}
      <div className="border-t border-gray-300 pt-4 mb-6">
        <div className="space-y-1">
          <div className="flex justify-between text-gray-700">
            <span>Subtotal</span>
            <span>${order.subtotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-gray-700">
            <span>Tax (8%)</span>
            <span>${order.tax.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-lg font-bold text-gray-900 border-t border-gray-300 pt-2 mt-2">
            <span>Total</span>
            <span>${order.total.toFixed(2)}</span>
          </div>
        </div>
      </div>

      {/* Customer Info */}
      {(order.customerName || order.phoneNumber) && (
        <div className="border-t border-gray-300 pt-4 mb-6">
          <h3 className="font-semibold text-gray-900 mb-2">
            Customer Information
          </h3>
          {order.customerName && (
            <p className="text-gray-700">
              <span className="font-medium">Name:</span> {order.customerName}
            </p>
          )}
          {order.phoneNumber && (
            <p className="text-gray-700">
              <span className="font-medium">Phone:</span> {order.phoneNumber}
            </p>
          )}
        </div>
      )}

      {/* Ambiguities */}
      {order.ambiguities && order.ambiguities.length > 0 && (
        <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 mb-6">
          <h3 className="font-semibold text-yellow-800 mb-2">
            Needs Clarification
          </h3>
          <ul className="list-disc list-inside space-y-1">
            {order.ambiguities.map((item, index) => (
              <li key={index} className="text-yellow-900">
                {item}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Upsell Suggestions */}
      {order.suggestedUpsells && order.suggestedUpsells.length > 0 && (
        <div className="bg-green-50 border-l-4 border-green-500 p-4 mb-6">
          <h3 className="font-semibold text-green-800 mb-2">
            Upsell Suggestions
          </h3>
          <ul className="list-disc list-inside space-y-1">
            {order.suggestedUpsells.map((item, index) => (
              <li key={index} className="text-green-900">
                {item}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Readback Script */}
      <div className="border-t border-gray-300 pt-4">
        <h3 className="font-semibold text-gray-900 mb-2">
          Confirmation Script
        </h3>
        <div className="bg-gray-100 p-4 border border-gray-300">
          <pre className="whitespace-pre-wrap font-sans text-sm text-gray-800">
            {readbackScript}
          </pre>
        </div>
      </div>
    </div>
  );
};
