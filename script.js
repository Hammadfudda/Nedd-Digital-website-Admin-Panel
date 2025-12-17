import { initializeApp } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-app.js";
import { 
  getFirestore, collection, getDocs, query, orderBy, updateDoc, doc, deleteDoc, addDoc, serverTimestamp 
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";

// Firebase Config
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

const PASS = "03172052765";

// Loader
function showLoader() { document.getElementById("loaderPopup").classList.remove("hidden"); }
function hideLoader() { document.getElementById("loaderPopup").classList.add("hidden"); }

// Alert Popup
function showAlert(message) {
  const overlay = document.createElement("div");
  overlay.className = "fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4";
  
  const popup = document.createElement("div");
  popup.className = "bg-white rounded-xl shadow-lg p-6 text-center max-w-sm mx-4";
  popup.innerHTML = `
    <p class="text-lg font-semibold mb-4">${message}</p>
    <button onclick="this.closest('.fixed').remove()" class="px-6 py-2 bg-sky-900 text-white rounded hover:bg-sky-800">
      OK
    </button>
  `;
  
  overlay.appendChild(popup);
  document.body.appendChild(overlay);
}

// Login
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

function showAdminSection() {
  document.getElementById("passwordSection").classList.add("hidden");
  document.getElementById("adminSection").classList.remove("hidden");
  document.getElementById("logoutBtn").classList.remove("hidden");
  loadPending();
  loadContacts();
  loadGmailList();
  loadGmailAccounts();
  loadTodayDue();
}

// Tabs
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

// Confirmation Popup
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

// ============== GMAIL LIST MANAGEMENT ==============

// Load Gmail List for Dropdown
async function loadGmailList() {
  const dropdown = document.getElementById("gmailName");
  if (!dropdown) return;
  
  try {
    const q = query(collection(db, "gmailList"), orderBy("createdAt", "desc"));
    const snapshot = await getDocs(q);
    
    dropdown.innerHTML = '<option value="">Select Gmail Account</option>';
    
    snapshot.forEach((docSnap) => {
      const data = docSnap.data();
      const option = document.createElement("option");
      option.value = data.name;
      option.textContent = data.name;
      dropdown.appendChild(option);
    });
  } catch (err) {
    console.error("Error loading Gmail list:", err);
  }
}

// Add Gmail Popup
const addGmailBtn = document.getElementById("addGmailBtn");
const addGmailPopup = document.getElementById("addGmailPopup");
const cancelAddGmail = document.getElementById("cancelAddGmail");
const addGmailPopupForm = document.getElementById("addGmailPopupForm");

if (addGmailBtn) {
  addGmailBtn.addEventListener("click", () => {
    addGmailPopup.classList.remove("hidden");
    document.getElementById("newGmailName").value = "";
  });
}

if (cancelAddGmail) {
  cancelAddGmail.addEventListener("click", () => {
    addGmailPopup.classList.add("hidden");
  });
}

if (addGmailPopupForm) {
  addGmailPopupForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    
    const gmailName = document.getElementById("newGmailName").value.trim();
    
    if (!gmailName) {
      showAlert("Please enter Gmail account name");
      return;
    }
    
    showLoader();
    
    try {
      await addDoc(collection(db, "gmailList"), {
        name: gmailName,
        createdAt: serverTimestamp()
      });
      
      addGmailPopup.classList.add("hidden");
      await loadGmailList();
      hideLoader();
      showAlert("Gmail account added to dropdown!");
    } catch (err) {
      console.error(err);
      hideLoader();
      showAlert("Failed to add Gmail account");
    }
  });
}

// ============== EMAIL TRACKING SYSTEM ==============

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

// Add Email Campaign Form
const addGmailForm = document.getElementById("addGmailForm");
if (addGmailForm) {
  addGmailForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    
    const gmailName = document.getElementById("gmailName").value.trim();
    const startEmail = document.getElementById("startEmail").value.trim();
    const endEmail = document.getElementById("endEmail").value.trim();
    
    if (!gmailName || !startEmail || !endEmail) {
      showAlert("Please fill all fields");
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
      showAlert("Campaign added successfully!");
    } catch (err) {
      console.error(err);
      hideLoader();
      showAlert("Failed to add campaign");
    }
  });
}

// Load All Gmail Campaigns
async function loadGmailAccounts() {
  const list = document.getElementById("gmailAccountsList");
  if (!list) return;
  
  showLoader();
  
  try {
    const q = query(collection(db, "gmailAccounts"), orderBy("createdAt", "desc"));
    const snapshot = await getDocs(q);
    
    list.innerHTML = "";
    
    if (snapshot.empty) {
      list.innerHTML = '<p class="text-gray-500">No campaigns added yet.</p>';
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
      card.className = `bg-white shadow rounded-xl p-3 sm:p-4 border-2 ${isDueToday ? 'border-amber-400' : isPastDue ? 'border-red-400' : isComplete ? 'border-green-400' : 'border-transparent'}`;
      card.innerHTML = `
        <div class="flex flex-col sm:flex-row items-start justify-between mb-3 gap-2">
          <h4 class="text-base sm:text-lg font-bold text-sky-900 break-words">${data.gmailName}</h4>
          ${statusBadge}
        </div>
        
        <div class="space-y-1 text-xs sm:text-sm text-slate-700 mb-3 break-words">
          <div><span class="font-semibold">Start:</span> ${data.startEmail}</div>
          <div><span class="font-semibold">End:</span> ${data.endEmail}</div>
          <div><span class="font-semibold">Progress:</span> ${stageText}</div>
          <div><span class="font-semibold">Last Sent:</span> ${formatDate(data.lastSentDate)}</div>
          <div><span class="font-semibold">Next Due:</span> ${nextDueDate ? formatDate(nextDueDate) : "N/A"} ${!isComplete ? `(${nextDay})` : ''}</div>
        </div>
        
        <div class="flex flex-col sm:flex-row gap-2">
          <button onclick="openEditGmailPopup('${id}')" class="flex-1 bg-blue-600 text-white py-1.5 sm:py-2 px-3 rounded hover:bg-blue-700 text-xs sm:text-sm">
            Edit
          </button>
          <button onclick="deleteGmail('${id}')" class="flex-1 bg-red-600 text-white py-1.5 sm:py-2 px-3 rounded hover:bg-red-700 text-xs sm:text-sm">
            Delete
          </button>
        </div>
      `;
      
      list.appendChild(card);
    });
    hideLoader();
  } catch (err) {
    console.error("Error loading campaigns:", err);
    list.innerHTML = '<p class="text-red-600">Failed to load campaigns</p>';
    hideLoader();
  }
}

// Load Today's Due Emails
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
        card.className = `bg-white shadow rounded-xl p-3 sm:p-4 border-2 ${isPastDue ? 'border-red-400' : 'border-amber-400'}`;
        card.innerHTML = `
          <div class="flex flex-col sm:flex-row items-start justify-between mb-2 gap-2">
            <h4 class="text-base sm:text-lg font-bold text-sky-900 break-words">${data.gmailName}</h4>
            <span class="px-2 py-1 ${isPastDue ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'} rounded-full text-xs font-semibold whitespace-nowrap">
              ${isPastDue ? 'Overdue' : 'Due Today'}
            </span>
          </div>
          
          <div class="space-y-1 text-xs sm:text-sm text-slate-700 mb-3 break-words">
            <div><span class="font-semibold">Email:</span> ${data.currentStage + 1}/4 (${nextDay})</div>
            <div><span class="font-semibold">Range:</span> ${data.startEmail} → ${data.endEmail}</div>
            <div><span class="font-semibold">Due Date:</span> ${formatDate(nextDueDate)}</div>
          </div>
          
          <button onclick="markAsSent('${id}')" class="w-full bg-sky-900 text-white py-1.5 sm:py-2 rounded hover:bg-sky-800 text-xs sm:text-sm">
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

// Mark Email as Sent
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
      showAlert("Campaign not found");
      return;
    }
    
    const newStage = currentData.currentStage + 1;
    
    await updateDoc(docRef, {
      currentStage: newStage,
      lastSentDate: new Date().toISOString()
    });
    
    if (newStage >= 4) {
      showAlert("🎉 All emails completed for this campaign!");
    } else {
      const dayIntervals = [0, 3, 9, 12];
      showAlert(`✅ Marked as sent! Next email in ${dayIntervals[newStage]} days.`);
    }
    
    await loadGmailAccounts();
    await loadTodayDue();
    hideLoader();
  } catch (err) {
    console.error(err);
    hideLoader();
    showAlert("Failed to update");
  }
};

// Edit Gmail Campaign Popup
function createEditGmailPopup(data, id) {
  const overlay = document.createElement("div");
  overlay.className = "fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 px-3 sm:px-4";

  const popup = document.createElement("div");
  popup.className = "bg-white w-full max-w-lg rounded-xl shadow-lg p-4 sm:p-6 overflow-y-auto max-h-[90vh]";

  popup.innerHTML = `
    <h2 class="text-base sm:text-lg font-bold mb-3 sm:mb-4">Edit Campaign</h2>
    <form id="editGmailForm" class="space-y-3 sm:space-y-4">
      <div>
        <label class="block mb-2 text-xs sm:text-sm font-medium text-gray-700">Gmail Account Name</label>
        <input type="text" id="edit-gmailName" value="${data.gmailName || ""}" class="w-full border rounded p-2 text-sm sm:text-base" required />
      </div>
      <div>
        <label class="block mb-2 text-xs sm:text-sm font-medium text-gray-700">Start Email Address</label>
        <input type="email" id="edit-startEmail" value="${data.startEmail || ""}" class="w-full border rounded p-2 text-sm sm:text-base" required />
      </div>
      <div>
        <label class="block mb-2 text-xs sm:text-sm font-medium text-gray-700">End Email Address</label>
        <input type="email" id="edit-endEmail" value="${data.endEmail || ""}" class="w-full border rounded p-2 text-sm sm:text-base" required />
      </div>
      <div class="flex flex-col sm:flex-row justify-end gap-2 mt-4">
        <button type="button" id="cancelEditGmail" class="w-full sm:w-auto px-4 py-2 bg-gray-500 text-white rounded text-sm sm:text-base order-2 sm:order-1">Cancel</button>
        <button type="submit" class="w-full sm:w-auto px-4 py-2 bg-sky-900 text-white rounded text-sm sm:text-base order-1 sm:order-2">Save Changes</button>
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
    showAlert("Campaign updated successfully!");
  });
}

window.openEditGmailPopup = async function (id) {
  const snapshot = await getDocs(query(collection(db, "gmailAccounts")));
  let gmailData = null;
  snapshot.forEach((docSnap) => { if (docSnap.id === id) gmailData = docSnap.data(); });
  if (!gmailData) return showAlert("Campaign not found!");
  createEditGmailPopup(gmailData, id);
};

// Delete Gmail Campaign
window.deleteGmail = async function(id) {
  await showConfirm("Are you sure you want to delete this campaign?", async () => {
    showLoader();
    try {
      await deleteDoc(doc(db, "gmailAccounts", id));
      await loadGmailAccounts();
      await loadTodayDue();
      hideLoader();
      showAlert("Campaign deleted");
    } catch (err) {
      console.error(err);
      hideLoader();
      showAlert("Failed to delete");
    }
  });
};

// ============== TESTIMONIALS ==============

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
      card.className = "bg-white shadow rounded-xl p-3 sm:p-4";
      card.innerHTML = `
        <p class="text-slate-600 text-sm sm:text-base">"${data.testimonial}"</p>
        <div class="mt-2 font-bold text-sm sm:text-base">- ${data.name}</div>
        <div class="mt-3 sm:mt-4 flex flex-col sm:flex-row gap-2">
          <button class="flex-1 px-3 py-1.5 sm:py-1 bg-green-600 text-white rounded text-xs sm:text-sm" onclick="approveTestimonial('${docSnap.id}')">Approve</button>
          <button class="flex-1 px-3 py-1.5 sm:py-1 bg-red-600 text-white rounded text-xs sm:text-sm" onclick="deleteTestimonial('${docSnap.id}')">Delete</button>
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

// ============== CONTACTS ==============

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
    card.className = "bg-white shadow rounded-xl p-3 sm:p-4";
    card.innerHTML = `
      <div class="font-bold mb-2 text-sm sm:text-base">Client Contact</div>
      <div class="text-xs sm:text-sm text-slate-600 space-y-1 break-words">${detailsHTML}</div>
      <div class="mt-3 flex flex-col sm:flex-row gap-2">
        <button class="flex-1 px-3 py-1.5 sm:py-1 bg-blue-600 text-white rounded text-xs sm:text-sm" onclick="openEditContactPopup('${docSnap.id}')">Edit</button>
        <button class="flex-1 px-3 py-1.5 sm:py-1 bg-red-600 text-white rounded text-xs sm:text-sm" onclick="deleteContact('${docSnap.id}')">Delete</button>
      </div>
    `;
    container.appendChild(card);
  });
  hideLoader();
}

window.deleteContact = async function (id) {
  await showConfirm("Are you sure you want to delete this contact?", async () => {
    showLoader();
    await deleteDoc(doc(db, "contacts", id));
    await loadContacts();
    hideLoader();
  });
};

function createEditContactPopup(data, id) {
  const overlay = document.createElement("div");
  overlay.className = "fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 px-3 sm:px-4";

  const popup = document.createElement("div");
  popup.className = "bg-white w-full max-w-lg rounded-xl shadow-lg p-4 sm:p-6 overflow-y-auto max-h-[90vh]";

  let fieldsHTML = "";
  for (const key in data) {
    if (key === "timestamp") continue;
    fieldsHTML += `
      <label class="block mb-2 text-xs sm:text-sm font-medium text-gray-700">${key}</label>
      <input type="text" id="edit-${key}" value="${data[key] || ""}" class="w-full border rounded p-2 mb-3 sm:mb-4 text-sm sm:text-base" />
    `;
  }

  popup.innerHTML = `
    <h2 class="text-base sm:text-lg font-bold mb-3 sm:mb-4">Edit Contact</h2>
    <form id="editForm" class="space-y-2">
      ${fieldsHTML}
      <div class="flex flex-col sm:flex-row justify-end gap-2 mt-4">
        <button type="button" id="cancelEdit" class="w-full sm:w-auto px-4 py-2 bg-gray-500 text-white rounded text-sm sm:text-base order-2 sm:order-1">Cancel</button>
        <button type="submit" class="w-full sm:w-auto px-4 py-2 bg-sky-900 text-white rounded text-sm sm:text-base order-1 sm:order-2">Save</button>
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
  if (!contactData) return showAlert("Contact not found!");
  createEditContactPopup(contactData, id);
};

// Logout
const logoutBtn = document.getElementById("logoutBtn");
logoutBtn.addEventListener("click", () => {
  localStorage.removeItem("adminLoggedIn");
  location.reload();
});