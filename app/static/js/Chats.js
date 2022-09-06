/**
 * Handles Chat UI
*/

function _(id) {return document.getElementById(id);}

var Chats = new function() {

    // Stores list of loaded messages
    this.list = [];

    // Chat box node
    this.box = _('Chats.box');

    // Creates a message element
    this.createMessageBox = (pfp, username, content) => {
        var box = document.createElement('div');
        box.className = 'message';
        box.innerHTML = `<div class="pfp" style="background-image:url('${pfp}');"></div>  
                         <div class="message-body">
                            <span class="username">${username}</span>
                            <div class="message-content">${content}</div>
                         </div>`;
        
        return box;
    };

    // Appends a new message and renders it
    this.addMessage = (username, content) => {
        var message = this.createMessageBox(`https://avatars.dicebear.com/api/identicon/${encodeURIComponent(username)}.svg`, username, content);

        this.list.push({
            username: username,
            content: content
        });

        this.box.appendChild(message);
    };

    // Renders a list of messages
    this.renderMessages = (list) => {
        list.forEach(message => {
            this.addMessage(message.username, message.message);
        });
    };

};

// Register event handlers
var handleSendSubmit = () => {
    var username = _('Chats.username').value;
    var content = _('Chats.input').value;

    // If username is provided, save it to local storage for future autofill
    if(username != '') {
        localStorage.setItem('detaChats_username', username);
    }

    // Send the message
    API.sendMessage(username, content);

    // Clear input
    _('Chats.input').value = '';
};

_('Chats.sendForm').onsubmit = (e) => {
    e.preventDefault();
    handleSendSubmit();
};

_('Chats.sendBtn').onclick = () => {
    handleSendSubmit();
};