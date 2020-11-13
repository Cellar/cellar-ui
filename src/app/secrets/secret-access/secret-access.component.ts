import {Component, OnInit, ViewChild} from '@angular/core';
import {SecretsService} from '../secrets.service';
import {ISecret} from '../secret';
import {ActivatedRoute, Router} from '@angular/router';
import {CdkTextareaAutosize} from '@angular/cdk/text-field';

@Component({
  selector: 'clr-secret-access',
  templateUrl: './secret-access.component.html',
  styleUrls: ['./secret-access.component.css']
})
export class SecretAccessComponent implements OnInit {
  public secret: ISecret = {
    id: '',
    content: '',
  };

  @ViewChild('autosize') autosize: CdkTextareaAutosize;

  constructor(private route: ActivatedRoute,
              private router: Router,
              private secretsService: SecretsService) { }

  ngOnInit(): void {
    const secretId = this.route.snapshot.paramMap.get('id');
    this.secretsService.accessSecret(secretId).subscribe(
      secret => {
          this.secret = secret;
      },
      error => {
        this.router.navigate(['/error', error.status]);
      },
    );
  }
}
