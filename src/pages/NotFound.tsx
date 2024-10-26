import React from "react";
import classes from "../pages/NotFound.module.css";
import Button from "../components/Button";
import {Header} from "../components/Header";
import {Link, useNavigate} from "react-router-dom";

export const NotFound = () => {
  const navigate = useNavigate();

  return (
    <>
      <Header/>
      <div className={classes.center}>
        <h1 className={classes.errorHeader}>No Secrets Here</h1>
        <h2 className={classes.message}>Sorry, but the page you were trying<br />to view could not be found</h2>
        <p className={classes.cta}>Click <a href="/create">here</a> to create a new secret</p>
        <div className={classes.createButton}>
          <Button appearance={Button.appearances.round} onClick={() => navigate('/secret/create')}>🔒 New Secret</Button>
        </div>
      </div>
      <Link className={classes.footer} to={'https://cellar-app.io/'} target='_blank'>About Cellar</Link>
    </>
  );
}

