// Check for service worker updates when the page loads
if ('serviceWorker' in navigator) {
  // Register the service worker
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/CalcFood/sw.js')
      .then(registration => {
        console.log('ServiceWorker registration successful');
        
        // Check for updates every time the page loads
        registration.update();
        
        // Listen for the controllerchange event to detect when a new service worker takes over
        let refreshing = false;
        navigator.serviceWorker.addEventListener('controllerchange', () => {
          if (!refreshing) {
            window.location.reload();
            refreshing = true;
          }
        });
      })
      .catch(error => {
        console.error('ServiceWorker registration failed:', error);
      });
  });

  // Listen for update messages from the service worker
  navigator.serviceWorker.addEventListener('message', event => {
    if (event.data && event.data.type === 'UPDATE_AVAILABLE') {
      showUpdateNotification();
    }
  });
}

// Function to show the update notification
function showUpdateNotification() {
  // Create the notification container if it doesn't exist
  let notification = document.getElementById('update-notification');
  
  if (!notification) {
    notification = document.createElement('div');
    notification.id = 'update-notification';
    notification.style.position = 'fixed';
    notification.style.bottom = '20px';
    notification.style.right = '20px';
    notification.style.padding = '15px 20px';
    notification.style.backgroundColor = '#1e293b';
    notification.style.color = 'white';
    notification.style.borderRadius = '8px';
    notification.style.boxShadow = '0 4px 6px rgba(0, 0, 0, 0.1)';
    notification.style.zIndex = '1000';
    notification.style.display = 'flex';
    notification.style.flexDirection = 'column';
    notification.style.gap = '10px';
    notification.style.maxWidth = '320px';
    
    // Add message
    const message = document.createElement('div');
    message.textContent = '¡Hay una nueva versión disponible!';
    notification.appendChild(message);
    
    // Add buttons container
    const buttons = document.createElement('div');
    buttons.style.display = 'flex';
    buttons.style.gap = '10px';
    buttons.style.justifyContent = 'flex-end';
    
    // Add update button
    const updateButton = document.createElement('button');
    updateButton.textContent = 'Actualizar ahora';
    updateButton.style.padding = '6px 12px';
    updateButton.style.backgroundColor = '#3b82f6';
    updateButton.style.color = 'white';
    updateButton.style.border = 'none';
    updateButton.style.borderRadius = '4px';
    updateButton.style.cursor = 'pointer';
    updateButton.addEventListener('click', () => {
      // Tell the service worker to skip waiting and take control
      if (navigator.serviceWorker.controller) {
        navigator.serviceWorker.controller.postMessage({ type: 'SKIP_WAITING' });
      }
    });
    
    // Add dismiss button
    const dismissButton = document.createElement('button');
    dismissButton.textContent = 'Ahora no';
    dismissButton.style.padding = '6px 12px';
    dismissButton.style.backgroundColor = 'transparent';
    dismissButton.style.color = '#94a3b8';
    dismissButton.style.border = '1px solid #94a3b8';
    dismissButton.style.borderRadius = '4px';
    dismissButton.style.cursor = 'pointer';
    dismissButton.addEventListener('click', () => {
      notification.style.display = 'none';
    });
    
    // Add buttons to the container
    buttons.appendChild(dismissButton);
    buttons.appendChild(updateButton);
    notification.appendChild(buttons);
    
    // Add the notification to the page
    document.body.appendChild(notification);
    
    // Auto-hide after 30 seconds
    setTimeout(() => {
      if (notification && notification.style.display !== 'none') {
        notification.style.opacity = '0';
        notification.style.transition = 'opacity 0.5s';
        setTimeout(() => {
          if (notification) {
            notification.style.display = 'none';
          }
        }, 500);
      }
    }, 30000);
  } else {
    // If notification exists but was hidden, show it again
    notification.style.display = 'flex';
    notification.style.opacity = '1';
  }
}
