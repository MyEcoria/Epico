# Epico

Epico is a TypeScript based music streaming app that relies on the Deezer API.
It lets you search for tracks, download them and manage your music library.

## Key features
- Search and download songs from Deezer
- User management with authentication
- Automatic BPM analysis
- Email notifications
- Listening history and recommendations

## Quick start
1. Clone the repository
   ```sh
   git clone https://github.com/MyEcoria/epico.git
   cd epico
   ```
2. Install dependencies
   ```sh
   npm install
   ```
3. Copy `.env.exemple` to `.env` and edit the values
4. Build the project
   ```sh
   npm run build
   ```
5. Start the server
   ```sh
   npm start
   ```
6. Produce executables for Linux, macOS and Windows
   ```sh
   npm run pkg:all
   ```

## Running the worker
The `worker/` directory contains a Bull-based service that processes downloads
and track analysis in the background. Run it with:
```sh
npm --prefix worker install
npm --prefix worker start
```
You can also build the worker using:
```sh
npm --prefix worker run build
```

## API usage
- **POST /user/register** – register a user
- **POST /user/login** – log in
- **GET /user/confirm/:id** – confirm registration
- **POST /music/search** – search for a track
- **GET /music/:id.mp3** – stream a track

## Configuration
- **Database** – set your connection variables in `.env`
- **SMTP** – configure email settings in `.env`
- **S3 storage** – add your S3 credentials to `.env`

## Project layout
- Main source code in `src/` with utilities in `modules/`
- Type definitions in `types/`
- Background worker in `worker/`

## Docker
```sh
docker-compose up --build
```
The application will be available on `http://localhost:8000` and the database
will be created from `schema.sql` on first start.
