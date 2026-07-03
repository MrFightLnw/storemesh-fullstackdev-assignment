# StoreFront Management System

Welcome to StoreFront Management System. (StoreMesh)
A Full-Stack StoreFront and Inventory Management web application built with **Django REST Framework (DRF)** and **React. (TypeScript)**

## Key Features

### Role-Based Access Control & Authentication
- Secure user login with **JWT Token-Based Authentication**.
- Route Guard for separate user based on roles. (Buyer or Seller)

### Marketplace & Cart Checkout (Buyer)
- Grid view layout for showing products on the main page and also a filter function filtered by products' names.
- Responsive modal viewing through for a full product description.
- A shopping cart for finalizing chosen products before purchasing.

### Inventory Management (Seller)
- A tracking table displaying all products owned by the specific seller.
- Access to creating, editing, deleting products from the seller.

---

## Installation & Setup

Please ensure you have **Python** and **Node.js** installed on your device.

### 1. Backend Configuration (Django)
Open Terminal, navigate to a folder named 'storefront_project', and initialize a virtual environment.

```bash
python -m venv venv
```

Then activate the virtual environment. (On Windows)

```bash
venv\Scripts\activate
```

Install all required dependencies.
```bash
pip install django djangorestframework django-cors-headers djangorestframework-simplejwt Pillow
```

Run database migrations to generate system tables.
```bash
python manage.py migrate
```

Start the local development server.
```bash
python manage.py runserver
```

This backend server will live at http://127.0.0.1:8000/

### 2. Frontend Configuration (React)

Open a separate terminal, navigate to a folder named 'storefront_frontend', and spin up the user interface.

```bash
npm install
npm run dev
```

This frontend application will be hosted on the URL provided on your terminal.