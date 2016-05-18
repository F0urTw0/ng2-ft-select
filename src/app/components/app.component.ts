import {Component} from 'angular2/core';
import {ROUTER_DIRECTIVES, RouteConfig} from 'angular2/router';
import {NavbarComponent} from './navbar.component';
import {ToolbarComponent} from './toolbar.component';
import {SingleCmp} from '../../pages/single/components/single.component';
import {MultiCmp} from '../../pages/multiple/components/multiple.component';
import {ChilCmp} from '../../pages/children/components/children.component';
import {RichCmp} from '../../pages/rich/components/rich.component';
import {ThemeCmp} from '../../pages/theme/components/theme.component';
import {NameListService} from '../../shared/services/name-list.service';

@Component({
  selector: 'sd-app',
  viewProviders: [NameListService],
  moduleId: module.id,
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  directives: [ROUTER_DIRECTIVES, NavbarComponent, ToolbarComponent]
})
@RouteConfig([
  { path: '/',      name: 'Single',  component: SingleCmp  },
  { path: '/multiple',      name: 'Multi',  component: MultiCmp  },
  { path: '/children',      name: 'Children',  component: ChilCmp  },
  { path: '/rich',      name: 'Rich',  component: RichCmp  },
  { path: '/theme',      name: 'Theme',  component: ThemeCmp  }
])
export class AppComponent {}
