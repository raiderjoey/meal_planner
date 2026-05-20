# UX Design Specification: Pantry Management UI

## 1. Overview
The Pantry Management UI provides a centralized interface for households to monitor their current inventory, manage stock levels, and manually add items. It bridges the gap between the Shopping List (purchased items) and Meal Planning (consumed items).

## 2. Information Architecture

### 2.1. Item Grouping
Items are grouped by **Category** to facilitate quick scanning.
- **Produce**: Fresh fruits and vegetables.
- **Dairy & Eggs**: Milk, cheese, yogurt, eggs.
- **Meat & Seafood**: Poultry, beef, fish.
- **Dry Goods & Grains**: Pasta, rice, flour, canned goods.
- **Spices & Oils**: Seasonings, oils, vinegars.
- **Frozen**: Frozen meals, vegetables, fruits.
- **Other**: Miscellaneous items.

### 2.2. Data Fields
Each pantry item displays:
- **Name**: Ingredient name.
- **Quantity**: Current amount (e.g., "2 lbs", "1 box").
- **Category**: Visual tag/icon.
- **Status**: Low stock indicator (if applicable).

## 3. Layout & Components

### 3.1. Header Section
- **Title**: "Pantry Inventory" (Headline LG).
- **Search Bar**: Real-time filtering by item name or category.
- **Add Item Button**: Primary action button (Green, rounded-xl).

### 3.2. Low Stock Alerts (The "Critical" Zone)
- **Visual**: A banner or a dedicated top section using `error-container` (#ffdad6) background.
- **Logic**: Displays items where `quantity <= low_stock_threshold`.
- **Action**: Quick "Add to Shopping List" button for each alert.

### 3.3. Inventory Grid (Bento-style)
- **Desktop**: Multi-column grid using `gutter` (24px) spacing.
- **Cards**: `surface-container-lowest` (#ffffff) background, `rounded-xl` (0.75rem), `shadow-sm`.
- **Category Headers**: Include an icon (Material Symbols) and a count of items.

## 4. Interactions

### 4.1. "Add Item" Modal Flow
1.  **Trigger**: Click "Add Item" FAB or Header button.
2.  **Search/Lookup**:
    -   User types item name.
    -   System triggers `nutrition-lookup` Edge Function.
    -   Results show "Real Food" data (USDA) with nutrition previews.
3.  **Configuration**:
    -   Select Category (Dropdown).
    -   Set Initial Quantity.
    -   Set Low Stock Threshold (Optional).
4.  **Confirmation**: "Add to Pantry" (Primary Green).

### 4.2. Inventory Management
- **Quick Adjust**: +/- buttons for quantity directly on the card.
- **Edit**: Click item name to open a side drawer or modal for full details (including nutrition).
- **Delete**: Swipe (mobile) or trash icon (desktop) with confirmation.

## 5. Visual Language

### 5.1. Color Palette
- **Primary (Green)**: `#4c6151` - Primary buttons, active states.
- **Secondary (Brown)**: `#7b5737` - Secondary accents, category icons.
- **Surface (Cream)**: `#f8faf9` - Page background.
- **Alert (Red)**: `#ba1a1a` - Low stock text.
- **Alert Container**: `#ffdad6` - Low stock background.

### 5.2. Typography
- **Headlines**: Quicksand (Bold/Semi-bold).
- **Body/Labels**: Inter (Regular/Semi-bold).

### 5.3. Icons (Material Symbols Outlined)
- **Produce**: `eco`
- **Dairy**: `egg`
- **Meat**: `set_meal`
- **Dry Goods**: `bakery_dining`
- **Low Stock**: `warning`

## 6. Responsive Design

### 6.1. Desktop (>= 768px)
- 12-column grid layout.
- Categories span 4 or 8 columns depending on item count.
- Sidebar for "Low Stock" summary if space permits.

### 6.2. Mobile (< 768px)
- Single column list.
- Sticky "Add Item" FAB (Floating Action Button) at bottom-right.
- Collapsible category sections to save vertical space.
- Horizontal scroll for "Low Stock" alerts at the top.
