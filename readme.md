# Inventory API - Module 4

## 1) What does this project do?
This is a basic REST API built with Node.js, Express, and PostgreSQL.
It allows CRUD operations for:
- `clientes`
- `productos`
- `transferencias`
- `proveedores`

The app creates required tables automatically when the server starts.

## 2) General information
### Tech stack
- Node.js
- Express
- PostgreSQL
- dotenv

### Project structure
- `src/config` -> environment and database config
- `src/db` -> database initialization
- `src/routes` -> API routes
- `src/controllers` -> request/response logic
- `src/services` -> SQL queries
- `src/utils` -> shared validation and HTTP error helpers

### ERD / Diagram
<img src="./img/Captura%20desde%202026-03-02%2019-03-55.png" alt="ERD diagram 1" width="900" />
<br/>
### Table and CSV
<img src="./img/Captura%20desde%202026-03-02%2019-04-38.png" alt="ERD diagram 2" width="900" />
<a href ="./PM-prueba-de-desempeno-data_m4.csv">siza</a>
## 3) How to run it?
### Prerequisites
- Node.js installed
- PostgreSQL running
- Database credentials in `.env`

### Environment variables
Use this format in `.env`:

```env
DB_HOST=your_host
DB_PORT=5432
DB_NAME=your_database
DB_USER=your_user
DB_PWD=your_password
APP_PORT=3000
```

### Install and start
```bash
npm install
npm start
```

Server default URL:
- `http://localhost:3000`

Health check:
- `GET /health`
