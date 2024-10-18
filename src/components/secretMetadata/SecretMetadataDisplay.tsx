import Button from '../Button'
import classes from "../secretMetadata/SecretMetadataDisplay.module.css";
import {useLoaderData, useNavigate} from "react-router-dom";
import {ISecretMetadata} from "../../models/secretMetadata";
import {TextInput} from "../Form";

export const SecretMetadataDisplay = () => {

  const {
    id: secretId,
    expiration: expiration,
    access_count: accessCount,
    access_limit: accessLimit,
  } = useLoaderData() as ISecretMetadata;


  async function handleCopyLinkSecret() {
    await navigator.clipboard.writeText(`${window.location.origin}/secret/${secretId}/access`)
  }

  async function handleCopyLinkMetadata() {
    await navigator.clipboard.writeText(`${window.location.origin}/secret/${secretId}`)
  }

  return (
    <>
      <div className={classes.metadataRow}>
        <div>
          <span className={classes.header}>Expires On</span>
          <p className={classes.metadataText}>{expiration.toString()}</p>
        </div>
        <div>
          <span className={classes.header}>Accessed</span>
          <p className={classes.metadataText}>{accessCount} of {accessLimit} times</p>
        </div>
      </div>
      <br/>
      <div>
        <TextInput className={classes.secretId} value={secretId} readOnly={true}/>
      </div>
      <br/>
      <div className={classes.metadataActions}>
        <Button appearance={Button.appearances.secondary} onClick={handleCopyLinkSecret}>
          Copy Link to Secret
        </Button>
        <Button appearance={Button.appearances.secondary} onClick={handleCopyLinkMetadata}>
          Copy Link to Metadata
        </Button>
        <div className={classes.shim}/>
        <a className={classes.delete}>Delete Secret</a>
      </div>
    </>
  )
}
