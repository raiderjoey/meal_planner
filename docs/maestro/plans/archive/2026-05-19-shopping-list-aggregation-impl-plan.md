---
title: "Shopping List Aggregation Implementation Plan"
design_ref: "conductor/plan.md"
created: "2026-05-19T21:10:00Z"
status: "draft"
total_phases: 5
estimated_files: 10
task_complexity: "medium"
---

# Shopping List Aggregation Implementation Plan

## Plan Overview
- **Total phases**: 5
- **Agents involved**: `data_engineer`, `devops_engineer`, `coder`, `code_reviewer`
- **Estimated effort**: Medium complexity; focuses on server-side aggregation and dynamic UI updates.

## Dependency Graph
```
Stage 1 (Parallel)
Phase 1: Database Implementation <----┐
Phase 2: Infrastructure (Edge Func) <-┘
    |
Stage 2 (Sequential)
Phase 3: Frontend Foundation (Hooks)
    |
Phase 4: UI Implementation
    |
Phase 5: Final Security Audit
```

## Phase 1: Database Implementation (Schema + RPC)
### Objective
Create the ad-hoc items table and the core aggregation RPC logic.
### Agent: data_engineer
### Parallel: Yes (with Phase 2)
### Files to Create
- `supabase/migrations/20260519000001_shopping_list_schema.sql`
### Implementation Details
- Table `ad_hoc_shopping_items`: Multi-tenant with `household_id`.
- RPC `get_shopping_list(start_date, end_date)`: Aggregates scaled requirements from meals and adds ad-hoc items, subtracting pantry stock.
- RPC `resolve_shopping_item`: Atomic pantry increment + ad-hoc resolution.
### Validation
- Verify RLS policies.
- SQL tests for aggregation math.

## Phase 2: Infrastructure (Edge Functions)
### Objective
Set up the Nutrition API proxy.
### Agent: devops_engineer
### Parallel: Yes (with Phase 1)
### Files to Create
- `supabase/functions/nutrition-lookup/index.ts`
### Implementation Details
- Deno Edge Function using secrets for API keys.
- Local caching for search results.
### Validation
- `supabase functions serve` local test.

## Phase 3: Frontend Foundation (Hooks & State)
### Objective
Integrate RPCs and Edge Functions into the React data layer.
### Agent: coder
### Parallel: No
### Files to Modify
- `src/types/database.ts`
- `src/lib/supabase.ts`
### Files to Create
- `src/hooks/useShoppingList.ts`
### Implementation Details
- Custom hook for fetching the rolling window.
- Optimistic UI logic for check-offs.
### Validation
- Vitest for the hook logic.

## Phase 4: UI Implementation
### Objective
Build the Shopping List view and interaction components.
### Agent: coder
### Parallel: No
### Files to Create
- `src/pages/ShoppingList/ShoppingList.tsx`
- `src/components/ShoppingList/AdHocEntry.tsx`
### Validation
- React Testing Library verification.

## Phase 5: Final Security Audit
### Objective
Final verification of RLS and race condition safety.
### Agent: code_reviewer
### Parallel: No
### Validation
- Security Report pass/fail.

---

## Execution Profile
- Total phases: 5
- Parallelizable phases: 2 (in 1 batch)
- Sequential-only phases: 3
- Estimated parallel wall time: 4 stages
- Estimated sequential wall time: 5 stages
