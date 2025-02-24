import Button from "src/components/buttons/Button";
import classes from "../secretMetadata/SecretMetadataDisplay.module.css";
import { useLoaderData, useNavigate } from "react-router-dom";
import { ISecretMetadata } from "@/models/secretMetadata";
import { TextArea } from "src/components/form/Form";
import { deleteSecret } from "@/api/client";
import {
  formatDate,
  formatDateAndTime,
  formatTime,
  getTimeZone,
} from "@/helpers/helpers";
import { useMediaQuery } from "@mantine/hooks";
import { CopyButton } from "src/components/buttons/CopyButton";

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
          <p className={classes.metadataText} data-testid="access-count">
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
            <CopyButton
              appearance={Button.appearances.secondary}
              text="Copy Link to Secret"
              textToCopy={`${window.location.origin}/secret/${secretId}/access`}
            />
            <div className={classes.shim} />
            <a className={classes.delete} onClick={handleDeleteSecret}>
              Delete Secret
            </a>
          </div>
          <div className={classes.actionsLine}>
            <CopyButton
              appearance={Button.appearances.secondary}
              text="Copy Link to Metadata"
              textToCopy={`${window.location.origin}/secret/${secretId}`}
            />
            <div className={classes.shim} />
          </div>
        </div>
      ) : (
        <div className={classes.metadataActions}>
          <div className={classes.copyActions}>
            <CopyButton
              data-testid="copy-secret-link-button"
              appearance={Button.appearances.secondary}
              text="Copy Link to Secret"
              textToCopy={`${window.location.origin}/secret/${secretId}/access`}
            />
            <CopyButton
              data-testid="copy-metadata-link-button"
              appearance={Button.appearances.secondary}
              text="Copy Link to Metadata"
              textToCopy={`${window.location.origin}/secret/${secretId}`}
            />
          </div>
          <div className={classes.shim} />
          <a
            data-testid="delete-secret-button"
            className={classes.delete}
            onClick={handleDeleteSecret}
          >
            Delete Secret
          </a>
        </div>
      )}
    </>
  );
};
