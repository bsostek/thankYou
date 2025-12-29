// TypeScript types for the OrderEase application

export interface MenuItem {
  id: string;
  name: string;
  category: "pizza" | "appetizer" | "drink" | "dessert" | "chinese";
  basePrice: number;
  sizes?: {
    small: number;
    medium: number;
    large: number;
  };
  customizations?: string[];
}

export interface OrderItem {
  menuItem: MenuItem;
  quantity: number;
  size?: "small" | "medium" | "large";
  modifications: string[];
  specialInstructions?: string;
  price: number;
}

export interface ParsedOrder {
  items: OrderItem[];
  subtotal: number;
  tax: number;
  total: number;
  customerName?: string;
  phoneNumber?: string;
  ambiguities?: string[];
  suggestedUpsells?: string[];
}

export interface OrderInputData {
  rawTranscript: string;
  timestamp: Date;
}
