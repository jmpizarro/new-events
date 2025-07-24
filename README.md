# Valencia Events

Valencia Events is a full stack application for discovering cultural events in Valencia, Spain. The backend is built with **Spring Boot** and integrates with OpenAI to generate event information and summaries. A **React** frontend displays upcoming events and provides an admin section for generating or uploading new data.

## Getting Started Locally

### Prerequisites
- **Java 21** and **Maven**
- **Node.js** and **npm** (or Yarn)
- Optional: `OPENAI_API_KEY` plus mail credentials if you want AI generation and the contact form

### Backend
1. Export environment variables or add them to `.env`:
   - `OPENAI_API_KEY` – your OpenAI key
   - `MAIL_USERNAME` and `MAIL_PASSWORD` – SMTP credentials (optional)
2. Start the API:
   ```bash
   mvn spring-boot:run
   ```
   The server runs on `http://localhost:8088` by default.

### Frontend
1. Install dependencies:
   ```bash
   cd frontend
   npm install
   ```
2. (Optional) create a `.env` file in `frontend` to set the backend URL:
   ```
   REACT_APP_BACKEND_URL=http://localhost:8088
   ```
3. Run the development server:
   ```bash
   npm start
   ```
   Open `http://localhost:3000` in your browser.

## Production Deployment
1. Build the frontend:
   ```bash
   cd frontend
   npm install
   npm run build
   ```
   The static files appear in `frontend/build`.
2. Package the backend:
   ```bash
   mvn clean package
   ```
   This creates `target/events-0.0.1-SNAPSHOT.jar`.
3. (Optional) copy the `frontend/build` directory to a public web server or into
   `src/main/resources/static` so Spring Boot can serve it.
4. Run the JAR with the necessary environment variables:
   ```bash
   java -jar target/events-0.0.1-SNAPSHOT.jar
   ```
5. Expose port `8088` (or your configured `server.port`) through your hosting
   or proxy to make the site available on the Internet.
