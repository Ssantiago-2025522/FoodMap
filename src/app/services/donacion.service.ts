import { Injectable, signal, computed } from '@angular/core';
import { Donacion, CategoriaDonacion, EstadoDonacion, FiltrosDonacion } from '../models/donacion';

@Injectable({
  providedIn: 'root'
})
export class DonacionService {
  private readonly STORAGE_KEY = 'foodmap_donaciones';

  private donacionesSignal = signal<Donacion[]>(this.cargarStorage());
  private filtrosSignal = signal<FiltrosDonacion>({
    busqueda: '',
    categoria: 'Todas',
    estado: 'Todos'
  });

  readonly donacionesFiltradas = computed(() => {
    const lista = this.donacionesSignal();
    const { busqueda, categoria, estado } = this.filtrosSignal();
    const hoy = new Date().toISOString().split('T')[0];

    return lista.map(donacion => {
      if (donacion.estado === 'Disponible' && donacion.fechaExpiracion < hoy) {
        return { ...donacion, estado: 'Expirada' as EstadoDonacion };
      }
      return donacion;
    }).filter(donacion => {
      const coincideBusqueda = !busqueda || 
        donacion.titulo.toLowerCase().includes(busqueda.toLowerCase()) ||
        donacion.descripcion.toLowerCase().includes(busqueda.toLowerCase()) ||
        donacion.ubicacion.toLowerCase().includes(busqueda.toLowerCase());

      const coincideCategoria = !categoria || categoria === 'Todas' || donacion.categoria === categoria;
      const coincideEstado = !estado || estado === 'Todos' || donacion.estado === estado;

      return coincideBusqueda && coincideCategoria && coincideEstado;
    });
  });

  constructor() {
    if (this.donacionesSignal().length === 0) {
      this.cargarDatosIniciales();
    }
  }

  obtenerDonaciones(): Donacion[] {
    return this.donacionesFiltradas();
  }

  obtenerPorId(id: string): Donacion | undefined {
    return this.donacionesSignal().find(d => d.id === id);
  }

  crearDonacion(datos: Omit<Donacion, 'id' | 'fechaCreacion' | 'estado'>): Donacion {
    const nuevaDonacion: Donacion = {
      ...datos,
      id: crypto.randomUUID(),
      estado: 'Disponible',
      fechaCreacion: new Date().toISOString()
    };

    const actualizadas = [nuevaDonacion, ...this.donacionesSignal()];
    this.actualizarEstado(actualizadas);
    return nuevaDonacion;
  }

  actualizarDonacion(id: string, campos: Partial<Donacion>): void {
    const actualizadas = this.donacionesSignal().map(d => 
      d.id === id ? { ...d, ...campos } : d
    );
    this.actualizarEstado(actualizadas);
  }

  eliminarDonacion(id: string): void {
    const actualizadas = this.donacionesSignal().filter(d => d.id !== id);
    this.actualizarEstado(actualizadas);
  }

  cambiarEstado(id: string, estado: EstadoDonacion): void {
    this.actualizarDonacion(id, { estado });
  }

  aplicarFiltros(filtros: Partial<FiltrosDonacion>): void {
    this.filtrosSignal.update(actual => ({ ...actual, ...filtros }));
  }

  private actualizarEstado(donaciones: Donacion[]): void {
    this.donacionesSignal.set(donaciones);
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(donaciones));
  }

  private cargarStorage(): Donacion[] {
    const datos = localStorage.getItem(this.STORAGE_KEY);
    return datos ? JSON.parse(datos) : [];
  }

  private cargarDatosIniciales(): void {
    const iniciales: Donacion[] = [
      {
        id: '1',
        titulo: 'Caja de Manzanas',
        descripcion: 'Manzanas frescas de huerto local.',
        categoria: 'Frutas',
        cantidad: 10,
        estado: 'Disponible',
        ubicacion: 'Parque Central',
        latitud: 14.6349,
        longitud: -90.5069,
        fechaCreacion: new Date().toISOString(),
        fechaExpiracion: '2026-10-15'
      }
    ];
    this.actualizarEstado(iniciales);
  }
}