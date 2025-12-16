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

// ---------------- Loader ----------------
function showLoader() { document.getElementById("loaderPopup").classList.remove("hidden"); }
function hideLoader() { document.getElementById("loaderPopup").classList.add("hidden"); }

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
  loadGmailAccounts();
  loadTodayDue();
}

// ---------------- Tabs ----------------
const tabTestimonials = document.getElementById("tabTestimonials");
const tabContacts = document.getElementById("tabContacts");
const tabEmailTracking = document.getElementById("tabEmailTracking");

const testimonialSection = document.getElementById("testimonialSection");
const contactSection = document.getElementById("contactSection");
const emailTrackingSection = document.getElementById("emailTrackingSection");

const tabs = [tabTestimonials, tabContacts, tabEmailTracking];
const sections = [testimonialSection, contactSection, emailTrackingSection];

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
tabEmailTracking.addEventListener("click", () => activateTab(tabEmailTracking));
activateTab(tabTestimonials);

// ---------------- Confirmation Popup ----------------
function showConfirm(message, callback) {
  const popup = document.getElementById("confirmPopup");
  const msg = document.getElementById("confirmMessage");
  const btnCancel = document.getElementById("confirmCancel");
  const btnOk = document.getElementById("confirmOk");

  msg.textContent = message;
  popup.classList.remove("hidden");

  const close = () => popup.classList.add("hidden");

  btnCancel.onclick = () => { close(); };
  btnOk.onclick = async () => { close(); await callback(); };
}

// ---------------- Load Pending Testimonials ----------------
async function loadPending() {
  showLoader();
  const container = document.getElementById("pendingTestimonials");
  const q = query(collection(db, "testimonials"), orderBy("timestamp", "desc"));
  const snapshot = await getDocs(q);
  container.innerHTML = "";

  let hasPending = false;
  snapshot.forEach((docSnap) => {
    const data = docSnap.data();
    if (!data.approved) {
      hasPending = true;
      const card = document.createElement("div");
      card.className = "bg-white shadow rounded-xl p-4";
      card.innerHTML = `
        <p class="text-slate-600">"${data.testimonial}"</p>
        <div class="mt-2 font-bold">- ${data.name}</div>
        <div class="mt-4 flex gap-2">
          <button class="px-3 py-1 bg-green-600 text-white rounded" onclick="approveTestimonial('${docSnap.id}')">Approve</button>
          <button class="px-3 py-1 bg-red-600 text-white rounded" onclick="deleteTestimonial('${docSnap.id}')">Delete</button>
        </div>
      `;
      container.appendChild(card);
    }
  });

  if (!hasPending) {
    container.innerHTML = `<p class="text-gray-500">No pending testimonials.</p>`;
  }
  hideLoader();
}

// ---------------- Load Client Contacts ----------------
async function loadContacts() {
  showLoader();
  const container = document.getElementById("clientContacts");
  const q = query(collection(db, "contacts"), orderBy("timestamp", "desc"));
  const snapshot = await getDocs(q);
  container.innerHTML = "";

  if (snapshot.empty) {
    container.innerHTML = `<p class="text-gray-500">No client contacts found.</p>`;
    hideLoader();
    return;
  }

  snapshot.forEach((docSnap) => {
    const data = docSnap.data();
    let detailsHTML = "";
    for (const key in data) {
      if (key === "timestamp") continue;
      detailsHTML += `<div><b>${key}:</b> ${data[key]}</div>`;
    }

    const card = document.createElement("div");
    card.className = "bg-white shadow rounded-xl p-4";
    card.innerHTML = `
      <div class="font-bold mb-2">Client Contact</div>
      <div class="text-sm text-slate-600 space-y-1">${detailsHTML}</div>
      <div class="mt-3 flex gap-2">
        <button class="px-3 py-1 bg-blue-600 text-white rounded" onclick="openEditContactPopup('${docSnap.id}')">Edit</button>
        <button class="px-3 py-1 bg-red-600 text-white rounded" onclick="deleteContact('${docSnap.id}')">Delete</button>
      </div>
    `;
    container.appendChild(card);
  });
  hideLoader();
}

// ---------------- Delete Contact ----------------
window.deleteContact = async function (id) {
  await showConfirm("Are you sure you want to delete this contact?", async () => {
    showLoader();
    await deleteDoc(doc(db, "contacts", id));
    await loadContacts();
    hideLoader();
  });
};

// ---------------- Edit Contact Popup ----------------
function createEditContactPopup(data, id) {
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

  document.getElementById("cancelEdit").addEventListener("click", () => { overlay.remove(); });

  document.getElementById("editForm").addEventListener("submit", async (e) => {
    e.preventDefault();
    showLoader();
    const updatedData = {};
    for (const key in data) {
      if (key === "timestamp") continue;
      const input = document.getElementById(`edit-${key}`);
      updatedData[key] = input.value.trim();
    }
    await updateDoc(doc(db, "contacts", id), updatedData);
    overlay.remove();
    await loadContacts();
    hideLoader();
  });
}

window.openEditContactPopup = async function (id) {
  const snapshot = await getDocs(query(collection(db, "contacts")));
  let contactData = null;
  snapshot.forEach((docSnap) => { if (docSnap.id === id) contactData = docSnap.data(); });
  if (!contactData) return alert("Contact not found!");
  createEditContactPopup(contactData, id);
};

// ============== EMAIL TRACKING SYSTEM ==============

// ---------------- Helper Functions ----------------
function formatDate(date) {
  if (!date) return "N/A";
  const d = new Date(date);
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function isToday(date) {
  const today = new Date();
  const checkDate = new Date(date);
  return today.toDateString() === checkDate.toDateString();
}

function isOverdue(date) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const checkDate = new Date(date);
  checkDate.setHours(0, 0, 0, 0);
  return checkDate < today;
}

function calculateNextDueDate(lastSentDate, currentStage) {
  const dayIntervals = [0, 3, 9, 12];
  if (currentStage >= 4) return null;
  
  const lastDate = new Date(lastSentDate);
  const nextInterval = dayIntervals[currentStage];
  const nextDate = new Date(lastDate);
  nextDate.setDate(lastDate.getDate() + nextInterval);
  
  return nextDate;
}

// ---------------- Add Gmail Form ----------------
const addGmailForm = document.getElementById("addGmailForm");
if (addGmailForm) {
  addGmailForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    
    const gmailName = document.getElementById("gmailName").value.trim();
    const startEmail = document.getElementById("startEmail").value.trim();
    const endEmail = document.getElementById("endEmail").value.trim();
    
    if (!gmailName || !startEmail || !endEmail) {
      alert("Please fill all fields");
      return;
    }
    
    showLoader();
    
    try {
      await addDoc(collection(db, "gmailAccounts"), {
        gmailName,
        startEmail,
        endEmail,
        currentStage: 0,
        lastSentDate: new Date().toISOString(),
        createdAt: serverTimestamp()
      });
      
      addGmailForm.reset();
      await loadGmailAccounts();
      await loadTodayDue();
      hideLoader();
      alert("Gmail account added successfully!");
    } catch (err) {
      console.error(err);
      hideLoader();
      alert("Failed to add account");
    }
  });
}

// ---------------- Load All Gmail Accounts ----------------
async function loadGmailAccounts() {
  const list = document.getElementById("gmailAccountsList");
  if (!list) return;
  
  showLoader();
  
  try {
    const q = query(collection(db, "gmailAccounts"), orderBy("createdAt", "desc"));
    const snapshot = await getDocs(q);
    
    list.innerHTML = "";
    
    if (snapshot.empty) {
      list.innerHTML = '<p class="text-gray-500">No Gmail accounts added yet.</p>';
      hideLoader();
      return;
    }
    
    snapshot.forEach((docSnap) => {
      const data = docSnap.data();
      const id = docSnap.id;
      
      const nextDueDate = calculateNextDueDate(data.lastSentDate, data.currentStage);
      const isComplete = data.currentStage >= 4;
      const isDueToday = nextDueDate && isToday(nextDueDate);
      const isPastDue = nextDueDate && isOverdue(nextDueDate);
      
      const stageText = isComplete ? "✅ Completed" : `Email ${data.currentStage + 1}/4`;
      const dayIntervals = [0, 3, 9, 12];
      const nextDay = isComplete ? "-" : `Day ${dayIntervals[data.currentStage]}`;
      
      let statusBadge = "";
      if (isComplete) {
        statusBadge = '<span class="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-semibold">Completed</span>';
      } else if (isDueToday) {
        statusBadge = '<span class="px-3 py-1 bg-amber-100 text-amber-700 rounded-full text-sm font-semibold">Due Today!</span>';
      } else if (isPastDue) {
        statusBadge = '<span class="px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm font-semibold">Overdue</span>';
      } else {
        statusBadge = '<span class="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-semibold">Active</span>';
      }
      
      const card = document.createElement("div");
      card.className = `bg-white shadow rounded-xl p-4 border-2 ${isDueToday ? 'border-amber-400' : isPastDue ? 'border-red-400' : isComplete ? 'border-green-400' : 'border-transparent'}`;
      card.innerHTML = `
        <div class="flex items-start justify-between mb-3">
          <h4 class="text-lg font-bold text-sky-900">${data.gmailName}</h4>
          ${statusBadge}
        </div>
        
        <div class="space-y-1 text-sm text-slate-700 mb-3">
          <div><span class="font-semibold">Start:</span> ${data.startEmail}</div>
          <div><span class="font-semibold">End:</span> ${data.endEmail}</div>
          <div><span class="font-semibold">Progress:</span> ${stageText}</div>
          <div><span class="font-semibold">Last Sent:</span> ${formatDate(data.lastSentDate)}</div>
          <div><span class="font-semibold">Next Due:</span> ${nextDueDate ? formatDate(nextDueDate) : "N/A"} ${!isComplete ? `(${nextDay})` : ''}</div>
        </div>
        
        <div class="flex gap-2">
          <button onclick="openEditGmailPopup('${id}')" class="flex-1 bg-blue-600 text-white py-2 px-3 rounded hover:bg-blue-700 text-sm">
            Edit
          </button>
          <button onclick="deleteGmail('${id}')" class="flex-1 bg-red-600 text-white py-2 px-3 rounded hover:bg-red-700 text-sm">
            Delete
          </button>
        </div>
      `;
      
      list.appendChild(card);
    });
    hideLoader();
  } catch (err) {
    console.error("Error loading Gmail accounts:", err);
    list.innerHTML = '<p class="text-red-600">Failed to load accounts</p>';
    hideLoader();
  }
}

// ---------------- Load Today's Due Emails ----------------
async function loadTodayDue() {
  const list = document.getElementById("todayDueList");
  if (!list) return;
  
  try {
    const q = query(collection(db, "gmailAccounts"), orderBy("createdAt", "desc"));
    const snapshot = await getDocs(q);
    
    list.innerHTML = "";
    
    let hasDueToday = false;
    
    snapshot.forEach((docSnap) => {
      const data = docSnap.data();
      const id = docSnap.id;
      
      const nextDueDate = calculateNextDueDate(data.lastSentDate, data.currentStage);
      const isComplete = data.currentStage >= 4;
      
      if (!isComplete && nextDueDate && (isToday(nextDueDate) || isOverdue(nextDueDate))) {
        hasDueToday = true;
        
        const dayIntervals = [0, 3, 9, 12];
        const nextDay = `Day ${dayIntervals[data.currentStage]}`;
        const isPastDue = isOverdue(nextDueDate);
        
        const card = document.createElement("div");
        card.className = `bg-white shadow rounded-xl p-4 border-2 ${isPastDue ? 'border-red-400' : 'border-amber-400'}`;
        card.innerHTML = `
          <div class="flex items-start justify-between mb-2">
            <h4 class="text-lg font-bold text-sky-900">${data.gmailName}</h4>
            <span class="px-2 py-1 ${isPastDue ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'} rounded-full text-xs font-semibold">
              ${isPastDue ? 'Overdue' : 'Due Today'}
            </span>
          </div>
          
          <div class="space-y-1 text-sm text-slate-700 mb-3">
            <div><span class="font-semibold">Email:</span> ${data.currentStage + 1}/4 (${nextDay})</div>
            <div><span class="font-semibold">Range:</span> ${data.startEmail} → ${data.endEmail}</div>
            <div><span class="font-semibold">Due Date:</span> ${formatDate(nextDueDate)}</div>
          </div>
          
          <button onclick="markAsSent('${id}')" class="w-full bg-sky-900 text-white py-2 rounded hover:bg-sky-800 text-sm">
            Mark as Sent
          </button>
        `;
        
        list.appendChild(card);
      }
    });
    
    if (!hasDueToday) {
      list.innerHTML = '<p class="text-gray-500">🎉 No emails due today!</p>';
    }
  } catch (err) {
    console.error("Error loading today's due:", err);
    list.innerHTML = '<p class="text-red-600">Failed to load</p>';
  }
}

// ---------------- Mark Email as Sent ----------------
window.markAsSent = async function(id) {
  showLoader();
  try {
    const docRef = doc(db, "gmailAccounts", id);
    const docSnap = await getDocs(query(collection(db, "gmailAccounts")));
    
    let currentData = null;
    docSnap.forEach((d) => {
      if (d.id === id) currentData = d.data();
    });
    
    if (!currentData) {
      hideLoader();
      alert("Account not found");
      return;
    }
    
    const newStage = currentData.currentStage + 1;
    
    await updateDoc(docRef, {
      currentStage: newStage,
      lastSentDate: new Date().toISOString()
    });
    
    if (newStage >= 4) {
      alert("🎉 All emails completed for this account!");
    } else {
      const dayIntervals = [0, 3, 9, 12];
      alert(`✅ Marked as sent! Next email in ${dayIntervals[newStage]} days.`);
    }
    
    await loadGmailAccounts();
    await loadTodayDue();
    hideLoader();
  } catch (err) {
    console.error(err);
    hideLoader();
    alert("Failed to update");
  }
};

// ---------------- Edit Gmail Account Popup ----------------
function createEditGmailPopup(data, id) {
  const overlay = document.createElement("div");
  overlay.className = "fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 px-4";

  const popup = document.createElement("div");
  popup.className = "bg-white w-full max-w-lg rounded-xl shadow-lg p-6 overflow-y-auto max-h-[90vh]";

  popup.innerHTML = `
    <h2 class="text-lg font-bold mb-4">Edit Gmail Account</h2>
    <form id="editGmailForm" class="space-y-4">
      <div>
        <label class="block mb-2 text-sm font-medium text-gray-700">Gmail Account Name</label>
        <input type="text" id="edit-gmailName" value="${data.gmailName || ""}" class="w-full border rounded p-2" required />
      </div>
      <div>
        <label class="block mb-2 text-sm font-medium text-gray-700">Start Email Address</label>
        <input type="email" id="edit-startEmail" value="${data.startEmail || ""}" class="w-full border rounded p-2" required />
      </div>
      <div>
        <label class="block mb-2 text-sm font-medium text-gray-700">End Email Address</label>
        <input type="email" id="edit-endEmail" value="${data.endEmail || ""}" class="w-full border rounded p-2" required />
      </div>
      <div class="flex justify-end gap-2 mt-4">
        <button type="button" id="cancelEditGmail" class="px-4 py-2 bg-gray-500 text-white rounded">Cancel</button>
        <button type="submit" class="px-4 py-2 bg-sky-900 text-white rounded">Save Changes</button>
      </div>
    </form>
  `;
  overlay.appendChild(popup);
  document.body.appendChild(overlay);

  document.getElementById("cancelEditGmail").addEventListener("click", () => { overlay.remove(); });

  document.getElementById("editGmailForm").addEventListener("submit", async (e) => {
    e.preventDefault();
    showLoader();
    
    const updatedData = {
      gmailName: document.getElementById("edit-gmailName").value.trim(),
      startEmail: document.getElementById("edit-startEmail").value.trim(),
      endEmail: document.getElementById("edit-endEmail").value.trim()
    };
    
    await updateDoc(doc(db, "gmailAccounts", id), updatedData);
    overlay.remove();
    await loadGmailAccounts();
    await loadTodayDue();
    hideLoader();
    alert("Gmail account updated successfully!");
  });
}

window.openEditGmailPopup = async function (id) {
  const snapshot = await getDocs(query(collection(db, "gmailAccounts")));
  let gmailData = null;
  snapshot.forEach((docSnap) => { if (docSnap.id === id) gmailData = docSnap.data(); });
  if (!gmailData) return alert("Gmail account not found!");
  createEditGmailPopup(gmailData, id);
};

// ---------------- Delete Gmail Account ----------------
window.deleteGmail = async function(id) {
  await showConfirm("Are you sure you want to delete this Gmail account?", async () => {
    showLoader();
    try {
      await deleteDoc(doc(db, "gmailAccounts", id));
      await loadGmailAccounts();
      await loadTodayDue();
      hideLoader();
      alert("Gmail account deleted");
    } catch (err) {
      console.error(err);
      hideLoader();
      alert("Failed to delete");
    }
  });
};

// ============== TESTIMONIALS ==============

// ---------------- Approve/Delete Testimonials ----------------
window.approveTestimonial = async function (id) {
  showLoader();
  await updateDoc(doc(db, "testimonials", id), { approved: true });
  await loadPending();
  hideLoader();
};

window.deleteTestimonial = async function (id) {
  await showConfirm("Are you sure you want to delete this testimonial?", async () => {
    showLoader();
    await deleteDoc(doc(db, "testimonials", id));
    await loadPending();
    hideLoader();
  });
};

// ---------------- Logout ----------------
const logoutBtn = document.getElementById("logoutBtn");
logoutBtn.addEventListener("click", () => {
  localStorage.removeItem("adminLoggedIn");
  location.reload();
});