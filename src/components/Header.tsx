import Button from "./Button";
import { Logo } from "./Logo";

import classes from './Header.module.css'

export function Header() {
  return (
    <header>
      <div className={classes.banner}>
        <p>Share sensitive information securely with cellar. End to end encryption, always free. No sign-up required.</p>
      </div>

      <div className={classes.title}>
        <div className={classes.shim}/>
        <div className={classes.branding}>
          <Logo className={classes.logo}/>
        </div>
        <div className={classes.shim}/>
      </div>
    </header>
  );
}
