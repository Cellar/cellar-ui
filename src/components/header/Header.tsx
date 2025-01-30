import { Logo } from "./Logo";

import classes from "./Header.module.css";
import { useMediaQuery } from "@mantine/hooks";

export function Header() {
  const isTinyMobile = useMediaQuery("(max-width: 393px)");

  return (
    <header>
      <div className={classes.banner}>
        {isTinyMobile ? (
          <p>
            Share sensitive information securely with cellar.
            <br />
            End to end encryption, always free. No sign-up required.
          </p>
        ) : (
          <p>
            Share sensitive information securely with cellar. End to end
            encryption, always free. No sign-up required.
          </p>
        )}
      </div>

      <div className={classes.title}>
        <div className={classes.shim} />
        <div className={classes.branding}>
          <Logo data-testid="cellar-logo" className={classes.logo} />
        </div>
        <div className={classes.shim} />
      </div>
    </header>
  );
}
