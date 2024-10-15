import React from "react";
import classes from "../pages/NotFound.module.css";
import Button from "../components/Button";
import {Header} from "../components/Header";

export const NotFound = () => {
  return (
    <>
      <Header/>
      <div className={classes.center}>
        <h1>No Secrets Here</h1>
        <h2 className={classes.message}>Sorry, but the page you were trying to view could not be found</h2>
        <p>Click <a href="/create">here</a> to create a new secret</p>
        <br />
        <div className={classes.createButton}>
          <Button appearance={Button.appearances.round}>🔒 New Secret</Button>
        </div>
      </div>
    </>
  );
}

