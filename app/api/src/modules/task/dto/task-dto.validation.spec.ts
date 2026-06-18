import 'reflect-metadata';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { CreateTaskDto, CreateTasksBulkDto, UpdateTaskDto } from './task.dto';

async function validateDto<T extends object>(dto: T) {
  return validate(dto, { whitelist: true, forbidNonWhitelisted: true });
}

describe('CreateTaskDto', () => {
  const valid = { weekday: 2, title: 'Treinar costas', scheduledAt: '18:30' };

  it('accepts a valid payload', async () => {
    const dto = plainToInstance(CreateTaskDto, valid);
    expect(await validateDto(dto)).toHaveLength(0);
  });

  it('rejects weekday outside 0-6', async () => {
    const dto = plainToInstance(CreateTaskDto, { ...valid, weekday: 7 });
    const errors = await validateDto(dto);
    expect(errors.some((e) => e.property === 'weekday')).toBe(true);
  });

  it('rejects scheduledAt that is not HH:mm', async () => {
    const dto = plainToInstance(CreateTaskDto, {
      ...valid,
      scheduledAt: 'tomorrow',
    });
    const errors = await validateDto(dto);
    expect(errors.some((e) => e.property === 'scheduledAt')).toBe(true);
  });

  it('rejects a userId injected in the body (mass assignment)', async () => {
    const dto = plainToInstance(CreateTaskDto, {
      ...valid,
      userId: 'someone-else',
    });
    const errors = await validateDto(dto);
    expect(errors.some((e) => e.property === 'userId')).toBe(true);
  });
});

describe('CreateTasksBulkDto', () => {
  it('validates nested task items', async () => {
    const dto = plainToInstance(CreateTasksBulkDto, {
      weekday: 1,
      tasks: [
        {
          title: '',
          scheduledAt: 'xx',
          sourceType: 'WORKOUT',
          sourceId: 'abc',
        },
      ],
    });
    const errors = await validateDto(dto);
    expect(errors.some((e) => e.property === 'tasks')).toBe(true);
  });

  it('accepts a valid bulk payload', async () => {
    const dto = plainToInstance(CreateTasksBulkDto, {
      weekday: 1,
      tasks: [
        {
          title: 'Meal: Lunch',
          scheduledAt: '12:00',
          sourceType: 'DIET_MEAL',
          sourceId: 'meal-1',
        },
      ],
    });
    expect(await validateDto(dto)).toHaveLength(0);
  });
});

describe('UpdateTaskDto', () => {
  it('accepts partial updates', async () => {
    const dto = plainToInstance(UpdateTaskDto, { isActive: false });
    expect(await validateDto(dto)).toHaveLength(0);
  });

  it('rejects empty titles', async () => {
    const dto = plainToInstance(UpdateTaskDto, { title: '' });
    const errors = await validateDto(dto);
    expect(errors.some((e) => e.property === 'title')).toBe(true);
  });
});
