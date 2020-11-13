import {Component, Input, OnInit} from '@angular/core';

@Component({
  selector: 'clr-toolbar',
  templateUrl: './toolbar.component.html',
  styleUrls: ['./toolbar.component.css']
})
export class ToolbarComponent implements OnInit {

  public rightTextDisplay: string;

  @Input() leftText: string;
  @Input() rightText: string;

  constructor() {}

  ngOnInit(): void {
    this.setRightText(window.innerWidth);
  }

  onresize(event) {
    this.setRightText(event.target.innerWidth);
  }

  setRightText(width) {
    if (!this.rightText) {
      return;
    }

    const numChars = 8 * (Math.floor(width / 100) - 2);
    if (numChars < this.rightText.length) {
      this.rightTextDisplay = this.rightText.substring(0, numChars) + '...';
    } else if (numChars > 0) {
      this.rightTextDisplay = this.rightText;
    } else {
      this.rightTextDisplay = '';
    }
  }
}
