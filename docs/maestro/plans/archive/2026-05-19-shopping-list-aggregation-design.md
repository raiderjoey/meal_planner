---
title: "Shopping List Aggregation"
created: "2026-05-19T00:00:00Z"
status: "approved"
authors: ["TechLead", "User"]
type: "design"
design_depth: "standard"
task_complexity: "medium"
---

# Shopping List Aggregation Design Document

## Problem Statement
The HarvestPlan application needs a dynamic Shopping List that aggregates required ingredients from upcoming meal plans, scales them by household portion multipliers, and subtracts what is already available in the pantry. When items are purchased, they must seamlessly integrate back into the pantry inventory. Additionally, users need a way to quickly look up nutrition data for standalone items via an external API to avoid manual data entry bottlenecks.

## Requirements

### Functional Requirements
1. **REQ-1**: The system must generate a rolling-window shopping list by aggregating `recipe_ingredients` across all upcoming `meal_plans`.
2. **REQ-2**: Ingredient quantities must be scaled by the sum of `portion_multiplier`s from the `meal_participants` table.
3. **REQ-3**: The shopping list must subtract quantities of ingredients that already exist in the `pantry_items` table.
4. **REQ-4**: Users can manually add ad-hoc items directly to the shopping list (independent of meal plans).
5. **REQ-5**: Checking off an item on the shopping list (whether aggregated from meals or added ad-hoc) must automatically add or increment its quantity in the `pantry_items` table.
6. **REQ-6**: The system must provide a Supabase Edge Function to securely proxy requests to a third-party Nutrition API (e.g., OpenFoodFacts) for standalone item lookups.

### Non-Functional Requirements
1. **REQ-7**: Aggregation must happen server-side via a Database RPC to minimize client payload and ensure fast response times.

### Constraints
- Must strictly adhere to existing Supabase RLS policies to ensure household data isolation.

## Approach

### Selected Approach
**Database-Driven Aggregation with Ad-Hoc Table**
We will create a Supabase Database Function (RPC) named `get_shopping_list(start_date, end_date)` that performs the heavy lifting. It will sum up scaled ingredients from `meal_plans`, subtract existing `pantry_items`, and `UNION` the result with a new `ad_hoc_shopping_items` table. Checking off an item will trigger an RPC that increments the `pantry_items` table and marks any ad-hoc item as resolved. For the Nutrition API, we will deploy a Supabase Edge Function to securely proxy requests.
*Rationale: Pushing the JOINs and aggregation to PostgreSQL guarantees minimal data transfer to the client and perfectly solves the rolling window requirement without managing complex local state.*

### Alternatives Considered
#### Client-Side Aggregation
- **Description**: Fetch raw data and aggregate in TypeScript.
- **Pros**: Keeps logic out of the database; highly testable.
- **Cons**: Requires massive payload downloads; taxes the client device.
- **Rejected Because**: The relational complexity makes client-side joining prohibitively slow for mobile users.

#### Edge Function Aggregation
- **Description**: Use an Edge Function to fetch raw data and aggregate in TypeScript.
- **Pros**: Offloads work from client; logic remains in TypeScript.
- **Cons**: Adds cold-start latency and requires pulling large raw datasets.
- **Rejected Because**: Database RPCs are significantly faster and more memory-efficient for relational math.

### Decision Matrix
| Criterion | Weight | Database-Driven (RPC) | Client-Side (TS) | Edge Function (TS) |
|-----------|--------|-----------------------|------------------|--------------------|
| Performance | 40% | 5: DB optimized for joins | 2: High latency/payload | 3: Extra network hop |
| Maintainability | 30% | 3: SQL is harder to test | 5: Pure TS logic | 4: TS logic on server |
| Real-time Sync | 30% | 5: Direct DB data access | 2: Hard to keep fresh | 3: Extra cache needed |
| **Weighted Total**| | **4.4** | **2.9** | **3.3** |

## Risk Assessment
| Risk | Severity | Likelihood | Mitigation |
|------|----------|------------|------------|
| **Complex RPC Logic** | HIGH | HIGH | Use CTEs, comprehensive comments, and write dedicated database unit tests. |
| **External API Rate Limits** | MEDIUM | MEDIUM | Implement a caching layer within the Edge Function to store recent searches. |
| **Pantry Stock Race Conditions** | MEDIUM | LOW | Use a strict atomic database operation (`UPDATE pantry_items SET quantity = quantity + X`). |
