import React, { HTMLProps } from 'react';
import classes from './Header.module.css'

import { Logo } from "./Logo";

const Button: React.FC<HTMLProps<HTMLAnchorElement>> = (props) => (
  <a className={classes.button} {...props} />
)

export function Header() {
  return (
    <header className={classes.header}>
      <div className={classes.banner}>
        <p>Share sensitive information securely with cellar. End to end encryption, always free. No sign-up required.</p>
      </div>

      <div className={classes.title}>
          <Logo className={classes.logo} />
          <div className={classes.cta}>
            <Button href="/">New Secret</Button>
          </div>
      </div>
    </header>
  );
  // const {classes} = useStyles();
  // return (
  //   <div className={classes.header}>
  //     <Paper className={classes.banner}>
  //       <Text style={{textAlign: "center"}}>
  //         Share sensitive information securely with cellar. End to end encryption, always free. No sign-up required.
  //       </Text>
  //     </Paper>
  //     <Container size="xl" px="md" className={classes.inner}>
  //       <Logo/>
  //       <Button color="blue">New Secret</Button>
  //     </Container>
  //   </div>
  // );
}
