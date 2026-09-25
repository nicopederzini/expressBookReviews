const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();
const axios = require('axios');

public_users.post("/register", (req,res) => {
  const username = req.body.username;
  const password = req.body.password;

  if (!username || !password) {
    return res.status(400).json({ message: "Username and password are required" });
  }

  const doesExist = (username) => {
    let userswithsamename = users.filter((user) => user.username === username);
    return userswithsamename.length > 0;
  };

  if (doesExist(username)) {
    return res.status(409).json({ message: "Username already exists" });
  }

  users.push({ "username": username, "password": password });
  
  return res.status(201).json({ message: "Customer successfully registered. Now you can login" });
});

// Get the book list available in the shop
public_users.get('/',function (req, res) {
    const formattedBooks = JSON.stringify(books, null, 2);
    return res.status(200).send(formattedBooks);
});

// Get book details based on ISBN
public_users.get('/isbn/:isbn',function (req, res) {
  const isbn = req.params.isbn;
  const book = books[isbn];

  if (book) {
    return res.status(200).send(JSON.stringify(book, null, 2));
  } else {
    return res.status(404).json({ message: "Book not found" });
  }
 });
  
// Get book details based on author
public_users.get('/author/:author',function (req, res) {
  const authorParam = req.params.author.toLowerCase();
  const bookKeys = Object.keys(books);
  let booksByAuthor = [];
  bookKeys.forEach(key => {
    if (books[key].author.toLowerCase() === authorParam) {
      // Guardamos el libro junto con su id/isbn para que la respuesta sea completa
      booksByAuthor.push({
        isbn: key,
        ...books[key]
      });
    }
  });
  if (booksByAuthor.length > 0) {
    return res.status(200).send(JSON.stringify(booksByAuthor, null, 2));
  } else {
    return res.status(404).json({ message: "No books found by this author" });
  }
});

// Get all books based on title
public_users.get('/title/:title',function (req, res) {
    const titleParam = req.params.title.toLowerCase();
    const bookKeys = Object.keys(books);

    let booksByTitle = [];

    bookKeys.forEach(key => {
    if (books[key].title.toLowerCase() === titleParam) {
      booksByTitle.push({
        isbn: key,
        ...books[key]
      });
    }
    if (booksByTitle.length > 0) {
        return res.status(200).send(JSON.stringify(booksByTitle, null, 2));
    } else {
        return res.status(404).json({ message: "Book not found with this title" });
    }
});

//  Get book review
public_users.get('/review/:isbn',function (req, res) {
  // 1. Recupera el ISBN desde los parámetros de la solicitud
  const isbn = req.params.isbn;

  // 2. Busca el libro en el objeto 'books'
  const book = books[isbn];

  // 3. Verifica si el libro existe
  if (book) {
    return res.status(200).send(JSON.stringify(book.reviews, null, 2));
  } else {
    return res.status(404).json({ message: "Book not found" });
  }
});

public_users.get('/', async function (req, res) {
  try {
    // Simulamos una promesa que resuelve los libros locales
    const getBooks = () => new Promise((resolve) => resolve(books));
    const allBooks = await getBooks();
    
    return res.status(200).send(JSON.stringify(allBooks, null, 2));
  } catch (error) {
    return res.status(500).json({ message: "Error retrieving books", error: error.message });
  }
});

public_users.get('/isbn/:isbn', function (req, res) {
  const isbn = req.params.isbn;
  
  const getBookByISBN = new Promise((resolve, reject) => {
    if (books[isbn]) {
      resolve(books[isbn]);
    } else {
      reject("Book not found");
    }
  });

  getBookByISBN
    .then((book) => {
      return res.status(200).send(JSON.stringify(book, null, 2));
    })
    .catch((err) => {
      return res.status(404).json({ message: err });
    });
});

public_users.get('/author/:author', function (req, res) {
  const authorParam = req.params.author.toLowerCase();
  
  const getBooksByAuthor = new Promise((resolve, reject) => {
    const bookKeys = Object.keys(books);
    let filteredBooks = [];
    
    bookKeys.forEach(key => {
      if (books[key].author.toLowerCase() === authorParam) {
        filteredBooks.push({ isbn: key, ...books[key] });
      }
    });
    
    if (filteredBooks.length > 0) {
      resolve(filteredBooks);
    } else {
      reject("No books found by this author");
    }
  });

  getBooksByAuthor
    .then((booksList) => {
      return res.status(200).send(JSON.stringify(booksList, null, 2));
    })
    .catch((err) => {
      return res.status(404).json({ message: err });
    });
});

public_users.get('/title/:title', function (req, res) {
  const titleParam = req.params.title.toLowerCase();
  
  const getBooksByTitle = new Promise((resolve, reject) => {
    const bookKeys = Object.keys(books);
    let filteredBooks = [];
    
    bookKeys.forEach(key => {
      if (books[key].title.toLowerCase() === titleParam) {
        filteredBooks.push({ isbn: key, ...books[key] });
      }
    });
    
    if (filteredBooks.length > 0) {
      resolve(filteredBooks);
    } else {
      reject("Book not found with this title");
    }
  });

  getBooksByTitle
    .then((booksList) => {
      return res.status(200).send(JSON.stringify(booksList, null, 2));
    })
    .catch((err) => {
      return res.status(404).json({ message: err });
    });
});


module.exports.general = public_users;
