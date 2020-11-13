import { Component, OnInit } from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {ISecretMetadata} from '../secret';
import {MatSnackBar} from '@angular/material/snack-bar';
import {MatDialog} from '@angular/material/dialog';
import {DeleteSecretDialogComponent} from './delete-secret-dialog/delete-secret-dialog.component';
import {SecretsService} from '../secrets.service';

@Component({
  selector: 'clr-secret-metadata',
  templateUrl: './secret-metadata.component.html',
  styleUrls: ['./secret-metadata.component.css']
})
export class SecretMetadataComponent implements OnInit {
  public secretMetadata: ISecretMetadata;
  public accessUrl: string;
  public metadataUrl: string;
  public secretAccessString: string;
  public secretIdString: string;

  constructor(private route: ActivatedRoute,
              private router: Router,
              private snackBar: MatSnackBar,
              public dialog: MatDialog,
              private secretsService: SecretsService) { }

  ngOnInit(): void {
    this.route.data.subscribe(data => {
      this.secretMetadata = data.resolvedMetadata;
      this.accessUrl = `${window.location.origin}/secret/${this.secretMetadata.id}/access`;
      this.metadataUrl = `${window.location.origin}/secret/${this.secretMetadata.id}`;
      this.setSecretAccessString();
      this.setSecretIdString(window.innerWidth);
    });
  }

  setSecretAccessString() {
    if (this.secretMetadata.access_limit > 0) {
      this.secretAccessString = `Accessed ${this.secretMetadata.access_count} of ${this.secretMetadata.access_limit} times`;
    } else {
      this.secretAccessString = `Accessed ${this.secretMetadata.access_count} times`;
    }
  }

  setSecretIdString(width) {
    const numChars = 8 * (Math.floor(width / 100) - 2);
    if (numChars < this.secretMetadata.id.length) {
      this.secretIdString = this.secretMetadata.id.substring(0, numChars) + '...';
    } else if (numChars > 0) {
      this.secretIdString = this.secretMetadata.id;
    } else {
      this.secretIdString = '';
    }
  }

  showSnackbarMessage(message: string) {
    this.snackBar.open(message, 'OK', {
      duration: 1000,
    });
  }

  deleteSecret() {
    const dialogRef = this.dialog.open(DeleteSecretDialogComponent, {
      width: '325px',
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result === true) {
        this.secretsService.deleteSecret(this.secretMetadata.id).subscribe(
          response => {
            this.router.navigate(['/secret', 'create']);
          },
          err => {
            console.log(err);
            this.showSnackbarMessage('Error deleting secret');
          }
        );
      }
    });
  }
}
