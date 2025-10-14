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