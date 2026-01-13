import { Layout } from "../layouts/Layout";
import React from "react";
import { SecretMetadataDisplay } from "../components/secretMetadata/SecretMetadataDisplay";
import { ISecretMetadata } from "../models/secretMetadata";
import { isApiError } from "../models/error";
import { getSecretMetadata } from "../api/client";

export const SecretMetadataLoader = async ({
  params,
}: {
  params: any;
}): Promise<ISecretMetadata> => {
  const secretId = params.secretId;

  const result = await getSecretMetadata(secretId);

  // If we got an error, throw it so React Router error boundary catches it
  if (isApiError(result)) {
    throw result;
  }

  return result;
};

export const SecretMetadata = () => {
  return (
    <Layout title="Secret Metadata">
      <SecretMetadataDisplay data-testid="secret-metadata-display" />
    </Layout>
  );
};
