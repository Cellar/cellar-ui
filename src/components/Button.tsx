import { ComponentPropsWithoutRef, FC } from 'react'
import cx from 'classnames'

import classes from './Button.module.css'

export const Button: FC<ComponentPropsWithoutRef<'a'>> = (props) => (
  <a className={cx(classes.resetBtn, classes.button)} {...props} />
)
