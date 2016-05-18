import {Component} from 'angular2/core';
import {CORE_DIRECTIVES, FORM_DIRECTIVES} from 'angular2/common';

import {NameListService} from '../../../shared/services/name-list.service';
import { FtInput } from '../../../shared/components/ft-input/ft-input';
import { SelectComponent } from '../../../ng2-ft-select/select';

@Component({
	selector: 'sd-rich',
	moduleId: module.id,
	templateUrl: './rich.component.html',
	styleUrls: ['./rich.component.css'],
	directives: [FORM_DIRECTIVES, CORE_DIRECTIVES, FtInput, SelectComponent]
})
export class RichCmp {
	public items = [
		{ name: 'Blue 10',       hex: '#C0E6FF' },
		{ name: 'Blue 20',       hex: '#7CC7FF' },
		{ name: 'Blue 30',       hex: '#5AAAFA' },
		{ name: 'Blue 40',       hex: '#5596E6' },
		{ name: 'Blue 50',       hex: '#4178BE' },
		{ name: 'Blue 60',       hex: '#325C80' },
		{ name: 'Blue 70',       hex: '#264A60' },
		{ name: 'Blue 80',       hex: '#1D3649' },
		{ name: 'Blue 90',       hex: '#152935' },
		{ name: 'Blue 100',      hex: '#010205' },
		{ name: 'Green 10',      hex: '#C8F08F' },
		{ name: 'Green 20',      hex: '#B4E051' },
		{ name: 'Green 30',      hex: '#8CD211' },
		{ name: 'Green 40',      hex: '#5AA700' },
		{ name: 'Green 50',      hex: '#4B8400' },
		{ name: 'Green 60',      hex: '#2D660A' },
		{ name: 'Green 70',      hex: '#144D14' },
		{ name: 'Green 80',      hex: '#0A3C02' },
		{ name: 'Green 90',      hex: '#0C2808' },
		{ name: 'Green 100',     hex: '#010200' },
		{ name: 'Red 10',        hex: '#FFD2DD' },
		{ name: 'Red 20',        hex: '#FFA5B4' },
		{ name: 'Red 30',        hex: '#FF7D87' },
		{ name: 'Red 40',        hex: '#FF5050' },
		{ name: 'Red 50',        hex: '#E71D32' },
		{ name: 'Red 60',        hex: '#AD1625' },
		{ name: 'Red 70',        hex: '#8C101C' },
		{ name: 'Red 80',        hex: '#6E0A1E' },
		{ name: 'Red 90',        hex: '#4C0A17' },
		{ name: 'Red 100',       hex: '#040001' },
		{ name: 'Yellow 10',     hex: '#FDE876' },
		{ name: 'Yellow 20',     hex: '#FDD600' },
		{ name: 'Yellow 30',     hex: '#EFC100' },
		{ name: 'Yellow 40',     hex: '#BE9B00' },
		{ name: 'Yellow 50',     hex: '#8C7300' },
		{ name: 'Yellow 60',     hex: '#735F00' },
		{ name: 'Yellow 70',     hex: '#574A00' },
		{ name: 'Yellow 80',     hex: '#3C3200' },
		{ name: 'Yellow 90',     hex: '#281E00' },
		{ name: 'Yellow 100',    hex: '#020100' }
];

	private value:any;
	private disabled:boolean;

	private newName: string;

	constructor(public nameListService: NameListService) {
		this.value = {};
		this.items.forEach((e: any) => {
			e.name = `<div class="colorbox" style='background-color:${e.hex};'></div> ${e.name} (${e.hex})`;
		});
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
