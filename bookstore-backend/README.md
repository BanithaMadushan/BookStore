# Bookstore Backend Data Utilities

This directory contains utility scripts to view and manipulate data in the MongoDB database for the bookstore application.

## Database Viewing Scripts

The following scripts help you view different types of data in the database:

### View Books

The `view-books.js` script allows you to view all books in the database or search for books by title.

```bash
# View all books
node view-books.js

# Search books by title
node view-books.js search "Python"
```

### List Book IDs

The `list-book-ids.js` script provides a simple list of all book IDs and titles in the database.

```bash
# List all book IDs
node list-book-ids.js
```

### View Users

The `view-users.js` script displays all users in the database.

```bash
# View all users
node view-users.js
```

### View Orders

The `view-orders.js` script displays all orders in the database with detailed information.

```bash
# View all orders
node view-orders.js
```

### View Carts

The `view-carts.js` script shows all shopping carts in the database.

```bash
# View all carts
node view-carts.js
```

### View Reviews

The `view-reviews.js` script allows you to view all reviews or reviews for a specific book.

```bash
# View all reviews
node view-reviews.js

# View reviews for a specific book (using book ID)
node view-reviews.js 68190beab268fd4687288470
```

### Search Books

The `search-books.js` script provides advanced search capabilities for books by title, author, or category.

```bash
# Search books by title
node search-books.js title "Python"

# Search books by author
node search-books.js author "Tolkien"

# Search books by category
node search-books.js category "Fiction"

# List all categories
node search-books.js list-categories
```

## Data Addition Scripts

The following scripts help you add sample data to the database:

### Add User

The `add-user.js` script allows you to add a new user to the database.

```bash
# Add a user with default values
node add-user.js

# Add a custom user
node add-user.js "John Doe" "john@example.com" "securepassword" user

# Add an admin user
node add-user.js "Admin User" "admin@example.com" "adminpassword" admin
```

### Add Cart

The `add-cart.js` script creates or updates a shopping cart for a user.

```bash
# Add cart items for a user (format: bookId:quantity)
node add-cart.js 68190946518cbe22969e07f3 68190beab268fd4687288470:2 68190bf8e50c6bf4794e7a0c:1
```

### Add Order

The `add-order.js` script creates a new order for a user.

```bash
# Add a basic order for a user
node add-order.js 68190946518cbe22969e07f3

# Add a paid order that hasn't been delivered
node add-order.js 68190946518cbe22969e07f3 paid undelivered PayPal

# Add a fully completed order with specific items
node add-order.js 68190946518cbe22969e07f3 paid delivered PayPal 68190beab268fd4687288470:2 68190bf8e50c6bf4794e7a0c:1
```

### Add Review

The `add-review.js` script adds a review for a book by a user.

```bash
# Add a basic 5-star review
node add-review.js 68190beab268fd4687288470 68190946518cbe22969e07f3

# Add a custom review with rating, title and comment
node add-review.js 68190beab268fd4687288470 68190946518cbe22969e07f3 4 "Great book with minor flaws" "I enjoyed reading this book but found some parts to be a bit slow."
```

## Data Manipulation Scripts

The following scripts help you modify data in the database:

### Update Book

The `update-book.js` script allows you to update book information such as price, stock, and featured status.

```bash
# Update a book's price and stock
node update-book.js 68190beab268fd4687288470 --price 12.99 --stock 25

# Mark a book as featured
node update-book.js 68190beab268fd4687288470 --featured true
```

### Import Books from Google Books API

The `test-books.js` script imports books from the Google Books API to the MongoDB database.

```bash
# Import fiction books
node test-books.js "fiction" 5

# Import books on a specific topic
node test-books.js "python programming" 5
```

## Configuration

These scripts use the MongoDB connection string from the `.env` file. Make sure your `.env` file contains the `MONGO_URI` variable with the correct connection string. 