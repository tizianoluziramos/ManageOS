# 🧠 ManageOS

**ManageOS** es un módulo para **Node.js**, **TypeScript** y **JavaScript** que permite **gestionar, auditar y automatizar tareas del sistema operativo Windows** (y otros entornos como Android) mediante una API sencilla y potente.

---

## 🚀 Características principales

- 🪟 Gestión avanzada del sistema operativo Windows.
- 🔒 Control de **BitLocker**, **Antivirus** y **Políticas de auditoría**.
- 🧾 Administración de **registros de eventos** y **certificados**.
- 🔉 Control de **audio**, **cámara**, **portapapeles** y más.
- 🧠 API unificada para funciones **sincrónicas (Sync)** y **asíncronas (Async)**.
- 🤖 Soporte extendido para **Android** (ADB y Fastboot).
- 🔐 Herramientas integradas de **encriptación y hash**.
- 🪶 Completamente escrito en **TypeScript** con tipado fuerte.

---

## 📦 Instalación

```bash
npm install manageos
# o
yarn add manageos
```

---

## 🧰 Ejemplo de uso básico

### Sincrónico
```ts
import { BitLocker } from "manageos";

BitLocker.Sync.lockDrive("C:");
console.log("Unidad C bloqueada con BitLocker.");
```

### Asíncrono
```ts
import { AuditPolicy } from "manageos";

await AuditPolicy.Async.enable("Logon/Logoff");
console.log("Política de auditoría activada.");
```

---

## 📚 Módulos disponibles

| Módulo | Descripción |
|--------|--------------|
| `Antivirus` | Controla y verifica el estado del antivirus de Windows. |
| `Audio` | Administra el volumen, dispositivos y controladores de audio. |
| `AuditPolicy` | Gestiona políticas de auditoría del sistema. |
| `BitLocker` | Controla el cifrado de unidades mediante BitLocker. |
| `Camera` | Accede a la cámara del sistema y gestiona su disponibilidad. |
| `Certificates` | Gestiona certificados del sistema. |
| `Clipboard` | Lee y escribe en el portapapeles del sistema. |
| `Encryption` | Permite encriptar, desencriptar, generar y guardar claves. |
| `EventLogs` | Lee y exporta registros del visor de eventos. |
| `Android` | Ejecuta comandos ADB y Fastboot para dispositivos Android. |

---

## 🔐 Ejemplo de encriptación

```ts
import { Encryption } from "manageos";

// Inicializa una clave
Encryption.init("mi_clave_secreta");

// Cifra texto
const { encryptedData, iv } = Encryption.encrypt("Hola mundo");

// Descifra texto
const texto = Encryption.decrypt(encryptedData, iv);
console.log(texto); // "Hola mundo"
```

---

## 🧩 API consistente

Todos los módulos siguen una estructura similar:
```ts
<Modulo>.Sync.<función>()
<Modulo>.Async.<función>()
```

Esto permite integrar **ManageOS** fácilmente en cualquier flujo sin preocuparse por compatibilidades entre promesas o ejecuciones bloqueantes.

---

## 🛠️ Requisitos

- Windows 10 / 11 o superior
- Node.js >= 18
- Permisos administrativos para algunas funciones

---

## 📖 Documentación

Consulta la documentación completa en el repositorio oficial:

👉 [GitHub - tizianoluziramos/ManageOS](https://github.com/tizianoluziramos/ManageOS)

---

## 🤝 Contribuir

¡Las contribuciones son bienvenidas!  
Haz un *fork* del proyecto, crea una rama con tus cambios y envía un *pull request*.

```bash
git clone https://github.com/tizianoluziramos/ManageOS.git
cd ManageOS
npm install
npm run build
```

---

## 🧾 Licencia

Este proyecto está licenciado bajo la **MIT License**.

---

### ✨ Desarrollado por [Tiziano Luzi Ramos](https://github.com/tizianoluziramos)
