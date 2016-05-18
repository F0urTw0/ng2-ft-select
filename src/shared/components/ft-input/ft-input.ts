import { Component, Input, Output, EventEmitter, HostListener, ElementRef } from 'angular2/core';

@Component({
	selector: 'ft-input',
	moduleId: module.id,
	templateUrl: './ft-input.html',
	styleUrls: ['./ft-input.css']
})
export class FtInput {
	@Input() value: string | number;
	@Output() valueOut: EventEmitter<string> = new EventEmitter();
	@Input() label: string | number;
	@Input() type: string = 'text';
	private labelTop: number;
	private labelFont: number;
	private _focused: boolean;

	constructor(private el: ElementRef) {
		this.el.nativeElement.style.position = 'relative';
		this.el.nativeElement.style.paddingTop = '10px';
		this.el.nativeElement.style.paddingBottom = '10px';
	}

	@HostListener('focused',['$event']) labelToggle() {
		this.focused = !this.focused;
	}

	set focused(v: boolean) {
		this._focused = v;
		if (v) {
			this.labelTop = 0;
			this.labelFont = 12;
		} else {
			this.labelTop = 10;
			this.labelFont = 14;
		}
	}

	get focused() {
		return this._focused;
	}
}
