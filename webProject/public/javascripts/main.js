
 //Profle Modal functions
      function openProfileModal() {
        document.getElementById("profileModal").style.display = "block";
      }

      function closeProfileModal() {
        document.getElementById("profileModal").style.display = "none";
        document.getElementById("deleteAccountForm").style.display = "none";
      }

      function confirmDeleteAccount() {
        document.getElementById("deleteAccountForm").style.display = "block";
      }

      function cancelDeleteAccount() {
        document.getElementById("deleteAccountForm").style.display = "none";
      }

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

      // Close modal if clicked outside
      window.onclick = function(event) {
        const modal = document.getElementById("profileModal");
        if (event.target === modal) {
          closeProfileModal();
        }
      }