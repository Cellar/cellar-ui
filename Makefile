GREEN := "\033[0;32m"
NC := "\033[0;0m"

IMAGE_NAME ?= cellar-ui
IMAGE_TAG ?= local

APP_VERSION ?= 0.0.0

API_IMAGE ?= registry.gitlab.com/auroq/cellar/cellar-api
API_VERSION ?= 0.0.0
API_PACKAGE_URL ?= https://gitlab.com/api/v4/projects/22424828/packages/generic/cellar-api

PACKAGE_TOKEN ?= ""
PACKAGE_REGISTRY_URL ?= localhost/projects/project-id/packages/generic/
PACKAGE_NAME ?= cellar-ui
PACKAGE_ID := ${PACKAGE_NAME}-${APP_VERSION}.tgz
PACKAGE_URL := ${PACKAGE_REGISTRY_URL}/${PACKAGE_NAME}/${APP_VERSION}/${PACKAGE_ID}

RELEASE_TAG := v${APP_VERSION}
RELEASE_NAME := "Release ${PACKAGE_NAME} ${RELEASE_TAG}"

VAULT_ADDR ?= http://127.0.0.1:8200
VAULT_ROOT_TOKEN ?= vault-admin
VAULT_TOKEN_NAME ?= cellar-key
VAULT_ROLE_NAME ?= cellar-testing

VAULT_REQUEST := @curl --header "X-Vault-Token: ${VAULT_ROOT_TOKEN}"


LOG := @sh -c '\
	   printf ${GREEN}; \
	   echo -e "\n> $$1\n"; \
	   printf ${NC}' VALUE

.PHONY: build publish

build:
	$(LOG) "Running build"
	@npm run build

test-unit:
	$(LOG) "Running unit tests"
	@npm run test:ci

test-e2e:
	$(LOG) "Running e2e tests"
	@npm run e2e:ci

publish:
	$(LOG) "Setting build version ${APP_VERSION}"
	@npm version ${APP_VERSION}
	$(LOG) "Publishing site with angular"
	@npm run publish
	$(LOG) "Compressing site as ${PACKAGE_ID}"
	@cd dist && tar -czvf ${PACKAGE_ID} cellar-ui/*
	$(LOG) "Uploading package to ${PACKAGE_URL}"
	@curl \
		--header "JOB-TOKEN: ${PACKAGE_TOKEN}" \
		--upload-file dist/${PACKAGE_ID} \
		${PACKAGE_URL}

release:
	$(LOG) "Creating gitlab release '${RELEASE_NAME}'"
	@release-cli create \
		--name ${RELEASE_NAME}  \
		--tag-name ${RELEASE_TAG} \
		--assets-link '{"name": "${PACKAGE_ID}", "url":"${PACKAGE_URL}"}' \
		--assets-link '{"name": "${IMAGE_NAME}:${IMAGE_TAG}", "url":"https://${IMAGE_NAME}:${IMAGE_TAG}"}'

docker-build:
	$(LOG) "Building docker image '${IMAGE_NAME}:${IMAGE_TAG}"
	@docker build -t ${IMAGE_NAME}:${IMAGE_TAG} --build-arg APP_VERSION=${APP_VERSION} .

docker-run:
	$(LOG) "Running docker image '${IMAGE_NAME}:${IMAGE_TAG}"
	@docker run ${IMAGE_NAME}:${IMAGE_TAG}

docker-publish: docker-build
	$(LOG) "Pushing docker image '${IMAGE_NAME}:${IMAGE_TAG}"
	@docker push ${IMAGE_NAME}:${IMAGE_TAG}

vault-configure: vault-enable-transit vault-enable-auth

vault-enable-transit:
	$(LOG) "Enabling the transit secrets engine with a single key"
	$(VAULT_REQUEST) -sX POST \
		--data '{"type": "transit"}' \
		${VAULT_ADDR}/v1/sys/mounts/transit
	$(VAULT_REQUEST) -sX POST \
		${VAULT_ADDR}/v1/transit/keys/${VAULT_TOKEN_NAME}

vault-enable-auth:
	$(LOG) "Enabling approle authentication transit secrets engine"
	$(VAULT_REQUEST) -sX POST \
		--data '{"type": "approle"}' \
		${VAULT_ADDR}/v1/sys/auth/approle
	$(LOG) "Adding role ${VAULT_ROLE_NAME} with full access to transit engine"
	$(VAULT_REQUEST) -sX PUT \
		--data '{"name":"transit","policy":"path \"transit/*\" {\n  capabilities = [ \"create\", \"read\", \"update\", \"delete\", \"list\" ]\n}"}' \
		${VAULT_ADDR}/v1/sys/policy/transit
	$(VAULT_REQUEST) -sX POST \
		--data '{"policies": "transit"}' \
		${VAULT_ADDR}/v1/auth/approle/role/${VAULT_ROLE_NAME}

vault-role-id:
	$(VAULT_REQUEST) -sX GET \
		${VAULT_ADDR}/v1/auth/approle/role/${VAULT_ROLE_NAME}/role-id \
		| jq -r '.data.role_id'

vault-secret-id:
	$(VAULT_REQUEST) -sX POST \
		${VAULT_ADDR}/v1/auth/approle/role/${VAULT_ROLE_NAME}/secret-id \
		| jq -r '.data.secret_id'

api-run:
	@docker run --rm -d ${API_IMAGE}:${API_VERSION}

api-run-binary:
	$(LOG) "Acquiring cellar binary version ${API_VERSION}"
	@curl \
		--header "JOB-TOKEN: ${PACKAGE_TOKEN}" \
		-o cellar-api \
		${API_PACKAGE_URL}/${API_VERSION}/cellar-api-${API_VERSION}-linux-amd64
	@chmod +x cellar-api
	$(LOG) "Starting Cellar"
	@./cellar-api & sleep 5
