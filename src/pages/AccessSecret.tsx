import { Layout } from "../layouts/Layout";
import React from "react";
import { AccessSecretDisplay } from "../components/accessSecret/AccessSecretDisplay";
import { isApiError } from "../models/error";
import { accessSecret } from "../api/client";
import { ISecret } from "../models/secret";

export const AccessSecretLoader = async ({
  params,
}: {
  params: any;
}): Promise<ISecret> => {
  const secretId = params.secretId;

  const result = await accessSecret(secretId);

  // If we got an error, throw it so React Router error boundary catches it
  if (isApiError(result)) {
    throw result;
  }

  return result;
};

export const AccessSecret = () => {
  return (
    <Layout title="The Secret">
      <AccessSecretDisplay data-testid="access-secret-display" />
    </Layout>
  );
};
