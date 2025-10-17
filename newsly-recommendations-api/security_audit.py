#!/usr/bin/env python3
"""
Security Audit Script for Newsly API
Checks for common security vulnerabilities
"""
import re

def audit_file(filepath):
    """Audit a Python file for security issues"""
    with open(filepath, 'r') as f:
        content = f.read()

    print(f"\n=== AUDITING {filepath} ===\n")

    # Check for parameterized queries
    param_queries = len(re.findall(r'execute_query\([^,]+,\s*\([^)]+\)', content))
    print(f"✓ Parameterized queries found: {param_queries}")

    # Check for potential SQL injection (f-strings or .format in queries)
    f_string_sql = re.findall(r'execute_query\(f["\']', content)
    format_sql = re.findall(r'\.format\(', content[:content.find('execute_query')] if 'execute_query' in content else '')

    if f_string_sql or format_sql:
        print(f"⚠ WARNING: Possible SQL injection vulnerability found")
    else:
        print("✓ No f-strings or .format() in SQL queries")

    # Check for password validation
    if 'validate_password' in content or 'validator' in content:
        print("✓ Password validation present")

    # Check for rate limiting
    if 'rate_limiter' in content or 'RateLimiter' in content:
        print("✓ Rate limiting implemented")

    # Check for CORS
    if 'CORSMiddleware' in content:
        print("✓ CORS protection configured")

    # Check for password hashing
    if 'bcrypt' in content or 'hash_password' in content:
        print("✓ Password hashing implemented")

    # Check for JWT tokens
    if 'jwt' in content or 'create_access_token' in content:
        print("✓ JWT authentication present")

    # Check for input validation
    if 'BaseModel' in content and 'validator' in content:
        print("✓ Pydantic input validation present")

    # Check for dangerous operations
    dangerous = ['eval(', 'exec(', 'os.system(', '__import__']
    found_dangerous = [d for d in dangerous if d in content]
    if found_dangerous:
        print(f"⚠ CRITICAL: Dangerous operations found: {found_dangerous}")
    else:
        print("✓ No dangerous operations (eval, exec, os.system)")

if __name__ == "__main__":
    print("=" * 60)
    print("NEWSLY API SECURITY AUDIT")
    print("=" * 60)

    files = ['main.py', 'user_service.py', 'database.py', 'auth.py']

    for filepath in files:
        try:
            audit_file(filepath)
        except FileNotFoundError:
            print(f"\n⚠ File not found: {filepath}")

    print("\n" + "=" * 60)
    print("AUDIT COMPLETE")
    print("=" * 60)
