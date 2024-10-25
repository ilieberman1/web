// database.js

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyChiYTJmUHB8oYDcDNn_PPjhd-aCGPAcTc",
    authDomain: "ilieberman-bbbad.firebaseapp.com",
    projectId: "ilieberman-bbbad",
    storageBucket: "ilieberman-bbbad.appspot.com",
    messagingSenderId: "289698155239",
    appId: "1:289698155239:web:47f47e3cf17bec2f5e3042",
    measurementId: "G-GDP759QDG9"
  };
  
  // Initialize Firebase
  firebase.initializeApp(firebaseConfig);
  
  // Initialize Firestore
  const db = firebase.firestore();
  