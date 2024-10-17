import { Layout } from "../layouts/Layout";
import React from "react";
import {SecretMetadataDisplay} from "../components/secretMetadata/SecretMetadataDisplay";
import {ISecretMetadata} from "../models/secretMetadata";
import {IApiError} from "../models/error";
import {getSecretMetadata} from "../api/client";

export const SecretMetadataLoader = async ({ params }: { params: any }): Promise<ISecretMetadata | IApiError>  => {
  const secretId = params.secretId;

  return getSecretMetadata(secretId);
}

export const SecretMetadata = () => {
  return (
    <Layout title="Secret Metadata">
      <SecretMetadataDisplay />
    </Layout>
  );
}

