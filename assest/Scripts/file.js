document.addEventListener("DOMContentLoaded", () => {
    // Load files immediately on page load
    loadFiles();
  
    // Refresh the file list every 1 minute (60,000 ms)
    setInterval(loadFiles, 60000);
  });
  
  async function loadFiles() {
    try {
      // 1) Retrieve all files using your getFiles() function
      const files = await getFiles(); // from file-sharing.js
  
      // 2) Display them in the table
      const filesTbody = document.getElementById("filesTbody");
      filesTbody.innerHTML = ""; // Clear previous rows
  
      files.forEach((file) => {
        // Create a row for each file
        const row = document.createElement("tr");
  
        // Cell 1: File Name
        const nameCell = document.createElement("td");
        nameCell.textContent = file.Name || "Untitled";
        row.appendChild(nameCell);
  
        // Cell 2: Size (convert to KB/MB if needed)
        const sizeCell = document.createElement("td");
        sizeCell.textContent = formatFileSize(file.Size);
        row.appendChild(sizeCell);
  
        // Cell 3: Links or "Links" button
        const linksCell = document.createElement("td");
        // Example: just a placeholder "Links" button
        const linksBtn = document.createElement("button");
        linksBtn.className = "links-toggle-btn";
        linksBtn.textContent = "Links";
        // Add your own logic for toggling link rows or showing a modal
        linksCell.appendChild(linksBtn);
  
        row.appendChild(linksCell);
  
        filesTbody.appendChild(row);
      });
  
      // (Optional) Update any "file info" in sidebar
      updateFileInfo(files);
  
    } catch (error) {
      console.error("Error loading files:", error);
    }
  }
  
  /**
   * Format file size for display (e.g., 12345 bytes -> '12 KB')
   * Adjust logic as needed.
   */
  function formatFileSize(sizeInBytes) {
    if (!sizeInBytes) return "0 B";
    const kb = sizeInBytes / 1024;
    if (kb < 1024) {
      return `${kb.toFixed(1)} KB`;
    }
    const mb = kb / 1024;
    return `${mb.toFixed(1)} MB`;
  }
  
  /**
   * (Optional) Update sidebar file info: total count, total size, etc.
   */
  function updateFileInfo(files) {
    // Example: get total count & sum of sizes
    const totalCount = files.length;
    const totalSize = files.reduce((acc, f) => acc + (f.Size || 0), 0);
  
    // Show total count
    const fileCountElem = document.querySelector(".file-info p:nth-of-type(1)");
    if (fileCountElem) {
      fileCountElem.textContent = `${totalCount} Files`;
    }
  
    // Show total size in some readable format
    const totalSizeElem = document.querySelector(".file-info p:nth-of-type(2)");
    if (totalSizeElem) {
      totalSizeElem.innerHTML = `${(totalSize / (1024 * 1024)).toFixed(1)}MB / <b>100GB</b>`;
    }
  }
  