import { ForbiddenException, NotFoundException } from '@nestjs/common';

export function assertResourceOwner(
  resourceUserId: string,
  requestUserId: string,
  label = 'Resource',
) {
  if (resourceUserId !== requestUserId) {
    throw new ForbiddenException(
      `${label} does not belong to the current user.`,
    );
  }
}

export function assertResourceExists<T>(
  resource: T | null | undefined,
  label = 'Resource',
): T {
  if (!resource) {
    throw new NotFoundException(`${label} not found.`);
  }
  return resource;
}
