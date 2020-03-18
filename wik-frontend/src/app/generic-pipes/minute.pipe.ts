import {Pipe, PipeTransform} from '@angular/core';

@Pipe({
  name: 'minute'
})
export class MinutePipe implements PipeTransform {

  transform(millisec: number): string {
    const second = millisec / 1000;
    const hours = Math.floor((second / 3600));
    const minutes: number = Math.floor((second / 60) / 60);
    const seconds = Math.floor(second % 3600 % 60);
    return hours + ':' + minutes + ':' + seconds;
  }

}
