import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'percentTransform',
  standalone: true
})
export class PercentTransformPipe implements PipeTransform {
  transform(value: number | null, mode: 'display' | 'store'): number | null {
    if (value === null || value === undefined) {
      return null;
    }
    if (mode === 'display') {
      // Chuyển từ thập phân (0.1) sang phần trăm (10)
      return value * 100;
    } else {
      // Chuyển từ phần trăm (10) sang thập phân (0.1)
      return value / 100;
    }
  }
}