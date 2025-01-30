import Button from "../Button";
import classes from "../secretMetadata/SecretMetadataDisplay.module.css";
import { useLoaderData, useNavigate } from "react-router-dom";
import { ISecretMetadata } from "@/models/secretMetadata";
import { TextArea } from "../Form";
import { deleteSecret } from "@/api/client";
import {
  formatDate,
  formatDateAndTime,
  formatTime,
  getTimeZone,
} from "@/helpers/helpers";
import { useMediaQuery } from "@mantine/hooks";

export const SecretMetadataDisplay = () => {
  const navigate = useNavigate();
  const isMobile = useMediaQuery("(max-width: 1000px)");
  const isTinyMobile = useMediaQuery("(max-width: 393px)");

  const {
    id: secretId,
    expiration: expiration,
    access_count: accessCount,
    access_limit: accessLimit,
  } = useLoaderData() as ISecretMetadata;

  async function handleCopyLinkSecret() {
    await navigator.clipboard.writeText(
      `${window.location.origin}/secret/${secretId}/access`,
    );
  }

  async function handleCopyLinkMetadata() {
    await navigator.clipboard.writeText(
      `${window.location.origin}/secret/${secretId}`,
    );
  }

  async function handleDeleteSecret() {
    if (window.confirm("Are you sure you wish to delete this secret?")) {
      await deleteSecret(secretId);
      navigate("/secret/create");
    }
  }

  return (
    <>
      <p data-testid="details-label" className={classes.detailsLabel}>
        details
      </p>
      <div className={classes.metadataRow}>
        <div>
          <div className={classes.headerWrapper}>
            <span className={classes.header}>Expires On</span>
          </div>
          {isMobile ? (
            <p className={classes.metadataText}>
              {formatDate(expiration)}
              <br />
              {`${formatTime(expiration)} ${getTimeZone(expiration)}`}
            </p>
          ) : (
            <p className={classes.metadataText}>
              {formatDateAndTime(expiration)}
            </p>
          )}
        </div>
        <div>
          <div className={classes.headerWrapper}>
            <span className={classes.header}>Accessed</span>
          </div>
          <p className={classes.metadataText}>
            {(accessLimit > 0 && `${accessCount} of ${accessLimit} times`) ||
              `${accessCount} times`}
          </p>
        </div>
      </div>
      <TextArea
        rows={isMobile ? (isTinyMobile ? 3 : 2) : 1}
        wrapperClassName={classes.secretIdWrapper}
        className={classes.secretId}
        value={secretId}
        readOnly={true}
      />
      {isMobile ? (
        <div className={classes.metadataActions}>
          <div className={classes.actionsLine}>
            <Button
              appearance={Button.appearances.secondary}
              onClick={handleCopyLinkSecret}
            >
              Copy Link to Secret
            </Button>
            <div className={classes.shim} />
            <a className={classes.delete} onClick={handleDeleteSecret}>
              Delete Secret
            </a>
          </div>
          <div className={classes.actionsLine}>
            <Button
              appearance={Button.appearances.secondary}
              onClick={handleCopyLinkMetadata}
            >
              Copy Link to Metadata
            </Button>
            <div className={classes.shim} />
          </div>
        </div>
      ) : (
        <div className={classes.metadataActions}>
          <div className={classes.copyActions}>
            <Button
              appearance={Button.appearances.secondary}
              onClick={handleCopyLinkSecret}
            >
              Copy Link to Secret
            </Button>
            <Button
              appearance={Button.appearances.secondary}
              onClick={handleCopyLinkMetadata}
            >
              Copy Link to Metadata
            </Button>
          </div>
          <div className={classes.shim} />
          <a className={classes.delete} onClick={handleDeleteSecret}>
            Delete Secret
          </a>
        </div>
      )}
    </>
  );
};
