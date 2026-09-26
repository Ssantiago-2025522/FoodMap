import { Injectable, signal, computed, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { environment } from '@env/environment';
import { Donacion, CategoriaDonacion, EstadoDonacion, FiltrosDonacion } from '../models/donacion';

@Injectable({
  providedIn: 'root'
})
export class DonacionService {
  private readonly API_URL = `${environment.apiUrl}/donaciones`;
  private http = inject(HttpClient);

  private donacionesSignal = signal<Donacion[]>([]);
  private filtrosSignal = signal<FiltrosDonacion>({
    busqueda: '',
    categoria: 'Todas',
    estado: 'Todos'
  });

  private cargandoSignal = signal(false);
  private errorSignal = signal<string | null>(null);

  readonly cargando = this.cargandoSignal.asReadonly();
  readonly error = this.errorSignal.asReadonly();

  readonly donaciones = this.donacionesSignal.asReadonly();

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
    this.cargarDonaciones();
  }

  private obtenerOptions() {
    const token = localStorage.getItem('token');
    if (!token) return {};
    return {
      headers: new HttpHeaders({
        'Authorization': `Bearer ${token}`
      })
    };
  }

  async cargarDonaciones(): Promise<void> {
    this.cargandoSignal.set(true);
    this.errorSignal.set(null);

    try {
      const donaciones = await firstValueFrom(
        this.http.get<Donacion[]>(this.API_URL, this.obtenerOptions())
      );
      this.donacionesSignal.set(donaciones || []);
    } catch (error) {
      console.error('Error al cargar donaciones:', error);
      this.errorSignal.set('No se pudieron cargar las donaciones desde el servidor.');
    } finally {
      this.cargandoSignal.set(false);
    }
  }

  obtenerDonaciones(): Donacion[] {
    return this.donacionesFiltradas();
  }

  obtenerPorId(id: string): Donacion | undefined {
    return this.donacionesSignal().find(d => d.id === id);
  }

  async crearDonacion(datos: Omit<Donacion, 'id' | 'fechaCreacion' | 'estado'>): Promise<Donacion> {
    const nuevaDonacion = await firstValueFrom(
      this.http.post<Donacion>(this.API_URL, datos, this.obtenerOptions())
    );
    this.donacionesSignal.update(lista => [nuevaDonacion, ...lista]);
    return nuevaDonacion;
  }

  async actualizarDonacion(id: string, campos: Partial<Donacion>): Promise<void> {
    const actualizada = await firstValueFrom(
      this.http.put<Donacion>(`${this.API_URL}/${id}`, campos, this.obtenerOptions())
    );
    this.donacionesSignal.update(lista => lista.map(d => (d.id === id ? actualizada : d)));
  }

  async eliminarDonacion(id: string): Promise<void> {
    await firstValueFrom(
      this.http.delete<void>(`${this.API_URL}/${id}`, this.obtenerOptions())
    );
    this.donacionesSignal.update(lista => lista.filter(d => d.id !== id));
  }

  async cambiarVisibilidad(id: string, oculta: boolean): Promise<Donacion> {
    const actualizada = await firstValueFrom(
      this.http.patch<Donacion>(`${this.API_URL}/${id}/visibilidad`, { oculta }, this.obtenerOptions())
    );
    this.donacionesSignal.update(lista => lista.map(d => (d.id === id ? actualizada : d)));
    return actualizada;
  }

  cambiarEstado(id: string, estado: EstadoDonacion): void {
    this.actualizarDonacion(id, { estado }).catch(error => {
      console.error('Error al cambiar el estado de la donación:', error);
    });
  }

  aplicarFiltros(filtros: Partial<FiltrosDonacion>): void {
    this.filtrosSignal.update(actual => ({ ...actual, ...filtros }));
  }
}