# Authentication Validation

When implementing Firebase Authentication, it is crucial to handle validation properly to ensure data integrity and security.

## Client-Side Validation

Always validate user input on the client-side before sending it to Firebase Authentication.

*   **Email Format**: Ensure the email is in a valid format (e.g., using a regex pattern).
*   **Password Strength**: Enforce password complexity (e.g., minimum length, use of upper/lowercase, numbers, special characters).
*   **Matching Passwords**: When asking users to confirm their password during sign-up, ensure both fields match.

## Firebase Auth Built-in Validation

Firebase Authentication has built-in validation for:

*   **Email uniqueness**: Ensures no duplicate email addresses are registered unless "Multiple accounts per email address" is enabled in the console.
*   **Password length**: Firebase requires a minimum password length of 6 characters by default.

## Advanced Validation & Security Rules

While client-side validation provides a good user experience, it's not enough for security. You must enforce custom validation rules.

1.  **Custom Claims**: If using custom claims to define roles (e.g., `admin`, `editor`), ensure they are validated properly in your backend and Firestore Security Rules.
2.  **Firestore Security Rules**: When tying authentication to your database, you should validate users' permissions in `firestore.rules`. For example, ensuring a user can only read/write their own data:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

## Email Verification

Consider enforcing email verification before allowing a user to access certain parts of your application:

```javascript
import { sendEmailVerification } from "firebase/auth";

// After sign up
await sendEmailVerification(user);

// Later, when checking access
if (user.emailVerified) {
  // Allow access
} else {
  // Prompt to verify email
}
```
