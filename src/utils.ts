import type { ParsedOrder, OrderItem } from "./types";
import { MENU_DATA, TAX_RATE } from "./menuData";
import type { ParseOrderResponse } from "./openaiService";

export function calculateOrderTotal(
  parsedResponse: ParseOrderResponse
): ParsedOrder {
  const items: OrderItem[] = [];
  const notFoundItems: string[] = [];

  parsedResponse.items.forEach((item) => {
    // Find matching menu item - exact match first
    let menuItem = MENU_DATA.find(
      (m) => m.name.toLowerCase() === item.itemName?.toLowerCase()
    );

    // If no exact match, try fuzzy matching
    if (!menuItem) {
      const itemNameLower = item.itemName?.toLowerCase() || "";
      menuItem = MENU_DATA.find(
        (m) =>
          m.name.toLowerCase().includes(itemNameLower) ||
          itemNameLower.includes(m.name.toLowerCase())
      );
    }

    if (!menuItem) {
      // Item not found - skip it and add to not found list
      notFoundItems.push(item.itemName || "unknown item");
      console.warn(`Menu item not found and skipped: "${item.itemName}"`);
      return;
    }

    // Calculate price
    let price = 0;
    let actualSize = item.size as "small" | "medium" | "large" | undefined;

    if (menuItem.sizes) {
      // If item has sizes but no size specified, default to medium
      if (!item.size) {
        actualSize = "medium";
      }
      price = menuItem.sizes[actualSize as keyof typeof menuItem.sizes] || 0;
    } else {
      price = menuItem.basePrice;
    }

    items.push({
      menuItem,
      quantity: item.quantity,
      size: actualSize,
      modifications: item.modifications,
      specialInstructions: item.specialInstructions,
      price: price * item.quantity,
    });
  });

  const subtotal = items.reduce((sum, item) => sum + item.price, 0);
  const tax = subtotal * TAX_RATE;
  const total = subtotal + tax;

  // Add not found items to ambiguities
  const allAmbiguities = [
    ...(parsedResponse.ambiguities || []),
    ...notFoundItems.map(
      (item) => `⚠️ Item not on menu: "${item}" - Please verify this order`
    ),
  ];

  return {
    items,
    subtotal,
    tax,
    total,
    customerName: parsedResponse.customerInfo?.name,
    phoneNumber: parsedResponse.customerInfo?.phone,
    ambiguities: allAmbiguities,
    suggestedUpsells: parsedResponse.suggestedUpsells,
  };
}

export function generateReadbackScript(order: ParsedOrder): string {
  let script = "Okay, let me confirm your order:\n\n";

  order.items.forEach((item, index) => {
    const sizeStr = item.size ? `${item.size} ` : "";
    const qtyStr = item.quantity > 1 ? `${item.quantity} ` : "";
    script += `${index + 1}. ${qtyStr}${sizeStr}${item.menuItem.name}`;

    if (item.modifications.length > 0) {
      script += ` (${item.modifications.join(", ")})`;
    }

    if (item.specialInstructions) {
      script += ` - ${item.specialInstructions}`;
    }

    script += `\n`;
  });

  script += `\nSubtotal: $${order.subtotal.toFixed(2)}`;
  script += `\nTax: $${order.tax.toFixed(2)}`;
  script += `\nTotal: $${order.total.toFixed(2)}`;

  if (order.customerName) {
    script += `\n\nName: ${order.customerName}`;
  }

  if (order.phoneNumber) {
    script += `\nPhone: ${order.phoneNumber}`;
  }

  script += "\n\nIs that correct?";

  return script;
}
