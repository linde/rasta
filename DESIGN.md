# Season Ticket Ranker - Design Document

This document outlines the architectural and design decisions for the Season Ticket Ranker single-page application.

## 1. Application Architecture

The application follows a standard React SPA architecture, built with `create-react-app`.

-   **Frontend Framework:** React.js
-   **Bundler:** Webpack (via `react-scripts`)
-   **Styling:** Pico.css for minimalist, semantic styling. Custom CSS will be used for specific adjustments.
-   **State Management:** React's built-in `useState` and `useContext` hooks will be primarily used for local and global state management, respectively. Redux or similar libraries are avoided to minimize dependencies unless complexity dictates their need.

## 2. Core Components

### 2.1. `App.js`

The root component, responsible for overall layout and routing (if applicable). It will manage the top-level state, such as `uploadedCsvData`, `columnMappings`, and `rankingCriteria`.

### 2.2. `FileUpload.js`

-   **Purpose:** Allows users to upload a CSV file.
-   **Implementation:** Utilizes an HTML `<input type="file">` element. File parsing will be handled by the `papaparse` library for efficient client-side CSV processing.
-   **Output:** On successful upload and parsing, it will pass the raw CSV data (array of objects) to the parent `App` component.

### 2.3. `ColumnMapper.js`

-   **Purpose:** Guides the user to map CSV headers to predefined data fields (Game Date, Time, Opponent, Location).
-   **Implementation:** Presents dropdowns or selection interfaces where users can choose which uploaded CSV column corresponds to each required field.
-   **Output:** Provides an object containing the mapping (e.g., `{ 'Game Date': 'CSV_Header_Date', ... }`) to the `App` component.

### 2.4. `RankingForm.js`

-   **Purpose:** Allows users to define criteria for ranking games.
-   **Input:** Receives unique values extracted from the mapped CSV data (e.g., unique opponents, unique locations, time buckets).
-   **Derived Values:**
    -   **Time Buckets:** Game times will be grouped into sensible buckets (e.g., "Morning" (before 12 PM), "Afternoon" (12 PM - 5 PM), "Evening" (after 5 PM)).
    -   **Mid-week Day Games:** A boolean flag will be derived for games falling on Monday-Thursday before 5 PM.
-   **Implementation:** Presents a form with sliders, input fields, or selection boxes to assign weights or preferences to different values.
-   **Accessibility:** Will be accessible via a "gear" icon or similar, allowing users to re-rank at any time.

### 2.5. `GameList.js`

-   **Purpose:** Displays the ranked list of games, grouped by series.
-   **Input:** Receives the processed game data, including calculated ranks.
-   **Series Grouping Logic:**
    -   **Definition:** A "series" is defined as 2 or more games against the same `opponent` at the same `location` occurring within a `N` day window (e.g., 4 days).
    -   **Grouping:** Games belonging to the same series that are "near" each other in the overall ranking (e.g., within X rank positions of each other) will be collapsed into a selectable group in the UI.
    -   **Internal Order:** Within a collapsed series group, games will maintain their raw rank order.
-   **Display:** Each game will show its rank and relevant details. Collapsed series will have an expand/collapse mechanism.

## 3. Data Flow

1.  User uploads CSV via `FileUpload`.
2.  `App` component receives raw CSV data.
3.  `App` passes data to `ColumnMapper`.
4.  User maps columns via `ColumnMapper`.
5.  `App` receives column mappings.
6.  `App` processes raw data + mappings to extract unique values and derive new attributes (time buckets, mid-week day games).
7.  `App` passes these processed values to `RankingForm`.
8.  User defines ranking criteria via `RankingForm`.
9.  `App` receives ranking criteria.
10. `App` (or a dedicated `ranker.js` utility) calculates ranks for all games based on criteria.
11. `App` processes ranked games for series grouping.
12. `App` passes final grouped, ranked data to `GameList`.
13. `GameList` renders the interactive list.

## 4. Testing Strategy

-   **Unit Tests:** Jest and React Testing Library will be used for unit testing individual React components and utility functions (e.g., `ranker.js` logic).
-   **End-to-End (E2E) Tests:** Cypress will be configured for E2E testing to simulate user flows, such as uploading a file, mapping columns, setting ranking criteria, and verifying the final ranked list display.

## 5. Future Considerations

-   Persistence: Saving user preferences and uploaded data using local storage.
-   Error Handling: Robust error handling for CSV parsing, invalid data, etc.
-   More complex ranking algorithms and custom rules.
-   Exporting ranked data.
