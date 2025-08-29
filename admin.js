import { initializeApp } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-app.js";
import { 
  getFirestore, collection, getDocs, query, orderBy, updateDoc, doc, deleteDoc, addDoc, serverTimestamp 
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";

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

if (localStorage.getItem("adminLoggedIn") === "true") {
  showAdminSection();
}

// ---------------- Show Admin Section ----------------
function showAdminSection() {
  document.getElementById("passwordSection").classList.add("hidden");
  document.getElementById("adminSection").classList.remove("hidden");
  document.getElementById("logoutBtn").classList.remove("hidden");
  loadPending();
  loadContacts();
  loadSlots();
}

// ---------------- Tabs ----------------
const tabTestimonials = document.getElementById("tabTestimonials");
const tabContacts = document.getElementById("tabContacts");
const tabSlots = document.getElementById("tabSlots");

const testimonialSection = document.getElementById("testimonialSection");
const contactSection = document.getElementById("contactSection");
const slotSection = document.getElementById("slotSection");

const tabs = [tabTestimonials, tabContacts, tabSlots];
const sections = [testimonialSection, contactSection, slotSection];

function activateTab(activeTab) {
  tabs.forEach((tab, i) => {
    if (tab === activeTab) {
      tab.classList.add("bg-sky-900", "text-white");
      tab.classList.remove("bg-gray-300", "text-black");
      sections[i].classList.remove("hidden");
    } else {
      tab.classList.remove("bg-sky-900", "text-white");
      tab.classList.add("bg-gray-300", "text-black");
      sections[i].classList.add("hidden");
    }
  });
}

tabTestimonials.addEventListener("click", () => activateTab(tabTestimonials));
tabContacts.addEventListener("click", () => activateTab(tabContacts));
tabSlots.addEventListener("click", () => activateTab(tabSlots));
activateTab(tabTestimonials);

// ---------------- Time Formatter ----------------
function formatTo12Hour(time24) {
  if (!time24) return "";
  const [hourStr, minute] = time24.split(":");
  let hour = parseInt(hourStr, 10);
  const ampm = hour >= 12 ? "PM" : "AM";
  hour = hour % 12 || 12;
  return `${hour}:${minute} ${ampm}`;
}

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

  if (snapshot.empty) {
    container.innerHTML = `<p class="text-gray-500">No client contacts found.</p>`;
    return;
  }

  snapshot.forEach((docSnap) => {
    const data = docSnap.data();

    let detailsHTML = "";
    for (const key in data) {
      if (key === "timestamp") continue;
      if (key === "slotTime") {
        detailsHTML += `<div><b>${key}:</b> ${formatTo12Hour(data[key])}</div>`;
      } else {
        detailsHTML += `<div><b>${key}:</b> ${data[key]}</div>`;
      }
    }

    const card = document.createElement("div");
    card.className = "bg-white shadow rounded-xl p-4";
    card.innerHTML = `
      <div class="font-bold mb-2">Client Contact</div>
      <div class="text-sm text-slate-600 space-y-1">${detailsHTML}</div>
      <div class="mt-3 flex gap-2">
        <button class="px-3 py-1 bg-blue-600 text-white rounded" onclick="openEditPopup('${docSnap.id}')">Edit</button>
        <button class="px-3 py-1 bg-red-600 text-white rounded" onclick="deleteContact('${docSnap.id}')">Delete</button>
      </div>
    `;
    container.appendChild(card);
  });
}

// ---------------- Delete Contact ----------------
window.deleteContact = async function (id) {
  if (confirm("Are you sure you want to delete this client contact?")) {
    await deleteDoc(doc(db, "contacts", id));
    loadContacts();
  }
};

// ---------------- Responsive Edit Popup ----------------
function createEditPopup(data, id) {
  const overlay = document.createElement("div");
  overlay.className = "fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 px-4";

  const popup = document.createElement("div");
  popup.className = "bg-white w-full max-w-lg rounded-xl shadow-lg p-6 overflow-y-auto max-h-[90vh]";

  let fieldsHTML = "";
  for (const key in data) {
    if (key === "timestamp") continue;
    fieldsHTML += `
      <label class="block mb-2 text-sm font-medium text-gray-700">${key}</label>
      <input type="text" id="edit-${key}" value="${data[key] || ""}" class="w-full border rounded p-2 mb-4" />
    `;
  }

  popup.innerHTML = `
    <h2 class="text-lg font-bold mb-4">Edit Contact</h2>
    <form id="editForm" class="space-y-2">
      ${fieldsHTML}
      <div class="flex justify-end gap-2 mt-4">
        <button type="button" id="cancelEdit" class="px-4 py-2 bg-gray-500 text-white rounded">Cancel</button>
        <button type="submit" class="px-4 py-2 bg-sky-900 text-white rounded">Save</button>
      </div>
    </form>
  `;

  overlay.appendChild(popup);
  document.body.appendChild(overlay);

  document.getElementById("cancelEdit").addEventListener("click", () => {
    overlay.remove();
  });

  document.getElementById("editForm").addEventListener("submit", async (e) => {
    e.preventDefault();
    const updatedData = {};
    for (const key in data) {
      if (key === "timestamp") continue;
      const input = document.getElementById(`edit-${key}`);
      updatedData[key] = input.value.trim();
    }
    await updateDoc(doc(db, "contacts", id), updatedData);
    overlay.remove();
    loadContacts();
  });
}

window.openEditPopup = async function (id) {
  const snapshot = await getDocs(query(collection(db, "contacts")));
  let contactData = null;

  snapshot.forEach((docSnap) => {
    if (docSnap.id === id) {
      contactData = docSnap.data();
    }
  });

  if (!contactData) return alert("Contact not found!");
  createEditPopup(contactData, id);
};

// ---------------- Load Available Slots ----------------
async function loadSlots() {
  const container = document.getElementById("slotList");
  const q = query(collection(db, "slots"), orderBy("date"));
  const snapshot = await getDocs(q);

  container.innerHTML = "";
  snapshot.forEach((docSnap) => {
    const data = docSnap.data();

    if (!data.booked) {
      const card = document.createElement("div");
      card.className = "bg-white shadow rounded-xl p-4 flex justify-between items-center";
      card.innerHTML = `
        <div>
          <div class="font-bold">${data.date} - ${formatTo12Hour(data.time)}</div>
        </div>
        <button class="px-3 py-1 bg-red-600 text-white rounded" onclick="deleteSlot('${docSnap.id}')">Delete</button>
      `;
      container.appendChild(card);
    }
  });
}

// ---------------- Add Slot ----------------
const addSlotBtn = document.getElementById("addSlotBtn");
addSlotBtn.addEventListener("click", async () => {
  const date = document.getElementById("slotDate").value;
  const time = document.getElementById("slotTime").value;

  if (date && time) {
    await addDoc(collection(db, "slots"), {
      date,
      time,
      booked: false,
      timestamp: serverTimestamp()
    });
    document.getElementById("slotDate").value = "";
    document.getElementById("slotTime").value = "";
    loadSlots();
  } else {
    alert("Please enter both date and time.");
  }
});

// ---------------- Approve/Delete Testimonials ----------------
window.approveTestimonial = async function (id) {
  await updateDoc(doc(db, "testimonials", id), { approved: true });
  loadPending();
};

window.rejectTestimonial = async function (id) {
  if (confirm("Are you sure you want to delete this testimonial?")) {
    await deleteDoc(doc(db, "testimonials", id));
    loadPending();
  }
};

// ---------------- Delete Slot ----------------
window.deleteSlot = async function (id) {
  if (confirm("Are you sure you want to delete this slot?")) {
    await deleteDoc(doc(db, "slots", id));
    loadSlots();
  }
};

// ---------------- Logout ----------------
const logoutBtn = document.getElementById("logoutBtn");
logoutBtn.addEventListener("click", () => {
  localStorage.removeItem("adminLoggedIn");
  location.reload();
});
