# RASTA (Rank A Season's Tickets Automatically)

This project is a static single-page application (SPA) designed to help users rank their season tickets. It allows for uploading a CSV file containing game information, mapping relevant columns, and then interactively ranking games based on user-defined criteria. The application groups similar games into "series" for easier management.

## Features:

- **CSV Upload:** Easily upload game data from a CSV file.
- **Column Mapping:** Map CSV columns to game date, time, opponent, and location.
- **Dynamic Ranking:** Rank games based on custom criteria, with intelligent bucketing for times and identification of mid-week day games.
- **Series Grouping:** Games from the same series are automatically grouped for streamlined ranking and selection.
- **Modern UI:** Built with React and styled using Pico.css for a clean, responsive, and modern user experience.

## Getting Started:

To get the project up and running, follow these steps:

### 1. Navigate to the App Directory
Open your terminal and navigate to the `rasta-app` directory:
```bash
cd rasta-app
```

### 2. Install Dependencies
Install the required Node.js packages:
```bash
npm install
```

### 3. Run the Application
Start the development server:
```bash
npm start
```
This will start the development server on `http://localhost:3000` and automatically open a browser window.

### 4. Build for Production
To create a production-ready build, which will output to the `dist` directory:
```bash
npm run build
```
The optimized static files will be generated in the newly created `dist` directory.

## Serving the Static Build Locally

After building the application, you can serve the static files locally using a simple Python HTTP server to test the production build. This setup respects relative paths for all resources.

1.  **Navigate into the `dist` directory:**
    ```bash
    cd rasta-app/dist
    ```
2.  **Run the Python HTTP server:**
    ```bash
    python -m http.server --port 8080
    ```
3.  **Open your web browser and navigate to:**
    ```
    http://localhost:8080
    ```
    You should see the production version of the RASTA application running.

## Publishing to Google Cloud Storage (GCS)

Once the application is built (using `npm run build`), you can publish the static files to a Google Cloud Storage bucket. Ensure you have the `gcloud` CLI and `gsutil` installed and configured.

Example `gsutil` command to upload the `dist` directory:
```bash
gsutil -m cp -r dist/* gs://your-gcs-bucket-name/
```
Replace `your-gcs-bucket-name` with the actual name of your GCS bucket. The `-m` flag enables parallel (multi-threaded) copies, and `-r` specifies recursive copy for directories.

## Project Structure:

The core application logic and components reside in the `rasta-app` directory.

```
rasta-app/
├── public/                  # Public assets (e.g., index.html)
├── src/
│   ├── components/          # Reusable React components (FileUpload, ColumnMapper, RankingForm, GameList)
│   ├── logic/               # Business logic and utility functions (e.g., ranker.js)
│   ├── App.js               # Main application component
│   ├── index.js             # Entry point for React application
│   └── index.css            # (Kept for potential future custom CSS)
├── cypress/                 # End-to-End tests
│   └── e2e/
│       └── app.cy.js        # Basic E2E test
│       └── example-flow.cy.js # E2E test for example CSV flow
│       └── clipboard.cy.js  # E2E test for clipboard copy functionality
├── node_modules/            # Installed Node.js modules
├── package.json             # Project metadata and dependencies
├── cypress.config.js        # Cypress configuration
└── README.md                # This file
```

## Testing:

The project includes both unit tests and end-to-end (E2E) tests.

### Unit Tests
Unit tests are written using Jest (configured by `react-scripts`) and are located alongside the logic they test.

To run all unit tests (non-interactively):
```bash
npm test
```

To run a specific unit test file (non-interactively, e.g., for `ranker.js`):
```bash
npm run test:unit
```

### End-to-End (E2E) Tests
E2E tests are written using Cypress to simulate user interactions and verify the overall application flow.

To run E2E tests in headless mode:
```bash
npm run e2e
```
This command will automatically:
1. Start the React development server on `http://localhost:3001`.
2. Wait for the server to be ready.
3. Run all Cypress tests in headless mode.
4. Shut down the server after the tests are complete.

To open the Cypress Test Runner for interactive testing:
```bash
npm run e2e:open
```
This command will:
1. Start the React development server on `http://localhost:3001` (without opening a browser).
2. Wait for the server to be ready.
3. Open the Cypress Test Runner, from which you can select and run tests.
4. Shut down the server once Cypress Test Runner is closed.
