# Birds of Aotearoa

## Overview
Birds of Aotearoa is a web application for managing a database of native birds. It allows users to create, edit, delete, and view bird entries, as well as upload images. The backend is built with Node.js and Express, using MySQL for data storage and EJS for server-side rendering.

## Features
- View all birds
- Create new bird entries
- Edit existing bird entries
- Delete bird entries
- Upload images for birds
- Data stored in MySQL
- Images stored in `/public/images/`

## Setup

### Prerequisites
- [Node.js](https://nodejs.org/)
- [Docker](https://www.docker.com/)

### Installation
1. Clone the repository:
   ```sh
   git clone https://altitude.otago.ac.nz/cosc203/code/asgn2-starter
   cd asgn2-starter
   ```
2. Install dependencies:
   ```sh
   npm install
   ```

### Database Setup
The MySQL database is managed using Docker.

1. Start the MySQL container:
   ```sh
   cd sql
   docker compose up -d
   ```
2. Access the MySQL container:
   ```sh
   docker exec -it cosc203mysql mysql -u root -p --default-character-set=utf8mb4
   ```
3. Create tables and populate data:
   ```sql
   source sql/db_setup.sql;
   source sql/db_populate.sql;
   ```

### Running the Project
1. Start the server:
   ```sh
   npm run start
   ```
2. Open the app in your browser:
   - [http://localhost:3000](http://localhost:3000)

## API Routes

### Pages
| Method | Route            | Description |
|--------|----------------|-------------|
| GET    | `/`            | Home page (list of birds) |
| GET    | `/birds/`      | List all birds |
| GET    | `/birds/create` | Form to create a new bird |
| GET    | `/birds/:id`   | View a specific bird |
| GET    | `/birds/:id/update` | Form to update a bird |

### Database Modifications
| Method | Route              | Description |
|--------|------------------|-------------|
| GET    | `/birds/:id/delete` | Delete a bird |
| POST   | `/birds/create`  | Create a new bird |
| POST   | `/birds/edit`    | Edit an existing bird |

## Image Uploads
To upload images, use a form with `enctype="multipart/form-data"`:
```html
<form action="/route/endpoint" method="POST" enctype="multipart/form-data">
    <input type="text" name="birdName"/>
    <input type="file" name="birdImage">
    <button type="submit">Submit</button>
</form>
```

## Technologies Used
- Node.js
- Express.js
- MySQL
- Docker
- EJS (Server-Side Rendering)
- Multer (File Uploads)

## License
This project is licensed under the MIT License.
