# API Documentation

The Hospital Bill Calculator provides a comprehensive REST API for managing medical items, bills, and analytics.

## Base URL

- **Development**: `http://localhost:5000/api`
- **Production**: `https://your-deployed-app.com/api`

## Authentication

Currently, the API does not require authentication. For production deployments, consider implementing authentication and authorization.

## Medical Items API

### Get All Medical Items

```http
GET /api/medical-items
```

**Response:**
```json
[
  {
    "id": 1,
    "category": "Laboratory",
    "name": "Complete Blood Count",
    "price": 500,
    "unit": "test",
    "description": "CBC with differential"
  }
]
```

### Create Medical Item

```http
POST /api/medical-items
Content-Type: application/json

{
  "category": "Laboratory",
  "name": "Complete Blood Count",
  "price": 500,
  "unit": "test",
  "description": "CBC with differential"
}
```

### Update Medical Item

```http
PUT /api/medical-items/:id
Content-Type: application/json

{
  "category": "Laboratory",
  "name": "Complete Blood Count",
  "price": 550,
  "unit": "test",
  "description": "CBC with differential - updated price"
}
```

### Delete Medical Item

```http
DELETE /api/medical-items/:id
```

## Bills API

### Get All Bills

```http
GET /api/bills
```

**Response:**
```json
[
  {
    "id": 1,
    "patientName": "John Doe",
    "patientId": "P001",
    "billType": "outpatient",
    "items": [
      {
        "id": 1,
        "name": "Complete Blood Count",
        "category": "Laboratory",
        "price": 500,
        "quantity": 1,
        "total": 500
      }
    ],
    "totalAmount": 500,
    "createdAt": "2025-02-01T10:00:00Z"
  }
]
```

### Create Bill

```http
POST /api/bills
Content-Type: application/json

{
  "patientName": "John Doe",
  "patientId": "P001",
  "billType": "outpatient",
  "items": [
    {
      "id": 1,
      "name": "Complete Blood Count",
      "category": "Laboratory",
      "price": 500,
      "quantity": 1
    }
  ],
  "admissionDate": "2025-02-01",
  "dischargeDate": "2025-02-03"
}
```

### Update Bill

```http
PUT /api/bills/:id
Content-Type: application/json

{
  "patientName": "John Doe Updated",
  "patientId": "P001",
  "billType": "outpatient",
  "items": [
    {
      "id": 1,
      "name": "Complete Blood Count",
      "category": "Laboratory",
      "price": 500,
      "quantity": 2
    }
  ]
}
```

### Delete Bill

```http
DELETE /api/bills/:id
```

## AI Analytics API

### Predict Treatment Cost

```http
POST /api/ai/predict-cost
Content-Type: application/json

{
  "patientAge": 45,
  "diagnosis": "Hypertension",
  "treatmentType": "outpatient",
  "symptoms": ["headache", "dizziness"],
  "medicalHistory": ["diabetes"]
}
```

**Response:**
```json
{
  "predictedCost": 2500,
  "confidence": 0.85,
  "breakdown": {
    "consultation": 500,
    "laboratory": 800,
    "medication": 1200
  },
  "recommendations": [
    "Consider bulk medication purchase for cost savings",
    "Regular monitoring recommended"
  ]
}
```

### Analyze Billing Trends

```http
POST /api/ai/analyze-trends
Content-Type: application/json

{
  "timeRange": "30days",
  "categories": ["Laboratory", "Medication", "Surgery"]
}
```

**Response:**
```json
{
  "trends": {
    "Laboratory": {
      "growth": 15.5,
      "totalRevenue": 125000,
      "averagePerBill": 850
    },
    "Medication": {
      "growth": -5.2,
      "totalRevenue": 89000,
      "averagePerBill": 450
    }
  },
  "insights": [
    "Laboratory services showing strong growth",
    "Medication costs declining due to bulk purchases"
  ]
}
```

### Optimize Billing

```http
POST /api/ai/optimize-billing
Content-Type: application/json

{
  "currentBill": {
    "items": [
      {
        "category": "Laboratory",
        "name": "Blood Test",
        "price": 500,
        "quantity": 1
      }
    ]
  }
}
```

**Response:**
```json
{
  "optimizations": [
    {
      "type": "bundle_discount",
      "description": "Combine with CBC for 10% discount",
      "savings": 50
    }
  ],
  "potentialSavings": 50,
  "optimizedTotal": 450
}
```

## Error Responses

All endpoints return consistent error responses:

```json
{
  "error": "Error message",
  "code": "ERROR_CODE",
  "details": "Additional error details"
}
```

### HTTP Status Codes

- `200` - Success
- `201` - Created
- `400` - Bad Request
- `404` - Not Found
- `500` - Internal Server Error

## Rate Limiting

The API currently has no rate limiting. For production deployments, consider implementing rate limiting to prevent abuse.

## Data Validation

All POST and PUT requests are validated using Zod schemas. Invalid data will return a 400 error with validation details.

## Pagination

Large datasets are paginated. Use query parameters:

```http
GET /api/medical-items?page=1&limit=50
```

## Search and Filtering

Many endpoints support search and filtering:

```http
GET /api/medical-items?category=Laboratory&search=blood
GET /api/bills?billType=inpatient&dateFrom=2025-01-01&dateTo=2025-01-31
```