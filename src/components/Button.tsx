import {ComponentPropsWithoutRef, FC, ReactElement, ValidationMap, WeakValidationMap} from 'react'
import cx from 'classnames'

import classes from './Button.module.css'

interface ButtonProps extends ComponentPropsWithoutRef<'a'> {
  appearance?: string,
}

interface Btn extends FC<ButtonProps> {
  appearances: {
    primary: string,
    secondary: string,
    round: string,
  }
}

const appearances = {
  primary: 'primary',
  secondary: 'secondary',
  round: 'round',
}

const Button: Btn = (props) => {
  const {appearance, ...rest} = props

  return (
    <a className={cx(classes.resetBtn, classes.button,
      appearance === appearances.primary && classes.primary,
      appearance === appearances.secondary && classes.secondary,
      appearance === appearances.round && classes.round)} {...props} />
  )
}

Button.appearances = appearances

export default Button
