# Nutrition Lookup Edge Function

This function acts as a proxy for the USDA FoodData Central API to provide real-time nutrition data for food items. It handles authentication, API key management, and data normalization.

## Security

- **JWT Validation**: The function requires a valid Supabase user JWT in the `Authorization` header.
- **API Key**: The USDA API key is stored as a Supabase secret and never exposed to the client.

## Environment Variables

The following secrets must be set in Supabase:

- `USDA_API_KEY`: Your API key from [USDA FoodData Central](https://fdc.nal.usda.gov/api-guide.html).

To set this in production:
```bash
supabase secrets set USDA_API_KEY=your_key
```

To set this locally for testing:
Create a `.env` file in the `supabase/functions/nutrition-lookup/` directory (do not commit it):
```
USDA_API_KEY=your_key
```

## Usage

Endpoint: `POST /nutrition-lookup`

Headers:
- `Authorization: Bearer <user_jwt>`
- `Content-Type: application/json`

Payload:
```json
{
  "query": "apple"
}
```

Response:
```json
{
  "name": "Apple, raw",
  "calories": 52,
  "protein": 0.3,
  "fat": 0.2,
  "carbs": 13.8,
  "unit": "100g"
}
```

## Data Source
Data is retrieved from the USDA FoodData Central API. Results are normalized to a 100g serving size as provided by the USDA search endpoint.
