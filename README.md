# Real-Time Task Tracker 📝

➡️ [Live Demo](https://fanciful-ganache-8a7bf9.netlify.app/)

A full-stack, real-time to-do list application built with vanilla JavaScript and powered by Google Firebase. This project demonstrates a complete front-end application with a serverless backend, featuring live data synchronization, secure user authentication, and a clean, responsive user interface.

---

## 🚀 About The Project

This project was developed to showcase a modern, serverless approach to building interactive web applications. By leveraging Google Firebase, the application provides robust backend functionality—like real-time database updates and secure authentication—without the need to build or manage a dedicated server.
- **The Power of Real-Time:** The core of this project is Firebase Firestore's real-time listener (onSnapshot). This allows for a seamless user experience where changes made by a user on one device are instantly reflected on all other open sessions, without needing manual refreshes or complex WebSocket implementations.
- **Serverless Authentication:** Firebase Authentication handles all the complexities of user management, from sign-up and login to password resets and email verification. This demonstrates how to build secure, feature-rich applications efficiently.
- **Focus on User Experience:** Every feature, from the intuitive login flow to inline task editing and automatic refresh after email verification, was designed to create a smooth and professional user experience.

---

## ✨ Features

🔐 Secure User Authentication:
  - Sign up and log in with Email & Password.
  - One-click Sign-In with Google.
  - Secure password reset functionality via email.
  - Mandatory email verification for new accounts.

🔄 Real-Time Database:
  - Tasks are synchronized live across all devices using Firebase Firestore.
  - Each user has their own private and secure to-do list.

🧰 Full CRUD Functionality:
  - Create: Add new tasks with optional due dates and times.
  - Read: View your task list, updated in real-time.
  - Update: Seamlessly edit existing tasks directly in the list (press Enter to save).
  - Delete: Remove tasks with a single click.

🖌️ Polished User Interface:
  - A clean, modern, and responsive UI built with Tailwind CSS.
  - User-friendly error messages and notifications.
  - Automatic page refresh after a user verifies their email in another tab.

---

## 🛠️ Tech Stack

- **Frontend:** HTML5, CSS3, Vanilla JavaScript
- **Backend & Database:** Firebase Authentication, Cloud Firestore
- **Deployment & Tools:** Netlify, Git & GitHub, VS Code

---

## 🧠 How It Works

The application is built on a serverless architecture with a clear separation between the client and backend services.

1. **Authentication Flow:**

   - User interaction begins with the authentication module. Firebase Authentication handles all user management.  
   - The `onAuthStateChanged` listener is the core of the application's state management. It detects when a user logs in or out and dynamically renders the appropriate view (e.g., login form, verification screen, or the main task app).  
   - For email sign-ups, a verification email is automatically sent. The app then polls the user's status in the background and reloads the page once verification is complete.  

2. **Real-Time Data Synchronization:**

   - Once a user is authenticated and verified, the application subscribes to their personal task list in the Firestore database.  
   - The data is structured to ensure privacy, with each user's tasks stored in a separate collection path: `users/{userId}/tasks`.  
   - The `onSnapshot` function from the Firestore SDK creates a persistent, real-time connection. Any change in the database (add, update, delete) is instantly pushed to the client, and the UI is re-rendered to reflect the new data. This creates the "live" feel of the application without needing manual refreshes.  

3. **Feature Engineering:** A consolidated `tags` column is created for each movie. This is the most crucial step, where we create a "profile" for each film by combining its most important textual features:

   - **Create:** New tasks are added to the user's collection in Firestore with a createdAt timestamp.  
   - **Update:** The `updateDoc` function is used to modify the text of an existing task document.  
   - **Delete:** The `deleteDoc` function removes the task document from the collection.  
   - All operations are handled through the secure Firebase SDK, which enforces the security rules defined in the project (i.e., only an authenticated user can access their own data).  

---

## ⚙️ Setup and Local Installation
Follow these steps to get the project running on your local machine.

1. **Prerequisites**
   - **Node.js** (which includes npm)  
   - A code editor like **VS Code** with the **Live Server** extension.

2. **Clone the Repository**

```
git clone [https://github.com/rishii-05/real-time-task-tracker.git](https://github.com/rishii-05/real-time-task-tracker.git)
cd real-time-task-tracker
```

3. **Set Up Firebase**
   - Go to the [Firebase Console](https://console.firebase.google.com/) and create a new project.  
   - Create a new Web App and copy your Firebase configuration keys.
   - In `script.js`, replace the placeholder `firebaseConfig` object with your keys.
   - In Authentication, enable the Email/Password and Google sign-in providers.
   - In Firestore Database, create a new database.
   - In Authentication -> Settings, add your local (`127.0.0.1`) and deployed domains to the list of Authorized Domains.

4. **Run the Application**
   - In VS Code, right-click on `index.html` and select "Open with Live Server".  

---

## 📂 Project Structure

```
real-time-task-tracker/
|
├── .gitignore          # Specifies files for Git to ignore
├── index.html          # The main HTML file for structure
├── script.js           # All JavaScript logic, including Firebase integration
├── style.css           # Custom CSS styles
└── README.md           # You are here!
```

---

## 🔮 Future Improvements

- **Task Priorities:** Add functionality to assign a priority level (e.g., Low, Medium, High) to each task.
- **Sorting & Filtering:** Implement controls to sort tasks by due date or priority.
- **Visual Indicators:** Add styling to visually distinguish overdue tasks.
- **Email Reminders:** Set up automated email notifications for upcoming task due dates.
