import React, {useState} from 'react'

import Button from '../Button'
import {Form, FormButton, TextArea, TextInput, ToggleButton} from '../Form'

import classes from './CreateSecretForm.module.css'
import {RelativeExpiration} from "./RelativeExpiration";
import {AbsoluteExpiration} from "./AbsoluteExpiration";
import {createSecret} from "../../api/client";
import {ISecretMetadata} from "../../models/secretMetadata";
import {useNavigate} from "react-router-dom";

const ExpirationModes = {
  Absolute: 'Expire On (Absolute)',
  Relative: 'Expire After (Relative)',
}

export const CreateSecretForm = () => {
  const [secretContent, setSecretContent] = useState('')
  const [expirationMode, setExpirationMode] = useState(ExpirationModes.Relative)
  const [accessLimit, setAccessLimit] = useState(1)
  const [accessLimitDisabled, setAccessLimitDisabled] = useState(false)

  const navigate = useNavigate()

  const now = new Date()
  let inTwentyFourHours = new Date()
  inTwentyFourHours.setHours(now.getHours() + 24, now.getMinutes(), 0, 0)
  const [expirationDate, setExpirationDate] = useState(inTwentyFourHours)

  function handleSetAccessLimit(newLimit: number) {
    if (newLimit > 0)
      setAccessLimit(newLimit)
  }

  async function handleCreateSecret() {
    const metadata = await createSecret(secretContent, expirationDate, accessLimitDisabled ? -1 : accessLimit)
    navigate(`/secret/${(metadata as ISecretMetadata).id}`)
  }

  return (
    <div>
      <Form>
        <TextArea
          rows={13}
          placeholder="Enter Secret Content"
          onChange={e => setSecretContent(e.target.value)}
          required/>
        <br />
        <div className={classes.formControls}>
          <div>
            <span className={classes.header}>Expiration</span>
            <div>
              {
                (expirationMode === ExpirationModes.Relative) &&
                <>
                  <button className={classes.expirationModeOption}
                          onClick={() => setExpirationMode(ExpirationModes.Absolute)}>{ExpirationModes.Absolute}</button>
                  <br/>
                  <RelativeExpiration expiration={expirationDate} setExpiration={setExpirationDate}/>
                </>
              }
              {
                (expirationMode === ExpirationModes.Absolute) &&
                <>
                  <AbsoluteExpiration expiration={expirationDate} setExpiration={setExpirationDate}/>
                  <br />
                  <button className={classes.expirationModeOption}
                          onClick={() => setExpirationMode(ExpirationModes.Relative)}>{ExpirationModes.Relative}</button>
                </>
              }
            </div>
          </div>
          <div className={classes.shim}/>
          <div>
            <span className={classes.header}>Access Limit</span>
            <div className={classes.accessLimitElements}>
              <TextInput
                inputMode='numeric'
                value={accessLimit}
                className={classes.accessLimitInput}
                onChange={(e) => handleSetAccessLimit(+e.target.value)}/>
              <FormButton onClick={() => handleSetAccessLimit(accessLimit - 1)}>-</FormButton>
              <FormButton onClick={() => handleSetAccessLimit(accessLimit + 1)}>+</FormButton>
              <p className={classes.orText}>or</p>
              <ToggleButton className={classes.noLimitInput} setParentState={setAccessLimitDisabled}>No Limit</ToggleButton>
            </div>
          </div>
        </div>
        <br/>
        <div>
          <Button appearance={Button.appearances.primary} data-text="Create Secret" onClick={handleCreateSecret}>
            Create Secret
          </Button>
        </div>
      </Form>
    </div>
  )
}
