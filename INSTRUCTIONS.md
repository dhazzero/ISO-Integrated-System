# Jawaban dan Panduan Lanjutan

Halo! Berikut adalah jawaban untuk pertanyaan-pertanyaan Anda.

### 1. Tombol Simpan "Stuck" di Pop-up "Tambah Pengguna"

Ini kemungkinan besar terjadi karena aplikasi (yang berjalan di browser Anda) **tidak dapat terhubung ke server database MongoDB Anda**. Saat Anda klik "Simpan", aplikasi mencoba mengirim data ke API, yang kemudian mencoba menyimpannya ke database. Jika database tidak dapat diakses, prosesnya akan gagal dan bisa tampak "stuck" atau macet.

**Mohon periksa hal berikut:**
*   Pastikan server MongoDB Anda sedang berjalan di komputer lokal Anda.
*   Saat Anda klik tombol "Simpan Pengguna", coba buka *Developer Tools* di browser Anda (biasanya dengan menekan F12) dan lihat di tab **"Console"** atau **"Network"**. Seharusnya ada pesan error yang lebih spesifik di sana yang bisa membantu kita.

### 2. Bagaimana User Matrix Diperbarui?

User matrix **diperbarui secara otomatis**.

Logikanya seperti ini:
1.  Saat Anda berhasil **menambah, mengubah, atau menghapus pengguna**, daftar pengguna di halaman Pengaturan akan dimuat ulang secara otomatis dari database.
2.  Setiap kali daftar pengguna dimuat ulang, **struktur matriks akan dibuat ulang** berdasarkan data terbaru.
3.  Jadi, saat Anda membuka kembali pop-up "Lihat Matriks", Anda akan melihat struktur yang sudah diperbarui.

Singkatnya: jika Anda berhasil mengelola data pengguna (yang memerlukan koneksi database), matriks akan mengikutinya secara otomatis.

### 3. Cara Menginput Superuser dan File JSON-nya

Berikut adalah panduan lengkapnya. Anda perlu menyiapkan database dan koleksi `users` terlebih dahulu, lalu mengimpor data superuser.

---

#### **Langkah 1: Siapkan Koleksi & Index di MongoDB**

Jalankan perintah ini di `mongosh` (MongoDB shell) Anda untuk membuat koleksi `users` dan *index* yang diperlukan untuk memastikan `userId` dan `email` tidak ada yang sama.

```javascript
// Pilih database Anda (sesuai file /lib/mongodb.ts)
use isoIntegratedSystemDB;

// Buat koleksi users
db.createCollection("users");

// Buat unique indexes
db.users.createIndex({ "userId": 1 }, { unique: true });
db.users.createIndex({ "email": 1 }, { unique: true });
```

#### **Langkah 2: Buat Hash untuk Password**

Untuk keamanan, password tidak boleh disimpan sebagai teks biasa. Jalankan skrip Node.js kecil ini di komputer Anda untuk membuat *hash* dari password.

1.  Buat file baru bernama `hash-password.js`.
2.  Salin kode di bawah ini ke dalam file tersebut:
    ```javascript
    const bcrypt = require('bcryptjs');

    // Password yang ingin Anda gunakan
    const plainPassword = 'SuperUserP@ssw0rd!23';
    const saltRounds = 10;

    bcrypt.hash(plainPassword, saltRounds, function(err, hash) {
        if (err) {
            console.error("Error:", err);
            return;
        }
        console.log("Salin dan gunakan hash ini untuk password Anda:");
        console.log(hash);
    });
    ```
3.  Jalankan file tersebut dari terminal Anda:
    ```bash
    node hash-password.js
    ```
4.  Anda akan mendapatkan output string yang panjang (contoh: `$2a$10$...`). **Salin hash tersebut.**

#### **Langkah 3: File `superuser.json`**

Buat file bernama `superuser.json` dan isi dengan konten di bawah ini. Ganti `PASTE_HASHED_PASSWORD_HERE` dengan hash yang Anda dapatkan dari Langkah 2.

```json
{
  "userId": "superuser",
  "name": "Super User",
  "email": "superuser@example.com",
  "password": "PASTE_HASHED_PASSWORD_HERE",
  "role": "administrator",
  "departmentId": null,
  "supervisorId": null,
  "status": "active",
  "lastLogin": null,
  "createdAt": { "$date": "2024-01-01T00:00:00.000Z" },
  "updatedAt": { "$date": "2024-01-01T00:00:00.000Z" }
}
```

#### **Langkah 4: Impor ke Database**

Gunakan tools seperti MongoDB Compass atau perintah `mongoimport` di terminal untuk mengimpor file `superuser.json` ini ke dalam koleksi `users` Anda.

---

Setelah Anda menyelesaikan langkah-langkah ini, database Anda akan siap dan Anda bisa mencoba kembali fitur "Tambah Pengguna". Seharusnya tombol simpan tidak akan macet lagi. Mohon kabari saya jika Anda mengalami kendala saat mengikuti langkah-langkah ini.
