import Button from '../Button'
import {Form, TextArea} from '../Form'
import {useLoaderData} from "react-router-dom";
import {ISecret} from "../../models/secret";
import classes from "./AccessSecretDisplay.module.css";

export const AccessSecretDisplay = () => {
  const { content: secretContent } = useLoaderData() as ISecret

  async function handleCopySecret() {
    await navigator.clipboard.writeText(secretContent)
  }

  return (
    <div>
      <Form>
        <TextArea
          readOnly={true}
          value={secretContent}
          rows={8}
          required/>
        <div className={classes.formSection}>
          <Button appearance={Button.appearances.primary} data-text="Copy Secret" onClick={handleCopySecret}>
            Create Secret
          </Button>
        </div>
      </Form>
    </div>
  )
}
