function displayBooks() {
    let books = getBooks();
    let table = document.getElementById("bookList");
    table.innerHTML = "";

    books.forEach(book => {
        table.innerHTML += `
            <tr>
                <td>${book.id}</td>
                <td>${book.name}</td>
                <td>${book.author}</td>
                <td>${book.status}</td>
            </tr>
        `;
    });
}

displayBooks();
