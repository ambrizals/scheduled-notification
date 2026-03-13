# Firebase FCM POC (React Native Expo)

This project is a Proof of Concept for Firebase Cloud Messaging (FCM) using `@react-native-firebase/messaging` in a React Native Expo environment.

## Prerequisites

- [Bun](https://bun.sh/) installed.
- [Expo CLI](https://docs.expo.dev/get-started/installation/) installed.
- A Firebase Project set up in the [Firebase Console](https://console.firebase.google.com/).

## Setup Instructions

1.  **Firebase Configuration**:
    - For **Android**: Download `google-services.json` from your Firebase project and replace the placeholder in the root directory.
    - For **iOS**: Download `GoogleService-Info.plist` from your Firebase project and replace the placeholder in the root directory.
    - Ensure the `package` name and `bundleIdentifier` in `app.json` match your Firebase settings (currently `com.dsf.mobileapp`).

2.  **Install Dependencies**:
    ```bash
    bun install
    ```

3.  **Run the Application**:
    This project uses native Firebase modules, which require a **Development Build**. You cannot use the standard Expo Go app.

    - **Android**:
      ```bash
      bun expo run:android
      ```
    - **iOS**:
      ```bash
      bun expo run:ios
      ```

## Features

- **Token Logging**: The FCM token is printed to the console on app launch and displayed on the screen.
- **Revoke Token**: A button to delete the current FCM token.
- **Notification Listeners**:
  - **Foreground**: Notifications will appear as an alert when the app is open.
  - **Background/Quit**: Handled via the background message handler (logs to console).

## Testing Notifications

You can send test notifications from the Firebase Console:
1. Go to **Messaging** in the Firebase Console.
2. Click **Create your first campaign** -> **Firebase Notification messages**.
3. Enter a title and text.
4. Use the FCM token printed in your terminal/app to send a test message to your specific device.
