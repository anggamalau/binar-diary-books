document.addEventListener('DOMContentLoaded', function() {
    // Auto-hide alerts after 5 seconds
    setTimeout(function() {
        const alerts = document.querySelectorAll('.alert');
        alerts.forEach(function(alert) {
            const bsAlert = new bootstrap.Alert(alert);
            setTimeout(function() {
                bsAlert.close();
            }, 5000);
        });
    }, 100);

    // Calendar day click handlers
    const calendarDays = document.querySelectorAll('.calendar-day[data-date]');
    calendarDays.forEach(function(day) {
        day.addEventListener('click', function() {
            const date = this.getAttribute('data-date');
            handleDayClick(date);
        });

        // Handle keyboard navigation
        day.addEventListener('keypress', function(e) {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                const date = this.getAttribute('data-date');
                handleDayClick(date);
            }
        });
    });

    function handleDayClick(date) {
        // For Phase 2, we'll just show an alert
        // In Phase 3, this will navigate to the entry management page
        console.log('Day clicked:', date);
        
        // Show a temporary message
        const alertContainer = document.querySelector('main .container');
        if (alertContainer) {
            const existingAlert = alertContainer.querySelector('.day-click-alert');
            if (existingAlert) {
                existingAlert.remove();
            }

            const alertDiv = document.createElement('div');
            alertDiv.className = 'alert alert-info alert-dismissible fade show day-click-alert';
            alertDiv.innerHTML = `
                <strong>Day Selected:</strong> ${formatDate(date)}
                <br><small>Diary entry management will be available in Phase 3.</small>
                <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
            `;
            
            alertContainer.insertBefore(alertDiv, alertContainer.firstChild);
            
            // Auto-hide after 3 seconds
            setTimeout(function() {
                if (alertDiv.parentNode) {
                    const bsAlert = new bootstrap.Alert(alertDiv);
                    bsAlert.close();
                }
            }, 3000);
        }
    }

    function formatDate(dateString) {
        const date = new Date(dateString + 'T00:00:00');
        return date.toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    }
});