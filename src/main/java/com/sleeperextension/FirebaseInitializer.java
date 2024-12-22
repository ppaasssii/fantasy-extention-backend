package com.sleeperextension;
import com.google.auth.oauth2.GoogleCredentials;
import com.google.firebase.FirebaseApp;
import com.google.firebase.FirebaseOptions;
import com.google.firebase.database.FirebaseDatabase;
import java.io.FileInputStream;
import java.io.IOException;

public class FirebaseInitializer {

    public static void initializeFirebase() {
        try {
            // Load the service account key file
            FileInputStream serviceAccount = new FileInputStream("src/main/resources/firebase-adminsdk.json");
            FirebaseOptions options = new FirebaseOptions.Builder()
                    .setCredentials(GoogleCredentials.fromStream(serviceAccount))
                    .setDatabaseUrl("https://fantasyextention-16841-default-rtdb.europe-west1.firebasedatabase.app/") // Replace with your project ID
                    .build();
            FirebaseApp.initializeApp(options);
        } catch (IOException e) {
            e.printStackTrace();
        }
    }
}

