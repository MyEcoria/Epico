# Deezar

Deezar is a music streeming application that allows you to search, download, and manage music.

## Features

- Search and download music from Deezer
- Manage user accounts and authentication
- Log user activities
- Send email notifications

## Installation

1. Clone the repository:
    ```sh
    git clone https://github.com/yourusername/deezar.git
    cd deezar
    ```

2. Install dependencies:
    ```sh
    npm install
    ```

3. Configure the application:
    - Copy the sample configuration files and update them with your settings:
        ```sh
        cp config/db.sample config/db.json
        cp config/smtp.sample config/smtp.json
        cp config/general.sample config/general.json
        ```

4. Build the project:
    ```sh
    npm run build
    ```

5. Start the application:
    ```sh
    npm start
    ```

6. To build the application:
    ```
    npm run pkg
    ```

## Usage

### API Endpoints

- **User Registration**: `POST /user/register`
- **User Login**: `POST /user/login`
- **Confirm User**: `GET /user/confirm/:id`
- **Search Music**: `POST /music/search`
- **Get Music**: `GET /music/:id`

## Configuration

- **Database Configuration**: `config/db.json`
- **SMTP Configuration**: `config/smtp.json`
- **General Configuration**: `config/general.json`

## Author

Cacaland