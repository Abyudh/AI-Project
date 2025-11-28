# IP Log Rate Limiter

his project is a full-stack rate-limiting and IP-logging system built using Node.js, Express, and MySQL.
It demonstrates three real-time rate limiters:

Login Attempt Limiter

Button Spam Click Limiter

Chat Message Limiter

Every action is securely logged into a MySQL database with the user’s IP, timestamp, and status.
The frontend provides a clean UI to test rate-limiting behaviour in real time.


##  Features

Secure backend proxy (API key is never exposed)

Real-time weather updates

Clean, responsive frontend UI

Error handling for invalid city names

Modern API structure

## Installation & Execution

Use the packages Node JS, Express JS, Body-parser and Mysql2
```bash
npm install express
npm install body-parser
npm install Mysql2

#Running the Website
node <file_name>.js
```

## Project Structure
```python
ip-log-limiter/
│
├── backend/
│   ├── AI.js                 # Main Express backend (rate limiter logic)
│   ├── package.json
│   └── README.md
│
└── frontend/
     └── AI.html               # UI for testing features
     

```

## Mysql2 Database
```python
CREATE DATABASE AI;

USE AI;

CREATE TABLE ip_logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    ip VARCHAR(50),
    timestamp BIGINT,
    status VARCHAR(50)
);

SHOW TABLES;

SELECT * FROM ip_logs

```
## Team Members
```python

PADALA KRISHNA CHAITHANYA GOUD 2403A52213
Sri Charan 2403A52214
Abyudh S. 2403A52215     


