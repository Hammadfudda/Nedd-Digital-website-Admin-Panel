import { initializeApp } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-app.js";
import { getFirestore, collection, getDocs, query, orderBy, updateDoc, doc, deleteDoc } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";

// ---------------- Firebase ----------------
const firebaseConfig = {
  apiKey: "AIzaSyAgkzgYPYpCHZbJddkoFkzWswSh3H5tsIo",
  authDomain: "nedddigitalwebsite.firebaseapp.com",
  projectId: "nedddigitalwebsite",
 storageBucket: "nedddigitalwebsite.appspot.com",
  messagingSenderId: "360940743614",
  appId: "1:360940743614:web:7eca9a842919ad569067ef",
  measurementId: "G-W9CBH3QEVP"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// ---------------- Admin Password ----------------
const PASS = "03172052765";

// ---------------- Login ----------------
const loginBtn = document.getElementById("loginBtn");
loginBtn.addEventListener("click", loginHandler);

function loginHandler() {
  const pass = document.getElementById("adminPass").value;
  if (pass === PASS) {
    localStorage.setItem("adminLoggedIn", "true");
    showAdminSection();
  } else {
    document.getElementById("errorMsg").classList.remove("hidden");
  }
}

// Auto-login if password saved
if (localStorage.getItem("adminLoggedIn") === "true") {
  showAdminSection();
}

// ---------------- Show Admin Section ----------------
function showAdminSection() {
  document.getElementById("passwordSection").classList.add("hidden");
  document.getElementById("adminSection").classList.remove("hidden");
  loadPending();
  loadContacts();
}

// ---------------- Tabs ----------------
const tabTestimonials = document.getElementById("tabTestimonials");
const tabContacts = document.getElementById("tabContacts");
const testimonialSection = document.getElementById("testimonialSection");
const contactSection = document.getElementById("contactSection");

tabTestimonials.addEventListener("click", () => {
  testimonialSection.classList.remove("hidden");
  contactSection.classList.add("hidden");
  tabTestimonials.classList.add("bg-sky-900", "text-white");
  tabTestimonials.classList.remove("bg-gray-300");
  tabContacts.classList.remove("bg-sky-900", "text-white");
  tabContacts.classList.add("bg-gray-300");
});

tabContacts.addEventListener("click", () => {
  testimonialSection.classList.add("hidden");
  contactSection.classList.remove("hidden");
  tabContacts.classList.add("bg-sky-900", "text-white");
  tabContacts.classList.remove("bg-gray-300");
  tabTestimonials.classList.remove("bg-sky-900", "text-white");
  tabTestimonials.classList.add("bg-gray-300");
});

// ---------------- Load Pending Testimonials ----------------
async function loadPending() {
  const container = document.getElementById("pendingTestimonials");
  const q = query(collection(db, "testimonials"), orderBy("timestamp", "desc"));
  const snapshot = await getDocs(q);

  container.innerHTML = "";
  snapshot.forEach((docSnap) => {
    const data = docSnap.data();
    if (!data.approved) {
      const card = document.createElement("div");
      card.className = "bg-white shadow rounded-xl p-4";
      card.innerHTML = `
        <p class="text-slate-600">"${data.testimonial}"</p>
        <div class="mt-2 font-bold">- ${data.name}</div>
        <div class="mt-4 flex gap-2">
          <button class="px-3 py-1 bg-green-600 text-white rounded" onclick="approveTestimonial('${docSnap.id}')">Approve</button>
          <button class="px-3 py-1 bg-red-600 text-white rounded" onclick="rejectTestimonial('${docSnap.id}')">Reject</button>
        </div>
      `;
      container.appendChild(card);
    }
  });
}

// ---------------- Load Client Contacts ----------------
async function loadContacts() {
  const container = document.getElementById("clientContacts");
  const q = query(collection(db, "contacts"), orderBy("timestamp", "desc"));
  const snapshot = await getDocs(q);

  container.innerHTML = "";
  snapshot.forEach((docSnap) => {
    const data = docSnap.data();
    const card = document.createElement("div");
    card.className = "bg-white shadow rounded-xl p-4";
    card.innerHTML = `
      <div class="font-bold">${data.name}</div>
      <div class="text-sm text-slate-500">
        Email: ${data.email || "N/A"}<br>
        Company: ${data.company || "N/A"}<br>
        Message: "${data.message}"
      </div>
    `;
    container.appendChild(card);
  });
}

// ---------------- Approve/Delete Testimonials ----------------
window.approveTestimonial = async function (id) {
  await updateDoc(doc(db, "testimonials", id), { approved: true });
  loadPending();
};

window.rejectTestimonial = async function (id) {
  const confirmDelete = confirm("Are you sure you want to delete this testimonial?");
  if (confirmDelete) {
    await deleteDoc(doc(db, "testimonials", id));
    loadPending();
  }
};

// ---------------- Logout ----------------
const logoutBtn = document.getElementById("logoutBtn");
logoutBtn.addEventListener("click", () => {
  localStorage.removeItem("adminLoggedIn");
  location.reload();
});
