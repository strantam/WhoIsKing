import {Pipe, PipeTransform} from '@angular/core';
import {DecimalPipe} from "@angular/common";

@Pipe({
  name: 'minute'
})
export class MinutePipe implements PipeTransform {

  constructor(private decimalPipe: DecimalPipe) {
  }

  transform(millisec: number): string {
    const second = millisec / 1000;
    const hours = Math.floor((second / 3600));
    const minutes: number = Math.floor((second - (hours * 3600)) / 60);
    const seconds = Math.floor(second % 3600 % 60);
    return this.transformNumber(hours) + ':' + this.transformNumber(minutes) + ':' + this.transformNumber(seconds);
  }

  transformNumber(input: number): string {
    return this.decimalPipe.transform(input,'2.0-0')
  }

}
