import React, { ReactNode } from "react";

import { Header } from "../components/Header";

import classes from './Layout.module.css'

export const Layout: React.FC<{ children: ReactNode }> = (props) => (
  <div>
    <Header />
    <main className={classes.main}>{props.children}</main>
  </div>
)
