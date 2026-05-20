# Nutrition Lookup Edge Function

This function acts as a proxy for external Nutrition APIs (e.g., OpenFoodFacts, Edamam) to avoid exposing API keys on the client side and to handle CORS.

## Environment Variables

The following secrets must be set in Supabase (to be finalized in Phase 4):

- `NUTRITION_API_KEY`: (Optional/Required depending on the provider)
- `NUTRITION_API_ID`: (Optional/Required depending on the provider)

To set these locally for testing:
Create a `.env` file in this directory (do not commit it).

To set these in production:
```bash
supabase secrets set NUTRITION_API_KEY=your_key
```

## Usage

Endpoint: `POST /nutrition-lookup`

Payload:
```json
{
  "query": "apple"
}
```

Response:
```json
{
  "name": "apple",
  "calories": 100,
  "protein": 5,
  "fat": 2,
  "carbs": 15,
  "unit": "100g"
}
```
