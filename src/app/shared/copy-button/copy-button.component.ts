import {Component, Input, OnInit} from '@angular/core';
import {MatSnackBar} from '@angular/material/snack-bar';

@Component({
  selector: 'clr-copy-button',
  templateUrl: './copy-button.component.html',
  styleUrls: ['./copy-button.component.css']
})
export class CopyButtonComponent implements OnInit {

  @Input() copyValue: string;
  @Input() copyButtonText: string;
  @Input() copyAlertText: string;

  constructor(private snackBar: MatSnackBar) { }

  ngOnInit(): void {
  }

  showSnackbarMessage() {
    this.snackBar.open(this.copyAlertText, 'OK', {
      duration: 1000,
    });
  }

}
