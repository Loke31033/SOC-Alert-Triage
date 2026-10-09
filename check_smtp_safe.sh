#!/usr/bin/env bash

set -u

PROJECT="$HOME/SOC-DATA-GENERATOR"
FRONTEND="$PROJECT/web/frontend"
ENV_FILE="$FRONTEND/.env.local"

echo "============================================================"
echo " SMTP / NODEMAILER SAFE CHECK"
echo "============================================================"
echo
echo "Project  : $PROJECT"
echo "Frontend : $FRONTEND"
echo

# ------------------------------------------------------------
# 1. PROJECT CHECK
# ------------------------------------------------------------

echo "[1/7] CHECKING PROJECT"
echo "------------------------------------------------------------"

if [ ! -d "$PROJECT" ]; then
    echo "[FAIL] Project not found:"
    echo "       $PROJECT"
    exit 1
fi

if [ ! -d "$FRONTEND" ]; then
    echo "[FAIL] Frontend not found:"
    echo "       $FRONTEND"
    exit 1
fi

echo "[PASS] Project found."
echo "[PASS] Frontend found."

# ------------------------------------------------------------
# 2. ENV CHECK
# ------------------------------------------------------------

echo
echo "[2/7] CHECKING .env.local"
echo "------------------------------------------------------------"

if [ ! -f "$ENV_FILE" ]; then
    echo "[FAIL] .env.local not found:"
    echo "       $ENV_FILE"
    exit 1
fi

echo "[PASS] .env.local found."

# ------------------------------------------------------------
# 3. SAFE DOTENV PARSING
# IMPORTANT:
# Never use: source .env.local
# ------------------------------------------------------------

echo
echo "[3/7] READING SMTP VARIABLES SAFELY"
echo "------------------------------------------------------------"

get_env_value() {
    local key="$1"

    awk -v key="$key" '
        BEGIN { FS="=" }

        /^[[:space:]]*#/ { next }

        $0 ~ "^[[:space:]]*" key "[[:space:]]*=" {
            line=$0
            sub("^[[:space:]]*" key "[[:space:]]*=[[:space:]]*", "", line)

            # Remove matching surrounding quotes.
            if (line ~ /^".*"$/) {
                sub(/^"/, "", line)
                sub(/"$/, "", line)
            } else if (line ~ /^'\''.*'\''$/) {
                sub(/^'\''/, "", line)
                sub(/'\''$/, "", line)
            }

            print line
            exit
        }
    ' "$ENV_FILE"
}

SMTP_HOST_VALUE="$(get_env_value SMTP_HOST)"
SMTP_PORT_VALUE="$(get_env_value SMTP_PORT)"
SMTP_USER_VALUE="$(get_env_value SMTP_USER)"
SMTP_PASSWORD_VALUE="$(get_env_value SMTP_PASSWORD)"
EMAIL_FROM_VALUE="$(get_env_value EMAIL_FROM)"

if [ -n "$SMTP_HOST_VALUE" ]; then
    echo "[SET] SMTP_HOST=$SMTP_HOST_VALUE"
else
    echo "[FAIL] SMTP_HOST missing"
fi

if [ -n "$SMTP_PORT_VALUE" ]; then
    echo "[SET] SMTP_PORT=$SMTP_PORT_VALUE"
else
    echo "[FAIL] SMTP_PORT missing"
fi

if [ -n "$SMTP_USER_VALUE" ]; then
    echo "[SET] SMTP_USER=$SMTP_USER_VALUE"
else
    echo "[FAIL] SMTP_USER missing"
fi

if [ -n "$SMTP_PASSWORD_VALUE" ]; then
    echo "[SET] SMTP_PASSWORD=[SET]"
else
    echo "[FAIL] SMTP_PASSWORD missing"
fi

if [ -n "$EMAIL_FROM_VALUE" ]; then
    echo "[SET] EMAIL_FROM=$EMAIL_FROM_VALUE"
else
    echo "[FAIL] EMAIL_FROM missing"
fi

if [ -z "$SMTP_HOST_VALUE" ] ||
   [ -z "$SMTP_PORT_VALUE" ] ||
   [ -z "$SMTP_USER_VALUE" ] ||
   [ -z "$SMTP_PASSWORD_VALUE" ] ||
   [ -z "$EMAIL_FROM_VALUE" ]; then

    echo
    echo "[FAIL] SMTP configuration is incomplete."
    exit 1
fi

echo
echo "[PASS] SMTP environment detected safely."
echo "[SAFE] Password was not displayed."

# ------------------------------------------------------------
# 4. NODEMAILER CHECK
# ------------------------------------------------------------

echo
echo "[4/7] CHECKING NODEMAILER"
echo "------------------------------------------------------------"

cd "$FRONTEND"

if npm list nodemailer >/dev/null 2>&1; then
    echo "[PASS] Nodemailer installed."
else
    echo "[FAIL] Nodemailer is not installed."
    echo
    echo "Run:"
    echo "npm install nodemailer"
    echo "npm install -D @types/nodemailer"
    exit 1
fi

if npm list @types/nodemailer >/dev/null 2>&1; then
    echo "[PASS] @types/nodemailer installed."
else
    echo "[WARN] @types/nodemailer not detected."
fi

# ------------------------------------------------------------
# 5. REGISTRATION API CHECK
# ------------------------------------------------------------

echo
echo "[5/7] CHECKING REGISTRATION API"
echo "------------------------------------------------------------"

API="$FRONTEND/app/api/registration/route.ts"

if [ ! -f "$API" ]; then
    echo "[FAIL] Registration API not found."
    exit 1
fi

echo "[PASS] Registration API found."

if grep -q "export async function POST" "$API"; then
    echo "[PASS] POST handler found."
else
    echo "[FAIL] POST handler not found."
    exit 1
fi

if grep -q "bcrypt" "$API"; then
    echo "[PASS] Password hashing detected."
else
    echo "[WARN] Password hashing marker not detected."
fi

if grep -q 'client.query("COMMIT")' "$API"; then
    echo "[PASS] Database COMMIT detected."
else
    echo "[WARN] Database COMMIT marker not detected."
fi

# ------------------------------------------------------------
# 6. REGISTRATION FORM CHECK
# ------------------------------------------------------------

echo
echo "[6/7] CHECKING REGISTRATION FORM"
echo "------------------------------------------------------------"

FORM="$FRONTEND/app/registration/page.tsx"

if [ ! -f "$FORM" ]; then
    echo "[FAIL] Registration page not found."
    exit 1
fi

echo "[PASS] Registration page found."

if grep -q 'fetch("/api/registration"' "$FORM"; then
    echo "[PASS] Registration POST detected."
else
    echo "[WARN] Registration POST not detected."
fi

if grep -qE 'email|Email' "$FORM"; then
    echo "[PASS] Email field/reference detected."
else
    echo "[WARN] Email field not detected."
fi

# ------------------------------------------------------------
# 7. FINAL
# ------------------------------------------------------------

echo
echo "============================================================"
echo " SMTP CHECK COMPLETE"
echo "============================================================"
echo
echo "[PASS] No .env.local shell sourcing was performed."
echo "[PASS] SMTP password was never printed."
echo
echo "Next test:"
echo
echo "node test-email.mjs"
echo
