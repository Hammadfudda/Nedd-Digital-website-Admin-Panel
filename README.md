# 🛠️ Nedd Digital Admin Panel  

An **Admin Panel** for managing the [Nedd Digital Website](https://nedddigital.netlify.app/).  
This panel allows administrators to **review, approve, and manage testimonials, proposals, and client data** stored in **Firebase Firestore**.  
Built with **Tailwind CSS**, **JavaScript**, and **Firebase**, deployed on **Netlify**.  

🔗 **Live Admin Panel** → [Nedd Digital Admin Panel](https://nedddigitaladminpanel.netlify.app/)  

---

## ✨ Features  

✅ Secure admin login with **password protection** 🔑  
✅ Approve or reject **client testimonials**  
✅ Manage **client proposals and contact submissions**  
✅ Real-time sync with Firestore database  
✅ Clean & responsive UI with Tailwind CSS  
✅ Deployed on **Netlify** for easy access  

---

## 🔑 Login Credentials  

By default, the admin panel is protected with a static password:  

- **Password**: `03172052765`  

> ⚠️ You should update this to a more secure authentication system (e.g., **Firebase Authentication**) for production use.  

---

## 🛠️ Tech Stack  

- **Frontend**: HTML5, Tailwind CSS, JavaScript  
- **Database**: Firebase Firestore 🔥  
- **Authentication**: Custom password-based access (basic auth simulation)  
- **Hosting**: Netlify 🚀  

---

## 📂 Project Structure  

```bash
.
├── index.html          # Admin login page
├── dashboard.html      # Admin dashboard after login
├── js/
│   ├── firebase-config.js   # Firebase setup
│   ├── auth.js              # Handles password authentication
│   ├── admin.js             # Firestore operations (CRUD for testimonials/proposals)
├── css/                 # Tailwind styles
├── assets/              # Logos, icons
