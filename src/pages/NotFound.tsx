import React from "react";
import classes from "../pages/NotFound.module.css";
import { Header } from "../components/header/Header";
import { NewSecretButton } from "src/components/buttons/NewSecretButton";
import { Footer } from "src/components/footer/footer";

export const NotFound = () => {
  return (
    <>
      <Header />
      <div className={classes.center} data-testid="not-found">
        <h1 className={classes.errorHeader} data-testid="header">
          No Secrets Here
        </h1>
        <h2 className={classes.message} data-testid="message">
          Sorry, but the page you were trying
          <br />
          to view could not be found
        </h2>
        <p className={classes.cta} data-testid="cta">
          Click <a href="/secret/create">here</a> to create a new secret
        </p>
        <NewSecretButton />
      </div>
      <Footer />
    </>
  );
};
