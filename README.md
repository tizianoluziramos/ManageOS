# 🧠 ManageOS

**ManageOS** is a module for **Node.js**, **TypeScript**, and
**JavaScript** that allows you to **manage, audit, and automate
operating system tasks** on Windows (and other environments like
Android) through a simple and powerful API.

📘 **Official Documentation:** [https://tizianoluziramos.github.io/ManageOS](https://tizianoluziramos.github.io/ManageOS)

---

## 🚀 Main Features

- 🪟 Advanced Windows OS management.
- 🔒 Control of **BitLocker**, **Antivirus**, and **Audit Policies**.
- 🧾 Administration of **event logs** and **certificates**.
- 🔉 Control of **audio**, **camera**, **clipboard**, and more.
- 🧠 Unified API for both **Synchronous (Sync)** and **Asynchronous
  (Async)** functions.
- 🤖 Extended support for **Android** (ADB and Fastboot).
- 🔐 Built-in **encryption and hashing** tools.
- 🪶 Fully written in **TypeScript** with strong typing.

---

## 📦 Installation

```bash
npm install manageos
# or
yarn add manageos
```

---

## 🧰 Basic Usage Example

### Synchronous

```ts
import { BitLocker } from "manageos";

BitLocker.Sync.lockDrive("C:");
console.log("Drive C locked with BitLocker.");
```

### Asynchronous

```ts
import { AuditPolicy } from "manageos";

await AuditPolicy.Async.enable("Logon/Logoff");
console.log("Audit policy enabled.");
```

---

## 📚 Available Modules

Module Description

---

`Antivirus` Controls and verifies Windows antivirus status.
`Audio` Manages volume, devices, and audio drivers.
`AuditPolicy` Manages system audit policies.
`BitLocker` Controls drive encryption via BitLocker.
`Camera` Accesses and manages system camera availability.
`Certificates` Manages system certificates.
`Clipboard` Reads and writes from/to the system clipboard.
`Encryption` Encrypts, decrypts, generates, and stores keys.
`EventLogs` Reads and exports Event Viewer logs.
`Android` Executes ADB and Fastboot commands for Android devices.

---

## 🔐 Encryption Example

```ts
import { Encryption } from "manageos";

// Initialize a key
Encryption.init("my_secret_key");

// Encrypt text
const { encryptedData, iv } = Encryption.encrypt("Hello world");

// Decrypt text
const text = Encryption.decrypt(encryptedData, iv);
console.log(text); // "Hello world"
```

---

## 🧩 Consistent API

All modules follow the same structure:

```ts
<Module>.Sync.<function>()
<Module>.Async.<function>()
```

This makes **ManageOS** easy to integrate into any workflow without
worrying about promise or blocking execution compatibility.

---

## 🛠️ Requirements

- Windows 10 / 11 or higher
- Node.js \>= 18
- Administrative privileges for certain functions

---

## 📖 Documentation

Check out the full documentation on the official repository:

👉 [GitHub -
tizianoluziramos/ManageOS](https://github.com/tizianoluziramos/ManageOS)

---

## 🤝 Contributing

Contributions are welcome!\
Fork the project, create a branch with your changes, and submit a pull
request.

```bash
git clone https://github.com/tizianoluziramos/ManageOS.git
cd ManageOS
npm install
npm run build
```

---

## 🧾 License

This project is licensed under the **MIT License**.

---

### ✨ Developed by [Tiziano Luzi Ramos](https://github.com/tizianoluziramos)
