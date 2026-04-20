# Authentication Module

The Authentication module provides a secure, multi-stage flow for user onboarding and session management. It distinguishes between new registrants (**Connect**) and returning owners (**Continue**).

## Modules

### Connect (Onboarding)
Handle the registration of new store owners.
- **Workflow**:
  1. `POST /auth/connect/send/otp`: Validates unique email and dispatches OTP.
  2. `POST /auth/connect/verify/otp`: Verifies OTP, creates Store entity, and promotes User to 'owner'.

### Continue (Login)
Handle authentication for existing owners and staff.
- **Workflow**:
  1. `POST /auth/continue/send/otp`: Validates owner existence and dispatches OTP.
  2. `POST /auth/continue/verify/otp`: Verifies OTP and establishes session.
  3. `POST /auth/continue/password`: Traditional email/password login.

## Sample Responses

### OTP Sent Successfully
```json
{
  "status": 200,
  "message": "OTP sent successfully!",
  "data": {
    "email": "owner@example.com",
    "sentAt": 1713280000000
  }
}
```

### Verification Successful (Connect)
```json
{
  "status": 200,
  "message": "Authentication successful and store created.",
  "data": {
    "user": {
      "id": "user-uuid",
      "email": "owner@example.com",
      "role": "owner"
    },
    "storeId": "store-uuid",
    "token": "bearer-token-if-mobile"
  }
}
```

### Error: Invalid OTP
```json
{
  "status": 401,
  "message": "Invalid or expired verification OTP",
  "data": {}
}
```
