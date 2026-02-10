// --- CONFIGURATION ---
const ADMIN_PASSWORD = "admin123"; // Change this to your preferred password

// --- STATE MANAGEMENT ---
// Load books from LocalStorage or initialize empty array
let books = JSON.parse(localStorage.getItem('libraryBooks')) || [];

// Selectors
const bookForm = document.getElementById('bookForm');
const adminBookList = document.getElementById('adminBookList');
const clientBookList = document.getElementById('clientBookList');
const loginSection = document.getElementById('loginSection');
const adminContent = document.getElementById('adminContent');
const logoutBtn = document.getElementById('logoutBtn');

// --- AUTHENTICATION LOGIC ---
function checkPassword() {
    const enteredPass = document.getElementById('adminPass').value;
    const errorMsg = document.getElementById('loginError');

    if (enteredPass === ADMIN_PASSWORD) {
        sessionStorage.setItem('isAdminLoggedIn', 'true');
        updateAdminVisibility();
    } else {
        errorMsg.style.display = 'block';
    }
}

function updateAdminVisibility() {
    const isLoggedIn = sessionStorage.getItem('isAdminLoggedIn') === 'true';
    
    if (loginSection && adminContent && logoutBtn) {
        if (isLoggedIn) {
            loginSection.style.display = 'none';
            adminContent.style.display = 'block';
            logoutBtn.style.display = 'block';
        } else {
            loginSection.style.display = 'block';
            adminContent.style.display = 'none';
            logoutBtn.style.display = 'none';
        }
    }
}

function logout() {
    sessionStorage.removeItem('isAdminLoggedIn');
    window.location.reload();
}

// --- DATA LOGIC ---
function saveBooks() {
    localStorage.setItem('libraryBooks', JSON.stringify(books));
    render();
}

// Add New Book
if (bookForm) {
    bookForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const titleInput = document.getElementById('title');
        const authorInput = document.getElementById('author');

        const newBook = {
            id: Date.now(),
            title: titleInput.value,
            author: authorInput.value,
            isIssued: false
        };

        books.push(newBook);
        titleInput.value = '';
        authorInput.value = '';
        saveBooks();
    });
}

// Toggle status between Available and Issued
function toggleIssue(id) {
    books = books.map(book => {
        if (book.id === id) {
            book.isIssued = !book.isIssued;
        }
        return book;
    });
    saveBooks();
}

// Delete a book from the system
function deleteBook(id) {
    if (confirm("Are you sure you want to delete this book?")) {
        books = books.filter(book => book.id !== id);
        saveBooks();
    }
}

// --- RENDERING LOGIC ---
function render() {
    // 1. Render Admin Table (if on admin page)
    if (adminBookList) {
        adminBookList.innerHTML = books.map(book => `
            <tr>
                <td><strong>${book.title}</strong></td>
                <td>${book.author}</td>
                <td>
                    <span style="color: ${book.isIssued ? '#dc3545' : '#28a745'}; font-weight: bold;">
                        ${book.isIssued ? '🔴 Issued' : '🟢 Available'}
                    </span>
                </td>
                <td>
                    <button class="${book.isIssued ? 'return-btn' : 'issue-btn'}" onclick="toggleIssue(${book.id})">
                        ${book.isIssued ? 'Return' : 'Issue'}
                    </button>
                    <button class="delete-btn" onclick="deleteBook(${book.id})">Delete</button>
                </td>
            </tr>
        `).join('');
    }

    // 2. Render Client Grid (if on client page)
    if (clientBookList) {
        const availableBooks = books.filter(book => !book.isIssued);
        
        if (availableBooks.length === 0) {
            clientBookList.innerHTML = `<p style="grid-column: 1/-1; text-align: center; color: #666;">No books currently available in the library.</p>`;
        } else {
            clientBookList.innerHTML = availableBooks.map(book => `
                <div class="book-card">
                    <h4>${book.title}</h4>
                    <p>Author: ${book.author}</p>
                    <span style="font-size: 0.8rem; color: #28a745;">✓ In Stock</span>
                </div>
            `).join('');
        }
    }
}

// Initialize on Page Load
window.onload = () => {
    updateAdminVisibility();
    render();
};