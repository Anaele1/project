
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



    // Toggle section visibility
        function toggleSection(sectionId) {
            const sections = document.querySelectorAll('.section');
            sections.forEach(section => {
                section.style.display = 'none';
            });
            document.getElementById(sectionId).style.display = 'block';
        }

    // Toggle section visibility
        function toggleSection(sectionId) {
            const sections = document.querySelectorAll('.section');
            sections.forEach(section => {
                section.style.display = 'none';
            });
            document.getElementById(sectionId).style.display = 'block';
        }

    // Render the pie chart with dynamic data
        window.onload = function() {
            // Use the data passed from the backend
            const statusCounts = {
                pending: <%= statusCounts.pending || 0 %>,
                accepted: <%= statusCounts.accepted || 0 %>,
                cancelled: <%= statusCounts.cancelled || 0 %>
            };

            const data = {
                labels: ['Pending', 'Accepted', 'Cancelled'],
                datasets: [{
                    data: [statusCounts.pending, statusCounts.accepted, statusCounts.cancelled],
                    backgroundColor: [
                        'rgba(255, 99, 132, 0.7)',
                        'rgba(54, 162, 235, 0.7)',
                        'rgba(255, 206, 86, 0.7)'
                    ],
                    borderColor: [
                        'rgba(255, 99, 132, 1)',
                        'rgba(54, 162, 235, 1)',
                        'rgba(255, 206, 86, 1)'
                    ],
                    borderWidth: 1
                }]
            };

            const config = {
                type: 'pie',
                data: data,
                options: {
                    responsive: true,
                    plugins: {
                        legend: {
                            position: 'right',
                        },
                        title: {
                            display: true,
                            text: 'Appointment Status Distribution'
                        }
                    }
                }
            };

            const ctx = document.getElementById('appointmentPieChart').getContext('2d');
            new Chart(ctx, config);
        };