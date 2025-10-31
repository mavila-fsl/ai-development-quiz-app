# Security Documentation

This document outlines the security measures implemented in the AI Development Quiz App and provides guidelines for secure deployment.

## Security Features

### 1. Password Security

#### Storage
- **Hashing Algorithm**: bcrypt with 12 salt rounds
- **Password Requirements**:
  - Minimum 8 characters
  - Must contain uppercase and lowercase letters
  - Must contain at least one number
  - Must contain at least one special character
- **Password Strength Meter**: Real-time feedback during registration

#### Transmission
- **Development**: Passwords transmitted over HTTP (encrypted only at application layer)
- **Production**: Passwords transmitted over HTTPS (end-to-end TLS encryption)
- **HTTPS Enforcement**: Automatic redirect from HTTP to HTTPS in production
- **HSTS Headers**: Forces browsers to only use HTTPS connections

### 2. Authentication

#### JWT Tokens
- **Storage**: HTTP-only cookies (not accessible via JavaScript)
- **Expiration**: 7 days
- **Token Versioning**: Supports session invalidation across all devices
- **Secure Flag**: Enabled in production (HTTPS only)
- **SameSite**: Strict in production for CSRF protection

#### Session Management
- `POST /api/users/login` - Authenticate and create session
- `POST /api/users/logout` - Clear session cookie
- `POST /api/users/invalidate-sessions` - Invalidate all sessions for user (requires auth)

### 3. Transport Security

#### HTTPS Configuration
```typescript
// Automatically enforced in production
app.use(enforceHTTPS);
```

#### Security Headers (Helmet)
- **HSTS**: HTTP Strict Transport Security with 1-year max age
- **Content Security Policy**: Restricts resource loading
- **X-Frame-Options**: Prevents clickjacking
- **X-Content-Type-Options**: Prevents MIME sniffing
- **Referrer-Policy**: Controls referrer information

### 4. Attack Prevention

#### Timing Attacks
- **Login Route**: Constant-time password comparison using bcrypt
- **Dummy Hash**: Pre-computed hash used when user doesn't exist
- **Random Delay**: Additional 10-50ms delay to obscure timing differences

#### SQL Injection
- **Prisma ORM**: Parameterized queries prevent SQL injection
- **Type Safety**: TypeScript ensures type-safe database operations

#### XSS (Cross-Site Scripting)
- **HTTP-only Cookies**: JWT tokens not accessible via JavaScript
- **CSP Headers**: Content Security Policy restricts inline scripts
- **Input Validation**: Server-side validation of all user inputs

#### CSRF (Cross-Site Request Forgery)
- **SameSite Cookies**: Strict mode in production prevents CSRF
- **CORS Configuration**: Whitelist of allowed origins

## Deployment Security Checklist

### Required for Production

- [ ] Set `NODE_ENV=production`
- [ ] Use HTTPS with valid TLS/SSL certificate
- [ ] Configure reverse proxy (nginx, etc.) to:
  - Terminate TLS
  - Set `X-Forwarded-Proto: https` header
  - Forward requests to application server
- [ ] Generate strong JWT_SECRET (minimum 32 characters, random string)
- [ ] Use PostgreSQL instead of SQLite (DATABASE_URL)
- [ ] Enable CORS only for your production domain
- [ ] Review and restrict CSP directives if needed
- [ ] Set up firewall rules to restrict database access
- [ ] Enable rate limiting on authentication endpoints
- [ ] Set up logging and monitoring for security events
- [ ] Regular security updates for dependencies

### Environment Variables

Production `.env` should include:

```bash
NODE_ENV=production
PORT=3001
DATABASE_URL=postgresql://user:password@host:5432/dbname
JWT_SECRET=<64-character-random-string>
CLIENT_URL=https://yourdomain.com
ANTHROPIC_API_KEY=<optional>
```

### Reverse Proxy Configuration

#### Nginx Example

```nginx
server {
    listen 443 ssl http2;
    server_name api.yourdomain.com;

    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;

    # Modern SSL configuration
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;

    # Security headers
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains; preload" always;

    location / {
        proxy_pass http://localhost:3001;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto https;
    }
}

# Redirect HTTP to HTTPS
server {
    listen 80;
    server_name api.yourdomain.com;
    return 301 https://$server_name$request_uri;
}
```

## Security Testing

### Manual Testing

1. **HTTPS Enforcement**
   ```bash
   # Should redirect to HTTPS in production
   curl -I http://your-domain.com/api/health
   ```

2. **Security Headers**
   ```bash
   curl -I https://your-domain.com/api/health
   # Should see HSTS, CSP, X-Frame-Options headers
   ```

3. **Cookie Security**
   - Inspect cookies in browser DevTools
   - Verify `HttpOnly`, `Secure`, and `SameSite` flags

### Automated Testing

Consider adding:
- OWASP ZAP for vulnerability scanning
- npm audit for dependency vulnerabilities
- SSL Labs test for TLS configuration

## Incident Response

If you discover a security vulnerability:

1. **Do not** open a public issue
2. Email security contact (if configured)
3. Include:
   - Description of vulnerability
   - Steps to reproduce
   - Potential impact
   - Suggested fix (if available)

## Security Updates

- Regularly run `npm audit` to check for vulnerable dependencies
- Update dependencies with security patches promptly
- Monitor security advisories for Express, Prisma, and other core dependencies
- Review and rotate JWT_SECRET periodically (requires user re-authentication)

## Additional Resources

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Express Security Best Practices](https://expressjs.com/en/advanced/best-practice-security.html)
- [Helmet.js Documentation](https://helmetjs.github.io/)
- [JWT Best Practices](https://datatracker.ietf.org/doc/html/rfc8725)

## Password Transmission - Technical Details

### Why JSON over HTTPS is secure:

1. **TLS/SSL Encryption**: When using HTTPS, all data (including JSON payloads) is encrypted using TLS before transmission
2. **Industry Standard**: This is the same method used by GitHub, Google, AWS, and virtually all modern web services
3. **Forward Secrecy**: Modern TLS configurations ensure past communications remain secure even if keys are compromised

### Development vs Production:

| Aspect | Development (HTTP) | Production (HTTPS) |
|--------|-------------------|-------------------|
| Transport | Unencrypted | TLS 1.2/1.3 encrypted |
| Visibility | Visible in network tools | Encrypted, not readable |
| Cookie Security | secure=false | secure=true |
| HSTS | Disabled | Enabled (1 year) |

### What is NOT secure:

- ❌ Sending passwords as URL parameters (logged in server logs)
- ❌ Storing passwords in localStorage (accessible via XSS)
- ❌ Client-side encryption before sending (doesn't add security with HTTPS)
- ❌ Using HTTP in production

### What IS secure (our implementation):

- ✅ Sending passwords in JSON request body over HTTPS
- ✅ Hashing passwords server-side with bcrypt
- ✅ Storing JWT in HTTP-only cookies
- ✅ HTTPS enforcement in production
- ✅ HSTS headers forcing HTTPS

## FAQ

**Q: I can see passwords in Chrome DevTools Network tab. Is this a security issue?**

A: In development (HTTP), yes, passwords are visible. In production with HTTPS, the network tab shows the request structure but the actual data is encrypted before transmission. This is normal and secure.

**Q: Should I encrypt passwords on the client before sending?**

A: No. Client-side encryption provides no additional security when using HTTPS, as the server needs the plaintext password to hash it with bcrypt. The TLS layer already provides encryption.

**Q: What if someone intercepts the password during transmission?**

A: With HTTPS properly configured, this is cryptographically infeasible. The TLS protocol prevents man-in-the-middle attacks through certificate validation and encryption.

**Q: Should I use OAuth instead of passwords?**

A: OAuth is great for third-party authentication but adds complexity. For a learning application like this, username/password with proper security measures is appropriate. You could add OAuth as an additional option.
