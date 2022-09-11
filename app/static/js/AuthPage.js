/**
 * Handles Authentication
*/

var Auth = new function() {

    // Authenticates username/password pair and returns a token
    this.login = (username, password) => {
        return new Promise((resolve, reject) => {
            window.onRecaptchaSubmit = (token) => {
                fetch(API_URL + '/users/login', {
                    method: 'POST',
                    body: JSON.stringify({
                        username: username,
                        password: password,
                        captcha: token
                    })
                }).then(async response => {
                    if (!response.ok) return reject(new Error(await response.text()));
    
                    var body = await response.json();
    
                    resolve(body.token);
                }).catch(reject);

                window.onRecaptchaSubmit = null;
            };

            // Reset and execute captcha challenge
            grecaptcha.reset();
            grecaptcha.execute();
        });
    };

    // Creates a new user
    this.createUser = (username, password) => {
        return new Promise((resolve, reject) => {
            window.onRecaptchaSubmit = (token) => {
                fetch(API_URL + '/users/signup', {
                    method: 'POST',
                    body: JSON.stringify({
                        username: username,
                        password: password,
                        captcha: token
                    })
                }).then(async response => {
                    if (!response.ok) return reject(new Error(await response.text()));
    
                    return resolve();
                }).catch(reject);

                window.onRecaptchaSubmit = null;
            };

            // Reset and execute captcha challenge
            grecaptcha.reset();
            grecaptcha.execute();
        });
    };

};

var signUpBtn = _('Auth.signUpBtn');
var loginBtn = _('Auth.loginBtn');

// Register handlers
var handleSignUp = () => {
    signUpBtn.classList.add('btn-disabled');
    signUpBtn.innerHTML = '...';

    var username = _('Auth.username').value;
    var password = _('Auth.password').value;

    Auth.createUser(username, password).then(() => {
        signUpBtn.innerHTML = 'Signed Up!';

        // Login automatically
        handleLogin();
    }).catch(e => {
        alert(e);

        signUpBtn.classList.remove('btn-disabled');
        signUpBtn.innerHTML = 'Sign Up';
    });
};
var handleLogin = () => {
    loginBtn.classList.add('btn-disabled');
    loginBtn.innerHTML = 'Logging in...';

    var username = _('Auth.username').value;
    var password = _('Auth.password').value;

    Auth.login(username, password).then((token) => {
        loginBtn.innerHTML = 'Success!';

        // Save token to local storage
        localStorage.setItem('detaChats_token', token);

        window.location.href = '/';
    }).catch(e => {
        alert(e);
        
        loginBtn.classList.remove('btn-disabled');
        loginBtn.innerHTML = 'Log In';
    });
};

signUpBtn.onclick = handleSignUp;
loginBtn.onclick = handleLogin;