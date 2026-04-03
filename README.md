# 📄 Finance Dashboard Backend (Zorvyn Assignment)

A well-structured backend system for a finance dashboard that demonstrates real-world backend engineering concepts such as authentication, role-based access control, financial data management, and analytics.

---

## 🚀 Features

- JWT Authentication  
- Role-Based Access Control (RBAC)  
- Financial Records CRUD (with soft delete)  
- Category Management (per-user)  
- Dashboard Analytics (MongoDB Aggregation)  
- Pagination, Filtering, Search & Sorting  
- Centralized Error Handling  
- Route-based Rate Limiting  

---

## 🛠️ Tech Stack

- Node.js  
- Express.js  
- MongoDB (Mongoose)  
- JWT  

---

## 📁 Project Structure

```text
src/
├── controllers/
├── models/
├── routes/
├── middlewares/
├── utils/
├── db/
├── app.js
└── server.js
```

---

## ⚙️ Environment Variables

Create a `.env` file:

```env
MONGODB_URI=mongodb://localhost:27017/finance-db
PORT=8000
JWT_SECRET=your_secret
JWT_EXPIRES_IN=1d
```

---

## 📦 Installation & Run

```bash
npm install
npm run dev
```

Server runs on:  
👉 http://localhost:8000

---

## 🔐 Authentication

### Register

**POST** `/api/v1/auth/register`

```json
{
  "name": "Yaswant",
  "email": "yaswant@test.com",
  "password": "123456"
}
```

### Login

**POST** `/api/v1/auth/login`

```json
{
  "email": "yaswant@test.com",
  "password": "123456"
}
```

**Response:**
```json
{
  "token": "JWT_TOKEN",
  "user": {
    "id": "USER_ID",
    "role": "admin"
  }
}
```

### 🔑 Authorization

Add header for protected routes:

`Authorization: Bearer <token>`

### 👤 Roles & Permissions

| Role | Permissions |
| :--- | :--- |
| Viewer | Read-only |
| Analyst | Create & update |
| Admin | Full access |

---

## 📂 Category APIs

### Create Category

**POST** `/api/v1/categories`  
🔒 Roles: admin, analyst

```json
{
  "name": "Food",
  "type": "expense"
}
```

### Get Categories

**GET** `/api/v1/categories`

### Delete Category

**DELETE** `/api/v1/categories/:id`  
🔒 Role: admin

---

## 💰 Record APIs

### Create Record

**POST** `/api/v1/records`

**Option 1 (category name)**
```json
{
  "amount": 500,
  "type": "expense",
  "category": "Food",
  "date": "2026-04-02",
  "note": "Dinner"
}
```

**Option 2 (categoryId)**
```json
{
  "amount": 500,
  "type": "expense",
  "categoryId": "CATEGORY_ID",
  "date": "2026-04-02"
}
```

### Get Records

**GET** `/api/v1/records`

**Query Parameters:**

| Param | Description |
| :--- | :--- |
| page | Page number |
| limit | Records per page |
| type | income / expense |
| category | name or id |
| startDate | filter start |
| endDate | filter end |
| search | search note/category |
| sortBy | date / amount / createdAt |
| order | asc / desc |

**Example:**  
`GET /api/v1/records?search=food&type=expense&page=1&limit=5&sortBy=amount&order=desc`

### Get Single Record

**GET** `/api/v1/records/:id`

### Update Record

**PATCH** `/api/v1/records/:id`

```json
{
  "amount": 700,
  "category": "Groceries"
}
```

### Delete Record (Soft Delete)

**DELETE** `/api/v1/records/:id`

---

## 📊 Dashboard APIs

### Get Summary

**GET** `/api/v1/dashboard`

**Response:**
```json
{
  "summary": {
    "totalIncome": 1000,
    "totalExpense": 700,
    "netBalance": 300
  },
  "categoryStats": [
    { "category": "salary", "total": 1000 },
    { "category": "groceries", "total": 700 }
  ],
  "monthlyStats": [
    { "year": 2026, "month": 4, "total": 1700 }
  ],
  "recent": [
    {
      "amount": 700,
      "type": "expense",
      "category": "groceries",
      "date": "2026-04-02"
    }
  ]
}
```

---

## ⚠️ Response Format

### Success
```json
{
  "success": true,
  "data": "..."
}
```

### Error
```json
{
  "success": false,
  "message": "Error message"
}
```

---

## 🚦 Rate Limiting

| Route | Limit |
| :--- | :--- |
| Auth | 10 requests / 15 min |
| Records | 100 requests / 15 min |
| Categories | 50 requests / 15 min |
| Dashboard | 30 requests / 15 min |

---

## 🧪 Testing

Steps:
1. Register user
2. Login → get token
3. Create category
4. Create records
5. Fetch records
6. Check dashboard

---

## ⚠️ Common Issues

- Missing `Content-Type: application/json`
- Invalid or expired JWT
- Category not found for given user

---

## 🧠 Design Decisions

- MongoDB aggregation used for dashboard analytics
- RBAC implemented using middleware
- Soft delete used for records
- Category auto-creation for flexibility
- Centralized error handling for consistency
- Modular rate limiting for API protection

---

## 🚀 Future Improvements

- Swagger / OpenAPI docs
- Unit & integration tests
- Redis caching
- Advanced validation (Zod/Joi)

---

## 🎯 Conclusion

This project demonstrates a scalable, secure, and production-ready backend system with clean architecture, efficient data handling, and real-world best practices.

---

<div align="center">
  <b>Made by <a href="https://github.com/Yaswantsoni1128">Yaswantsoni1128</a></b>
</div>
