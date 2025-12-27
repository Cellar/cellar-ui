import Button from "src/components/buttons/Button";
import { Form, TextArea } from "src/components/form/Form";
import { useLoaderData } from "react-router-dom";
import { ISecret } from "@/models/secret";
import classes from "./AccessSecretDisplay.module.css";
import { useMediaQuery } from "@mantine/hooks";
import { CopyButton } from "src/components/buttons/CopyButton";

export const AccessSecretDisplay = () => {
  const secret = useLoaderData() as ISecret;
  const isMobile = useMediaQuery("(max-width: 1000px)");

  const handleSaveFile = () => {
    if (!secret.fileBlob || !secret.filename) return;

    const url = window.URL.createObjectURL(secret.fileBlob);
    const a = document.createElement("a");
    a.href = url;
    a.download = secret.filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  if (secret.contentType === "file") {
    return (
      <div>
        <Form data-testid="access-secret-form">
          <div data-testid="file-info-card" className={classes.fileInfo}>
            <div className={classes.fileDetails}>
              <p className={classes.fileLabel}>Filename:</p>
              <p className={classes.fileName} data-testid="file-name">
                {secret.filename}
              </p>
            </div>
            <div className={classes.fileDetails}>
              <p className={classes.fileLabel}>Size:</p>
              <p className={classes.fileSize} data-testid="file-size">
                {secret.fileBlob
                  ? `${(secret.fileBlob.size / (1024 * 1024)).toFixed(2)} MB`
                  : "Unknown"}
              </p>
            </div>
          </div>
          <div className={classes.formSection}>
            <Button
              data-testid="save-file-button"
              appearance={Button.appearances.primary}
              textstates={["Save File"]}
              onClick={handleSaveFile}
            >
              Save File
            </Button>
          </div>
        </Form>
      </div>
    );
  }

  return (
    <div>
      <Form data-testid="access-secret-form">
        <TextArea
          data-testid="secret-content"
          className={classes.secretContent}
          readOnly={true}
          value={secret.content}
          rows={isMobile ? 11 : 11}
          required
        />
        <div className={classes.formSection}>
          <CopyButton
            data-testid="copy-secret-button"
            appearance={Button.appearances.primary}
            text="Copy Secret"
            textToCopy={secret.content}
            confirmationText="Copied"
            showCheckmark={false}
          />
        </div>
      </Form>
    </div>
  );
};
