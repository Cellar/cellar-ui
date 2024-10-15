import { CreateSecretForm } from "../components/createSecret/CreateSecretForm";
import { Layout } from "../layouts/Layout";
import React from "react";
import {AccessSecretDisplay} from "../components/accessSecret/AccessSecretDisplay";
import {SecretMetadataDisplay} from "../components/secretMetadata/SecretMetadataDisplay";

export const SecretMetadata = () => {
  return (
    <Layout title="Secret Metadata">
      <SecretMetadataDisplay />
    </Layout>
  );
}

