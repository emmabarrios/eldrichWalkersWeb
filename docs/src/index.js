import { initializeApp } from "firebase/app";
import { getDatabase, ref, get, child, set, remove, update } from "firebase/database";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, setPersistence, browserSessionPersistence, onAuthStateChanged } from "firebase/auth";

const firebaseConfig = {
    apiKey: "AIzaSyCOwLpePJJhqZbGQwa1K4edRGglv-3ds0I",
    authDomain: "eldrich-78666.firebaseapp.com",
    databaseURL: "https://eldrich-78666-default-rtdb.firebaseio.com",
    projectId: "eldrich-78666",
    storageBucket: "eldrich-78666.appspot.com",
    messagingSenderId: "526963708979",
    appId: "1:526963708979:web:ba19aeff8d72885c3abf46"
  };

initializeApp(firebaseConfig);

const dbref = ref(getDatabase());
const auth = getAuth();

onAuthStateChanged(auth, (user) => {
    if (user) {

        console.log("Current user:", user);
        
        const userRef = child(dbref, `users/${user.uid}`);

        get(userRef)
            .then((snapshot) => {
                if (snapshot.exists()) {
                    const userData = snapshot.val();
                    console.log("User data:", userData);
                    const userRole = userData.role;

                    if(userRole === "user"){
                        if (window.location.pathname.endsWith('session.html')) {

                            setTimeout(() => {
                                window.location.href = 'user.html';
                            }, 4000);

                           
                        }
                    }else if(userRole === "admin"){
                        if (window.location.pathname.endsWith('session.html')) {

                            setTimeout(() => {
                                window.location.href = 'user.html';
                            }, 4000);

                            window.location.href = 'admin.html';
                        }
                    }

                }
            })
            .catch((err) => {
                console.error(err.message);
            });
        
        const userMail = document.getElementById("user-mail");

        if(userMail){
            userMail.innerText = user.email;
        }

        const userInfoList = document.getElementById("userInfoList");
        

        if(userInfoList){
            renderUserInfo(userRef);

            const delete_account_button = document.getElementById("delete_account_button");

            delete_account_button.addEventListener('click', () => {
                deleteCurrentUser();
            });
        }
        
    }
});


window.addEventListener('load', function(){

    const registration_form = document.getElementById("registration_form");
    const login_form = document.getElementById("login_form");
    const logout_button = document.getElementById("logout_Button");
    const userInfoContainer = document.getElementById("userInfoContainer");
    const editUserForm = document.getElementById('userInfoForm');
    const submit_changes = document.getElementById('submit_changes');
    const createUserForm = document.getElementById('createUserForm');
    const clearCreateForm = document.getElementById('clear-form');

    if (registration_form) {
        registration_form.addEventListener('submit', (e) => {
            e.preventDefault();
            handleRegister();
        });
    }

    if (login_form) {
        login_form.addEventListener('submit', (e) => {
            e.preventDefault();
            handleLogin();
        });
    }

    if (logout_button) {
        logout_button.addEventListener('click', () => {
            signOut(auth)
                .then(() => {
                    console.log("the user signed out")
                    window.location.href = "./session.html";
                })
                .catch((err) => {
                    console.log(err.message)
                });
        });
    }

    if(userInfoContainer){
        renderAllUserCards()
    }

    const urlParams = new URLSearchParams(window.location.search);
    const userId = urlParams.get('uid');

    if (userId) {
        console.log(userId);
        fetchUserDataAndPopulateForm(userId);
    }

    if(editUserForm){
        editUserForm.addEventListener('submit', function(event) {
            event.preventDefault(); 
            submitUserEdit();
        });
    }

    if(submit_changes){
        submit_changes.addEventListener('click', function(event) {
            event.preventDefault(); 
            window.location.href = 'admin.html';
        });
    }

    if(createUserForm){
        createUserForm.addEventListener('submit', function(event) {
            event.preventDefault();
            createNewUser();
        });
    }
    
    if(clearCreateForm){
        clearCreateForm.addEventListener('click', function(event) {
            clearForm();
        });
    }

})


function loginUser(email, password) {

    if (!email.trim() || !password.trim()) {
        showError('Faltan campos por llenar');
        return;
    }

    showLoadingScreen();
    setPersistence(auth, browserSessionPersistence)
    .then(()=>{
        return signInWithEmailAndPassword(auth, email, password)
    }).catch((err) => {

        switch(err.code) {
            case 'auth/invalid-email':
                console.log('El formato del correo electrónico es incorrecto.');
                showError('El formato del correo electrónico es incorrecto.');
                break;
            case 'auth/user-not-found':
            case 'auth/wrong-password':
                console.log('Correo electrónico o contraseña incorrectos.');
                showError('Correo electrónico o contraseña incorrectos.');
                break;
            case 'auth/invalid-credential':
                console.log('Las credenciales son inválidas. Por favor, intenta de nuevo.');
                showError('Las credenciales son inválidas. Por favor, intenta de nuevo.');
                break;
            default:
                console.log('Ocurrió un error al iniciar sesión: ' + err.message);
                showError('Ocurrió un error al iniciar sesión. Por favor, inténtalo de nuevo.');
        }
        
    })
    .finally(()=>{
        hideLoadingScreen();
    });
}

function registerUser(email, password) {

    if (!email.trim() || !password.trim()) {
        showError('Faltan campos por llenar');
        return;
    }

    showLoadingScreen();
    createUserWithEmailAndPassword(auth, email, password)
        .then((cred) => {
            
            console.log("User created: ",cred.user);
            // alert("User created: ", cred.user.uid);

            showSuccessMessage("Usuario creado con éxito: " + cred.user.uid);

            return addEmptyRecord(cred.user.uid, email);

        }).then(()=>{
            auth.signOut()
            // window.location.href = 'session.html';
        }) 
        .catch((err) => {

            switch(err.code) {
                case 'auth/email-already-in-use':
                    showError('El correo electrónico ya está en uso.');
                    break;
                case 'auth/invalid-email':
                    showError('El formato del correo electrónico es incorrecto.');
                    break;
                case 'auth/weak-password':
                    showError('La contraseña es demasiado débil. Por favor, elige una contraseña más fuerte.');
                    break;
                default:
                    showError('Ocurrió un error al registrar el usuario. Por favor, inténtalo de nuevo.');
            }

        })
        .finally(()=>{
            hideLoadingScreen();
        });

}

function addEmptyRecord(userId, usermail) {
    const userRef = child(dbref, `users/${userId}`);

     const emptyUser = {
        email: usermail,
        userId: userId,
        role: "user",
        weaponItems: [],
        quickItems: [],
        loggedDays: [],
        exp: 0,
        stats: {
            endurance:1,
            strenght:1,
            vitality:1
        },
        skillPointCost: 0,
        totalTraveledDistance: 0,
        totalDaysLogged: 0,
        lastLoggedDay: ""
    };

    set(userRef, emptyUser)
            .then(() => {
                console.log("Empty user created");
                alert("Empty user created");
            })
            .catch((err) => {
                console.log(err.message);
            });
}

function handleRegister() {
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    registerUser(email, password);

}

function handleLogin() {
    const email = document.getElementById("login_email").value;
    const password = document.getElementById("login_password").value;

    loginUser(email, password);
}

function renderUserInfo(userRef) {
    const userInfoList = document.getElementById("userInfoList");

    get(userRef)
            .then((snapshot) => {
                if (snapshot.exists()) {
                    const userData = snapshot.val();
                    console.log("User data:", userData);

                    const userInfoItems = `
                        <hr class="mt-1 mb-1"/>
                        <li class="user-card-label" >Experience <span class="user-card-data">${userData.exp}</span></li>
                        <hr class="mt-1 mb-1"/>
                        <li class="user-card-label">Endurance <span class="user-card-data">${userData.stats.endurance}</span></li>
                        <li class="user-card-label">Strenght <span class="user-card-data">${userData.stats.strenght}</span></li>
                        <li class="user-card-label">Vitality <span class="user-card-data">${userData.stats.vitality}</span></li>
                        <hr class="mt-1 mb-1"/>
                        <li class="user-card-label">Skill Point Cost <span class="user-card-data">${userData.skillPointCost}</span></li>
                        <li class="user-card-label">Total Traveled Distance <span class="user-card-data">${userData.totalTraveledDistance}</span></li>
                        <li class="user-card-label">Total Days Logged <span class="user-card-data">${userData.totalDaysLogged}</span></li>
                        <li class="user-card-label">Last Logged Day <span class="user-card-data">${userData.lastLoggedDay}</span></li>
                    `;

                    userInfoList.innerHTML = `
                        <ul class="list-group">
                            ${userInfoItems}
                        </ul>
                    `;
            }
        })
            .catch((err) => {
                console.error(err.message);
            });

}

function renderAllUserCards() {
    const userInfoContainer = document.getElementById("userInfoContainer");

    userInfoContainer.innerHTML = '';

    const usersRef = child(dbref, 'users');

    get(usersRef)
        .then((snapshot) => {
            if (snapshot.exists()) {
                const usersObject = snapshot.val();

                for (const [uid, userData] of Object.entries(usersObject)) {
                    const userEmail = userData.email; 
                    const userCard = document.createElement("div");
                    userCard.className = "card mb-3"; 
                    userCard.id = `user-card-${uid}`;
                    const cardContent = `
                        <div class="card-body d-flex justify-content-between">
                            <h6 class="card-title">User ID: ${uid}</h6>
                            <h6 class="card-title">Email: ${userEmail}</h6>
                            <div>
                                <button id="edit-${uid}" class="btn btn-primary mr-2" onclick="editUser('${uid}')">Edit</button>
                                <button id="delete-${uid}" class="btn btn-danger">Delete</button>
                            </div>
                        </div>
                    `;
                
                    userCard.innerHTML = cardContent;
                    userInfoContainer.appendChild(userCard);

                    document.getElementById(`delete-${uid}`).addEventListener('click', () => {
                        deleteUser(uid);
                    });


                    document.getElementById(`edit-${uid}`).addEventListener('click', () => {
                        editUser(uid);
                    });
                }
            } else {
                console.log("No user data available");
            }
        })
        .catch((error) => {
            console.error(error.message);
        });
}

function editUser(userId) {
    window.location.href = `edit.html?uid=${userId}`;
}

function submitUserEdit(){
    const userId = document.getElementById('user-id').value;
    const userRef = child(dbref, `users/${userId}`);

    const updatedUserData = {
        exp: parseInt(document.getElementById('experience').value, 10),
        stats: {
            endurance: parseInt(document.getElementById('endurance').value, 10),
            strength: parseInt(document.getElementById('strength').value, 10),
            vitality: parseInt(document.getElementById('vitality').value, 10)
        },
        skillPointCost: parseInt(document.getElementById('skillPointCost').value, 10),
        totalTraveledDistance: parseInt(document.getElementById('totalTraveledDistance').value, 10),
        totalDaysLogged: parseInt(document.getElementById('totalDaysLogged').value, 10),
        lastLoggedDay: document.getElementById('lastLoggedDay').value
    };

    update(userRef, updatedUserData)
        .then(() => {
            console.log("User data updated successfully");
            window.location.href = 'admin.html'; 
        })
        .catch((error) => {
            console.error("Error updating user data: ", error);
        });
}

function deleteUser(userId) {
    const userRef = child(dbref, `users/${userId}`);
    remove(userRef)
        .then(() => {
            console.log("User record deleted from database");

            const userCardElement = document.getElementById(`user-card-${userId}`);
            console.log(userCardElement);

            if (userCardElement) {
                userCardElement.remove();
            }
        })
        .catch((err) => {
            console.error("Error deleting user record from database: ", err.message);
            showError(err.message);
        })
        .finally(()=>{
            hideLoadingScreen();
        });
        
}

function fetchUserDataAndPopulateForm(userId) {

    const userRef = child(dbref, `users/${userId}`);
    get(userRef).then((snapshot) => {
        if (snapshot.exists()) {
            const userData = snapshot.val();

            populateForm(userData);
        }
    }).catch((error) => {
        console.error("Error fetching user data:", error.message);
    });
}

function populateForm(userData) {

    document.getElementById('user-id').value = userData.userId;
    document.getElementById('experience').value = userData.exp;
    document.getElementById('endurance').value = userData.stats.endurance;
    document.getElementById('strength').value = userData.stats.strength;
    document.getElementById('vitality').value = userData.stats.vitality;
    document.getElementById('skillPointCost').value = userData.skillPointCost;
    document.getElementById('totalTraveledDistance').value = userData.totalTraveledDistance;
    document.getElementById('totalDaysLogged').value = userData.totalDaysLogged;
    document.getElementById('lastLoggedDay').value = userData.lastLoggedDay;
}

function createNewUser() {
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    registerUser(email, password);

}

function clearForm() {
    document.getElementById('email').value = '';
    document.getElementById('password').value = '';
}

function showLoadingScreen() {
    document.getElementById('loader_container').style.display = "flex";
}

function hideLoadingScreen() {
    document.getElementById('loader_container').style.display = "none";
}

function showError(message) {
    const container = document.getElementById('error-message-container');
    container.innerText = message; 
    container.style.display = 'block';

    setTimeout(() => {
        container.style.display = 'none';
    }, 4000);

    container.onclick = () => {
        container.style.display = 'none';
    };
}

function showSuccessMessage(message) {
    const messageContainer = document.getElementById('success-message-container');
    messageContainer.textContent = message; 
    messageContainer.style.display = 'block';

    setTimeout(() => {
        messageContainer.style.display = 'none';
    }, 4000);

    messageContainer.onclick = () => {
        messageContainer.style.display = 'none';
    };
}

function deleteCurrentUser() {
    showLoadingScreen();

    const user = auth.currentUser; 

    if (user) {
        const userId = user.uid;
        const userRef = child(dbref, `users/${userId}`);

        remove(userRef).then(() => {

            return user.delete();
        }).then(() => {
            window.location.href = 'index.html';
        }).catch((err) => {
            showError(err.message);
        }).finally(() => {
            hideLoadingScreen();
        });
    } else {
        console.log("No user is currently signed in.");
        hideLoadingScreen();
    }
}
