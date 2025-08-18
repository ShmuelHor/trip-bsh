# TripBSH

TripBSH היא אפליקציה לניהול הוצאות קבוצתיות בטיולים.  
האפליקציה מחשבת בצורה חכמה כמה כל אחד צריך לשלם למי, כדי לסגור חשבון בצורה מהירה והוגנת.

---

## 📑 תוכן עניינים
- [TripBSH](#tripbsh)
  - [📑 תוכן עניינים](#-תוכן-עניינים)
  - [✨ תכונות](#-תכונות)
  - [⚙️ התקנה והרצה](#️-התקנה-והרצה)
    - [הרצה עם Docker Compose](#הרצה-עם-docker-compose)
  - [🌍 דיפלוי](#-דיפלוי)
  - [🛠 מבנה פרויקט](#-מבנה-פרויקט)
  - [📡 API Endpoints](#-api-endpoints)
  - [📄 דוגמאות שימוש](#-דוגמאות-שימוש)
    - [יצירת טיול (Create Trip)](#יצירת-טיול-create-trip)
    - [הוספת הוצאה (Add Expense)](#הוספת-הוצאה-add-expense)
    - [סיכום טיול (Summary)](#סיכום-טיול-summary)
  - [🤝 תרומה](#-תרומה)
  - [📜 רישיון](#-רישיון)

---

## ✨ תכונות
- ניהול טיולים וחברים
- הוספת הוצאות לכל טיול
- חישוב אוטומטי של איזון התשלומים
- תמיכה בעברית ובאנגלית
- ממשק מודרני עם MUI

---

## ⚙️ התקנה והרצה

```bash
# התקנת צד שרת
cd backend
npm install
npm run dev

# התקנת צד לקוח
cd ui
npm install
npm run dev
```

### הרצה עם Docker Compose
```bash
docker compose up --build
```

---

## 🌍 דיפלוי
- **Frontend** – GitHub Pages
- **Backend** – Railway.app / Render

---

## 🛠 מבנה פרויקט
```
trip-bsh/
│── backend/        # צד שרת - Node.js + Express + TypeScript + MongoDB
│── ui/             # צד לקוח - React + TS + MUI
│── docker-compose.yml
│── README.md
```

---

## 📡 API Endpoints

| Method | Endpoint                  | Description                  |
|--------|---------------------------|------------------------------|
| POST   | /api/trips                | יצירת טיול חדש              |
| GET    | /api/trips/:id            | קבלת פרטי טיול               |
| POST   | /api/trips/:id/expenses   | הוספת הוצאה לטיול            |
| GET    | /api/trips/:id/summary    | סיכום חובות/יתרות            |
| POST   | /api/users                | יצירת משתמש חדש              |
| GET    | /api/users/:id            | פרטי משתמש                   |

---

## 📄 דוגמאות שימוש

### יצירת טיול (Create Trip)
**Request**
```bash
curl -X POST http://localhost:3000/api/trips \
  -H "Content-Type: application/json" \
  -d '{"name":"טיול לאמסטרדם","participants":["u1","u2"]}'
```

**Response**
```json
{
  "id": "t1",
  "name": "טיול לאמסטרדם",
  "participants": ["u1", "u2"]
}
```

---

### הוספת הוצאה (Add Expense)
**Request**
```bash
curl -X POST http://localhost:3000/api/trips/t1/expenses \
  -H "Content-Type: application/json" \
  -d '{"payer":"u1","amount":200,"description":"ארוחת ערב"}'
```

**Response**
```json
{
  "id": "e1",
  "payer": "u1",
  "amount": 200,
  "description": "ארוחת ערב"
}
```

---

### סיכום טיול (Summary)
**Request**
```bash
curl http://localhost:3000/api/trips/t1/summary
```

**Response**
```json
{
  "balances": [
    { "user": "u1", "balance": +100 },
    { "user": "u2", "balance": -100 }
  ]
}
```

---

## 🤝 תרומה
מוזמנים לפתוח **Pull Requests** או לדווח על בעיות ב־**Issues**.

---

## 📜 רישיון
MIT License © 2025 TripBSH
