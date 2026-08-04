import { hashPassword, comparePassword } from '../src/utils/password';

describe('utils/password', () => {
  it('genera un hash distinto al texto plano', async () => {
    const plain = 'MiPassword123';
    const hash = await hashPassword(plain);
    expect(hash).not.toBe(plain);
  });

  it('valida correctamente una contraseña correcta', async () => {
    const plain = 'MiPassword123';
    const hash = await hashPassword(plain);
    const isValid = await comparePassword(plain, hash);
    expect(isValid).toBe(true);
  });

  it('rechaza una contraseña incorrecta', async () => {
    const hash = await hashPassword('MiPassword123');
    const isValid = await comparePassword('OtraPassword456', hash);
    expect(isValid).toBe(false);
  });
});
