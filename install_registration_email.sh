#!/usr/bin/env bash
set -euo pipefail

PROJECT="$HOME/SOC-DATA-GENERATOR"
FRONTEND="$PROJECT/web/frontend"

API="$FRONTEND/app/api/registration/route.ts"
FORM="$FRONTEND/app/registration/page.tsx"

STAMP="$(date +%Y%m%d-%H%M%S)"
BACKUP="$PROJECT/registration-email-install-backup-$STAMP"

echo "============================================================"
echo " REGISTRATION SUCCESS EMAIL — GMAIL SMTP INSTALLER"
echo "============================================================"
echo
echo "Project  : $PROJECT"
echo "Frontend : $FRONTEND"
echo

fail() {
    echo
    echo "[FAIL] $1"
    echo
    if [[ -d "$BACKUP" ]]; then
        echo "[RESTORE] Restoring original files..."
        cp "$BACKUP/route.ts" "$API"
        cp "$BACKUP/page.tsx" "$FORM"
        echo "[PASS] Original files restored."
    fi
    exit 1
}

echo "[1/10] CHECKING PROJECT"
echo "------------------------------------------------------------"

[[ -d "$PROJECT" ]] || fail "Project not found."
[[ -d "$FRONTEND" ]] || fail "Frontend directory not found."
[[ -f "$API" ]] || fail "Registration API not found: $API"
[[ -f "$FORM" ]] || fail "Registration form not found: $FORM"

echo "[PASS] Project found."
echo "[PASS] Registration API found."
echo "[PASS] Registration page found."
echo

echo "[2/10] CREATING BACKUP"
echo "------------------------------------------------------------"

mkdir -p "$BACKUP"

cp "$API" "$BACKUP/route.ts"
cp "$FORM" "$BACKUP/page.tsx"

echo "[PASS] Backup:"
echo "       $BACKUP"
echo

echo "[3/10] CHECKING NODEMAILER"
echo "------------------------------------------------------------"

if ! node -e "require.resolve('nodemailer')" >/dev/null 2>&1; then
    fail "Nodemailer is not installed. Run: npm install nodemailer @types/nodemailer"
fi

if ! node -e "require.resolve('@types/nodemailer')" >/dev/null 2>&1; then
    echo "[WARN] @types/nodemailer package could not be resolved."
else
    echo "[PASS] Nodemailer detected."
fi

echo

echo "[4/10] CHECKING SMTP ENVIRONMENT"
echo "------------------------------------------------------------"

if [[ ! -f "$FRONTEND/.env.local" ]]; then
    fail ".env.local not found."
fi

set +u
set -a
source "$FRONTEND/.env.local"
set +a
set -u

[[ -n "${SMTP_HOST:-}" ]] || fail "SMTP_HOST missing from .env.local"
[[ -n "${SMTP_PORT:-}" ]] || fail "SMTP_PORT missing from .env.local"
[[ -n "${SMTP_USER:-}" ]] || fail "SMTP_USER missing from .env.local"
[[ -n "${SMTP_PASSWORD:-}" ]] || fail "SMTP_PASSWORD missing from .env.local"
[[ -n "${EMAIL_FROM:-}" ]] || fail "EMAIL_FROM missing from .env.local"

echo "[SET] SMTP_HOST"
echo "[SET] SMTP_PORT"
echo "[SET] SMTP_USER"
echo "[SET] SMTP_PASSWORD"
echo "[SET] EMAIL_FROM"
echo "[PASS] SMTP environment configured."
echo "[SAFE] SMTP password was not displayed."
echo

echo "[5/10] ANALYSING EXISTING REGISTRATION CODE"
echo "------------------------------------------------------------"

grep -q 'export async function POST' "$API" \
    || fail "Registration POST handler not found."

grep -q 'await client.query("COMMIT")' "$API" \
    || fail "Database COMMIT not found."

grep -q 'bcrypt' "$API" \
    || fail "Password hashing logic not found."

grep -q 'contest_students' "$API" \
    || fail "Student creation logic not found."

echo "[PASS] Registration handler detected."
echo "[PASS] Student creation detected."
echo "[PASS] Password hashing detected."
echo "[PASS] Database COMMIT detected."
echo

echo "[6/10] PATCHING REGISTRATION API"
echo "------------------------------------------------------------"

python3 - "$API" <<'PY'
from pathlib import Path
import sys

path = Path(sys.argv[1])
text = path.read_text()

IMPORT_MARKER = "// REGISTRATION_EMAIL_SMTP_IMPORT"
BLOCK_MARKER = "// REGISTRATION_EMAIL_SMTP_BLOCK"

# ------------------------------------------------------------
# 1. Add nodemailer import
# ------------------------------------------------------------

if IMPORT_MARKER not in text:
    if 'import nodemailer from "nodemailer";' not in text:
        lines = text.splitlines()

        insert_at = 0

        for i, line in enumerate(lines):
            if line.startswith("import "):
                insert_at = i + 1

        lines.insert(
            insert_at,
            '// REGISTRATION_EMAIL_SMTP_IMPORT\nimport nodemailer from "nodemailer";'
        )

        text = "\n".join(lines) + ("\n" if text.endswith("\n") else "")

# ------------------------------------------------------------
# 2. Ensure email input exists
# ------------------------------------------------------------

if "const email = clean(body?.email).toLowerCase();" not in text:

    anchor = "const teamName = clean(body?.team_name);"

    if anchor not in text:
        raise SystemExit(
            "Could not locate team_name parsing line in registration API."
        )

    replacement = (
        anchor
        + '\n    const email = clean(body?.email).toLowerCase();'
    )

    text = text.replace(anchor, replacement, 1)

# ------------------------------------------------------------
# 3. Add email validation
# ------------------------------------------------------------

if 'A valid registration email address is required.' not in text:

    anchor = "if (!teamName) {"

    if anchor not in text:
        raise SystemExit(
            "Could not locate team_name validation block."
        )

    email_validation = '''if (
      !email ||
      !/^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/.test(email)
    ) {
      return NextResponse.json(
        {
          success: false,
          error: "A valid registration email address is required.",
        },
        { status: 400 }
      );
    }

    '''

    text = text.replace(anchor, email_validation + anchor, 1)

# ------------------------------------------------------------
# 4. Remove previously misplaced email blocks
# ------------------------------------------------------------

start = text.find(BLOCK_MARKER)

if start != -1:
    # Remove from marker through the matching email section
    # until the normal catch block begins.
    catch_marker = "    } catch (error) {"

    end = text.find(catch_marker, start)

    if end != -1:
        text = text[:start] + text[end:]

# ------------------------------------------------------------
# 5. Find COMMIT and successful response
# ------------------------------------------------------------

commit_marker = '    await client.query("COMMIT");'

if commit_marker not in text:
    raise SystemExit("Database COMMIT marker not found.")

email_block = r'''
    // REGISTRATION_EMAIL_SMTP_BLOCK
    //
    // Send credentials only after the database transaction commits.
    // Email failure must never convert a successful registration
    // into a failed registration.

    try {
      const smtpHost = process.env.SMTP_HOST;
      const smtpPort = Number(process.env.SMTP_PORT || "587");
      const smtpUser = process.env.SMTP_USER;
      const smtpPassword = process.env.SMTP_PASSWORD;
      const emailFrom = process.env.EMAIL_FROM;

      if (
        smtpHost &&
        smtpPort &&
        smtpUser &&
        smtpPassword &&
        emailFrom
      ) {
        const transporter = nodemailer.createTransport({
          host: smtpHost,
          port: smtpPort,
          secure: process.env.SMTP_SECURE === "true",
          auth: {
            user: smtpUser,
            pass: smtpPassword,
          },
        });

        const primaryUsername =
          normalizedMembers[0]?.username || "";

        const contestUrl =
          process.env.NEXT_PUBLIC_CONTEST_URL ||
          "http://localhost:3000";

        await transporter.sendMail({
          from: emailFrom,
          to: email,
          subject:
            "SOC Alert Triage Contest — Registration Successful",

          text: `
SOC ALERT TRIAGE CONTEST
REGISTRATION SUCCESSFUL

Your team registration has been completed successfully.

Team Details
------------------------------
Team ID   : ${teamId}
Team Name : ${teamName}

Login Credentials
------------------------------
Username  : ${primaryUsername}
Password  : ${password}

Contest Login
------------------------------
${contestUrl}

Please keep these credentials safe.

SOC Alert Triage Contest
          `.trim(),

          html: `
            <div style="font-family:Arial,sans-serif;background:#f4f7fb;padding:30px;">
              <div style="max-width:650px;margin:auto;background:white;border-radius:12px;overflow:hidden;">

                <div style="background:#0f172a;color:white;padding:24px;">
                  <h1 style="margin:0;">
                    SOC Alert Triage Contest
                  </h1>

                  <p style="margin:8px 0 0;color:#cbd5e1;">
                    Registration Successful
                  </p>
                </div>

                <div style="padding:28px;">

                  <p>
                    Your team registration has been completed successfully.
                  </p>

                  <h2>Team Details</h2>

                  <table style="border-collapse:collapse;width:100%;">
                    <tr>
                      <td style="padding:10px;border:1px solid #ddd;font-weight:bold;">
                        Team ID
                      </td>
                      <td style="padding:10px;border:1px solid #ddd;">
                        ${teamId}
                      </td>
                    </tr>

                    <tr>
                      <td style="padding:10px;border:1px solid #ddd;font-weight:bold;">
                        Team Name
                      </td>
                      <td style="padding:10px;border:1px solid #ddd;">
                        ${teamName}
                      </td>
                    </tr>
                  </table>

                  <h2 style="margin-top:25px;">
                    Login Credentials
                  </h2>

                  <table style="border-collapse:collapse;width:100%;">
                    <tr>
                      <td style="padding:10px;border:1px solid #ddd;font-weight:bold;">
                        Username
                      </td>
                      <td style="padding:10px;border:1px solid #ddd;">
                        ${primaryUsername}
                      </td>
                    </tr>

                    <tr>
                      <td style="padding:10px;border:1px solid #ddd;font-weight:bold;">
                        Password
                      </td>
                      <td style="padding:10px;border:1px solid #ddd;">
                        ${password}
                      </td>
                    </tr>
                  </table>

                  <div style="margin-top:25px;">
                    <a
                      href="${contestUrl}"
                      style="display:inline-block;padding:12px 20px;background:#2563eb;color:white;text-decoration:none;border-radius:8px;"
                    >
                      Open Contest Platform
                    </a>
                  </div>

                  <p style="margin-top:25px;color:#64748b;">
                    Please keep your credentials safe.
                  </p>

                  <p>
                    Good luck!
                  </p>

                  <p style="font-weight:bold;">
                    SOC Alert Triage Contest
                  </p>

                </div>
              </div>
            </div>
          `,
        });

        console.log(
          "[REGISTRATION EMAIL] Success email sent to:",
          email
        );
      } else {
        console.error(
          "[REGISTRATION EMAIL] SMTP environment variables are missing."
        );
      }
    } catch (emailError) {
      console.error(
        "[REGISTRATION EMAIL] Failed:",
        emailError
      );
    }

'''

text = text.replace(
    commit_marker,
    commit_marker + "\n" + email_block,
    1
)

path.write_text(text)
PY

echo "[PASS] Registration API patched."
echo

echo "[7/10] PATCHING REGISTRATION FORM"
echo "------------------------------------------------------------"

python3 - "$FORM" <<'PY'
from pathlib import Path
import sys

path = Path(sys.argv[1])
text = path.read_text()

STATE_MARKER = "REGISTRATION_EMAIL_STATE"
INPUT_MARKER = "REGISTRATION_EMAIL_INPUT"
PAYLOAD_MARKER = "REGISTRATION_EMAIL_PAYLOAD"

# ------------------------------------------------------------
# Locate teamName state
# ------------------------------------------------------------

if "const [teamName" not in text:
    raise SystemExit(
        "Could not locate teamName state in registration form."
    )

# ------------------------------------------------------------
# Add email state
# ------------------------------------------------------------

if STATE_MARKER not in text:
    lines = text.splitlines()

    for i, line in enumerate(lines):
        if "const [teamName" in line:
            indent = line[:len(line) - len(line.lstrip())]

            lines.insert(
                i + 1,
                f'{indent}// {STATE_MARKER}\n'
                f'{indent}const [email, setEmail] = useState("");'
            )
            break

    text = "\n".join(lines) + ("\n" if text.endswith("\n") else "")

# ------------------------------------------------------------
# Add email to validation
# ------------------------------------------------------------

if "A registration email is required." not in text:

    validation_candidates = [
        'if (!teamName.trim()) {',
        'if (!teamName) {',
        'if (!teamName.trim() ||',
    ]

    found = False

    for anchor in validation_candidates:
        if anchor in text:
            block = f'''if (!email.trim()) {{
      setError("A registration email is required.");
      return;
    }}

    '''

            text = text.replace(anchor, block + anchor, 1)
            found = True
            break

    if not found:
        raise SystemExit(
            "Could not locate registration validation block safely."
        )

# ------------------------------------------------------------
# Add email to POST payload
# ------------------------------------------------------------

if PAYLOAD_MARKER not in text:

    anchor = 'team_name: teamName.trim(),'

    if anchor not in text:
        raise SystemExit(
            "Could not locate team_name POST field safely."
        )

    replacement = (
        anchor
        + '\n          // REGISTRATION_EMAIL_PAYLOAD'
        + '\n          email: email.trim(),'
    )

    text = text.replace(anchor, replacement, 1)

# ------------------------------------------------------------
# Add email input
# ------------------------------------------------------------

if INPUT_MARKER not in text:

    # Prefer inserting immediately before the first members heading.
    heading_candidates = [
        "<h3>Team members</h3>",
        "<h2>Team members</h2>",
        "Team members",
    ]

    inserted = False

    email_input = '''
              {/* REGISTRATION_EMAIL_INPUT */}
              <div className="form-field">
                <label htmlFor="registration-email">
                  Registration Email
                </label>

                <input
                  id="registration-email"
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="Enter email address"
                  autoComplete="email"
                  required
                />

                <small>
                  Team registration details and login credentials will be sent to this email address.
                </small>
              </div>

'''

    for anchor in heading_candidates:
        if anchor in text:
            text = text.replace(
                anchor,
                email_input + "              " + anchor,
                1
            )
            inserted = True
            break

    if not inserted:
        raise SystemExit(
            "Could not locate Team members section for email field."
        )

path.write_text(text)
PY

echo "[PASS] Registration form patched."
echo

echo "[8/10] VERIFYING IMPLEMENTATION"
echo "------------------------------------------------------------"

grep -q 'import nodemailer from "nodemailer";' "$API" \
    || fail "Nodemailer import missing."

grep -q 'process.env.SMTP_HOST' "$API" \
    || fail "SMTP_HOST integration missing."

grep -q 'process.env.SMTP_PORT' "$API" \
    || fail "SMTP_PORT integration missing."

grep -q 'process.env.SMTP_USER' "$API" \
    || fail "SMTP_USER integration missing."

grep -q 'process.env.SMTP_PASSWORD' "$API" \
    || fail "SMTP_PASSWORD integration missing."

grep -q 'process.env.EMAIL_FROM' "$API" \
    || fail "EMAIL_FROM integration missing."

grep -q 'transporter.sendMail' "$API" \
    || fail "sendMail integration missing."

grep -q 'registration-email' "$FORM" \
    || fail "Registration email input missing."

grep -q 'email: email.trim()' "$FORM" \
    || fail "Registration email is not included in POST payload."

echo "[PASS] SMTP_HOST integration found."
echo "[PASS] SMTP_PORT integration found."
echo "[PASS] SMTP_USER integration found."
echo "[PASS] SMTP_PASSWORD integration found."
echo "[PASS] EMAIL_FROM integration found."
echo "[PASS] Nodemailer sendMail integration found."
echo "[PASS] Registration email field found."
echo "[PASS] Email POST payload found."
echo

echo "[9/10] TYPESCRIPT VALIDATION"
echo "------------------------------------------------------------"

cd "$FRONTEND"

if [[ -x "./node_modules/.bin/tsc" ]]; then
    ./node_modules/.bin/tsc --noEmit --pretty false \
        || fail "TypeScript validation failed."
else
    npx --no-install tsc --noEmit --pretty false \
        || fail "TypeScript validation failed."
fi

echo "[PASS] TypeScript validation passed."
echo

echo "[10/10] FINAL VERIFICATION"
echo "------------------------------------------------------------"

if grep -q 'REGISTRATION_EMAIL_SMTP_BLOCK' "$API" \
   && grep -q 'REGISTRATION_EMAIL_INPUT' "$FORM" \
   && grep -q 'REGISTRATION_EMAIL_PAYLOAD' "$FORM"; then

    echo "[PASS] Registration email implementation verified."
else
    fail "Final implementation markers are incomplete."
fi

echo
echo "============================================================"
echo " REGISTRATION EMAIL INSTALLATION COMPLETE"
echo "============================================================"
echo
echo "Backup:"
echo "  $BACKUP"
echo
echo "SMTP:"
echo "  Host : $SMTP_HOST"
echo "  Port : $SMTP_PORT"
echo "  User : $SMTP_USER"
echo "  From : $EMAIL_FROM"
echo
echo "Registration flow:"
echo "  1. User enters team details"
echo "  2. User enters registration email"
echo "  3. Form POSTs email to /api/registration"
echo "  4. Team and students are created"
echo "  5. Database COMMIT succeeds"
echo "  6. Gmail SMTP sends registration email"
echo "  7. Success response is returned"
echo
echo "IMPORTANT:"
echo "  Email failure does NOT roll back a successful registration."
echo
