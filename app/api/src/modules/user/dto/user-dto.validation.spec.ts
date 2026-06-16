import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { CreateUserDto } from './create-user.dto';
import { UpdateUserDto } from './update-user.dto';

async function validateDto<T extends object>(dto: T) {
  return validate(dto, { whitelist: true, forbidNonWhitelisted: true });
}

describe('CreateUserDto', () => {
  const validPayload = {
    name: 'Guilherme',
    email: 'gui@example.com',
    password: 'super-secret-1',
    cpf: '12345678901',
  };

  it('accepts a valid payload', async () => {
    const dto = plainToInstance(CreateUserDto, validPayload);
    expect(await validateDto(dto)).toHaveLength(0);
  });

  it('rejects passwords below 8 characters', async () => {
    const dto = plainToInstance(CreateUserDto, {
      ...validPayload,
      password: '1234567',
    });
    const errors = await validateDto(dto);
    expect(errors.some((e) => e.property === 'password')).toBe(true);
  });

  it('rejects malformed CPFs', async () => {
    const dto = plainToInstance(CreateUserDto, { ...validPayload, cpf: '123' });
    const errors = await validateDto(dto);
    expect(errors.some((e) => e.property === 'cpf')).toBe(true);
  });

  it('rejects invalid emails', async () => {
    const dto = plainToInstance(CreateUserDto, {
      ...validPayload,
      email: 'not-an-email',
    });
    const errors = await validateDto(dto);
    expect(errors.some((e) => e.property === 'email')).toBe(true);
  });

  it('rejects privileged fields like isAdmin (mass assignment)', async () => {
    const dto = plainToInstance(CreateUserDto, {
      ...validPayload,
      isAdmin: true,
    });
    const errors = await validateDto(dto);
    expect(errors.some((e) => e.property === 'isAdmin')).toBe(true);
  });
});

describe('UpdateUserDto', () => {
  it('accepts a partial update', async () => {
    const dto = plainToInstance(UpdateUserDto, { name: 'Novo Nome' });
    expect(await validateDto(dto)).toHaveLength(0);
  });

  it('rejects totalBalance/disciplineLevel/passwordHash (mass assignment)', async () => {
    const dto = plainToInstance(UpdateUserDto, {
      totalBalance: 999999,
      disciplineLevel: 100,
      passwordHash: 'hacked',
    });
    const errors = await validateDto(dto);
    const offending = errors.map((e) => e.property);
    expect(offending).toEqual(
      expect.arrayContaining([
        'totalBalance',
        'disciplineLevel',
        'passwordHash',
      ]),
    );
  });

  it('rejects negative monthlyIncome', async () => {
    const dto = plainToInstance(UpdateUserDto, { monthlyIncome: -10 });
    const errors = await validateDto(dto);
    expect(errors.some((e) => e.property === 'monthlyIncome')).toBe(true);
  });
});
