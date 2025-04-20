import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'yshDate'
})
export class YshDatePipe implements PipeTransform {

  transform(dt: Date): string {
    const year = dt.getFullYear();
    const month = String(dt.getMonth() + 1).padStart(2, '0'); // Months are 0-indexed, so add 1
    const day = String(dt.getDate()).padStart(2, '0');
    const hours = String(dt.getHours()).padStart(2, '0');
    const minutes = String(dt.getMinutes()).padStart(2, '0');

    return `${year}-${month}-${day}T${hours}:${minutes}`;
  }

}
