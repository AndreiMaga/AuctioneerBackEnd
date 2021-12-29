import { FirebaseApp, initializeApp } from "firebase/app";
import firebaseConfig from "./secret.json";
import { Firestore, getFirestore } from "firebase/firestore";

export default function initFirebase() {
  app = initializeApp(firebaseConfig);
  database = getFirestore(app);
}

export var app: FirebaseApp;
export var database: Firestore;
