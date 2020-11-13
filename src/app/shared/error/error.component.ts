import { Component, OnInit } from '@angular/core';
import {ActivatedRoute} from '@angular/router';

@Component({
  selector: 'clr-error',
  templateUrl: './error.component.html',
  styleUrls: ['./error.component.css']
})
export class ErrorComponent implements OnInit {
  headerMessage: string;
  message: string;

  constructor(private route: ActivatedRoute) { }

  ngOnInit(): void {
    const errorId = this.route.snapshot.paramMap.get('errorId');
    switch (errorId) {
      case '404':
        this.headerMessage = 'No Secrets Here!';
        this.message = 'Sorry, but the page you were trying to view could not be found.';
        break;
      case '500':
        this.headerMessage = 'Server Error';
        this.message = 'An error has occurred. Please contact a site administrator.';
        break;
      case '401':
      case '403':
        this.headerMessage = 'Authentication Error';
        this.message = 'You are not authorized to see this page. ' +
          'If you believe this is an error, contact a site administrator.';
        break;
      default:
        this.headerMessage = 'Unexpected Error Occurred';
        this.message = 'An unexpected error has occurred. Please try again or contact a site administrator';
    }
  }
}
