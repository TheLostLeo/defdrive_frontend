// Define the API base URL
const API_BASE_URL = "https://defdb.wlan0.in/api/";

// Toggle the row containing links
function toggleLinks(button, fileID) {
  const row = button.closest("tr").nextElementSibling;
  if (row.classList.contains("hidden")) {
    row.classList.remove("hidden");
    button.textContent = "Hide Links";
    fetchAccesses(fileID); // Fetch accesses when the subtable is shown
    logFileAction("Show Links", fileID);
  } else {
    row.classList.add("hidden");
    button.textContent = "Show Links";
    logFileAction("Hide Links", fileID);
  }
}

// Copy the link to clipboard
function copyToClipboard(link) {
  navigator.clipboard.writeText(link).then(() => {
    showMessageModal("Link copied to clipboard!");
  }).catch((error) => {
    console.error("Failed to copy link:", error);
    showMessageModal("Failed to copy link.");
  });
}

function showMessageModal(message) {
  const messageModal = document.getElementById("messageModal");
  const messageText = document.getElementById("messageText");

  if (messageModal && messageText) {
    messageText.textContent = message;
    messageModal.style.display = "flex";

    setTimeout(() => {
      messageModal.style.display = "none";
    }, 2000); // Hide the modal after 2 seconds
  }
}

// Open upload modal
function openUploadModal() {
  const uploadModal = document.getElementById("uploadModal");
  if (uploadModal) {
    uploadModal.style.display = "flex";
  } else {
    console.error("Upload modal not found.");
  }
}

// Close upload modal
function closeUploadModal() {
  const uploadModal = document.getElementById("uploadModal");
  if (uploadModal) {
    uploadModal.style.display = "none";
  } else {
    console.error("Upload modal not found.");
  }
}

// Handle file selection and display file name
document.addEventListener("DOMContentLoaded", function () {
  const fileInput = document.getElementById("fileInput");
  if (fileInput) {
    fileInput.addEventListener("change", function () {
      const fileName = this.files[0] ? this.files[0].name : "No file chosen";
      const fileNameDisplay = document.getElementById("fileName");
      if (fileNameDisplay) {
        fileNameDisplay.textContent = fileName;
      }
    });
  } else {
    console.error("File input element not found.");
  }
});

// Open and close modals for creating access
function openCreateAccessModal(fileID) {
  const modal = document.getElementById("createAccessModal");
  modal.setAttribute("data-file-id", fileID);
  modal.removeAttribute("data-access-id"); // Ensure no access ID is set for creation

  // Show input for Create
  document.getElementById("accessNameInput").classList.remove("hidden");
  document.getElementById("accessNameInput").value = ""; // Clear input field

  document.getElementById("createAccessBtn").classList.remove("hidden");
  document.getElementById("updateAccessBtn").classList.add("hidden");
  document.getElementById("accessModalHeader").textContent = "Create Access"; // Update header
  modal.style.display = "flex";
}

// Close the Create Access modal
function closeCreateAccessModal() {
  document.getElementById("createAccessModal").style.display = "none";
}

// Add dynamic input fields
function addInput(containerId) {
  const container = document.getElementById(containerId);
  const div = document.createElement("div");
  div.classList.add("dynamic-input");

  const input = document.createElement("input");
  input.type = "text";
  input.classList.add("input-field");
  input.placeholder =
    containerId === "subnetContainer"
      ? "Enter subnet (e.g. 192.168.1.0/24)"
      : "Enter IP (e.g. 192.168.1.1)";

  const removeBtn = document.createElement("button");
  removeBtn.innerHTML = "✖";
  removeBtn.classList.add("remove-btn");
  removeBtn.onclick = function () {
    container.removeChild(div);
  };

  div.appendChild(input);
  div.appendChild(removeBtn);
  container.appendChild(div);
}

// Helper function to get the token from sessionStorage
function getAuthToken() {
  const token = sessionStorage.getItem("token");
  if (!token) {
    console.error("Authorization token is missing. Please log in.");
  }
  return token;
}

// Ensure the token is set in sessionStorage before making API requests
document.addEventListener("DOMContentLoaded", function () {
  const authToken = sessionStorage.getItem("token");
  if (!authToken) {
    showNotification("You are not logged in. Please log in to continue.", false);
    // Redirect to login page or handle unauthorized access
    window.location.href = "/"; // Adjust the path to your login page
  }
});

// Logout functionality
document.addEventListener("DOMContentLoaded", function () {
  const logoutBtn = document.querySelector(".logout-btn");

  if (logoutBtn) {
    logoutBtn.addEventListener("click", function () {
      // Remove token and username from session storage
      sessionStorage.removeItem("token");
      sessionStorage.removeItem("username");

      // Reload the current page
      location.reload();
    });
  } else {
    console.error("Logout button not found!");
  }
});

// =============================
// File Endpoints
// =============================

// Fetch all files
async function fetchFiles() {
  try {
    const response = await fetch(`${API_BASE_URL}files`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${getAuthToken()}`,
      },
    });
    if (!response.ok) throw new Error(`Error: ${response.status}`);
    const { files } = await response.json();
    console.log("Fetched Files:", files);

    const fileTableBody = document.querySelector(".file-table tbody");
    fileTableBody.innerHTML = ""; // Clear existing rows

    files.forEach((file) => {
      const fileRow = document.createElement("tr");
      fileRow.setAttribute("data-file-id", file.ID); // Add file ID as a data attribute
      fileRow.innerHTML = `
        <td>${file.Name}</td>
        <td>${(file.Size / 1024).toFixed(2)} KB</td>
        <td>
          <div class="action-buttons">
            <button class="links-toggle-btn" onclick="toggleLinks(this, ${file.ID})">Show Links</button>
            <button class="delete-btn" onclick="deleteFile(${file.ID})">Delete</button>
          </div>
        </td>
        <td class="access-toggle">
          <label class="switch">
            <input type="checkbox" ${file.Public ? "checked" : ""} onchange="toggleFilePublic(${file.ID}, this.checked)">
            <span class="slider"></span>
          </label>
        </td>
      `;
      fileTableBody.appendChild(fileRow);

      // Add a hidden row for the subtable (accesses)
      const accessRow = document.createElement("tr");
      accessRow.classList.add("link-row", "hidden");
      accessRow.setAttribute("data-file-id", file.ID); // Add file ID as a data attribute
      accessRow.innerHTML = `
        <td colspan="4">
          <div class="link-table-header">
            <button class="create-link-btn" onclick="openCreateAccessModal(${file.ID})">+ Create New Link</button>
          </div>
          <table class="links-table">
            <thead>
              <tr>
                <th>Link</th>
                <th>Copy</th>
                <th>Actions</th>
                <th>Toggle Access</th>
              </tr>
            </thead>
            <tbody id="accessTable-${file.ID}">
              <!-- Access rows will be dynamically populated -->
            </tbody>
          </table>
        </td>
      `;
      fileTableBody.appendChild(accessRow);
    });
  } catch (error) {
    console.error("Failed to fetch files:", error);
  }
}

// Upload a file
async function uploadFile(file) {
  try {
    const formData = new FormData();
    formData.append("file", file);

    const token = getAuthToken();
    if (!token) {
      showNotification("Authorization token is missing. Please log in.", false);
      return;
    }

    const response = await fetch(`${API_BASE_URL}upload`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`, // Ensure token is included
      },
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`Error: ${response.status} - ${error.error || "Unknown error"}`);
    }

    const result = await response.json();
    console.log("File uploaded successfully:", result);
    showNotification("File uploaded successfully!", true);
    // Reset the file input and update the UI after successful upload
    fileInput.value = "";
    const fileNameDisplay = document.getElementById("fileName");
    if (fileNameDisplay) {
      fileNameDisplay.textContent = "No file chosen";
    }
    closeUploadModal();
    fetchFiles(); // Refresh the file list
  } catch (error) {
    console.error("Failed to upload file:", error);
    showNotification(`Failed to upload file: ${error.message}`, false);
  }
}

// Delete a file
async function deleteFile(fileID) {
  try {
    const response = await fetch(`${API_BASE_URL}files/${fileID}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${getAuthToken()}`,
      },
    });
    if (!response.ok) throw new Error(`Error: ${response.status}`);
    const result = await response.json();
    console.log("File deleted successfully:", result);
    showNotification("File deleted successfully!", true);
    logFileAction("Delete File", fileID);
    fetchFiles(); // Refresh the file list after deletion
  } catch (error) {
    console.error("Failed to delete file:", error);
    showNotification("Failed to delete file. Please try again.", false);
  }
}

// Toggle file public access
async function toggleFilePublic(fileID, isPublic) {
  try {
    const response = await fetch(`${API_BASE_URL}files/${fileID}/access`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${getAuthToken()}`,
      },
      body: JSON.stringify({ public: isPublic }),
    });
    if (!response.ok) throw new Error(`Error: ${response.status}`);
    const result = await response.json();
    console.log("File access updated successfully:", result);
    showNotification("File access updated successfully!", true);
  } catch (error) {
    console.error("Failed to update file access:", error);
    showNotification("Failed to update file access. Please try again.", false);
  }
}

// =============================
// Access Endpoints
// =============================

// Fetch accesses for a specific file
async function fetchAccesses(fileID) {
  try {
    const response = await fetch(`${API_BASE_URL}files/${fileID}/accesses`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${getAuthToken()}`,
      },
    });

    if (!response.ok) throw new Error(`Error: ${response.status}`);
    const { accesses } = await response.json(); // Parse JSON response
    console.log(`Fetched Accesses for File ${fileID}:`, accesses);

    // Ensure the access table is updated
    populateAccessTable(fileID, accesses);
  } catch (error) {
    console.error(`Failed to fetch accesses for file ${fileID}:`, error);
  }
}

// Create a new access
async function createAccess(fileID, accessData) {
  try {
    const response = await fetch(`${API_BASE_URL}files/${fileID}/accesses`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${getAuthToken()}`,
      },
      body: JSON.stringify(accessData),
    });
    if (!response.ok) throw new Error(`Error: ${response.status}`);
    const result = await response.json();
    console.log("Access created successfully:", result);
    showNotification("Access created successfully!", true);
    fetchAccesses(fileID); // Refresh the access list
  } catch (error) {
    console.error("Failed to create access:", error);
    showNotification("Failed to create access. Please try again.", false);
  }
}

// Update an access
async function updateAccess(accessID, accessData) {
  try {
    const response = await fetch(`${API_BASE_URL}accesses/${accessID}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${getAuthToken()}`,
      },
      body: JSON.stringify(accessData),
    });
    if (!response.ok) throw new Error(`Error: ${response.status}`);
    const result = await response.json();
    console.log("Access updated successfully:", result);
    showNotification("Access updated successfully!", true);
  } catch (error) {
    console.error("Failed to update access:", error);
    showNotification("Failed to update access. Please try again.", false);
  }
}

// Delete an access
async function deleteAccess(accessID) {
  try {
    const response = await fetch(`${API_BASE_URL}accesses/${accessID}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${getAuthToken()}`,
      },
    });
    if (!response.ok) throw new Error(`Error: ${response.status}`);
    const result = await response.json();
    console.log("Access deleted successfully:", result);
    showNotification("Access deleted successfully!", true);
    fetchFiles(); // Refresh the file list after access deletion
  } catch (error) {
    console.error("Failed to delete access:", error);
    showNotification("Failed to delete access. Please try again.", false);
  }
}

// Toggle access public/private in the links table
async function toggleAccessPublic(accessID, isPublic) {
  try {
    // Fetch the current access JSON
    const response = await fetch(`${API_BASE_URL}accesses/${accessID}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${getAuthToken()}`,
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`Error: ${response.status} - ${error.message || "Failed to fetch access details"}`);
    }

    const accessData = await response.json();
    console.log("Fetched Access Data:", accessData);

    // Update the public field
    accessData.Public = isPublic;

    // Send the updated JSON back to the server
    const updateResponse = await fetch(`${API_BASE_URL}accesses/${accessID}/access`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${getAuthToken()}`,
      },
      body: JSON.stringify(accessData),
    });

    if (!updateResponse.ok) {
      const updateError = await updateResponse.json();
      throw new Error(`Error: ${updateResponse.status} - ${updateError.message || "Failed to update access"}`);
    }

    const updatedAccess = await updateResponse.json();
    console.log("Access updated successfully:", updatedAccess);
    showNotification("Access updated successfully!", true);
  } catch (error) {
    console.error("Failed to toggle access public/private:", error);
    showNotification(`Failed to toggle access: ${error.message}`, false);
  }
}

// =============================
// Utility Functions
// =============================

// Populate the file table
function populateFileTable(files) {
  const fileTableBody = document.querySelector(".file-table tbody");
  fileTableBody.innerHTML = ""; // Clear existing rows

  files.forEach((file) => {
    const fileRow = document.createElement("tr");
    fileRow.setAttribute("data-file-id", file.ID); // Add file ID as a data attribute
    fileRow.innerHTML = `
      <td>${file.Name}</td>
      <td>${(file.Size / 1024).toFixed(2)} KB</td>
      <td>
        <div class="action-buttons">
          <button class="links-toggle-btn" onclick="toggleLinks(this, ${file.ID})">Show Links</button>
          <button class="delete-btn" onclick="deleteFile(${file.ID})">Delete</button>
        </div>
      </td>
      <td class="access-toggle">
        <label class="switch">
          <input type="checkbox" ${file.Public ? "checked" : ""} onchange="toggleFilePublic(${file.ID}, this.checked)">
          <span class="slider"></span>
        </label>
      </td>
    `;
    fileTableBody.appendChild(fileRow);

    // Add a hidden row for the subtable (accesses)
    const accessRow = document.createElement("tr");
    accessRow.classList.add("link-row", "hidden");
    accessRow.setAttribute("data-file-id", file.ID); // Add file ID as a data attribute
    accessRow.innerHTML = `
      <td colspan="4">
        <div class="link-table-header">
          <button class="create-link-btn" onclick="openCreateAccessModal(${file.ID})">+ Create New Link</button>
        </div>
        <table class="links-table">
          <thead>
            <tr>
              <th>Link</th>
              <th>Copy</th>
              <th>Actions</th>
              <th>Toggle Access</th>
            </tr>
          </thead>
          <tbody id="accessTable-${file.ID}">
            <!-- Access rows will be dynamically populated -->
          </tbody>
        </table>
      </td>
    `;
    fileTableBody.appendChild(accessRow);
  });
}

// Populate the access table for a specific file
function populateAccessTable(fileID, accesses) {
  const accessTableBody = document.getElementById(`accessTable-${fileID}`);
  if (!accessTableBody) {
    console.error(`Access table body not found for file ID: ${fileID}`);
    return;
  }

  accessTableBody.innerHTML = ""; // Clear existing rows

  accesses.forEach((access) => {
    const fullLink = `https://defdb.wlan0.in/link/${access.Link}`;
    const accessRow = document.createElement("tr");
    accessRow.innerHTML = `
      <td>${access.Name || "Unnamed Access"}</td>
      <td>
        <button class="copy-btn" onclick="copyToClipboard('${fullLink}')">Copy</button>
      </td>
      <td>
        <button class="update-access-btn" onclick="openUpdateAccessModal(${access.ID})">Update Access</button>
        <button class="delete-btn" onclick="deleteAccess(${access.ID})">Delete</button>
      </td>
      <td>
        <label class="switch">
          <input type="checkbox" ${access.Public ? "checked" : ""} onchange="toggleAccessPublic(${access.ID}, this.checked)">
          <span class="slider"></span>
        </label>
      </td>
    `;
    accessTableBody.appendChild(accessRow);
  });
}

// Handle create access
function handleCreateAccess() {
  const fileID = document.querySelector("#createAccessModal").getAttribute("data-file-id");
  if (!fileID) {
    showNotification("File ID is missing. Please try again.", false);
    return;
  }

  const name = document.getElementById("accessNameInput").value; // Fetch the hidden Access Name
  const subnets = Array.from(document.querySelectorAll("#subnetContainer .input-field")).map(input => input.value);
  const ips = Array.from(document.querySelectorAll("#ipContainer .input-field")).map(input => input.value);
  const expires = document.getElementById("accessExpires").value;
  const isPublic = document.getElementById("accessPublic").checked;
  const oneTimeUse = document.getElementById("accessOneTimeUse").checked;
  const ttl = document.getElementById("accessTTL").value;
  const enableTTL = document.getElementById("accessEnableTTL").checked;

  const accessData = {
    name,
    subnets,
    ips,
    expires: expires ? new Date(Date.now() + expires * 24 * 60 * 60 * 1000).toISOString() : null,
    public: isPublic,
    oneTimeUse,
    ttl: ttl ? parseInt(ttl, 10) : null,
    enableTTL,
  };

  createAccess(fileID, accessData);
  closeCreateAccessModal();
}

// Object to store access details by accessID
const accessDetails = {};

// Open the Create Access modal for updating an access
async function openUpdateAccessModal(accessID) {
  const modal = document.getElementById("createAccessModal");
  try {
    const response = await fetch(`${API_BASE_URL}accesses/${accessID}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${getAuthToken()}`,
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`Error: ${response.status} - ${error.message || "Failed to fetch access details"}`);
    }

    const access = await response.json();

    // Fetch and set the Access Name in the hidden field
    document.getElementById("accessNameInput").value = access.Name || "";

    // Populate other fields
    const subnets = Array.isArray(access.Subnets) ? access.Subnets : [];
    document.getElementById("subnetContainer").innerHTML = subnets
      .map(
        (subnet) => `
        <div class="dynamic-input">
          <input type="text" class="input-field" value="${subnet}">
          <button class="remove-btn" onclick="this.parentElement.remove()">✖</button>
        </div>
      `
      )
      .join("");

    const ips = Array.isArray(access.IPs) ? access.IPs : [];
    document.getElementById("ipContainer").innerHTML = ips
      .map(
        (ip) => `
        <div class="dynamic-input">
          <input type="text" class="input-field" value="${ip}">
          <button class="remove-btn" onclick="this.parentElement.remove()">✖</button>
        </div>
      `
      )
      .join("");

    document.getElementById("accessExpires").value = access.Expires
      ? Math.ceil((new Date(access.Expires) - Date.now()) / (24 * 60 * 60 * 1000))
      : "";
    document.getElementById("accessPublic").checked = !!access.Public;
    document.getElementById("accessOneTimeUse").checked = !!access.OneTimeUse;
    document.getElementById("accessTTL").value = access.TTL || "";
    document.getElementById("accessEnableTTL").checked = !!access.EnableTTL;

    // Set modal attributes and display it
    modal.setAttribute("data-access-id", accessID);
    document.getElementById("createAccessBtn").classList.add("hidden");
    document.getElementById("updateAccessBtn").classList.remove("hidden");
    document.getElementById("accessModalHeader").textContent = "Update Access";
    modal.style.display = "flex";
  } catch (error) {
    console.error("Failed to fetch access details:", error);
    showNotification(`Failed to fetch access details: ${error.message}`, false);
  }
}

// Handle updating an access
async function handleUpdateAccess() {
  const accessID = document.querySelector("#createAccessModal").getAttribute("data-access-id");
  if (!accessID) {
    showNotification("Access ID is missing. Please try again.", false);
    return;
  }

  const name = document.getElementById("accessNameInput").value.trim() || "Unnamed Access";
  const subnets = Array.from(document.querySelectorAll("#subnetContainer .input-field")).map(input => input.value.trim());
  const ips = Array.from(document.querySelectorAll("#ipContainer .input-field")).map(input => input.value.trim());
  const expires = document.getElementById("accessExpires").value.trim() || "1";
  const isPublic = document.getElementById("accessPublic").checked;
  const oneTimeUse = document.getElementById("accessOneTimeUse").checked;
  const ttl = document.getElementById("accessTTL").value.trim() || null;
  const enableTTL = document.getElementById("accessEnableTTL").checked;

  const accessData = {
    name,
    subnets: subnets.filter(Boolean),
    ips: ips.filter(Boolean),
    expires: new Date(Date.now() + parseInt(expires, 10) * 24 * 60 * 60 * 1000).toISOString(),
    public: isPublic,
    oneTimeUse,
    ttl: ttl ? parseInt(ttl, 10) : null,
    enableTTL,
  };

  try {
    const requestBody = JSON.stringify(accessData);
    console.log("Request Body:", requestBody);

    const response = await fetch(`${API_BASE_URL}accesses/${accessID}/access`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${getAuthToken()}`,
      },
      body: requestBody,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`Error: ${response.status} - ${error.message || "Failed to update access"}`);
    }

    const result = await response.json();
    console.log("Access updated successfully:", result);
    showNotification("Access updated successfully!", true);
    closeCreateAccessModal();
    fetchAccesses(result.FileID);
  } catch (error) {
    console.error("Failed to update access:", error);
    showNotification(`Failed to update access: ${error.message}`, false);
  }
}

// =============================
// Initialize Event Listeners
// =============================
document.addEventListener("DOMContentLoaded", function () {
  fetchFiles(); // Fetch files on page load
  setInterval(fetchFiles, 180000); // Refresh files every 3 minutes
});

// Example: Upload a file to the API
async function uploadFile() {
  const fileInput = document.getElementById("fileInput");
  if (!fileInput) {
    console.error("File input element not found.");
    return;
  }

  const file = fileInput.files[0];
  if (!file) {
    showNotification("Please select a file to upload.", false);
    return;
  }

  try {
    const formData = new FormData();
    formData.append("file", file);

    const token = getAuthToken();
    if (!token) {
      showNotification("Authorization token is missing. Please log in.", false);
      return;
    }

    const response = await fetch(`${API_BASE_URL}upload`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`, // Ensure token is included
      },
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`Error: ${response.status} - ${error.error || "Unknown error"}`);
    }

    const result = await response.json();
    console.log("File uploaded successfully:", result);
    showNotification("File uploaded successfully!", true);
    // Reset the file input and update the UI after successful upload
    fileInput.value = "";
    const fileNameDisplay = document.getElementById("fileName");
    if (fileNameDisplay) {
      fileNameDisplay.textContent = "No file chosen";
    }
    closeUploadModal();
    fetchFiles(); // Refresh the file list
  } catch (error) {
    console.error("Failed to upload file:", error);
    showNotification(`Failed to upload file: ${error.message}`, false);
  }
}

// Initialize event listeners
document.addEventListener("DOMContentLoaded", function () {
  // Ensure modals are hidden on load
  document.getElementById("uploadModal").style.display = "none";
  document.getElementById("createAccessModal").style.display = "none";

  document.getElementById("addSubnetBtn").addEventListener("click", function () {
    addInput("subnetContainer");
  });

  document.getElementById("addIpBtn").addEventListener("click", function () {
    addInput("ipContainer");
  });

  // Close button for upload modal
  document.querySelector("#uploadModal .close-btn").addEventListener("click", closeUploadModal);

  // Close button for create access modal
  document.querySelector("#createAccessModal .close-btn").addEventListener("click", closeCreateAccessModal);

  // Fetch files on page load
  fetchFiles();

  // Fetch files every 3 minutes (180,000 milliseconds)
  setInterval(fetchFiles, 180000);

  const uploadForm = document.getElementById("uploadForm");
  if (uploadForm) {
    uploadForm.addEventListener("submit", function (event) {
      event.preventDefault(); // Prevent the default form submission
      uploadFile();
    });
  } else {
    console.error("Upload form not found.");
  }
});

// Update the submit button in the modal to handle updates
document.addEventListener("DOMContentLoaded", function () {
  const submitButton = document.querySelector("#createAccessModal .submit-btn");
  submitButton.onclick = function () {
    const accessID = document.querySelector("#createAccessModal").getAttribute("data-access-id");
    if (accessID) {
      handleUpdateAccess(); // Update access if accessID exists
    } else {
      handleCreateAccess(); // Create new access otherwise
    }
  };
});

/**
 * Converts a JSON string into a JavaScript object.
 * @param {string} jsonString - The JSON string to convert.
 * @returns {object} - The resulting JavaScript object.
 * @throws {Error} - Throws an error if the JSON is invalid.
 */
function parseJSONToObject(jsonString) {
  try {
    return JSON.parse(jsonString);
  } catch (error) {
    console.error("Failed to parse JSON:", error);
    throw new Error("Invalid JSON format.");
  }
}

// Log file actions
function logFileAction(action, fileID) {
  console.log(`Action: ${action}, File ID: ${fileID}`);
}

// Refresh the links table for all files every minute
function refreshLinksTable() {
  const fileRows = document.querySelectorAll(".file-table tbody tr[data-file-id]");
  fileRows.forEach((row) => {
    const fileID = row.getAttribute("data-file-id");
    fetchAccesses(fileID);
  });
}

// Initialize periodic refresh for links table
document.addEventListener("DOMContentLoaded", function () {
  setInterval(refreshLinksTable, 60000); // Refresh every 1 minute
});

async function viewAccessDetails(accessID) {
  if (!accessID) {
    showNotification("Access ID is missing. Please try again.", false);
    return;
  }

  try {
    const response = await fetch(`${API_BASE_URL}accesses/${accessID}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${getAuthToken()}`,
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`Error: ${response.status} - ${error.message || "Failed to fetch access details"}`);
    }

    const accessDetails = await response.json();
    console.log("Access Details:", accessDetails);

    // Display access details (you can customize this as needed)
    showNotification(`Access Details:\nName: ${accessDetails.Name}\nSubnets: ${accessDetails.Subnets.join(", ")}\nIPs: ${accessDetails.IPs.join(", ")}\nExpires: ${accessDetails.Expires || "No expiration"}\nPublic: ${accessDetails.Public ? "Yes" : "No"}\nOne-Time Use: ${accessDetails.OneTimeUse ? "Yes" : "No"}\nTTL: ${accessDetails.TTL || "Not set"}\nEnable TTL: ${accessDetails.EnableTTL ? "Yes" : "No"}`, true);
  } catch (error) {
    console.error("Failed to fetch access details:", error);
    showNotification(`Failed to fetch access details: ${error.message}`, false);
  }
}

// Function to display a popup notification
function showNotification(message, isSuccess = true) {
  // Remove any existing notification
  const existingNotification = document.querySelector(".notification");
  if (existingNotification) {
    existingNotification.remove();
  }

  // Create a new notification
  const notification = document.createElement("div");
  notification.className = `notification ${isSuccess ? "success" : "error"}`;
  notification.textContent = message;

  document.body.appendChild(notification);

  // Automatically remove the notification after 10 seconds
  setTimeout(() => {
    if (notification.parentNode) {
      notification.remove();
    }
  }, 10000);
}





