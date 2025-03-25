// file-sharing.js

// Base API URL (adjust if necessary)
const baseURL = "https://defdrive.wlan0.in";

// Helper to get authorization headers (assumes token stored in sessionStorage)
function getAuthHeaders() {
  const token = sessionStorage.getItem("token");
  return token ? { "Authorization": `Bearer ${token}` } : {};
}

/* ---------------------------
   API ENDPOINT FUNCTIONS
--------------------------- */

/**
 * Upload File
 * POST /api/upload
 * FormData with "file" field, and query parameter ?public=<boolean>
 */
async function uploadFile(file, isPublic = false) {
  try {
    const url = `${baseURL}/api/upload?public=${isPublic}`;
    const formData = new FormData();
    formData.append("file", file);

    const response = await fetch(url, {
      method: "POST",
      headers: {
        ...getAuthHeaders(),
      },
      body: formData
    });

    const result = await response.json();
    if (!response.ok) {
      throw new Error(result.error || "Failed to upload file");
    }
    return result.file; // Returns uploaded file object
  } catch (error) {
    console.error("Upload Error:", error.message);
    throw error;
  }
}

/**
 * Get Files
 * GET /api/files
 */
async function getFiles() {
  try {
    const url = `${baseURL}/api/files`;
    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        ...getAuthHeaders()
      }
    });
    const result = await response.json();
    if (!response.ok) {
      throw new Error(result.error || "Failed to retrieve files");
    }
    return result.files; // Returns array of file objects
  } catch (error) {
    console.error("Get Files Error:", error.message);
    throw error;
  }
}

/**
 * Update File Access
 * PUT /api/files/:fileID/access
 * Request body: { "public": true/false }
 */
async function updateFileAccess(fileID, isPublic) {
  try {
    const url = `${baseURL}/api/files/${fileID}/access`;
    const response = await fetch(url, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        ...getAuthHeaders()
      },
      body: JSON.stringify({ public: isPublic })
    });
    const result = await response.json();
    if (!response.ok) {
      throw new Error(result.error || "Failed to update file access");
    }
    return result.file;
  } catch (error) {
    console.error("Update File Access Error:", error.message);
    throw error;
  }
}

/**
 * Delete File
 * DELETE /api/files/:fileID
 */
async function deleteFile(fileID) {
  try {
    const url = `${baseURL}/api/files/${fileID}`;
    const response = await fetch(url, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        ...getAuthHeaders()
      }
    });
    const result = await response.json();
    if (!response.ok) {
      throw new Error(result.error || "Failed to delete file");
    }
    return result.message;
  } catch (error) {
    console.error("Delete File Error:", error.message);
    throw error;
  }
}

/**
 * Create Access for a File
 * POST /api/files/:fileID/accesses
 * Request body: { name, subnets, ips, expires, public, oneTimeUse, ttl, enableTTL }
 */
async function createAccess(fileID, accessData) {
  try {
    const url = `${baseURL}/api/files/${fileID}/accesses`;
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...getAuthHeaders()
      },
      body: JSON.stringify(accessData)
    });
    const result = await response.json();
    if (!response.ok) {
      throw new Error(result.error || "Failed to create access record");
    }
    return result.access;
  } catch (error) {
    console.error("Create Access Error:", error.message);
    throw error;
  }
}

/**
 * Get Accesses for a File
 * GET /api/files/:fileID/accesses
 */
async function getAccesses(fileID) {
  try {
    const url = `${baseURL}/api/files/${fileID}/accesses`;
    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        ...getAuthHeaders()
      }
    });
    const result = await response.json();
    if (!response.ok) {
      throw new Error(result.error || "Failed to retrieve accesses");
    }
    return result.accesses;
  } catch (error) {
    console.error("Get Accesses Error:", error.message);
    throw error;
  }
}

/**
 * Update an Access Record
 * PUT /api/accesses/:accessID/access
 */
async function updateAccess(accessID, accessData) {
  try {
    const url = `${baseURL}/api/accesses/${accessID}/access`;
    const response = await fetch(url, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        ...getAuthHeaders()
      },
      body: JSON.stringify(accessData)
    });
    const result = await response.json();
    if (!response.ok) {
      throw new Error(result.error || "Failed to update access record");
    }
    return result.access;
  } catch (error) {
    console.error("Update Access Error:", error.message);
    throw error;
  }
}

/**
 * Delete an Access Record
 * DELETE /api/accesses/:accessID
 */
async function deleteAccess(accessID) {
  try {
    const url = `${baseURL}/api/accesses/${accessID}`;
    const response = await fetch(url, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        ...getAuthHeaders()
      }
    });
    const result = await response.json();
    if (!response.ok) {
      throw new Error(result.error || "Failed to delete access record");
    }
    return result.message;
  } catch (error) {
    console.error("Delete Access Error:", error.message);
    throw error;
  }
}

/* ---------------------------
   PAGE INITIALIZATION & UI
--------------------------- */

/**
 * Format file size for display (e.g., 12345 bytes -> '12.0 KB' or '1.2 MB')
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
 * Update the file info in the sidebar: total count and total size.
 */
function updateFileInfo(files) {
  const totalCount = files.length;
  const totalSize = files.reduce((acc, f) => acc + (f.Size || 0), 0);
  const fileCountElem = document.getElementById("totalFiles");
  const totalSizeElem = document.getElementById("totalSize");
  if (fileCountElem) {
    fileCountElem.textContent = `${totalCount} Files`;
  }
  if (totalSizeElem) {
    totalSizeElem.innerHTML = `${(totalSize / (1024 * 1024)).toFixed(1)}MB / <b>100GB</b>`;
  }
}

/**
 * Load files from the server and display them in the table.
 * This function is called on page load and every 1 minute.
 */
async function loadFiles() {
  try {
    const files = await getFiles();
    const filesTbody = document.getElementById("filesTbody");
    filesTbody.innerHTML = ""; // Clear previous rows

    files.forEach((file) => {
      // Create a row for each file
      const row = document.createElement("tr");

      // Cell 1: File Name
      const nameCell = document.createElement("td");
      nameCell.textContent = file.Name || "Untitled";
      row.appendChild(nameCell);

      // Cell 2: Size
      const sizeCell = document.createElement("td");
      sizeCell.textContent = formatFileSize(file.Size);
      row.appendChild(sizeCell);

      // Cell 3: Links Button
      const linksCell = document.createElement("td");
      const linksBtn = document.createElement("button");
      linksBtn.className = "links-toggle-btn";
      linksBtn.textContent = "Links";
      // Add click event if you want to toggle a links row or modal here
      linksBtn.addEventListener("click", () => {
        // Your logic for showing file-specific link information
        // For example, open a modal to manage access links
        // or toggle a hidden row below this file
        alert("Implement link management for file " + file.ID);
      });
      linksCell.appendChild(linksBtn);
      row.appendChild(linksCell);

      filesTbody.appendChild(row);
    });

    updateFileInfo(files);
  } catch (error) {
    console.error("Error loading files:", error);
  }
}

/* ---------------------------
   PAGE LOAD & REFRESH LOGIC
--------------------------- */
document.addEventListener("DOMContentLoaded", () => {
  // Load files immediately on page load
  loadFiles();
  // Refresh file list every 1 minute (60000 ms)
  setInterval(loadFiles, 60000);
});

/* ---------------------------
   DUMMY/UTILITY UI FUNCTIONS
--------------------------- */
// Below are the functions from your "share" functionality example.
// They are currently dummy implementations and can be replaced with real API calls as needed.

/* Toggle a dropdown for links (if using dropdown UI) */
function toggleDropdown(dropdownId) {
  const dropdown = document.getElementById(dropdownId);
  dropdown.style.display = (dropdown.style.display === "block") ? "none" : "block";
}

/* Modal Controls for creating access links */
const createLinkModal = document.getElementById("createLinkModal");
let currentLinksTableBody = null;

function openCreateLinkModal(linksTableBodyId) {
  currentLinksTableBody = document.getElementById(linksTableBodyId);
  if (createLinkModal) {
    createLinkModal.style.display = "block";
  }
}

function closeCreateLinkModal() {
  if (createLinkModal) {
    createLinkModal.style.display = "none";
    document.getElementById("generatedLink").style.display = "none";
    document.getElementById("linkUrl").textContent = "";
  }
}

/* Generate a new access link (dummy implementation) */
function generateLink() {
  const access = document.getElementById("accessSelect").value;
  const ttl = document.getElementById("ttlSelect").value;
  const randomPart = Math.random().toString(36).substring(2, 8);
  const newLink = `https://defdrive.com/share/${randomPart}`;
  document.getElementById("generatedLink").style.display = "block";
  document.getElementById("linkUrl").textContent = newLink;

  const newRow = document.createElement("tr");
  newRow.innerHTML = `
    <td>${newLink}</td>
    <td>${access}</td>
    <td>${ttl}</td>
  `;
  if (currentLinksTableBody) {
    currentLinksTableBody.appendChild(newRow);
  }
}

/* Copy link to clipboard */
function copyLink() {
  const linkText = document.getElementById("linkUrl").textContent;
  navigator.clipboard.writeText(linkText)
    .then(() => {
      alert("Link copied to clipboard!");
    })
    .catch(err => {
      alert("Failed to copy link: " + err);
    });
}

/* Close modal if clicking outside of it */
window.onclick = function(event) {
  if (event.target === createLinkModal) {
    closeCreateLinkModal();
  }
};

  


