import React from "react";
import classes from "../pages/NotFound.module.css";
import { Header } from "../components/header/Header";
import { Link } from "react-router-dom";
import { NewSecretButton } from "src/components/buttons/NewSecretButton";

export const NotFound = () => {
  return (
    <>
      <Header />
      <div className={classes.center}>
        <h1 className={classes.errorHeader}>No Secrets Here</h1>
        <h2 className={classes.message}>
          Sorry, but the page you were trying
          <br />
          to view could not be found
        </h2>
        <p className={classes.cta}>
          Click <a href="/secret/create">here</a> to create a new secret
        </p>
        <NewSecretButton />
      </div>
      <Link
        className={classes.footer}
        to={"https://cellar-app.io/"}
        target="_blank"
      >
        About Cellar
      </Link>
    </>
  );
};
