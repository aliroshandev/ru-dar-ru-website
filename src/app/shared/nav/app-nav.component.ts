import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';

/**
 * Persistent app navigation header (Phase 15). Static links to the home hub,
 * search, advert list, and create — rendered once in the app shell around the
 * routed content. Uses the router's active-link styling via RouterLinkActive.
 */
@Component({
  selector: 'app-nav',
  imports: [RouterModule],
  templateUrl: './app-nav.component.html',
  styleUrl: './app-nav.component.css',
})
export class AppNavComponent {}
