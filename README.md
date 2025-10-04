I) A brief description of the project --->
  
  Employee Data Management System
  
  Project Description-
  The Employee Data Management System is a full-stack web application designed to manage employee records efficiently.  
  
  It allows users to:
  
  - Add, edit, and delete employee details.
  - Upload bulk employee data using CSV files.
  - View employee details along with department.
  - Advanced Filters and search employees.
  
  The application is built with Vite React for the frontend and Node.js + Express for the backend, and uses PostgreSQL as the database.

  Technologies Used-
  
  - Frontend: Vite React, JavaScript
  - Backend: Node.js, Express.js
  - Database:PostgreSQL
  - Libraries & Tools: Axios (API calls), Lucide-React (icons), Joi (validation), Cors, dotenv
    

II) Clear instructions on how to set up and run it locally.--->

  Follow the steps below to set up and run the project locally.
  
  Clone the Repository
  
  git clone https://github.com/vaishnavi17122002/Employee_data_management.git
  cd Employee_data_management
  
  1. Backend Setup
  
      a) Navigate to backend folder:
  
         cd backend
      
      b) Install backend dependencies:
  
         npm install
      
      c) Setup Environment Variables:
      
          PORT=3001
          PGHOST=localhost
          PGUSER=your_db_user
          PGPASSWORD=your_db_password
          PGDATABASE=employee_db
          PGPORT=5432
          DATABASE_URL=postgres://postgres:root@localhost:5432/employee_db
          JWT_SECRET=YOUR_JWT_SECRET
      
      d) Create PostgreSQL Database:
  
         CREATE DATABASE employee_db;
  
         CREATE TABLE employees (
            id SERIAL PRIMARY KEY,
            name VARCHAR(255) NOT NULL,
            email VARCHAR(255) UNIQUE NOT NULL,
            position VARCHAR(100),
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            password VARCHAR(255),
            role VARCHAR(50) DEFAULT 'user',
            department VARCHAR(100),
            salary NUMERIC(10,2),
            joining_date DATE,
            profile_photo_url VARCHAR(255),
            photo_url VARCHAR(255)
          );
  
      
      e) Run Backend Server
  
         npm start
      
         Server runs at http://localhost:3001
  
  3. Frontend Setup
  
      a) Navigate to frontend folder:
  
         cd ../frontend
     
      b) Install frontend dependencies:
  
         npm install
  
     c) Run Frontend Server:
  
         npm run dev
  
         Vite runs frontend at http://localhost:5173 (default)
         Ensure backend is running before starting frontend
  

III) Instructions on how to run your test cases --->

  1. Backend Test Cases-
  
    Step 1: Navigate to your backend folder-
  
        cd backend
  
    Step 2: Make sure all dependencies are installed-
  
        npm install
  
    Step 3: Run the test cases-
  
        npm test
  
  2️. Frontend Test Cases-
  
    Step 1: Navigate to your frontend folder-
  
        cd ../frontend
          
    Step 2: Install frontend dependencies (if not already done)-
  
        npm install
          
    Step 3: Run frontend tests-
  
        npm run test

IV) Assumptions & Design Choices--->

    All employee information, including department, is stored in a single employees table.
    
    CSV import requires headers: Name, Email, Department, Position.
    
    Validation of employee data is handled using Joi in backend API requests.
    
    React + Vite provide a fast, modern, and responsive UI.
    
    Node.js + Express provide RESTful API endpoints for CRUD operations.
    
    Pagination and filtering are implemented for better UI performance and usability.
    
    Environment variables are used for database credentials, ports, and other sensitive information.

V) Bonus Points --->

  Refer below drive link from the video demonstration:

    https://drive.google.com/file/d/15gOXrWHlNbA1iTRasRY6dlR9TIQhgsuH/view?usp=sharing


    
  
