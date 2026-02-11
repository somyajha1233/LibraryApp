import { initializeApp } from "https://www.gstatic.com/firebasejs/12.9.0/firebase-app.js";
import { getDatabase, ref, get, update } from "https://www.gstatic.com/firebasejs/12.9.0/firebase-database.js";

const firebaseConfig = {
    apiKey: "AIzaSyBh1s2S6rZe9zK4DLWpZUcpXtXZolEBQlI",
    authDomain: "webapp-e8b28.firebaseapp.com",
    projectId: "webapp-e8b28",
    storageBucket: "webapp-e8b28.firebasestorage.app",
    messagingSenderId: "126884302653",
    appId: "1:126884302653:web:2e0ab14def6bad3361ff54",
    measurementId: "G-GJVK5R349Q"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

// Get book ID from URL
const params = new URLSearchParams(window.location.search);
const bookId = params.get('bookId');
const statusText = document.getElementById('scanStatus');

if (bookId) {
    const bookRef = ref(db, 'library/books/' + bookId);
    
    // Get current book data
    get(bookRef).then((snapshot) => {
        if (snapshot.exists()) {
            const book = snapshot.val();
            const userId = prompt(`Scanning: ${book.title}\n\nEnter User ID to Issue:`);
            
            if (userId) {
                if (!book.issuedTo) book.issuedTo = [];
                
                if (book.issuedTo.length < book.total) {
                    book.issuedTo.push(userId);
                    update(ref(db, 'library/books/' + bookId), { issuedTo: book.issuedTo })
                        .then(() => {
                            statusText.innerText = "Success! Book Issued.";
                            statusText.style.color = "green";
                        });
                } else {
                    statusText.innerText = "Error: Out of stock.";
                    statusText.style.color = "red";
                }
            } else {
                statusText.innerText = "Scan cancelled.";
            }
        } else {
            statusText.innerText = "Book not found.";
        }
    });
} else {
    statusText.innerText = "No book ID provided.";
}