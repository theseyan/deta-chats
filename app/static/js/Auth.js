/**
 * Authentication State manager
*/

// Redirect to Sign Up/Login if auth token is missing
if(!localStorage.getItem('detaChats_token')) window.location.href = '/auth.html';

// Stores info about logged in user
var User = new function() {

    this.token = localStorage.getItem('detaChats_token');
    this.username = null;
    this.id = null;

    // Loads logged in user info from token
    this.fetchUser = () => {
        return new Promise((resolve, reject) => {
            fetch(API_URL + '/users/user', {
                method: 'POST',
                body: JSON.stringify({
                    token: this.token
                })
            }).then(async response => {
                if (!response.ok) return reject(new Error(await response.text()));

                var body = await response.json();

                resolve(body);
            }).catch(reject);
        });
    };

    // Logs out
    this.logOut = () => {
        localStorage.removeItem('detaChats_token');
        window.location.href = '/auth.html';
    };

};

_('User.logOutBtn').onclick = User.logOut;