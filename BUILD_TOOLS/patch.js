import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import glob from "glob";

// Obtener __dirname en ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ruta al dist (desde BUILD_TOOLS/patch.js)
const DIST_DIR = path.resolve(__dirname, "../dist");

// Regex para detectar imports: from '...' o "..." o `...`
const importRegex = /from\s+(['"`])([^'"`]+)\1/g;

function patchImportPath(jsFile) {
  let content = fs.readFileSync(jsFile, "utf-8");
  let newContent = content;

  const matches = [];
  let match;
  while ((match = importRegex.exec(content)) !== null) {
    matches.push(match);
  }

  // Procesar de atrás hacia adelante para no romper índices
  for (let i = matches.length - 1; i >= 0; i--) {
    const m = matches[i];
    const quote = m[1];
    const importPath = m[2];

    if (importPath.startsWith("./") || importPath.startsWith("../")) {
      const absPath = path.resolve(path.dirname(jsFile), importPath);
      let newPath;

      if (fs.existsSync(absPath) && fs.lstatSync(absPath).isDirectory()) {
        // Carpeta → apuntar a index.js
        newPath = importPath.replace(/\/?$/, "/index.js");
      } else {
        // Archivo → agregar .js si no tiene
        newPath = path.extname(absPath) === ".js" ? importPath : importPath + ".js";
      }

      // Reemplazar en el contenido
      const start = m.index + m[0].indexOf(importPath);
      const end = start + importPath.length;
      newContent = newContent.slice(0, start) + newPath + newContent.slice(end);
    }
  }

  fs.writeFileSync(jsFile, newContent, "utf-8");
  console.log(`Patched: ${jsFile}`);
}

// Recorrer todos los JS en dist
glob(`${DIST_DIR}/**/*.js`, (err, files) => {
  if (err) throw err;
  files.forEach(patchImportPath);
  console.log("✅ All relative imports patched for Node ESM");
});
