import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyC1Q0_QvCUfL6sNzjwWNATmNQIiadU9Itg",
  authDomain: "hotelriosaguavivaproyecto.firebaseapp.com",
  projectId: "hotelriosaguavivaproyecto",
  storageBucket: "hotelriosaguavivaproyecto.firebasestorage.app",
  messagingSenderId: "178067502833",
  appId: "1:178067502833:web:116979c160c36a7fe51b50",
  measurementId: "G-QS5RT39B5C"
};

const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);