import React, { ReactNode } from "react";

import { Header } from "../components/Header";

import classes from './Layout.module.css'
import Button from "../components/Button";

export const Layout: React.FC<{ title: string, children: ReactNode }> = (props) => (
  <div>
    <Header/>
    <main className={classes.main}>
      <div className={classes.title}>
        <h1>{props.title}</h1>
        <div className={classes.shim}/>
        <div className={classes.createButton}>
          <Button appearance={Button.appearances.round}>🔒 New Secret</Button>
        </div>
      </div>
      {props.children}
    </main>
  </div>
)
