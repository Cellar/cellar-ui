import Button from '../Button'
import {Form, TextArea} from '../Form'
import {useLoaderData} from "react-router-dom";
import {ISecret} from "../../models/secret";

export const AccessSecretDisplay = () => {
  const { content: secretContent } = useLoaderData() as ISecret

  function handleCopySecret() {
    console.log('TODO copy secret') // TODO: copy secret to clipboard
  }

  return (
    <div>
      <Form>
        <TextArea
          readOnly={true}
          value={secretContent}
          rows={13}
          required/>
        <br />
        <div>
          <Button appearance={Button.appearances.primary} data-text="Copy Secret" onClick={handleCopySecret}>
            Create Secret
          </Button>
        </div>
      </Form>
    </div>
  )
}
