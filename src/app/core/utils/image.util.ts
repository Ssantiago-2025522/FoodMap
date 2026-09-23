const TAMANO_MAXIMO_PX = 400;
const CALIDAD_JPEG = 0.85;

/**
 * Lee un archivo de imagen, lo redimensiona (máx. 400x400) y lo comprime a JPEG,
 * devolviendo un data URL en base64 listo para guardar como foto de perfil.
 */
export function archivoAFotoPerfil(archivo: File): Promise<string> {
  return new Promise((resolve, reject) => {
    if (!archivo.type.startsWith('image/')) {
      reject(new Error('El archivo seleccionado no es una imagen.'));
      return;
    }

    const lector = new FileReader();

    lector.onerror = () => reject(new Error('No se pudo leer la imagen seleccionada.'));

    lector.onload = () => {
      const imagen = new Image();

      imagen.onerror = () => reject(new Error('El archivo seleccionado no es una imagen válida.'));

      imagen.onload = () => {
        const escala = Math.min(1, TAMANO_MAXIMO_PX / Math.max(imagen.width, imagen.height));
        const ancho = Math.round(imagen.width * escala);
        const alto = Math.round(imagen.height * escala);

        const canvas = document.createElement('canvas');
        canvas.width = ancho;
        canvas.height = alto;

        const contexto = canvas.getContext('2d');
        if (!contexto) {
          reject(new Error('No se pudo procesar la imagen.'));
          return;
        }

        contexto.drawImage(imagen, 0, 0, ancho, alto);
        resolve(canvas.toDataURL('image/jpeg', CALIDAD_JPEG));
      };

      imagen.src = lector.result as string;
    };

    lector.readAsDataURL(archivo);
  });
}
