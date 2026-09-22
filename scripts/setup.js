const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { spawnSync } = require('child_process');

const backend = path.join(__dirname, '..', 'backend');
const archivoEnv = path.join(backend, '.env');
const archivoEjemplo = path.join(backend, '.env.example');
const forzarInstalacion = process.argv.includes('--install');

function crearEnv() {
  if (fs.existsSync(archivoEnv) || !fs.existsSync(archivoEjemplo)) {
    return;
  }

  const secreto = crypto.randomBytes(48).toString('hex');
  const contenido = fs
    .readFileSync(archivoEjemplo, 'utf8')
    .replace(/^JWT_SECRET=.*$/m, `JWT_SECRET=${secreto}`);

  fs.writeFileSync(archivoEnv, contenido);
  console.log('[setup] Se creó backend/.env. Si tu MySQL usa contraseña, edita DB_PASSWORD.');
}

function instalarBackend() {
  const instalado = fs.existsSync(path.join(backend, 'node_modules'));
  if (instalado && !forzarInstalacion) {
    return;
  }

  console.log('[setup] Instalando dependencias del backend...');
  const resultado = spawnSync('npm install --no-audit --no-fund', {
    cwd: backend,
    stdio: 'inherit',
    shell: true
  });

  if (resultado.status !== 0) {
    console.error('[setup] No se pudieron instalar las dependencias del backend.');
    process.exit(resultado.status || 1);
  }
}

crearEnv();
instalarBackend();
