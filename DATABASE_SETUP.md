# Panduan Setup Database MongoDB

Berikut adalah panduan untuk menyiapkan koleksi (tabel) dan data yang diperlukan untuk aplikasi ini.

## 1. Koleksi `users`

Aplikasi ini memerlukan koleksi bernama `users`. Berikut adalah struktur dokumen yang direkomendasikan:

```json
{
  "_id": "ObjectId",
  "userId": "string (unik)",
  "name": "string",
  "email": "string (unik)",
  "password": "string (di-hash)",
  "role": "string ('administrator', 'manager', atau 'staff')",
  "departmentId": "ObjectId (referensi ke koleksi 'departments')" | null,
  "supervisorId": "ObjectId (referensi ke user lain)" | null,
  "status": "string ('active' atau 'inactive')",
  "lastLogin": "Date" | null,
  "createdAt": "Date",
  "updatedAt": "Date"
}
```

### Rekomendasi Index

Untuk performa dan integritas data yang optimal, buatlah *unique index* pada field `userId` dan `email`.

```javascript
// Jalankan di mongo shell
db.users.createIndex({ "userId": 1 }, { unique: true });
db.users.createIndex({ "email": 1 }, { unique: true });
```

---

## 2. Membuat Akun Superuser

Berikut adalah data JSON untuk akun `superuser`.

**PENTING:** Jangan salin-tempel password di bawah ini secara langsung. Anda harus membuat hash-nya terlebih dahulu.

### Langkah 1: Buat file `hash-password.js`

Buat sebuah file sementara di direktori proyek Anda dengan nama `hash-password.js` dan isi kode berikut:

```javascript
const bcrypt = require('bcryptjs');

const plainPassword = 'SuperUserP@ssw0rd!23';
const saltRounds = 10;

bcrypt.hash(plainPassword, saltRounds, function(err, hash) {
    if (err) {
        console.error("Error hashing password:", err);
        return;
    }
    console.log("Password Anda yang sudah di-hash adalah:");
    console.log(hash);
});
```

### Langkah 2: Jalankan skrip

Buka terminal di direktori proyek Anda dan jalankan perintah:

```bash
node hash-password.js
```

Anda akan mendapatkan output string yang panjang. Itulah password Anda yang sudah di-hash.

### Langkah 3: Siapkan file `superuser.json`

Buat file `superuser.json` dan gunakan hash dari langkah 2 untuk mengisi field `password`.

```json
{
  "userId": "superuser",
  "name": "Super User",
  "email": "superuser@example.com",
  "password": "PASTE_HASHED_PASSWORD_DARI_LANGKAH_2_DI_SINI",
  "role": "administrator",
  "departmentId": null,
  "supervisorId": null,
  "status": "active",
  "lastLogin": null,
  "createdAt": { "$date": "2024-01-01T00:00:00.000Z" },
  "updatedAt": { "$date": "2024-01-01T00:00:00.000Z" }
}
```

### Langkah 4: Impor ke Database

Gunakan `mongoimport` atau MongoDB Compass untuk mengimpor file `superuser.json` ke dalam koleksi `users` di database `isoIntegratedSystemDB` Anda.

Setelah langkah-langkah ini selesai, Anda akan memiliki akun superuser yang siap digunakan.
