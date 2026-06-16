import { BadRequestException, Injectable, PipeTransform } from '@nestjs/common';

/** Validates and converts a weekday route/query param to an integer 0-6. */
@Injectable()
export class ParseWeekdayPipe implements PipeTransform<unknown, number> {
  transform(value: unknown): number {
    const weekday = Number(value);
    if (!Number.isInteger(weekday) || weekday < 0 || weekday > 6) {
      throw new BadRequestException(
        'weekday must be an integer between 0 and 6.',
      );
    }
    return weekday;
  }
}
