function save_options() {
    var carbs = document.getElementById('netCarbs').value;
    chrome.storage.sync.set({
      netCarbs: carbs
    }, function() {
      // Update status to let user know options were saved.
      var status = document.getElementById('status');
      status.textContent = 'Options saved.';
      setTimeout(function() {
        status.textContent = '';
      }, 750);
    });
  }
  
  // Restores select box and checkbox state using the preferences
  // stored in chrome.storage.
  function restore_options() {
    // Use default value color = 'red' and likesColor = true.
    chrome.storage.sync.get({
        netCarbs: '30'
    }, function(items) {
      document.getElementById('netCarbs').value = items.netCarbs;
    });
  }
  document.addEventListener('DOMContentLoaded', restore_options);
  document.getElementById('save').addEventListener('click', save_options);