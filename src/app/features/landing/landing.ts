import {
  AfterViewInit,
  Component,
  ElementRef,
  OnDestroy,
  QueryList,
  ViewChildren
} from '@angular/core';
import { NgClass } from '@angular/common';
import { RouterLink } from '@angular/router';

interface Paso {
  numero: string;
  titulo: string;
  descripcion: string;
  icono: string;
}

interface Caracteristica {
  icono: string;
  titulo: string;
  descripcion: string;
  color: 'naranja' | 'verde' | 'rosa' | 'azul' | 'morado' | 'menta';
}

interface Testimonio {
  iniciales: string;
  nombre: string;
  rol: string;
  cita: string;
  color: 'verde' | 'naranja' | 'rosa';
}

interface ActividadEnVivo {
  nombre: string;
  detalle: string;
  hace: string;
  color: 'verde' | 'naranja' | 'azul';
}

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [RouterLink, NgClass],
  templateUrl: './landing.html',
  styleUrl: './landing.css'
})
export class Landing implements AfterViewInit, OnDestroy {
  @ViewChildren('reveal') private secciones!: QueryList<ElementRef<HTMLElement>>;

  private observer?: IntersectionObserver;

  readonly pasos: Paso[] = [
    {
      numero: '01',
      icono: 'paquete',
      titulo: 'El establecimiento publica',
      descripcion:
        'Un restaurante, supermercado o catering registra en segundos el excedente disponible: tipo de alimento, cantidad y ventana de recogida.'
    },
    {
      numero: '02',
      icono: 'mapa',
      titulo: 'FoodMap conecta',
      descripcion:
        'El algoritmo notifica automáticamente a organizaciones benéficas, bancos de alimentos y voluntarios verificados en Guatemala en un radio de 5 km.'
    },
    {
      numero: '03',
      icono: 'corazon',
      titulo: 'El alimento llega a quien lo necesita',
      descripcion:
        'Se coordina la recogida, se valida la seguridad alimentaria y el impacto queda registrado para el historial de todos los participantes.'
    }
  ];

  readonly caracteristicas: Caracteristica[] = [
    {
      icono: 'rayo',
      color: 'naranja',
      titulo: 'Publicación Instantánea',
      descripcion:
        'Los establecimientos publican excedentes en segundos. La plataforma clasifica y distribuye la alerta automáticamente.'
    },
    {
      icono: 'campana',
      color: 'verde',
      titulo: 'Notificaciones en Tiempo Real',
      descripcion:
        'Las organizaciones y voluntarios cercanos reciben alertas inmediatas con toda la información necesaria.'
    },
    {
      icono: 'pin',
      color: 'rosa',
      titulo: 'Geolocalización',
      descripcion:
        'Mapa interactivo que muestra excedentes disponibles y conecta con la red más cercana de manera óptima.'
    },
    {
      icono: 'escudo',
      color: 'azul',
      titulo: 'Validación de Seguridad',
      descripcion:
        'Sistema de verificación que garantiza la trazabilidad, calidad y seguridad alimentaria de cada donación.'
    },
    {
      icono: 'grafico',
      color: 'morado',
      titulo: 'Historial y Estadísticas',
      descripcion:
        'Panel de control con métricas de impacto: kilos salvados, CO₂ evitado y personas beneficiadas.'
    },
    {
      icono: 'usuarios',
      color: 'menta',
      titulo: 'Perfiles Diferenciados',
      descripcion:
        'Interfaz adaptada para establecimientos, organizaciones benéficas, bancos de alimentos y voluntarios.'
    }
  ];

  readonly testimonios: Testimonio[] = [
    {
      iniciales: 'MG',
      nombre: 'María González',
      rol: 'Directora, Banco de Alimentos de Guatemala',
      cita:
        'FoodMap transformó nuestra capacidad operativa. Antes dependíamos de llamadas telefónicas; ahora gestionamos 40 recogidas diarias con cero fricción.',
      color: 'verde'
    },
    {
      iniciales: 'CF',
      nombre: 'Carlos Fernández',
      rol: 'Chef propietario, Restaurante La Fonda, Zona 10',
      cita:
        'Antes tiraba 15 kg de comida cada noche. Con FoodMap esos alimentos llegan a familias necesitadas y tengo el certificado para demostrar mi impacto.',
      color: 'naranja'
    },
    {
      iniciales: 'AR',
      nombre: 'Ana Ruiz',
      rol: 'Voluntaria activa, Villa Nueva',
      cita:
        'La app es tan sencilla que empecé a contribuir el mismo día que me registré. En 3 meses llevo 89 kg de alimentos rescatados. Es adictivo hacer el bien.',
      color: 'rosa'
    }
  ];

  readonly actividad: ActividadEnVivo[] = [
    { nombre: 'Panadería Don Luis, Zona 1', detalle: '8 kg de pan', hace: 'hace 3 min', color: 'verde' },
    { nombre: 'Café Baviera, Zona 10', detalle: '6 kg de repostería', hace: 'hace 11 min', color: 'naranja' },
    { nombre: 'Pollo Campero Miraflores', detalle: '12 kg de pollo', hace: 'hace 19 min', color: 'azul' }
  ];

  ngAfterViewInit(): void {
    this.observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.classList.add('es-visible');
            this.observer?.unobserve(entry.target);
          }
        }
      },
      { threshold: 0.15, rootMargin: '0px 0px -60px 0px' }
    );

    this.secciones.forEach((seccion) => this.observer?.observe(seccion.nativeElement));
  }

  ngOnDestroy(): void {
    this.observer?.disconnect();
  }
}
