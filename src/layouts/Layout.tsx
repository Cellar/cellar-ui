import React, { ReactNode } from "react";

import { Header } from "../components/header/Header";

import classes from "./Layout.module.css";
import Button from "../components/Button";
import { Link, useNavigate } from "react-router-dom";
import { Lock } from "src/components/characters/Lock";

export const Layout: React.FC<{ title?: string; children: ReactNode }> = (
  props,
) => {
  const navigate = useNavigate();

  return (
    <div>
      <Header />
      <main className={classes.main}>
        {props.title && (
          <div className={classes.title}>
            <h1>{props.title}</h1>
            <div className={classes.shim} />
            <div className={classes.createButton}>
              <Button
                appearance={Button.appearances.round}
                onClick={() => navigate("/secret/create")}
              >
                <Lock className={classes.lockImg} />
                New Secret
              </Button>
            </div>
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
