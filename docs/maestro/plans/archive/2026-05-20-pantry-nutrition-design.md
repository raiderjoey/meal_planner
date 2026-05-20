---
title: "Advanced Pantry Management & Nutrition API"
created: "2026-05-20T00:00:00Z"
status: "approved"
authors: ["TechLead", "User"]
type: "design"
design_depth: "standard"
task_complexity: "medium"
---

# Advanced Pantry Management & Nutrition API Design Document

## Problem Statement
The HarvestPlan application currently generates shopping lists and adds purchased items to the pantry, but lacks a dedicated interface for users to manually manage, categorize, and monitor their pantry inventory. Furthermore, the existing Edge Function for nutrition lookups returns hardcoded mock data, preventing users from retrieving real nutritional information for standalone items. We need an Advanced Pantry Management UI and a secure, production-ready Edge Function integrated with the USDA FoodData Central API.

## Requirements

### Functional Requirements
1. **REQ-1**: The system must provide a dedicated Pantry Management UI to view, edit, and manually add inventory items.
2. **REQ-2**: The Pantry UI must support item categorization (e.g., Produce, Dairy, Dry Goods) and provide visual alerts for low-stock items.
3. **REQ-3**: The `nutrition-lookup` Edge Function must integrate with the USDA FoodData Central API to return real nutritional data for queried items.
4. **REQ-4**: The Edge Function must validate the user's JWT to ensure only authenticated HarvestPlan users can trigger external API calls.

### Non-Functional Requirements
1. **REQ-5**: The Edge Function should implement a basic caching layer (e.g., storing recent searches) to minimize redundant external API calls and reduce latency.

### Constraints
- Must adhere to Supabase RLS policies for household data isolation in all new UI queries.
- Must securely manage the USDA API key via Supabase Secrets.

## Approach

### Selected Approach
**USDA API Proxy with Categorized Pantry UI**
We will update the existing `nutrition-lookup` Edge Function to parse the incoming JWT, instantiate an authenticated Supabase client to verify the user, and proxy the search query to the USDA FoodData Central API using securely stored secrets. On the frontend, we will build a `PantryManagement` page that fetches `pantry_items`, grouping them by category. The UI will implement client-side filtering, sorting, and low-stock highlighting based on new database columns (`category` and `low_stock_threshold`).

### Alternatives Considered
#### OpenFoodFacts Integration
- **Description**: Use OpenFoodFacts instead of USDA.
- **Pros**: Better for branded/barcoded products.
- **Cons**: Less structured/authoritative for generic produce and raw ingredients (which are common in recipe planning).
- **Rejected Because**: User specifically selected USDA FoodData Central for its authoritative data on generic ingredients.

#### Edamam / Spoonacular Integration
- **Description**: Use commercial natural language parsing APIs.
- **Pros**: Extremely robust parsing for complex ingredient strings.
- **Cons**: Restrictive free tiers could cause the feature to break under moderate household usage without a paid plan.
- **Rejected Because**: The pricing/limits risk disruption to the user experience compared to the free USDA offering.

### Decision Matrix
| Criterion | Weight | USDA API | OpenFoodFacts | Edamam/Spoonacular |
|-----------|--------|----------|---------------|--------------------|
| Cost / Limits | 40% | 5: Free, generous limits | 5: Free | 2: Restrictive free tier |
| Data Quality (Generic) | 30% | 5: Authoritative | 3: Crowdsourced | 5: Highly accurate |
| Complexity | 30% | 4: Standard REST | 4: Standard REST | 3: Complex NLP parsing |
| **Weighted Total**| | **4.7** | **4.1** | **3.2** |

## Architecture

### Component Diagram
```
[Pantry UI Component] --> [Supabase Auth JWT]
      |                           |
      v                           v
[Supabase JS Client] --> [Edge Function: nutrition-lookup]
      |                           | (Validates JWT)
      v                           v
[PostgreSQL DB]          [USDA FoodData API]
```

### Key Interfaces
```typescript
// Edge Function Request/Response
interface LookupRequest { query: string; }
interface LookupResponse { name: string; nutrition: Nutrition; }

// Pantry Item Extension (for UI categories/alerts)
interface PantryItemWithDetails extends PantryItem {
  ingredients: { name: string; category?: string; };
  low_stock_threshold?: number;
  isLowStock: boolean; // Computed client-side based on threshold
}
```

## Agent Team
| Phase | Agent(s) | Parallel | Deliverables |
|-------|----------|----------|--------------|
| 1     | `data_engineer` | No | Schema migrations for `category` and `low_stock_threshold`. |
| 2     | `devops_engineer` | Yes | JWT validation & USDA API integration in the Edge Function. |
| 3     | `ux_designer` | Yes | Wireframes and layout specifications for the Pantry UI. |
| 4     | `coder` | No | Implementation of the Pantry UI (React components, hooks) based on wireframes. |
| 5     | `security_engineer` | No | Final double-audit of Edge Function security and UI RLS compliance. |

## Risk Assessment
| Risk | Severity | Likelihood | Mitigation |
|------|----------|------------|------------|
| **Edge Function Unauthorized Access** | HIGH | LOW | The Edge Function will strictly validate the `Authorization` header JWT against the Supabase Auth instance before proceeding. |
| **USDA API Structure Changes** | MEDIUM | LOW | Abstract the USDA response mapping into a dedicated parsing function so it can be easily updated if their schema changes. |
| **UI Performance with Large Pantry** | LOW | MEDIUM | Implement virtualization or pagination if the pantry list grows extremely large, though client-side grouping should suffice for typical households. |
