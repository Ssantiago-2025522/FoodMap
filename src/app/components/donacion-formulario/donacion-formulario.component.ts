import { Component, EventEmitter, Input, Output, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { DonacionService } from '../../services/donacion.service';
import { GeocodingService } from '../../services/geocoding.service';
import { Donacion, CategoriaDonacion, EstadoDonacion } from '../../models/donacion';

interface Pais {
  nombre: string;
  codigo: string;
}

@Component({
  selector: 'app-donacion-formulario',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './donacion-formulario.component.html',
  styleUrl: './donacion-formulario.component.css'
})
export class DonacionFormularioComponent implements OnInit {
  private fb = inject(FormBuilder);
  private donacionService = inject(DonacionService);
  private geocodingService = inject(GeocodingService);

  @Input() donacionEditar: Donacion | null = null;
  @Output() cerrar = new EventEmitter<void>();

  form!: FormGroup;
  cargandoUbicacion = false;
  modoEdicion = false;
  errorGuardado = '';
  imagenPreview: string = '';
  paisNombreSeleccionado: string = 'Guatemala';

  listaPaisesCompleta: Pais[] = [
    { nombre: 'Afganistán', codigo: 'af' },
    { nombre: 'Albania', codigo: 'al' },
    { nombre: 'Alemania', codigo: 'de' },
    { nombre: 'Andorra', codigo: 'ad' },
    { nombre: 'Angola', codigo: 'ao' },
    { nombre: 'Antigua y Barbuda', codigo: 'ag' },
    { nombre: 'Arabia Saudita', codigo: 'sa' },
    { nombre: 'Argelia', codigo: 'dz' },
    { nombre: 'Argentina', codigo: 'ar' },
    { nombre: 'Armenia', codigo: 'am' },
    { nombre: 'Australia', codigo: 'au' },
    { nombre: 'Austria', codigo: 'at' },
    { nombre: 'Azerbaiyán', codigo: 'az' },
    { nombre: 'Bahamas', codigo: 'bs' },
    { nombre: 'Bangladés', codigo: 'bd' },
    { nombre: 'Barbados', codigo: 'bb' },
    { nombre: 'Baréin', codigo: 'bh' },
    { nombre: 'Bélgica', codigo: 'be' },
    { nombre: 'Belice', codigo: 'bz' },
    { nombre: 'Benín', codigo: 'bj' },
    { nombre: 'Bielorrusia', codigo: 'by' },
    { nombre: 'Birmania (Myanmar)', codigo: 'mm' },
    { nombre: 'Bolivia', codigo: 'bo' },
    { nombre: 'Bosnia y Herzegovina', codigo: 'ba' },
    { nombre: 'Botsuana', codigo: 'bw' },
    { nombre: 'Brasil', codigo: 'br' },
    { nombre: 'Brunéi', codigo: 'bn' },
    { nombre: 'Bulgaria', codigo: 'bg' },
    { nombre: 'Burkina Faso', codigo: 'bf' },
    { nombre: 'Burundi', codigo: 'bi' },
    { nombre: 'Bután', codigo: 'bt' },
    { nombre: 'Cabo Verde', codigo: 'cv' },
    { nombre: 'Camboya', codigo: 'kh' },
    { nombre: 'Camerún', codigo: 'cm' },
    { nombre: 'Canadá', codigo: 'ca' },
    { nombre: 'Catar', codigo: 'qa' },
    { nombre: 'Chad', codigo: 'td' },
    { nombre: 'Chile', codigo: 'cl' },
    { nombre: 'China', codigo: 'cn' },
    { nombre: 'Chipre', codigo: 'cy' },
    { nombre: 'Ciudad del Vaticano', codigo: 'va' },
    { nombre: 'Colombia', codigo: 'co' },
    { nombre: 'Comoras', codigo: 'km' },
    { nombre: 'Corea del Norte', codigo: 'kp' },
    { nombre: 'Corea del Sur', codigo: 'kr' },
    { nombre: 'Costa de Marfil', codigo: 'ci' },
    { nombre: 'Costa Rica', codigo: 'cr' },
    { nombre: 'Croacia', codigo: 'hr' },
    { nombre: 'Cuba', codigo: 'cu' },
    { nombre: 'Dinamarca', codigo: 'dk' },
    { nombre: 'Dominica', codigo: 'dm' },
    { nombre: 'Ecuador', codigo: 'ec' },
    { nombre: 'Egipto', codigo: 'eg' },
    { nombre: 'El Salvador', codigo: 'sv' },
    { nombre: 'Emiratos Árabes Unidos', codigo: 'ae' },
    { nombre: 'Eritrea', codigo: 'er' },
    { nombre: 'Eslovaquia', codigo: 'sk' },
    { nombre: 'Eslovenia', codigo: 'si' },
    { nombre: 'España', codigo: 'es' },
    { nombre: 'Estados Unidos', codigo: 'us' },
    { nombre: 'Estonia', codigo: 'ee' },
    { nombre: 'Etiopía', codigo: 'et' },
    { nombre: 'Filipinas', codigo: 'ph' },
    { nombre: 'Finlandia', codigo: 'fi' },
    { nombre: 'Fiyi', codigo: 'fj' },
    { nombre: 'Francia', codigo: 'fr' },
    { nombre: 'Gabón', codigo: 'ga' },
    { nombre: 'Gambia', codigo: 'gm' },
    { nombre: 'Georgia', codigo: 'ge' },
    { nombre: 'Ghana', codigo: 'gh' },
    { nombre: 'Granada', codigo: 'gd' },
    { nombre: 'Grecia', codigo: 'gr' },
    { nombre: 'Guatemala', codigo: 'gt' },
    { nombre: 'Guinea', codigo: 'gn' },
    { nombre: 'Guinea-Bisáu', codigo: 'gw' },
    { nombre: 'Guinea Ecuatorial', codigo: 'gq' },
    { nombre: 'Guyana', codigo: 'gy' },
    { nombre: 'Haití', codigo: 'ht' },
    { nombre: 'Honduras', codigo: 'hn' },
    { nombre: 'Hungría', codigo: 'hu' },
    { nombre: 'India', codigo: 'in' },
    { nombre: 'Indonesia', codigo: 'id' },
    { nombre: 'Irak', codigo: 'iq' },
    { nombre: 'Irán', codigo: 'ir' },
    { nombre: 'Irlanda', codigo: 'ie' },
    { nombre: 'Islandia', codigo: 'is' },
    { nombre: 'Islas Marshall', codigo: 'mh' },
    { nombre: 'Islas Salomón', codigo: 'sb' },
    { nombre: 'Israel', codigo: 'il' },
    { nombre: 'Italia', codigo: 'it' },
    { nombre: 'Jamaica', codigo: 'jm' },
    { nombre: 'Japón', codigo: 'jp' },
    { nombre: 'Jordania', codigo: 'jo' },
    { nombre: 'Kazajistán', codigo: 'kz' },
    { nombre: 'Kenia', codigo: 'ke' },
    { nombre: 'Kirguistán', codigo: 'kg' },
    { nombre: 'Kiribati', codigo: 'ki' },
    { nombre: 'Kuwait', codigo: 'kw' },
    { nombre: 'Laos', codigo: 'la' },
    { nombre: 'Lesoto', codigo: 'ls' },
    { nombre: 'Letonia', codigo: 'lv' },
    { nombre: 'Líbano', codigo: 'lb' },
    { nombre: 'Liberia', codigo: 'lr' },
    { nombre: 'Libia', codigo: 'ly' },
    { nombre: 'Liechtenstein', codigo: 'li' },
    { nombre: 'Lituania', codigo: 'lt' },
    { nombre: 'Luxemburgo', codigo: 'lu' },
    { nombre: 'Macedonia del Norte', codigo: 'mk' },
    { nombre: 'Madagascar', codigo: 'mg' },
    { nombre: 'Malasia', codigo: 'my' },
    { nombre: 'Malaui', codigo: 'mw' },
    { nombre: 'Maldivas', codigo: 'mv' },
    { nombre: 'Malí', codigo: 'ml' },
    { nombre: 'Malta', codigo: 'mt' },
    { nombre: 'Marruecos', codigo: 'ma' },
    { nombre: 'Mauricio', codigo: 'mu' },
    { nombre: 'Mauritania', codigo: 'mr' },
    { nombre: 'México', codigo: 'mx' },
    { nombre: 'Micronesia', codigo: 'fm' },
    { nombre: 'Moldavia', codigo: 'md' },
    { nombre: 'Mónaco', codigo: 'mc' },
    { nombre: 'Mongolia', codigo: 'mn' },
    { nombre: 'Montenegro', codigo: 'me' },
    { nombre: 'Mozambique', codigo: 'mz' },
    { nombre: 'Namibia', codigo: 'na' },
    { nombre: 'Nauru', codigo: 'nr' },
    { nombre: 'Nepal', codigo: 'np' },
    { nombre: 'Nicaragua', codigo: 'ni' },
    { nombre: 'Níger', codigo: 'ne' },
    { nombre: 'Nigeria', codigo: 'ng' },
    { nombre: 'Noruega', codigo: 'no' },
    { nombre: 'Nueva Zelanda', codigo: 'nz' },
    { nombre: 'Omán', codigo: 'om' },
    { nombre: 'Países Bajos', codigo: 'nl' },
    { nombre: 'Pakistán', codigo: 'pk' },
    { nombre: 'Palaos', codigo: 'pw' },
    { nombre: 'Palestina', codigo: 'ps' },
    { nombre: 'Panamá', codigo: 'pa' },
    { nombre: 'Papúa Nueva Guinea', codigo: 'pg' },
    { nombre: 'Paraguay', codigo: 'py' },
    { nombre: 'Perú', codigo: 'pe' },
    { nombre: 'Polonia', codigo: 'pl' },
    { nombre: 'Portugal', codigo: 'pt' },
    { nombre: 'Reino Unido', codigo: 'gb' },
    { nombre: 'República Centroafricana', codigo: 'cf' },
    { nombre: 'República Checa', codigo: 'cz' },
    { nombre: 'República del Congo', codigo: 'cg' },
    { nombre: 'República Democrática del Congo', codigo: 'cd' },
    { nombre: 'República Dominicana', codigo: 'do' },
    { nombre: 'Ruanda', codigo: 'rw' },
    { nombre: 'Rumanía', codigo: 'ro' },
    { nombre: 'Rusia', codigo: 'ru' },
    { nombre: 'Samoa', codigo: 'ws' },
    { nombre: 'San Cristóbal y Nieves', codigo: 'kn' },
    { nombre: 'San Marino', codigo: 'sm' },
    { nombre: 'San Vicente y las Granadinas', codigo: 'vc' },
    { nombre: 'Santa Lucía', codigo: 'lc' },
    { nombre: 'Santo Tomé y Príncipe', codigo: 'st' },
    { nombre: 'Senegal', codigo: 'sn' },
    { nombre: 'Serbia', codigo: 'rs' },
    { nombre: 'Seychelles', codigo: 'sc' },
    { nombre: 'Sierra Leona', codigo: 'sl' },
    { nombre: 'Singapur', codigo: 'sg' },
    { nombre: 'Siria', codigo: 'sy' },
    { nombre: 'Somalia', codigo: 'so' },
    { nombre: 'Sri Lanka', codigo: 'lk' },
    { nombre: 'Suazilandia (Esuatini)', codigo: 'sz' },
    { nombre: 'Sudáfrica', codigo: 'za' },
    { nombre: 'Sudán', codigo: 'sd' },
    { nombre: 'Sudán del Sur', codigo: 'ss' },
    { nombre: 'Suecia', codigo: 'se' },
    { nombre: 'Suiza', codigo: 'ch' },
    { nombre: 'Surinam', codigo: 'sr' },
    { nombre: 'Tailandia', codigo: 'th' },
    { nombre: 'Tanzania', codigo: 'tz' },
    { nombre: 'Tayikistán', codigo: 'tj' },
    { nombre: 'Timor Oriental', codigo: 'tl' },
    { nombre: 'Togo', codigo: 'tg' },
    { nombre: 'Tonga', codigo: 'to' },
    { nombre: 'Trinidad y Tobago', codigo: 'tt' },
    { nombre: 'Túnez', codigo: 'tn' },
    { nombre: 'Turkmenistán', codigo: 'tm' },
    { nombre: 'Turquía', codigo: 'tr' },
    { nombre: 'Tuvalu', codigo: 'tv' },
    { nombre: 'Ucrani', codigo: 'ua' },
    { nombre: 'Uganda', codigo: 'ug' },
    { nombre: 'Uruguay', codigo: 'uy' },
    { nombre: 'Uzbekistán', codigo: 'uz' },
    { nombre: 'Vanuatu', codigo: 'vu' },
    { nombre: 'Venezuela', codigo: 've' },
    { nombre: 'Vietnam', codigo: 'vn' },
    { nombre: 'Yemen', codigo: 'ye' },
    { nombre: 'Yibuti', codigo: 'dj' },
    { nombre: 'Zambia', codigo: 'zm' },
    { nombre: 'Zimbabue', codigo: 'zw' }
  ];

  categorias: CategoriaDonacion[] = [
    'Frutas', 
    'Verduras', 
    'Lácteos', 
    'Pan', 
    'Comida preparada', 
    'Bebidas'
  ];

  estados: EstadoDonacion[] = [
    'Disponible', 
    'Reservada', 
    'Entregada', 
    'Expirada'
  ];

  ngOnInit(): void {
    this.modoEdicion = !!this.donacionEditar;
    this.imagenPreview = (this.donacionEditar as any)?.imagen || this.donacionEditar?.imagenUrl || '';

    this.form = this.fb.group({
      titulo: [this.donacionEditar?.titulo || '', Validators.required],
      descripcion: [this.donacionEditar?.descripcion || '', Validators.required],
      imagenUrl: [this.imagenPreview],
      categoria: [this.donacionEditar?.categoria || 'Comida preparada', Validators.required],
      cantidad: [this.donacionEditar?.cantidad || 1, [Validators.required, Validators.min(1)]],
      codigoPais: ['gt', Validators.required],
      ubicacion: [this.donacionEditar?.ubicacion || '', Validators.required],
      fechaExpiracion: [this.donacionEditar?.fechaExpiracion || '', Validators.required],
      estado: [this.donacionEditar?.estado || 'Disponible']
    });
  }

  onPaisInput(event: Event): void {
    const inputElement = event.target as HTMLInputElement;
    const textoIngresado = inputElement.value;
    this.paisNombreSeleccionado = textoIngresado;

    const paisEncontrado = this.listaPaisesCompleta.find(
      p => p.nombre.toLowerCase() === textoIngresado.trim().toLowerCase()
    );

    if (paisEncontrado) {
      this.form.patchValue({ codigoPais: paisEncontrado.codigo });
    } else {
      this.form.patchValue({ codigoPais: textoIngresado.toLowerCase() });
    }
  }

  /** Convertir archivo local a cadena Base64 */
  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const archivo = input.files[0];
      const reader = new FileReader();

      reader.onload = () => {
        const base64String = reader.result as string;
        this.imagenPreview = base64String;
        this.form.patchValue({ imagenUrl: base64String });
      };

      reader.readAsDataURL(archivo);
    }
  }

  async guardar(): Promise<void> {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.cargandoUbicacion = true;
    this.errorGuardado = '';
    const datos = this.form.value;

    let latitud = 14.6349;
    let longitud = -90.5069;

    try {
      const coords = await this.geocodingService.obtenerCoordenadas(
        datos.ubicacion, 
        datos.codigoPais
      );
      if (coords && coords.latitud && coords.longitud) {
        latitud = coords.latitud;
        longitud = coords.longitud;
      }
    } catch (e) {
      console.warn('No se pudo geocodificar la ubicación, usando coordenadas por defecto.', e);
    }

    const imagenAEnviar = datos.imagenUrl || this.imagenPreview || null;

    const payloadDonacion: any = {
      titulo: datos.titulo,
      descripcion: datos.descripcion,
      imagen: imagenAEnviar,
      categoria: datos.categoria,
      cantidad: datos.cantidad,
      ubicacion: datos.ubicacion,
      fechaExpiracion: datos.fechaExpiracion,
      estado: datos.estado,
      latitud: latitud,
      longitud: longitud
    };

    try {
      if (this.modoEdicion && this.donacionEditar) {
        await this.donacionService.actualizarDonacion(this.donacionEditar.id, payloadDonacion);
      } else {
        await this.donacionService.crearDonacion(payloadDonacion);
      }

      this.cerrar.emit();
    } catch (error) {
      console.error('Error al guardar la donación:', error);
      this.errorGuardado =
        (error as any)?.error?.message ||
        'No se pudo guardar la donación. Verifica los datos e inténtalo de nuevo.';
    } finally {
      this.cargandoUbicacion = false;
    }
  }

  cancelar(): void {
    this.cerrar.emit();
  }
}