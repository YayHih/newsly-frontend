# "I Like Apples" Password Gate Flow

## 📍 Where Users Are Prompted

Users are prompted to enter **"I like apples"** at **TWO locations**:

---

## 1️⃣ SIGNUP PAGE (Creating Account)

### When:
- User visits `http://localhost:3000/signup`
- **BEFORE** they can see the signup form

### What Happens:
1. User navigates to `/signup`
2. Page loads with **password gate screen**
3. User sees:
   - **Heading:** "Welcome to Newsly"
   - **Message:** "Please enter the access password to create an account"
   - **Input field:** "Access Password"
   - **Button:** "Continue"

4. User enters: **"I like apples"**
5. Click "Continue"
6. If correct → Shows signup form (Google OAuth + Email/Password options)
7. If incorrect → Error: "Incorrect password. Please try again."

### Location:
- **File:** `/home/opc/NEWS/news-personalization (5)/app/signup/page.tsx`
- **Lines:** 106-183 (password gate component)
- **Session Storage Key:** `newsly-signup-access`

---

## 2️⃣ ONBOARDING PAGE (Completing Profile)

### When:
- User visits `http://localhost:3000/onboarding`
- **BEFORE** they can answer profile questions

### What Happens:
1. User clicks "Add Info" button on homepage (or navigates to `/onboarding`)
2. Page loads with **password gate screen**
3. User sees:
   - **Heading:** "Welcome to Newsly"
   - **Message:** "Please enter the password to continue"
   - **Input field:** "Password"
   - **Button:** "Continue"

4. User enters: **"I like apples"**
5. Click "Continue"
6. If correct → Shows onboarding questions
7. If incorrect → Error: "Incorrect password. Please try again."

### Location:
- **File:** `/home/opc/NEWS/news-personalization (5)/app/onboarding/page.tsx`
- **Component:** `/home/opc/NEWS/news-personalization (5)/app/onboarding/components/password-gate.tsx`
- **Session Storage Key:** `newsly-onboarding-access`

---

## 🔄 Complete User Journey

### New User (First Time):
```
1. Visit homepage → Click "Sign In"
   ↓
2. Click "Create one" (signup link)
   ↓
3. 🔒 PASSWORD GATE #1: Enter "I like apples"
   ↓
4. See signup form → Create account with email/password OR Google
   ↓
5. Account created → Redirected to homepage
   ↓
6. Click "Add Info" button
   ↓
7. 🔒 PASSWORD GATE #2: Enter "I like apples" again
   ↓
8. Answer onboarding questions
   ↓
9. Get personalized recommendations
```

### Returning User (Already Has Account):
```
1. Visit homepage → Click "Sign In"
   ↓
2. Enter email/password OR use Google
   ↓
3. Login successful → See recommendations
   ↓
4. No password gates needed ✅
```

---

## 🎯 How It Works Technically

### Password Verification:
1. Frontend sends password to backend API
2. Backend endpoint: `POST /auth/verify-password`
3. Backend checks: `password == "I like apples"`
4. Returns: `{"valid": true}` or `{"valid": false}`

### Session Persistence:
- Password stored in `sessionStorage` (not `localStorage`)
- Persists only for current browser tab/session
- Cleared when tab/browser is closed
- User must re-enter password in new session

### Backend Configuration:
```python
# File: /home/opc/NEWS/newsly-recommendations-api/config.py
ONBOARDING_PASSWORD: str = "I like apples"
```

**To change password:** Update this value in config.py or .env file

---

## 🖥️ Visual Flow Diagram

```
┌─────────────────────────────────────────────────────┐
│          USER VISITS /signup                        │
└────────────────────┬────────────────────────────────┘
                     │
                     ▼
        ┌────────────────────────────┐
        │  PASSWORD GATE SCREEN      │
        │                            │
        │  "Welcome to Newsly"       │
        │  "Enter access password"   │
        │                            │
        │  [___________________]     │
        │  [    Continue     ]       │
        └────────────────────────────┘
                     │
                     │ User enters "I like apples"
                     ▼
        ┌────────────────────────────┐
        │  Backend Verification      │
        │  POST /auth/verify-password│
        └────────────────────────────┘
                     │
           ┌─────────┴─────────┐
           │                   │
        ✓ Correct         ✗ Incorrect
           │                   │
           ▼                   ▼
    ┌─────────────┐    ┌─────────────┐
    │ Show Signup │    │ Show Error  │
    │    Form     │    │   Message   │
    └─────────────┘    └─────────────┘
```

---

## 🔍 Testing the Password Gates

### Test Signup Password Gate:
1. Open browser: `http://localhost:3000/signup`
2. Should see password gate immediately
3. Try wrong password → See error
4. Enter "I like apples" → See signup form

### Test Onboarding Password Gate:
1. Create account (or login)
2. Click "Add Info" button on homepage
3. Should see password gate immediately
4. Try wrong password → See error
5. Enter "I like apples" → See onboarding questions

---

## ❓ Frequently Asked Questions

### Q: Why two password gates?
**A:**
- **Signup gate:** Prevents random people from creating accounts
- **Onboarding gate:** Protects profile data collection from unauthorized access

### Q: Do they need to enter it twice?
**A:** Yes, once at signup and once at onboarding (for new users)

### Q: What about returning users?
**A:** Returning users only need to login (no password gates)

### Q: Can I make it ask only once?
**A:** Yes, you can share the sessionStorage key between both pages:
```javascript
// Use same key for both:
sessionStorage.getItem("newsly-access")
```

### Q: How do I change the password?
**A:** Update in backend config:
```bash
# Edit .env file
ONBOARDING_PASSWORD="your new password here"
```

### Q: Is the password encrypted?
**A:** It's sent over HTTP (or HTTPS in production) to the backend for verification. The backend compares it with the stored value.

---

## 📱 Mobile Experience

Password gates work perfectly on mobile:
- Responsive design
- Touch-friendly buttons
- Accessible keyboard input
- Error messages display clearly

---

## 🔐 Security Notes

1. **Password is NOT for authentication** (that's what login is for)
2. **Password is for ACCESS CONTROL** (who can create accounts)
3. **Password verification happens on backend** (not just frontend)
4. **Password is cleared from memory** after verification
5. **Access persists only in current session** (cleared on tab close)

---

**Current Password:** `"I like apples"`
**Change in:** `/home/opc/NEWS/newsly-recommendations-api/config.py` or `.env`
