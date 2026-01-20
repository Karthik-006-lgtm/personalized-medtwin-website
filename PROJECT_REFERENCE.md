# Project Reference

## Part 1: Tech Stack Documentation

### Frontend UI
- **Stack:** React, Vite, Tailwind CSS  
- **Where used:** `frontend/src/` (pages, components, layouts, styling)  
- **Why chosen:**  
  - React provides modular, reusable UI components for dashboards and forms.  
  - Vite delivers fast development builds and quick refresh cycles.  
  - Tailwind CSS enables consistent, responsive design without heavy custom CSS.

### State & Authentication
- **Stack:** React Context, JWT  
- **Where used:** `frontend/src/context/AuthContext.jsx`, protected routes in `frontend/src/components/PrivateRoute.jsx`  
- **Why chosen:**  
  - Context gives centralized auth state without prop drilling.  
  - JWT is a standard, stateless auth mechanism for secure APIs.

### Backend API
- **Stack:** Node.js, Express  
- **Where used:** `backend/server.js`, `backend/routes/*`  
- **Why chosen:**  
  - Express is lightweight and ideal for REST APIs.  
  - Node.js is event-driven and efficient for concurrent requests.

### Database
- **Stack:** MongoDB, Mongoose  
- **Where used:** `backend/models/*`  
- **Why chosen:**  
  - MongoDB handles flexible, evolving health data structures.  
  - Mongoose enforces schema validation and simpler queries.

### AI/ML Service
- **Stack:** Python, Flask  
- **Where used:** `ml-service/app.py`, `ml-service/nutrition_engine.py`, `ml-service/prediction_engine.py`  
- **Why chosen:**  
  - Python is best suited for AI logic and data processing.  
  - Flask exposes ML logic as clean REST endpoints.

### ML Libraries
- **Stack:** scikit-learn, NumPy  
- **Where used:** `ml-service/`  
- **Why chosen:**  
  - scikit-learn provides stable ML utilities.  
  - NumPy supports fast numerical computation.

### File Uploads & Storage
- **Stack:** Multer, Node.js FS  
- **Where used:** `backend/routes/documents.js`, `backend/routes/user.js`  
- **Why chosen:**  
  - Multer is standard for multipart uploads.  
  - FS provides direct control over file storage.

---

## Part 2: Project Presentation Script

Hello everyone, my name is [Your Name], and I’m presenting my AI‑powered Health Monitoring Platform.  

The goal of this system is to make preventive healthcare simple and actionable. Users can record their daily health metrics, receive risk analysis, and get personalized nutrition guidance. The system also allows secure medical document storage and profile management, all in one place.

From a user perspective, the flow is simple:
1) Sign up and log in securely  
2) Enter health metrics or sync device data  
3) Get health insights and risk level  
4) View AI‑driven nutrition recommendations  
5) Store and manage medical documents safely  

Technically, the frontend is built with React and Tailwind CSS for a modern, responsive interface. The backend uses Node.js and Express to handle authentication, data processing, and API routing. MongoDB stores all user profiles, health history, and medical files.  

For AI, a separate Python Flask service runs the prediction and nutrition logic, producing personalized results quickly and reliably. This architecture keeps the system scalable and modular.

In short, this project combines user‑friendly design, secure data handling, and AI‑based recommendations to create a complete health monitoring solution suitable for real‑world wellness platforms.

Thank you.

---

## Part 3: Viva/Interview Q&A

### Frontend
**Q1: Why did you choose React?**  
A: React makes the UI modular and easy to maintain, which is important for dashboards and forms.

**Q2: How is authentication handled on the frontend?**  
A: JWT tokens are stored in localStorage and managed through React Context with protected routes.

**Q3: How did you ensure responsive design?**  
A: Tailwind CSS utilities were used to build mobile‑friendly layouts.

### Backend
**Q4: What are the responsibilities of the backend?**  
A: It manages authentication, profile data, health records, document uploads, and ML service communication.

**Q5: How do you connect to the ML service?**  
A: The backend calls the Flask service via REST endpoints (`/api/predict`, `/api/nutrition`).

**Q6: How are file uploads handled?**  
A: Multer processes the upload, and Node.js FS stores files in the server directory.

### Database
**Q7: Why MongoDB?**  
A: It is flexible for health data that can vary between users and grows over time.

**Q8: What does Mongoose add?**  
A: It enforces schema validation and simplifies MongoDB queries.

### ML / AI
**Q9: Where is the ML logic implemented?**  
A: In the `ml-service` using Python and Flask.

**Q10: What type of AI logic is used for predictions?**  
A: Rule‑based scoring and thresholds to compute risk and recommendations.

**Q11: How are nutrition recommendations generated?**  
A: The system uses profile + health data to generate 7‑day plans, snacks, and hydration guidance.

**Q12: How is personalization achieved?**  
A: It uses user age, gender, occupation, stress/activity level, and health conditions to tailor output.
