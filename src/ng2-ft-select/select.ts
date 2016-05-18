import { Component, Input, Output, EventEmitter, ElementRef, OnInit } from 'angular2/core';
// import {SelectItem} from './select-item';
import { HighlightPipe, stripTags } from './select-pipes';
// import {OptionsBehavior} from './select-interfaces';
import { escapeRegexp } from './common';
import { OffClickDirective } from './off-click';

let optionsTemplate = `
		<ul *ngIf="optionsOpened && options && options.length > 0 && !firstItemHasChildren" class="ui-ng2-select-dropdown">
			<li class="ui-select-choices-group">
				<div *ngFor="#o of options"
						 class="ui-select-choices-row"
						 [class.active]="isActive(o)"
						 [class.focused]="isFocused(o)"
						 (mouseenter)="selectFocused(o)"
						 (click)="selectMatch(o, $event)">
					<a href="javascript:void(0)" class="ui-select-choices-row-inner">
						<div [innerHtml]="o[labelPath] | highlight:inputValue"></div>
					</a>
				</div>
			</li>
		</ul>

		<ul *ngIf="optionsOpened && options && options.length > 0 && firstItemHasChildren" class="ui-ng2-select-dropdown">
			<li *ngFor="#g of options; #index=index" class="ui-select-choices-group">
				<div class="divider" *ngIf="index > 0"></div>
				<div class="ui-select-choices-group-label">{{g[childrenTitlePath]}}</div>

				<div *ngFor="#o of g[childrenPath]"
						 class="ui-select-choices-row"
						 [class.active]="isActive(o)"
						 [class.focused]="isFocused(o)"
						 (mouseenter)="selectFocused(o)"
						 (click)="selectMatch(o, $event)">
					<a href="javascript:void(0)" class="ui-select-choices-row-inner">
						<div [innerHtml]="o[labelPath] | highlight:inputValue"></div>
					</a>
				</div>
			</li>
		</ul>
`;
@Component({
	selector: 'ng2-ft-select',
	directives: [OffClickDirective],
	pipes: [HighlightPipe],
	moduleId: module.id,
	template: `
	<div tabindex="0"
		 *ngIf="multiple === false"
		 (keyup)="mainClick($event)"
		 [offClick]="clickedOutside"
		 [class.ui-disabled]="_disabled"
		 [class.ui-white-theme]="whiteTheme"
		 class="ui-select-container open">
		<i class="ui-ng2-caret" [style.transform]="style_CaretTransform" (click)="matchClick($event)"></i>
		<div class="ui-select-match" *ngIf="!inputMode">
			<span tabindex="-1"
					class="ui-select-toggle"
					(click)="matchClick($event)"
					style="outline: 0;">
				<span *ngIf="active.length <= 0" class="ui-select-placeholder">{{placeholder}}</span>
				<span *ngIf="active.length > 0" class="ui-select-match-text pull-left"
							[ngClass]="{'ui-select-allow-clear': allowClear && active.length > 0}"
							[innerHTML]="active[0][labelPath]"></span>
				<i class="dropdown-toggle"></i>
				<i *ngIf="allowClear && active.length>0" (click)="remove(active[0])" class="ui-ng2-remove"></i>
			</span>
		</div>
		<input type="text" autocomplete="false" tabindex="-1"
					 (keydown)="inputEvent($event)"
					 (keyup)="inputEvent($event, true)"
					 [disabled]="_disabled"
					 class="ui-select-search"
					 *ngIf="inputMode"
					 placeholder="{{active.length <= 0 ? placeholder : ''}}">
			${optionsTemplate}
	</div>

	<div tabindex="0"
		 *ngIf="multiple === true"
		 (keyup)="mainClick($event)"
		 [offClick]="clickedOutside"
		 (focus)="focusToInput('')"
		 (click)="matchClick($event)"
		 [class.ui-disabled]="_disabled"
		 [class.ui-white-theme]="whiteTheme"
		 class="ui-select-container ui-select-multiple open">
		<span class="ui-select-match">
				<span class="ui-select-label" *ngFor="#a of active">
						<span class="ui-select-match-item btn btn-default btn-secondary btn-xs"
									tabindex="-1"
									type="button"
									[ngClass]="{'btn-default': true}">
							 <a class="close ui-select-match-close"
									(click)="remove(a, $event)">&nbsp;&times;</a>
							 <span [innerHTML]="a[labelPath]"></span>
					 </span>
				</span>
		</span>
		<input type="text"
					 size="1"
					 (keydown)="inputEvent($event)"
					 (keyup)="inputEvent($event, true)"
					 [disabled]="_disabled"
					 [class.fill-space]="active.length === 0"
					 autocomplete="false"
					 autocorrect="off"
					 autocapitalize="off"
					 spellcheck="false"
					 class="ui-select-search input-xs"
					 placeholder="{{active.length <= 0 ? placeholder : ''}}"
					 role="combobox">
		${optionsTemplate}
	</div>
	`,
	styleUrls: ['./select.css']
})
export class SelectComponent implements OnInit {
	@Input() whiteTheme:boolean = false;
	@Input() allowClear:boolean = true;
	@Input() placeholder:string = '';
	@Input() multiple:boolean = false;
	@Input() value:Array<any> = [];
	@Output() valueChange = new EventEmitter<any>();

	@Input() items:Array<any> = [];
	@Input() valuePath: string = 'id';
	@Input() labelPath: string = 'text';
	@Input() childrenPath: string = 'children';
	@Input() childrenTitlePath: string = 'text';

	@Input()
	public set disabled(value:boolean) {
		this._disabled = value;
		if (this._disabled === true) {
			this.clickedOutside();
		}
	}

	@Output() public removed:EventEmitter<any> = new EventEmitter();
	@Output() public typed:EventEmitter<any> = new EventEmitter();

	public options:Array<any> = [];
	// public itemObjects:Array<SelectItem> = [];
  public optionsMap:Map<string, number> = new Map<string, number>();
	public active:Array<Object> = [];
	public focusedOption: any;
	public element:ElementRef;

	private inputMode:boolean = false;
	private optionsOpened:boolean = false;
	// private behavior:OptionsBehavior;
	private inputValue:string = '';
	private _disabled:boolean = false;

	private style_CaretTransform: string;

	public constructor(element:ElementRef) {
		this.element = element;
		this.clickedOutside = this.clickedOutside.bind(this);
	}

	public inputEvent(e:any, isUpMode:boolean = false):void {
		// tab
		if (e.keyCode === 9) {
			return;
		}
		if (isUpMode && (e.keyCode === 37 || e.keyCode === 39 || e.keyCode === 38 ||
			e.keyCode === 40 || e.keyCode === 13)) {
			e.preventDefault();
			return;
		}
		// backspace
		if (!isUpMode && e.keyCode === 8) {
			let el:any = this.element.nativeElement
				.querySelector('div.ui-select-container > input');
			if (!el.value || el.value.length <= 0) {
				if (this.active.length > 0) {
					this.remove(this.active[this.active.length - 1]);
				}
				e.preventDefault();
			}
		}
		// esc
		if (!isUpMode && e.keyCode === 27) {
			this.clickedOutside();
			this.element.nativeElement.children[0].focus();
			e.preventDefault();
			return;
		}
		// del
		if (!isUpMode && e.keyCode === 46) {
			if (this.active.length > 0) {
				this.remove(this.active[this.active.length - 1]);
			}
			e.preventDefault();
		}
		// left
		if (!isUpMode && e.keyCode === 37 && this.items.length > 0) {
			this.first();
			e.preventDefault();
			return;
		}
		// right
		if (!isUpMode && e.keyCode === 39 && this.items.length > 0) {
			this.last();
			e.preventDefault();
			return;
		}
		// up
		if (!isUpMode && e.keyCode === 38) {
			this.prev();
			e.preventDefault();
			return;
		}
		// down
		if (!isUpMode && e.keyCode === 40) {
			this.next();
			e.preventDefault();
			return;
		}
		// enter
		if (!isUpMode && e.keyCode === 13) {
			if (this.active.indexOf(this.focusedOption) === -1) {
				this.selectMatch(this.focusedOption);
				this.next();
			}
			e.preventDefault();
			return;
		}
		if (e.srcElement) {
			this.inputValue = e.srcElement.value;
			this.filter(new RegExp(escapeRegexp(this.inputValue), 'ig'));
			this.typed.emit(this.inputValue);
		}
	}

	public ngOnInit():any {
		// this.behavior = (this.firstItemHasChildren) ? new ChildrenBehavior(this) : new GenericBehavior(this);
		if (this.items[0] && typeof this.items[0] === 'string') {
			for (let i: number = 0; i < this.items.length; i++) {
				this.items[i] = {id: this.items[i], text: this.items[i]};
			}
		}
		if (this.value) {
			this.selectMatch(this.items.find((v) => {
				if (isset(()=> { return v[this.childrenPath][this.labelPath]; })) {
					return v[this.childrenPath][this.labelPath] === this.value;
				} else {
					return v[this.labelPath] === this.value;
				}
			}));
			this.valueChange.emit(this.active);
		}
	}

	public first():void {
		this.focusedOption = this.options[0];
		this.ensureHighlightVisible();
	}

	public last():void {
		this.focusedOption = this.options[this.options.length - 1];
		this.ensureHighlightVisible();
	}

	public prev():void {
		let index = this.options.indexOf(this.focusedOption);
		this.focusedOption = this
			.options[index - 1 < 0 ? this.options.length - 1 : index - 1];
		this.ensureHighlightVisible();
	}

	public next():void {
		let index = this.options.indexOf(this.focusedOption);
		this.focusedOption = this
			.options[index + 1 > this.options.length - 1 ? 0 : index + 1];
		this.ensureHighlightVisible();
	}

	public remove(item: Object, e: Event = void 0):void {
		if (e) {
			e.stopPropagation();
			e.preventDefault();
		}
		if (this._disabled === true) {
			return;
		}
		if (this.multiple === true && this.active) {
			let index = this.active.indexOf(item);
			this.active.splice(index, 1);
			this.valueChange.emit(this.active);
			this.removed.emit(item);
		}
		if (this.multiple === false) {
			this.active = [];
			this.valueChange.emit('');
			this.removed.emit(item);
		}
	}

	public clickedOutside():void  {
		this.inputValue = '';
		this.inputMode = false;
		this.optionsOpened = false;
		this.style_CaretTransform = 'rotate(0deg)';
	}

	public get firstItemHasChildren():boolean {
		let a = this.items[0] && isset(()=> { return this.items[0][this.childrenPath]; });
		return a;
	}

	protected matchClick(e:any):void {
		if (this._disabled === true) {
			return;
		}
		this.inputMode = !this.inputMode;
		if (this.inputMode === true && ((this.multiple === true && e) || this.multiple === false)) {
			this.focusToInput();
			this.open();
		} else {
			this.clickedOutside();
		}
	}

	protected  mainClick(event:any):void {
		if (this.inputMode === true || this._disabled === true) {
			return;
		}
		if (event.keyCode === 46) {
			event.preventDefault();
			this.inputEvent(event);
			return;
		}
		if (event.keyCode === 8) {
			event.preventDefault();
			this.inputEvent(event, true);
			return;
		}
		if (event.keyCode === 9 || event.keyCode === 13 ||
			event.keyCode === 27 || (event.keyCode >= 37 && event.keyCode <= 40)) {
			event.preventDefault();
			return;
		}
		this.inputMode = true;
		let value = String
			.fromCharCode(96 <= event.keyCode && event.keyCode <= 105 ? event.keyCode - 48 : event.keyCode)
			.toLowerCase();
		this.focusToInput(value);
		this.open();
		event.srcElement.value = value;
		this.inputEvent(event);
	}

	protected  selectFocused(value: any[]):void {
		this.focusedOption = value;
	}

	protected  isFocused(value: any[]):boolean {
		return this.focusedOption === value;
	}

	protected isActive(value:Object):boolean {
		return this.active.find((v: Object) => { return v === value; }) !== undefined;
	}

	private focusToInput(value: string = ''):void {
		this.style_CaretTransform = 'rotate(180deg)';
		setTimeout(() => {
			let el = this.element.nativeElement.querySelector('div.ui-select-container > input');
			if (el) {
				el.focus();
				el.value = value;
			}
		}, 0);
	}

	private open():void {
		this.options = this.items;

		this.optionsOpened = true;
	}

	private selectMatch(item: any, e:Event = void 0):void {
		if (e) {
			e.stopPropagation();
			e.preventDefault();
		}
		if (this.items.length <= 0 || !item) {
			return;
		}
		if (this.multiple === true) {
			if (this.active.find((v)=> {  return v === item; })) {
				return;
			}
			this.active.push(item);
			this.valueChange.emit(this.active);
			this.focusToInput();
		} else {
			this.active[0] = item;
			this.valueChange.emit(item);
			this.focusToInput(item[this.labelPath]);
			this.clickedOutside();
			// this.element.nativeElement.querySelector('.ui-select-container').focus();
		}
	}

	private filter(query:RegExp):void {
		let options = this.items.filter((option: any) => {
				return stripTags(option[this.labelPath]).match(query) &&
					(this.multiple === false ||
					(this.multiple === true && this.active.indexOf(option) < 0));
			});
		this.options = options;
		if (this.options.length > 0) {
			this.focusedOption = this.options[0];
			this.ensureHighlightVisible();
		}
	}

	// private fillOptionsMap():void {
	// 	this.optionsMap.clear();
	// 	let startPos = 0;
	// 	this.items
	// 		.map((item: any) => {
	// 			startPos = item.fillChildrenHash(this.optionsMap, startPos);
	// 		});
	// }

	private ensureHighlightVisible():void {
		let container = this.element.nativeElement.querySelector('.ui-ng2-select-dropdown');
		if (!container) {
			return;
		}
		let choices = container.querySelectorAll('.ui-select-choices-row');
		if (choices.length < 1) {
			return;
		}
		let activeIndex = this.getActiveIndex(this.optionsMap);
		if (activeIndex < 0) {
			return;
		}
		let highlighted:any = choices[activeIndex];
		if (!highlighted) {
			return;
		}
		let posY:number = highlighted.offsetTop + highlighted.clientHeight - container.scrollTop;
		let height:number = container.offsetHeight;
		if (posY > height) {
			container.scrollTop += posY - height;
		} else if (posY < highlighted.clientHeight) {
			container.scrollTop -= highlighted.clientHeight - posY;
		}
	}

	private getActiveIndex(optionsMap:Map<string, number> = void 0):number {
		let ai = this.options.indexOf(this.focusedOption);
		if (ai < 0 && optionsMap !== void 0) {
			let path = this.firstItemHasChildren ? this.childrenPath+'.'+this.valuePath : this.valuePath;
			ai = optionsMap.get(this.focusedOption[path]);
		}
		return ai;
	}
}

export function isset(fn: Function): boolean {
	let value: any;
	try {
		value = fn();
	} catch (e) {
		value = undefined;
	}
	return value !== undefined;
}

// export class Behavior {
// 	public optionsMap:Map<string, number> = new Map<string, number>();

// 	public actor: SelectComponent;
// 	public constructor(actor:SelectComponent) {
// 		this.actor = actor;
// 	}

// 	public fillOptionsMap():void {
// 		this.optionsMap.clear();
// 		let startPos = 0;
// 		this.actor.itemObjects
// 			.map((item:SelectItem) => {
// 				startPos = item.fillChildrenHash(this.optionsMap, startPos);
// 			});
// 	}

// 	public ensureHighlightVisible(optionsMap:Map<string, number> = void 0):void {
// 		let container = this.actor.element.nativeElement.querySelector('.ui-ng2-select-dropdown');
// 		if (!container) {
// 			return;
// 		}
// 		let choices = container.querySelectorAll('.ui-select-choices-row');
// 		if (choices.length < 1) {
// 			return;
// 		}
// 		let activeIndex = this.getActiveIndex(optionsMap);
// 		if (activeIndex < 0) {
// 			return;
// 		}
// 		let highlighted:any = choices[activeIndex];
// 		if (!highlighted) {
// 			return;
// 		}
// 		let posY:number = highlighted.offsetTop + highlighted.clientHeight - container.scrollTop;
// 		let height:number = container.offsetHeight;
// 		if (posY > height) {
// 			container.scrollTop += posY - height;
// 		} else if (posY < highlighted.clientHeight) {
// 			container.scrollTop -= highlighted.clientHeight - posY;
// 		}
// 	}

// 	private getActiveIndex(optionsMap:Map<string, number> = void 0):number {
// 		let ai = this.actor.options.indexOf(this.actor.focusedOption);
// 		if (ai < 0 && optionsMap !== void 0) {
// 			ai = optionsMap.get(this.actor.focusedOption.id);
// 		}
// 		return ai;
// 	}
// }

// export class GenericBehavior extends Behavior implements OptionsBehavior {
// 	public constructor(actor:SelectComponent) {
// 		super(actor);
// 	}

// 	public first():void {
// 		this.actor.focusedOption = this.actor.options[0];
// 		super.ensureHighlightVisible();
// 	}

// 	public last():void {
// 		this.actor.focusedOption = this.actor.options[this.actor.options.length - 1];
// 		super.ensureHighlightVisible();
// 	}

// 	public prev():void {
// 		let index = this.actor.options.indexOf(this.actor.focusedOption);
// 		this.actor.focusedOption = this.actor
// 			.options[index - 1 < 0 ? this.actor.options.length - 1 : index - 1];
// 		super.ensureHighlightVisible();
// 	}

// 	public next():void {
// 		let index = this.actor.options.indexOf(this.actor.focusedOption);
// 		this.actor.focusedOption = this.actor
// 			.options[index + 1 > this.actor.options.length - 1 ? 0 : index + 1];
// 		super.ensureHighlightVisible();
// 	}

// 	public filter(query:RegExp):void {
// 		let options = this.actor.itemObjects
// 			.filter((option:SelectItem) => {
// 				return stripTags(option.text).match(query) &&
// 					(this.actor.multiple === false ||
// 					(this.actor.multiple === true && this.actor.active.indexOf(option) < 0));
// 			});
// 		this.actor.options = options;
// 		if (this.actor.options.length > 0) {
// 			this.actor.focusedOption = this.actor.options[0];
// 			super.ensureHighlightVisible();
// 		}
// 	}
// }

// export class ChildrenBehavior extends Behavior implements OptionsBehavior {
// 	public constructor(actor:SelectComponent) {
// 		super(actor);
// 	}

// 	public first():void {
// 		this.actor.focusedOption = this.actor.options[0].children[0];
// 		this.fillOptionsMap();
// 		this.ensureHighlightVisible(this.optionsMap);
// 	}

// 	public last():void {
// 		this.actor.focusedOption =
// 			this.actor
// 				.options[this.actor.options.length - 1]
// 				.children[this.actor.options[this.actor.options.length - 1].children.length - 1];
// 		this.fillOptionsMap();
// 		this.ensureHighlightVisible(this.optionsMap);
// 	}

// 	public prev():void {
// 		let indexParent = this.actor.options
// 			.findIndex((option:SelectItem) => this.actor.focusedOption.parent && this.actor.focusedOption.parent.id === option.id);
// 		let index = this.actor.options[indexParent].children
// 			.findIndex((option:SelectItem) => this.actor.focusedOption && this.actor.focusedOption.id === option.id);
// 		this.actor.focusedOption = this.actor.options[indexParent].children[index - 1];
// 		if (!this.actor.focusedOption) {
// 			if (this.actor.options[indexParent - 1]) {
// 				this.actor.focusedOption = this.actor
// 					.options[indexParent - 1]
// 					.children[this.actor.options[indexParent - 1].children.length - 1];
// 			}
// 		}
// 		if (!this.actor.focusedOption) {
// 			this.last();
// 		}
// 		this.fillOptionsMap();
// 		this.ensureHighlightVisible(this.optionsMap);
// 	}

// 	public next():void {
// 		let indexParent = this.actor.options
// 			.findIndex((option:SelectItem) => this.actor.focusedOption.parent && this.actor.focusedOption.parent.id === option.id);
// 		let index = this.actor.options[indexParent].children
// 			.findIndex((option:SelectItem) => this.actor.focusedOption && this.actor.focusedOption.id === option.id);
// 		this.actor.focusedOption = this.actor.options[indexParent].children[index + 1];
// 		if (!this.actor.focusedOption) {
// 			if (this.actor.options[indexParent + 1]) {
// 				this.actor.focusedOption = this.actor.options[indexParent + 1].children[0];
// 			}
// 		}
// 		if (!this.actor.focusedOption) {
// 			this.first();
// 		}
// 		this.fillOptionsMap();
// 		this.ensureHighlightVisible(this.optionsMap);
// 	}

// 	public filter(query:RegExp):void {
// 		let options:Array<SelectItem> = [];
// 		let optionsMap:Map<string, number> = new Map<string, number>();
// 		let startPos = 0;
// 		for (let si of this.actor.itemObjects) {
// 			let children:Array<SelectItem> = si.children.filter((option:SelectItem) => query.test(option.text));
// 			startPos = si.fillChildrenHash(optionsMap, startPos);
// 			if (children.length > 0) {
// 				let newSi = si.getSimilar();
// 				newSi.children = children;
// 				options.push(newSi);
// 			}
// 		}
// 		this.actor.options = options;
// 		if (this.actor.options.length > 0) {
// 			this.actor.focusedOption = this.actor.options[0].children[0];
// 			super.ensureHighlightVisible(optionsMap);
// 		}
// 	}
// }
