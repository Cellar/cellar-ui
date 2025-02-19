import React, { ReactNode, useEffect, useRef, useState } from "react";

import { Header } from "../components/header/Header";

import classes from "./Layout.module.css";
import { Link } from "react-router-dom";
import { NewSecretButton } from "src/components/buttons/NewSecretButton";

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
      <Link
        className={classes.footer}
        to={"https://cellar-app.io/"}
        target="_blank"
      >
        About Cellar
      </Link>
    </div>
  );
};
