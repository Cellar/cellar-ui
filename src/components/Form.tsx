import { ComponentPropsWithoutRef, FC } from 'react'
import cx from 'classnames'

import classes from './Form.module.css'

export const Form: FC<ComponentPropsWithoutRef<'form'>> = (props) => {
  const { className, ...rest } = props

  return (
    <form className={cx(classes.form, className)} {...rest} />
  )
}


interface InputWrapperProps extends
  ComponentPropsWithoutRef<'div'> {
  label?: string
}
export const InputWrapper: FC<InputWrapperProps> = (props) => {

  const { children, className, label, ...rest } = props

  return (
    <div className={cx(classes.inputWrapper, className)} {...rest} >
      {label && <label className={classes.label}>{label}</label>}
      {children}
    </div>
  )
}


interface TextAreaProps extends
  ComponentPropsWithoutRef<'textarea'> {
  label?: string
}

export const TextArea: FC<TextAreaProps> = (props) => {
  const { className, label, ...rest } = props

  return (
    <InputWrapper label={label}>
      <textarea className={cx(classes.input, classes.textArea, className)}  {...rest} />
    </InputWrapper>
  )

}
export const TextInput: FC<ComponentPropsWithoutRef<'input'>> = (props) => {
  const { className, ...rest } = props

  return (
    <InputWrapper>
      <input className={cx(classes.input, classes.textInput, className)}  {...rest} />
    </InputWrapper>
  )
}
