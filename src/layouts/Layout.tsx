import React, { ReactNode } from "react";

import { Header } from "../components/header/Header";

import classes from "./Layout.module.css";
import { NewSecretButton } from "src/components/buttons/NewSecretButton";
import { Footer } from "src/components/footer/footer";

export const Layout: React.FC<{ title?: string; children: ReactNode }> = (
  props,
) => {
  return (
    <div>
      <Header />
      <main className={classes.main}>
        {props.title && (
          <div className={classes.title}>
            <h1>{props.title}</h1>
            <div className={classes.shim} />
            <NewSecretButton />
          </div>
        )}
        {props.children}
      </main>
      <Footer />
    </div>
  );
};
