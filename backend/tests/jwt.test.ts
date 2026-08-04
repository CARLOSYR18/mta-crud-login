import { parseDurationToMs, hashToken } from '../src/utils/jwt';

describe('utils/jwt', () => {
  it('convierte duraciones a milisegundos correctamente', () => {
    expect(parseDurationToMs('15m')).toBe(15 * 60 * 1000);
    expect(parseDurationToMs('7d')).toBe(7 * 24 * 60 * 60 * 1000);
    expect(parseDurationToMs('30s')).toBe(30 * 1000);
  });

  it('lanza un error con formato inválido', () => {
    expect(() => parseDurationToMs('abc')).toThrow();
  });

  it('genera siempre el mismo hash para el mismo token', () => {
    const token = 'ejemplo.de.token';
    expect(hashToken(token)).toBe(hashToken(token));
  });

  it('genera hashes distintos para tokens distintos', () => {
    expect(hashToken('token-a')).not.toBe(hashToken('token-b'));
  });
});
