function addBook() {
    let books = getBooks();

    let id = document.getElementById("bookId").value;
    let name = document.getElementById("bookName").value;
    let author = document.getElementById("author").value;

    if (!id || !name || !author) {
        alert("Please fill all fields");
        return;
    }

    let exists = books.find(b => b.id === id);
    if (exists) {
        alert("Book ID already exists");
        return;
    }

    books.push({
        id: id,
        name: name,
        author: author,
        status: "Available"
    });

    saveBooks(books);
    displayAdminBooks();
}

function toggleStatus(index) {
    let books = getBooks();
    books[index].status =
        books[index].status === "Available" ? "Issued" : "Available";
    saveBooks(books);
    displayAdminBooks();
}

function displayAdminBooks() {
    let books = getBooks();
    let table = document.getElementById("adminBookList");
    table.innerHTML = "";

    books.forEach((book, index) => {
        table.innerHTML += `
            <tr>
                <td>${book.id}</td>
                <td>${book.name}</td>
                <td>${book.author}</td>
                <td>${book.status}</td>
                <td>
                    <button onclick="toggleStatus(${index})">
                        Issue / Return
                    </button>
                </td>
            </tr>
        `;
    });
}

displayAdminBooks();

