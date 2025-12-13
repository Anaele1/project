 //dashboard default views and toggles
 document.addEventListener('DOMContentLoaded', function() {
  const sections = document.querySelectorAll('.section');
  sections.forEach(section => {
      section.style.display = 'none';
  });

  // Add close buttons to each section
  sections.forEach(section => {
      const closeButton = document.createElement('button');
      closeButton.textContent = 'Close';
      closeButton.className = 'close-button';
      closeButton.onclick = function() {
          sections.forEach(s => s.style.display = 'none');
          document.getElementById('dv').style.display = 'grid';
      };
      section.insertBefore(closeButton, section.firstChild);
  });

  // Function to toggle sections
  function toggleSection(sectionId) {
      // Hide all sections
      sections.forEach(s => s.style.display = 'none');
      // Hide dashboard views
      document.getElementById('dv').style.display = 'none';
      // Show the selected section
      document.getElementById(sectionId).style.display = 'block';
  }

  // Attach toggleSection to window for button onclick
  window.toggleSection = toggleSection;
  });


 // Account Delete Function
function confirmDeleteAccount() {
  document.getElementById("deleteAccountForm").style.display = "block";
}

function cancelDeleteAccount() {
  document.getElementById("deleteAccountForm").style.display = "none";
}

// Providers Profile Updates Functions
document.getElementById("specialtyEdit").addEventListener("click", function() {
  document.getElementById("editSpecialtyForm").style.display = "block";
  document.getElementById("editLocationForm").style.display = "none";
  document.getElementById("editLanguageForm").style.display = "none";
});

document.getElementById("specialtyClose").addEventListener("click", function() {
  document.getElementById("editSpecialtyForm").style.display = "none";
});

document.getElementById("locationEdit").addEventListener("click", function() {
  document.getElementById("editLocationForm").style.display = "block";
  document.getElementById("editLanguageForm").style.display = "none";
  document.getElementById("editSpecialtyForm").style.display = "none";
});

document.getElementById("locationClose").addEventListener("click", function() {
  document.getElementById("editLocationForm").style.display = "none";
});

document.getElementById("languageEdit").addEventListener("click", function() {
  document.getElementById("editLanguageForm").style.display = "block";
  document.getElementById("editLocationForm").style.display = "none";
  document.getElementById("editSpecialtyForm").style.display = "none";
});

document.getElementById("languageClose").addEventListener("click", function() {
  document.getElementById("editLanguageForm").style.display = "none";
});


