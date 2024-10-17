import { Layout } from "../layouts/Layout";
import React from "react";
import {SecretMetadataDisplay} from "../components/secretMetadata/SecretMetadataDisplay";
import {ISecretMetadata} from "../models/secretMetadata";
import {IApiError} from "../models/error";

export const SecretMetadataLoader = async ({ params }: { params: any }): Promise<ISecretMetadata | IApiError>  => {
  const secretId = params.secretId;

  const res = await fetch(`/api/v1/secrets/${secretId}`);

  return res.json();
}

export const SecretMetadata = () => {
  return (
    <Layout title="Secret Metadata">
      <SecretMetadataDisplay />
    </Layout>
  );
}

