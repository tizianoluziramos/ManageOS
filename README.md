# ManageOS

**ManageOS** is a Node.js library that provides a set of tools to manage operating system resources and settings on Windows systems. It offers utilities for registry editing, process management, file system operations, system information retrieval, and user account management.

---

## 📦 Installation

Install via npm:

```bash
npm install manageos
```

or with Yarn:

```bash
yarn add manageos
```

---

## 🛠 Usage

### Import the package

```ts
import ManageOS from "manageos";
```

---

### File System

```ts
// Synchronous usage
const files = ManageOS.FileSystem.sync.listDirectory("C:\\Path\\To\\Folder");

// Asynchronous usage
const filesAsync = await ManageOS.FileSystem.async.listDirectory(
  "C:\\Path\\To\\Folder"
);
```

---

### Registry Editor

```ts
await ManageOS.Regedit.createKey("HKCU\\Software\\MyApp");
await ManageOS.Regedit.setValue(
  "HKCU\\Software\\MyApp",
  "TestValue",
  "REG_SZ",
  "Hello World"
);
const registryData = await ManageOS.Regedit.listKey("HKCU\\Software\\MyApp");
await ManageOS.Regedit.deleteKey("HKCU\\Software\\MyApp");
```

---

### Process Manager

```ts
const processes = ManageOS.Taskmgr.sync.listProcesses();
const processCount = ManageOS.Taskmgr.sync.getProcessCount();

ManageOS.Taskmgr.sync.killByName("notepad.exe", true);
```

---

### System Information

```ts
const sysInfo = ManageOS.SystemInfo();
console.log(sysInfo.platform, sysInfo.architecture, sysInfo.cpus);
```

---

### User Management

```ts
const users = ManageOS.UserManager.listUsers();
const userInfo = ManageOS.UserManager.getUserInfo("Administrator");

ManageOS.UserManager.createUser("newuser", "password123");
ManageOS.UserManager.deleteUser("newuser");
```

---

## 📚 API Overview

- **`ManageOS.FileSystem`** – File and directory operations (sync & async versions).
- **`ManageOS.Regedit`** – Create, delete, read, and modify Windows Registry keys and values.
- **`ManageOS.Taskmgr`** – Process listing, monitoring, and termination.
- **`ManageOS.SystemInfo`** – Retrieve system details such as OS version, CPU info, memory, and uptime.
- **`ManageOS.UserManager`** – Manage Windows user accounts and groups.

---

## ⚙ Requirements

- Node.js v18 or higher
- Windows operating system (registry and process management are Windows-specific)
- Administrative privileges for some operations

---

## 💡 Notes

- Many operations require elevated privileges (Administrator mode).
- Registry changes can affect system stability. Use with caution.
- This library wraps built-in Windows commands, so all outputs depend on system configuration.

---

## 🔧 Development

Clone the repository and install dependencies:

```bash
git clone https://github.com/yourusername/manageos.git
cd manageos
npm install
npm run build
```

Run in development mode:

```bash
npm run dev
```

---

## 📄 License

MIT License © Tiziano Tomas Luzi Ramos
