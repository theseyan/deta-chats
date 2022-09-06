/**
 * Main App Runtime
*/

// Autofill Username input if it was saved to local storage
if(localStorage['detaChats_username']) {
    _('Chats.username').value = localStorage.getItem('detaChats_username');
}