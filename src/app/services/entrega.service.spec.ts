import { EntregaService } from './entrega.service';

describe('EntregaService', () => {
  it('debe buscar una entrega aunque el ID venga con espacios', () => {
    const service = new EntregaService();
    const entrega = service.crear('donador-1', 'beneficiario-1', 'Comida para reparto');

    expect(service.obtenerPorId(`  ${entrega.id}  `)).toEqual(entrega);
  });
});
