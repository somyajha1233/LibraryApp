import { initializeApp } from "https://www.gstatic.com/firebasejs/12.9.0/firebase-app.js";
import { getDatabase, ref, set, onValue, remove, update } from "https://www.gstatic.com/firebasejs/12.9.0/firebase-database.js";

const ADMIN_PASSWORD = "admin123";

// 1. Firebase Configuration
const firebaseConfig = {
    apiKey: "AIzaSyBh1s2S6rZe9zK4DLWpZUcpXtXZolEBQlI",
    authDomain: "webapp-e8b28.firebaseapp.com",
    projectId: "webapp-e8b28",
    storageBucket: "webapp-e8b28.firebasestorage.app",
    messagingSenderId: "126884302653",
    appId: "1:126884302653:web:2e0ab14def6bad3361ff54",
    measurementId: "G-GJVK5R349Q"
};

// 2. Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);
const booksRef = ref(db, 'library/books');

// 3. Local State (Syncs with Firebase)
let books = [];

// 4. Real-time Listener (Crucial for syncing)
onValue(booksRef, (snapshot) => {
    const data = snapshot.val();
    books = data ? Object.values(data) : [];
    render();
});

// --- AUTH LOGIC ---
function checkPassword() {
    const pass = document.getElementById('adminPass').value;
    if (pass === ADMIN_PASSWORD) {
        sessionStorage.setItem('isAdminLoggedIn', 'true');
        updateAdminVisibility();
    } else { 
        document.getElementById('loginError').style.display = 'block';
    }
}

function updateAdminVisibility() {
    const isLoggedIn = sessionStorage.getItem('isAdminLoggedIn') === 'true';
    const loginSec = document.getElementById('loginSection');
    const adminCont = document.getElementById('adminContent');
    const logoutBtn = document.getElementById('logoutBtn');

    if (loginSec && adminCont) {
        loginSec.style.display = isLoggedIn ? 'none' : 'block';
        adminCont.style.display = isLoggedIn ? 'block' : 'none';
        if (logoutBtn) logoutBtn.style.display = isLoggedIn ? 'block' : 'none';
    }
}

function logout() { sessionStorage.removeItem('isAdminLoggedIn'); window.location.reload(); }

// --- CORE ACTIONS (Firebase) ---

// Add Book
const bookForm = document.getElementById('bookForm');
if (bookForm) {
    bookForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const id = Date.now().toString();
        const newBook = {
            id: id,
            title: document.getElementById('title').value,
            author: document.getElementById('author').value,
            total: parseInt(document.getElementById('quantity').value) || 1,
            issuedTo: []
        };
        
        // Save to Firebase
        set(ref(db, 'library/books/' + id), newBook);
        e.target.reset();
    });
}

// ISSUE BOOK
window.issueToUser = function(bookId) {
    const book = books.find(b => b.id == bookId);
    
    if (!book) return;
    if (!book.issuedTo) book.issuedTo = []; 
    
    if (book.issuedTo.length < book.total) {
        const userId = prompt("Enter User/Student ID:");
        if (userId) {
            book.issuedTo.push(userId);
            update(ref(db, 'library/books/' + bookId), { issuedTo: book.issuedTo });
        }
    } else { alert("No copies available!"); }
}

// RETURN BOOK
window.returnFromUser = function(bookId) {
    const book = books.find(b => b.id == bookId);
    
    if (!book) return;
    if (!book.issuedTo) book.issuedTo = [];
    
    if (book.issuedTo.length > 0) {
        const userId = prompt(`Enter ID returning book:\nCurrently held by: ${book.issuedTo.join(', ')}`);
        const index = book.issuedTo.indexOf(userId);
        if (index > -1) {
            book.issuedTo.splice(index, 1);
            update(ref(db, 'library/books/' + bookId), { issuedTo: book.issuedTo });
        } else { alert("User ID not found!"); }
    }
}

// DELETE BOOK
window.deleteBook = function(id) { 
    if(confirm("Delete this book permanently?")) {
        remove(ref(db, 'library/books/' + id));
    }
}

// --- QR MODAL ---
window.showQR = function(id, title) {
    const modal = document.getElementById('qrModal');
    const qrContainer = document.getElementById('qrcode');
    if (!modal || !qrContainer) return;

    qrContainer.innerHTML = "";
    document.getElementById('qrText').innerText = title;
    modal.style.display = "block";

    const url = `${window.location.origin}${window.location.pathname}?bookId=${id}`;
    new QRCode(qrContainer, { text: url, width: 180, height: 180 });
}

window.closeModal = function() { 
    const modal = document.getElementById('qrModal');
    if(modal) modal.style.display = "none"; 
}

// --- EXPOSE NECESSARY FUNCTIONS TO WINDOW ---
window.checkPassword = checkPassword;
window.logout = logout;

// --- RENDER ---
function render() {
    const adminList = document.getElementById('adminBookList');
    const clientList = document.getElementById('clientBookList');

    if (adminList) {
        adminList.innerHTML = books.length === 0 
            ? '<tr><td colspan="4" style="text-align:center">No books added yet.</td></tr>'
            : books.map(b => `
            <tr>
                <td data-label="Book"><strong>${b.title}</strong><br><small>${b.author}</small></td>
                <td data-label="Stock">${b.total - (b.issuedTo ? b.issuedTo.length : 0)} / ${b.total}</td>
                <td data-label="Borrowed By">
                    ${(b.issuedTo && b.issuedTo.length > 0) 
                        ? b.issuedTo.map(id => `<span class="user-badge">${id}</span>`).join(' ') 
                        : '<span style="color: #bbb;">None</span>'}
                </td>
                <td data-label="Actions">
                    <button class="issue-btn" style="background:#27ae60; color:white; padding:5px 10px;" onclick="issueToUser('${b.id}')">Issue</button>
                    <button class="return-btn" style="background:#3498db; color:white; padding:5px 10px;" onclick="returnFromUser('${b.id}')">Return</button>
                    <button class="delete-btn" style="background:#e74c3c; color:white; padding:5px 10px;" onclick="deleteBook('${b.id}')">Del</button>
                </td>
            </tr>
        `).join('');
    }

    if (clientList) {
        clientList.innerHTML = books.length === 0
            ? '<p>The library is currently empty.</p>'
            : books.map(b => {
                const avail = b.total - (b.issuedTo ? b.issuedTo.length : 0);
                // Safe handling of single quotes in titles for the onclick function
                const safeTitle = b.title.replace(/'/g, "\\'");                
                return `
                    <div class="book-card" style="border-top: 4px solid ${avail > 0 ? '#27ae60' : '#e74c3c'}">
                        <h4>${b.title}</h4>
                        <p>By ${b.author}</p>
                        <p><strong>Available: ${avail} / ${b.total}</strong></p>
                        ${avail > 0 
                            ? `<button class="qr-btn" onclick="showQR('${b.id}', '${safeTitle}')" style="background:#34495e; color:white; width:100%; border-radius:5px; padding:8px;">Show QR</button>` 
                            : `<p style="color:#e74c3c; font-weight:bold;">Out of Stock</p>`}
                    </div>
                `;
            }).join('');
    }
}

window.onload = () => {
    updateAdminVisibility();
    render();
};