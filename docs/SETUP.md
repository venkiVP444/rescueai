# Local Setup Guide

## Prerequisites
- **.NET 10.0 SDK**
- **Node.js (v20+ or v24+)**
- **npm (v10+)**

---

## Running the Application

### 1. Start the Backend API (Port 5105)
```bash
cd C:\Personal\RescueAI
dotnet run --project src/Rescue.Api/Rescue.Api.csproj
```
The backend will initialize SQLite (`rescue.db`) and begin listening on `http://localhost:5105`.

### 2. Start the Frontend Web App (Port 5173)
```bash
cd C:\Personal\RescueAI\src\Rescue.Web
npm run dev
```
Open your browser at `http://localhost:5173`.

---

## Running the Automated Test Suite
```bash
cd C:\Personal\RescueAI
dotnet test RescueAI.slnx
```
