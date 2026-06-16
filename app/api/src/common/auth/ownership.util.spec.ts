import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { assertResourceExists, assertResourceOwner } from './ownership.util';

describe('ownership.util', () => {
  describe('assertResourceOwner', () => {
    it('does nothing when the resource belongs to the user', () => {
      expect(() => assertResourceOwner('user-1', 'user-1')).not.toThrow();
    });

    it('throws ForbiddenException when the resource belongs to another user', () => {
      expect(() => assertResourceOwner('user-1', 'user-2', 'Task')).toThrow(
        ForbiddenException,
      );
    });
  });

  describe('assertResourceExists', () => {
    it('returns the resource when present', () => {
      const resource = { id: '1' };
      expect(assertResourceExists(resource, 'Task')).toBe(resource);
    });

    it('throws NotFoundException for null', () => {
      expect(() => assertResourceExists(null, 'Task')).toThrow(
        NotFoundException,
      );
    });

    it('throws NotFoundException for undefined', () => {
      expect(() => assertResourceExists(undefined, 'Task')).toThrow(
        NotFoundException,
      );
    });
  });
});
