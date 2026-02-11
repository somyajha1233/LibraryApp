const ADMIN_PASSWORD = "admin123";

// Fail-Safe Loading
let books = [];
try {
    const savedData = localStorage.getItem('libraryBooks');
    books = savedData ? JSON.parse(savedData) : [];
} catch (e) {
    books = [];
}

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

// --- CORE ACTIONS ---
function save() { 
    localStorage.setItem('libraryBooks', JSON.stringify(books)); 
    render(); 
}

// Add Book
const bookForm = document.getElementById('bookForm');
if (bookForm) {
    bookForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const newBook = {
            id: Date.now(),
            title: document.getElementById('title').value,
            author: document.getElementById('author').value,
            total: parseInt(document.getElementById('quantity').value) || 1,
            issuedTo: [] // THIS MUST EXIST
        };
        books.push(newBook);
        e.target.reset();
        save();
    });
}

function issueToUser(bookId) {
    const book = books.find(b => b.id == bookId);
    if (book && book.issuedTo.length < book.total) {
        const userId = prompt("Enter User/Student ID:");
        if (userId) {
            book.issuedTo.push(userId);
            save();
        }
    } else { alert("No copies available!"); }
}

function returnFromUser(bookId) {
    const book = books.find(b => b.id == bookId);
    if (book && book.issuedTo.length > 0) {
        const userId = prompt(`Enter ID returning book:\nCurrently held by: ${book.issuedTo.join(', ')}`);
        const index = book.issuedTo.indexOf(userId);
        if (index > -1) {
            book.issuedTo.splice(index, 1);
            save();
        } else { alert("User ID not found!"); }
    }
}

function deleteBook(id) { if(confirm("Delete?")) { books = books.filter(b => b.id != id); save(); } }

// --- QR MODAL ---
function showQR(id, title) {
    const modal = document.getElementById('qrModal');
    const qrContainer = document.getElementById('qrcode');
    if (!modal || !qrContainer) return;

    qrContainer.innerHTML = "";
    document.getElementById('qrText').innerText = title;
    modal.style.display = "block";

    const url = `${window.location.origin}${window.location.pathname}?bookId=${id}`;
    new QRCode(qrContainer, { text: url, width: 180, height: 180 });
}

function closeModal() { 
    const modal = document.getElementById('qrModal');
    if(modal) modal.style.display = "none"; 
}

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
                    <button class="issue-btn" style="background:#27ae60; color:white;" onclick="issueToUser(${b.id})">Issue</button>
                    <button class="return-btn" style="background:#3498db; color:white;" onclick="returnFromUser(${b.id})">Return</button>
                    <button class="delete-btn" style="background:#e74c3c; color:white;" onclick="deleteBook(${b.id})">Del</button>
                </td>
            </tr>
        `).join('');
    }

    if (clientList) {
        clientList.innerHTML = books.length === 0
            ? '<p>The library is currently empty.</p>'
            : books.map(b => {
                const avail = b.total - (b.issuedTo ? b.issuedTo.length : 0);
                return `
                    <div class="book-card" style="border-top: 4px solid ${avail > 0 ? '#27ae60' : '#e74c3c'}">
                        <h4>${b.title}</h4>
                        <p>By ${b.author}</p>
                        <p><strong>Available: ${avail} / ${b.total}</strong></p>
                        ${avail > 0 
                            ? `<button class="qr-btn" onclick="showQR(${b.id}, '${b.title}')" style="background:#34495e; color:white; width:100%; border-radius:5px; padding:8px;">Show QR</button>` 
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