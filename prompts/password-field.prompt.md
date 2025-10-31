# Password Field Implementation – Sign-In and Sign-Up Processes

## Overview
Implement secure password fields in both the **sign-in** and **sign-up** processes on the **Home page**.  
The **sign-up form** must include a **confirmation password field** to verify that both entries match.

## Security Requirements
Implement all relevant **security best practices** throughout the entire process — from the moment the user types their password until it is securely stored in the database.  
This includes:
- Proper input handling and validation.
- Encryption in transit (HTTPS/TLS).
- Secure hashing before storage (e.g., bcrypt or Argon2id).
- Protection against common vulnerabilities:
  - Cross-Site Scripting (XSS)
  - Cross-Site Request Forgery (CSRF)
  - SQL Injection
  - Timing attacks
  - Brute-force attacks

## Agent Responsibilities

### Frontend Engineer Agent
**IMPORTANT:** Use the @.claude/agents/frontend-engineer.md to accomplish the next tasks
- Implement all UI and client-side functionality for the password fields.
- Ensure masked input with a visibility toggle.
- Include a confirmation password field in the sign-up form with real-time match validation.
- Provide a password strength indicator and clear error messaging.
- Prevent any plaintext password logging or insecure handling.

### Backend Enginner Agent
**IMPORTANT:** Use the @.claude/agents/backend-engineer.md to accomplish the next tasks
- Handle password verification, hashing, and secure storage.
- Validate password strength and confirmation match server-side.
- Use strong password hashing algorithms (e.g., Argon2id or bcrypt) with proper salting.
- Enforce HTTPS, rate limiting, and protection against brute-force or timing attacks.
- Ensure all authentication data is stored and processed securely.

## Implementation Instructions
Think hard and define a **detailed, step-by-step process** to implement this feature securely.  
Each step should clearly identify which **agent** (frontend or backend) is responsible.  
Avoid any vulnerabilities throughout the entire password handling flow.

Save the detailed implementation output in the `features/` folder.
