/* Toggle the dropdown for a specific file */
function toggleDropdown(dropdownId) {
    const dropdown = document.getElementById(dropdownId);
    // Toggle display
    dropdown.style.display = (dropdown.style.display === 'block') ? 'none' : 'block';
  }
  
  /* Modal Controls */
  const createLinkModal = document.getElementById('createLinkModal');
  let currentLinksTableBody = null;
  
  /* Open the modal for creating a link */
  function openCreateLinkModal(linksTableBodyId) {
    currentLinksTableBody = document.getElementById(linksTableBodyId);
    createLinkModal.style.display = 'block';
  }
  
  /* Close modal */
  function closeCreateLinkModal() {
    createLinkModal.style.display = 'none';
    // Hide generated link area
    document.getElementById('generatedLink').style.display = 'none';
    document.getElementById('linkUrl').textContent = '';
  }
  
  /* Generate a new link (dummy) */
  function generateLink() {
    // Get user selections
    const access = document.getElementById('accessSelect').value;
    const ttl = document.getElementById('ttlSelect').value;
  
    // Create a dummy link (in real usage, you'd request from server)
    const randomPart = Math.random().toString(36).substring(2, 8);
    const newLink = `https://defdrive.com/share/${randomPart}`;
  
    // Display the new link
    document.getElementById('generatedLink').style.display = 'block';
    document.getElementById('linkUrl').textContent = newLink;
  
    // Optionally, add it to the table immediately
    const newRow = document.createElement('tr');
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
    const linkText = document.getElementById('linkUrl').textContent;
    navigator.clipboard.writeText(linkText)
      .then(() => {
        alert('Link copied to clipboard!');
      })
      .catch(err => {
        alert('Failed to copy link: ', err);
      });
  }
  
  /* Close modal if user clicks outside it */
  window.onclick = function(event) {
    if (event.target === createLinkModal) {
      closeCreateLinkModal();
    }
  };
  


