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
        // Navigate to the entries page for the selected date
        console.log('Day clicked:', date);
        window.location.href = `/entries/date/${date}`;
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