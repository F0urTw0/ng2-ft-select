import {Component} from 'angular2/core';
import {CORE_DIRECTIVES, FORM_DIRECTIVES} from 'angular2/common';

import {NameListService} from '../../../shared/services/name-list.service';
import { FtInput } from '../../../shared/components/ft-input/ft-input';
import { SelectComponent } from '../../../ng2-ft-select/select';

@Component({
  selector: 'sd-single',
  moduleId: module.id,
  templateUrl: './single.component.html',
  styleUrls: ['./single.component.css'],
  directives: [FORM_DIRECTIVES, CORE_DIRECTIVES, FtInput, SelectComponent]
})
export class SingleCmp {
  public items:Array<string> = ['Amsterdam', 'Antwerp', 'Athens', 'Barcelona',
    'Berlin', 'Birmingham', 'Bradford', 'Bremen', 'Brussels', 'Bucharest',
    'Budapest', 'Cologne', 'Copenhagen', 'Dortmund', 'Dresden', 'Dublin',
    'Düsseldorf', 'Essen', 'Frankfurt', 'Genoa', 'Glasgow', 'Gothenburg',
    'Hamburg', 'Hannover', 'Helsinki', 'Kraków', 'Leeds', 'Leipzig', 'Lisbon',
    'London', 'Madrid', 'Manchester', 'Marseille', 'Milan', 'Munich', 'Málaga',
    'Naples', 'Palermo', 'Paris', 'Poznań', 'Prague', 'Riga', 'Rome',
    'Rotterdam', 'Seville', 'Sheffield', 'Sofia', 'Stockholm', 'Stuttgart',
    'The Hague', 'Turin', 'Valencia', 'Vienna', 'Vilnius', 'Warsaw', 'Wrocław',
    'Zagreb', 'Zaragoza', 'Łódź'];

  private value:any;
  private disabled:boolean;

  private newName: string;

  constructor(public nameListService: NameListService) {
    this.value = this.items.find((v)=> { return v === 'Genoa'; });
    this.disabled =false;
  }

  selected(value:any) {
    this.value = value;
    console.log('Selected value is: ', value);
  }

  teste(value:any) {
    console.log('value', value);
  }

  removed(value:any):void {
    console.log('Removed value is: ', value);
  }

  typed(value:any):void {
    console.log('New search input: ', value);
  }

  refreshValue(value:any):void {
    this.value = value;
  }

  /*
   * @param newname  any text as input.
   * @returns return false to prevent default form submit behavior to refresh the page.
   */
  addName(): boolean {
    this.nameListService.add(this.newName);
    this.newName = '';
    return false;
  }
}
