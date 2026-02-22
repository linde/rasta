import React, { useCallback } from 'react';
import Papa from 'papaparse';

const EXAMPLE_CSV_PATH = `${process.env.PUBLIC_URL}/GameTicketPromotionPrice.csv`;

function FileUpload({ onFileUpload }) {
  const handleFileChange = useCallback((event) => {
    const file = event.target.files[0];
    if (file) {
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          onFileUpload(results.data);
        },
        error: (err) => {
          console.error("Error parsing CSV:", err);
          alert("Failed to parse CSV file. Please check the file format.");
        }
      });
    }
  }, [onFileUpload]);

  const handleLoadExample = useCallback((event) => {
    // Prevent default form submission or navigation if inside a form
    event.preventDefault(); 
    
    fetch(EXAMPLE_CSV_PATH) // Use the PUBLIC_URL prefixed path
      .then(response => response.text())
      .then(csvText => {
        Papa.parse(csvText, {
          header: true,
          skipEmptyLines: true,
          complete: (results) => {
            onFileUpload(results.data);
          },
          error: (err) => {
            console.error("Error parsing example CSV:", err);
            alert("Failed to parse the example CSV file.");
          }
        });
      })
      .catch(error => {
        console.error("Error fetching example CSV:", error);
        alert(`Could not fetch the example CSV file from ${EXAMPLE_CSV_PATH}. Please ensure it is in the public directory and the PUBLIC_URL is correctly configured.`);
      });
  }, [onFileUpload]);

  const linkStyle = {
    background: 'none',
    border: 'none',
    padding: 0,
    color: 'var(--pico-primary)',
    cursor: 'pointer',
    textDecoration: 'underline',
    font: 'inherit'
  };

  return (
    <article>
      <header>
        <h3>Upload CSV File</h3>
      </header>
      <small style={{ marginTop: '0.5rem', marginBottom: '1rem', display: 'block' }}>
        Please upload a CSV file containing your season schedule, or use this{" "}
        <button onClick={handleLoadExample} style={linkStyle}>
          example
        </button>{" "}
        from the 2026 gmen.
      </small>
      <input
        type="file"
        accept=".csv"
        onChange={handleFileChange}
      />
    </article>
  );
}

export default FileUpload;
