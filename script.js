// --- Firebase SDK Imports ---
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-app.js";
import { 
    getAuth, 
    createUserWithEmailAndPassword, 
    signInWithEmailAndPassword, 
    signOut, 
    onAuthStateChanged,
    GoogleAuthProvider,
    signInWithPopup,
    sendEmailVerification,
    sendPasswordResetEmail
} from "https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js";
import { 
    getFirestore, 
    collection, 
    addDoc, 
    onSnapshot, 
    deleteDoc, 
    doc, 
    query, 
    orderBy,
    updateDoc
} from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";

// --- Firebase Configuration ---
const firebaseConfig = {
  apiKey: "AIzaSyCaaXJU_2GcGe26hCV7Af97BZbR17TF5x4",
  authDomain: "real-time-task-tracker-6e75a.firebaseapp.com",
  projectId: "real-time-task-tracker-6e75a",
  storageBucket: "real-time-task-tracker-6e75a.appspot.com",
  messagingSenderId: "418018195574",
  appId: "1:418018195574:web:e3c0e5c91e90b94a6e0757"
};

// --- Initialize Firebase Services ---
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const googleProvider = new GoogleAuthProvider();

// --- DOM Element References ---
const authContainer = document.getElementById('auth-container');
const welcomeView = document.getElementById('welcome-view');
const loginView = document.getElementById('login-view');
const signupView = document.getElementById('signup-view');
const verifyEmailView = document.getElementById('verify-email-view');
const resetPasswordView = document.getElementById('reset-password-view');
const loginForm = document.getElementById('login-form');
const signupForm = document.getElementById('signup-form');
const resetPasswordForm = document.getElementById('reset-password-form');
const authError = document.getElementById('auth-error');
const authSuccess = document.getElementById('auth-success');
const showLoginBtn = document.getElementById('show-login-btn');
const showSignupLink = document.getElementById('show-signup-link');
const showResetPasswordLink = document.getElementById('show-reset-password-link');
const backToWelcomeFromLogin = document.getElementById('back-to-welcome-from-login');
const backToWelcomeFromSignup = document.getElementById('back-to-welcome-from-signup');
const backToLoginFromReset = document.getElementById('back-to-login-from-reset');
const googleSigninBtn = document.getElementById('google-signin-btn');
const googleSignupBtn = document.getElementById('google-signin-btn-signup');
const verificationEmailAddress = document.getElementById('verification-email-address');
const resendVerificationBtn = document.getElementById('resend-verification-btn');
const logoutFromVerifyBtn = document.getElementById('logout-from-verify-btn');
const resendStatus = document.getElementById('resend-status');
const appContainer = document.getElementById('app-container');
const userEmailDisplay = document.getElementById('user-email');
const logoutButton = document.getElementById('logout-button');
const taskForm = document.getElementById('task-form');
const taskInput = document.getElementById('task-input');
const dueDateInput = document.getElementById('due-date-input'); // NEW
const taskList = document.getElementById('task-list');
const loadingState = document.getElementById('loading-state');

// --- Global Variables ---
let tasksUnsubscribe = null;
let verificationTimer = null;

// --- Helper Functions ---
function formatDate(timestamp) {
    if (!timestamp) return '';
    const date = timestamp.toDate();
    return date.toLocaleString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit'
    });
}

// --- UI Navigation Logic ---
function showView(viewId) {
    welcomeView.classList.add('hidden');
    loginView.classList.add('hidden');
    signupView.classList.add('hidden');
    verifyEmailView.classList.add('hidden');
    resetPasswordView.classList.add('hidden');
    authError.textContent = '';
    authSuccess.textContent = '';
    document.getElementById(viewId).classList.remove('hidden');
}

// --- Event Listeners for Navigation ---
showLoginBtn.addEventListener('click', () => showView('login-view'));
showSignupLink.addEventListener('click', (e) => { e.preventDefault(); showView('signup-view'); });
showResetPasswordLink.addEventListener('click', (e) => { e.preventDefault(); showView('reset-password-view'); });
backToWelcomeFromLogin.addEventListener('click', (e) => { e.preventDefault(); showView('welcome-view'); });
backToWelcomeFromSignup.addEventListener('click', (e) => { e.preventDefault(); showView('welcome-view'); });
backToLoginFromReset.addEventListener('click', (e) => { e.preventDefault(); showView('login-view'); });

// --- Core Authentication Logic ---
onAuthStateChanged(auth, (user) => {
    if (verificationTimer) clearInterval(verificationTimer);

    if (user) {
        if (user.emailVerified) {
            appContainer.classList.remove('hidden');
            authContainer.classList.add('hidden');
            userEmailDisplay.textContent = `Logged in as: ${user.email}`;
            fetchUserTasks(user.uid);
        } else {
            appContainer.classList.add('hidden');
            authContainer.classList.remove('hidden');
            verificationEmailAddress.textContent = user.email;
            showView('verify-email-view');
            verificationTimer = setInterval(async () => {
                await user.reload();
                if (user.emailVerified) {
                    clearInterval(verificationTimer);
                    window.location.reload();
                }
            }, 3000);
        }
    } else {
        appContainer.classList.add('hidden');
        authContainer.classList.remove('hidden');
        showView('welcome-view');
        if (tasksUnsubscribe) tasksUnsubscribe();
        taskList.innerHTML = '';
    }
});

// --- Function to fetch tasks for a specific user ---
function fetchUserTasks(userId) {
    const tasksCollectionPath = `users/${userId}/tasks`;
    const q = query(collection(db, tasksCollectionPath), orderBy('createdAt', 'desc'));

    tasksUnsubscribe = onSnapshot(q, (snapshot) => {
        loadingState.style.display = 'none';
        taskList.innerHTML = ''; 

        if (snapshot.empty) {
            taskList.innerHTML = '<p class="text-center p-8 text-gray-500">No tasks yet. Add one!</p>';
        } else {
            snapshot.docs.forEach((doc) => {
                const task = doc.data();
                const taskId = doc.id;
                
                const taskElement = document.createElement('div');
                taskElement.className = 'task-item p-4 border-b border-gray-200 last:border-b-0';
                taskElement.dataset.id = taskId;

                const formattedDueDate = formatDate(task.dueDate);

                taskElement.innerHTML = `
                    <div class="view-state flex items-center justify-between">
                        <div>
                            <span class="task-text flex-grow break-all mr-4">${task.text}</span>
                            ${formattedDueDate ? `<p class="text-sm text-gray-500 mt-1">Due: ${formattedDueDate}</p>` : ''}
                        </div>
                        <div class="flex-shrink-0 flex gap-2">
                            <button class="edit-btn text-blue-500 hover:text-blue-700">
                                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M17.414 2.586a2 2 0 00-2.828 0L7 10.172V13h2.828l7.586-7.586a2 2 0 000-2.828z" /><path fill-rule="evenodd" d="M2 6a2 2 0 012-2h4a1 1 0 010 2H4v10h10v-4a1 1 0 112 0v4a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" clip-rule="evenodd" /></svg>
                            </button>
                            <button class="delete-btn text-red-500 hover:text-red-700">
                                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clip-rule="evenodd" /></svg>
                            </button>
                        </div>
                    </div>
                    <div class="edit-state hidden flex items-center gap-2">
                        <input type="text" class="edit-input flex-grow p-2 border border-gray-300 rounded-md" value="${task.text}">
                        <button class="save-btn bg-green-500 text-white py-2 px-4 rounded-md hover:bg-green-600">Save</button>
                        <button class="cancel-btn bg-gray-500 text-white py-2 px-4 rounded-md hover:bg-gray-600">Cancel</button>
                    </div>
                `;
                taskList.appendChild(taskElement);
            });
        }
    });
}


// --- Event Listeners for Forms ---
const handleGoogleSignIn = () => {
    signInWithPopup(auth, googleProvider).catch((error) => {
        authError.textContent = "Could not sign in with Google. Please try again.";
    });
};
googleSigninBtn.addEventListener('click', handleGoogleSignIn);
googleSignupBtn.addEventListener('click', handleGoogleSignIn);
signupForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = document.getElementById('signup-email').value;
    const password = document.getElementById('signup-password').value;
    createUserWithEmailAndPassword(auth, email, password)
        .then((userCredential) => sendEmailVerification(userCredential.user))
        .catch((error) => {
            switch (error.code) {
                case 'auth/email-already-in-use': authError.textContent = 'An account with this email already exists.'; break;
                case 'auth/weak-password': authError.textContent = 'Password should be at least 6 characters long.'; break;
                default: authError.textContent = 'An unknown error occurred. Please try again.';
            }
        });
});
loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;
    signInWithEmailAndPassword(auth, email, password).catch((error) => {
        switch (error.code) {
            case 'auth/invalid-credential':
            case 'auth/wrong-password':
            case 'auth/user-not-found': authError.textContent = 'Incorrect email or password. Please try again.'; break;
            default: authError.textContent = 'An unknown error occurred. Please try again.';
        }
    });
});
resetPasswordForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = document.getElementById('reset-email').value;
    sendPasswordResetEmail(auth, email)
        .then(() => {
            authSuccess.textContent = 'Password reset email sent! Please check your inbox.';
            authError.textContent = '';
        })
        .catch((error) => {
            authSuccess.textContent = '';
            authError.textContent = 'Could not send reset email. Please check the address and try again.';
        });
});
logoutButton.addEventListener('click', () => signOut(auth));
logoutFromVerifyBtn.addEventListener('click', () => signOut(auth));
resendVerificationBtn.addEventListener('click', () => {
    if (auth.currentUser) {
        sendEmailVerification(auth.currentUser).then(() => {
            resendStatus.textContent = 'New verification email sent!';
            setTimeout(() => { resendStatus.textContent = '' }, 5000);
        }).catch(() => {
            resendStatus.textContent = 'Error sending email. Please wait before trying again.';
            setTimeout(() => { resendStatus.textContent = '' }, 5000);
        });
    }
});
taskForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const taskText = taskInput.value.trim();
    const dueDateValue = dueDateInput.value; // NEW
    const user = auth.currentUser;
    if (taskText && user && user.emailVerified) {
        try {
            await addDoc(collection(db, `users/${user.uid}/tasks`), {
                text: taskText,
                createdAt: new Date(),
                owner: user.uid,
                dueDate: dueDateValue ? new Date(dueDateValue) : null // NEW
            });
            taskForm.reset(); // Reset the whole form
        } catch (error) { console.error("Error adding document: ", error); }
    }
});

taskList.addEventListener('click', async (e) => {
    const user = auth.currentUser;
    if (!user || !user.emailVerified) return;

    const taskItem = e.target.closest('.task-item');
    if (!taskItem) return;

    const taskId = taskItem.dataset.id;
    const viewState = taskItem.querySelector('.view-state');
    const editState = taskItem.querySelector('.edit-state');
    const editInput = taskItem.querySelector('.edit-input');

    // Handle Delete
    if (e.target.closest('.delete-btn')) {
        try {
            await deleteDoc(doc(db, `users/${user.uid}/tasks/${taskId}`));
        } catch (error) { console.error("Error removing document: ", error); }
    }

    // Handle Edit
    if (e.target.closest('.edit-btn')) {
        viewState.classList.add('hidden');
        editState.classList.remove('hidden');
        editInput.focus();
        editInput.setSelectionRange(editInput.value.length, editInput.value.length);
    }

    // Handle Cancel
    if (e.target.closest('.cancel-btn')) {
        viewState.classList.remove('hidden');
        editState.classList.add('hidden');
    }

    // Handle Save
    if (e.target.closest('.save-btn')) {
        const newText = editInput.value.trim();
        if (newText) {
            try {
                const taskRef = doc(db, `users/${user.uid}/tasks/${taskId}`);
                await updateDoc(taskRef, { text: newText });
            } catch (error) { console.error("Error updating document: ", error); }
        }
    }
});

taskList.addEventListener('keydown', async (e) => {
    if (e.key === 'Enter' && e.target.classList.contains('edit-input')) {
        e.preventDefault();
        
        const user = auth.currentUser;
        if (!user || !user.emailVerified) return;

        const taskItem = e.target.closest('.task-item');
        if (!taskItem) return;
        
        const taskId = taskItem.dataset.id;
        const newText = e.target.value.trim();

        if (newText) {
            try {
                const taskRef = doc(db, `users/${user.uid}/tasks/${taskId}`);
                await updateDoc(taskRef, { text: newText });
            } catch (error) {
                console.error("Error updating document on Enter: ", error);
            }
        }
    }
});
