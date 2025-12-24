GREEN := "\033[0;32m"
NC := "\033[0;0m"

IMAGE_NAME ?= cellar-ui
IMAGE_TAG ?= local

APP_VERSION ?= 0.0.0

API_IMAGE ?= registry.gitlab.com/cellar-app/cellar-api
API_VERSION ?= 0.0.0 
API_PACKAGE_URL ?= https://gitlab.com/api/v4/projects/22424828/packages/generic/cellar-api

PACKAGE_TOKEN ?= ""
PACKAGE_REGISTRY_URL ?= localhost/projects/project-id/packages/generic/
PACKAGE_NAME ?= cellar-ui
PACKAGE_ID := ${PACKAGE_NAME}-${APP_VERSION}.tgz
PACKAGE_URL := ${PACKAGE_REGISTRY_URL}/${PACKAGE_NAME}/${APP_VERSION}/${PACKAGE_ID}

RELEASE_TAG := v${APP_VERSION}
RELEASE_NAME := "Release ${PACKAGE_NAME} ${RELEASE_TAG}"

VAULT_LOCAL_ADDR ?= http://127.0.0.1:8200
VAULT_ROOT_TOKEN ?= vault-admin
VAULT_TOKEN_NAME ?= cellar-key
VAULT_ROLE_NAME ?= cellar-testing

VAULT_REQUEST := @curl --header "X-Vault-Token: ${VAULT_ROOT_TOKEN}"

E2E_PARAMS ?= --project='figma' --project='figma-mobile' --project='figma-mobile-tiny'

BROWSER ?=
E2E_TEST ?=


LOG := @sh -c '\
	   printf ${GREEN}; \
	   echo -e "\n> $$1\n"; \
	   printf ${NC}' VALUE


-include .env

.PHONY: build publish

targets:
	@awk -F'::?[[:space:]]*' '/^[a-zA-Z0-9][^$#\/\t=]*::?([^=]|$$)/ { \
		gsub(/^[[:space:]]+|[[:space:]]+$$/, "", $$1); \
		gsub(/^[[:space:]]+|[[:space:]]+$$/, "", $$2); \
		split($$1,A,/ /); \
		target=A[1]; \
		deps=$$2; \
		printf "%s", target; \
		if (deps) printf " → %s", deps; \
		print "" \
	}' $(MAKEFILE_LIST)

build:
	$(LOG) "Running build with version ${APP_VERSION}"
	@APP_VERSION=${APP_VERSION} npm run build

test: test-unit test-e2e

test-unit:
	$(LOG) "Running unit tests"
	@npm run test

test-e2e:
	$(LOG) "Running e2e tests"
	@npm run test:e2e  -- ${E2E_PARAMS}

test-watch:
	$(LOG) "Running tests"
	@npm run test:watch

publish:
	$(LOG) "Setting build version ${APP_VERSION}"
	@npm version ${APP_VERSION}
	$(LOG) "Publishing site with angular"
	@npm publish
	$(LOG) "Compressing site as ${PACKAGE_ID}"
	@tar -czvf dist/${PACKAGE_ID} -C dist .
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
	@docker run -p 80:80 ${IMAGE_NAME}:${IMAGE_TAG}

docker-push:
	$(LOG) "Pushing docker image '${IMAGE_NAME}:${IMAGE_TAG}"
	@docker push ${IMAGE_NAME}:${IMAGE_TAG}

docker-publish: docker-build docker-push

docker-retag:
	$(LOG) "Pulling source image '${IMAGE_NAME}:${SOURCE_TAG}'"
	@docker pull ${IMAGE_NAME}:${SOURCE_TAG}
	$(LOG) "Retagging as '${IMAGE_NAME}:${IMAGE_TAG}'"
	@docker tag ${IMAGE_NAME}:${SOURCE_TAG} ${IMAGE_NAME}:${IMAGE_TAG}
	$(LOG) "Pushing retagged image '${IMAGE_NAME}:${IMAGE_TAG}'"
	@docker push ${IMAGE_NAME}:${IMAGE_TAG}

vault-configure: vault-enable-transit vault-enable-auth

vault-enable-transit:
	$(LOG) "Enabling the transit secrets engine with a single key"
	$(VAULT_REQUEST) -sX POST \
		--data '{"type": "transit"}' \
		${VAULT_LOCAL_ADDR}/v1/sys/mounts/transit
	$(VAULT_REQUEST) -sX POST \
		${VAULT_LOCAL_ADDR}/v1/transit/keys/${VAULT_TOKEN_NAME}

vault-enable-auth:
	$(LOG) "Enabling approle authentication transit secrets engine"
	$(VAULT_REQUEST) -sX POST \
		--data '{"type": "approle"}' \
		${VAULT_LOCAL_ADDR}/v1/sys/auth/approle
	$(LOG) "Adding role ${VAULT_ROLE_NAME} with full access to transit engine"
	$(VAULT_REQUEST) -sX PUT \
		--data '{"name":"transit","policy":"path \"transit/*\" {\n  capabilities = [ \"create\", \"read\", \"update\", \"delete\", \"list\" ]\n}"}' \
		${VAULT_LOCAL_ADDR}/v1/sys/policy/transit
	$(VAULT_REQUEST) -sX POST \
		--data '{"policies": "transit"}' \
		${VAULT_LOCAL_ADDR}/v1/auth/approle/role/${VAULT_ROLE_NAME}

vault-role-id:
	$(VAULT_REQUEST) -sX GET \
		${VAULT_LOCAL_ADDR}/v1/auth/approle/role/${VAULT_ROLE_NAME}/role-id \
		| jq -r '.data.role_id'

vault-secret-id:
	$(VAULT_REQUEST) -sX POST \
		${VAULT_LOCAL_ADDR}/v1/auth/approle/role/${VAULT_ROLE_NAME}/secret-id \
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


services: dotenv-clean clean-services services-api-dependencies services-vault-wait vault-configure dotenv-values services-api

dotenv-clean:
	$(LOG) "Generating empty .env file"
	@[ -f ".env" ] && rm -f .env || exit 0
	@echo "VAULT_ROLE_ID=" > .env
	@echo "VAULT_SECRET_ID=" >> .env

dotenv-values:
	@[ -f ".env" ] && rm -f .env || exit 0
	$(LOG) "Adding vault role to .env"
	@echo "VAULT_ROLE_ID=$$(make -s vault-role-id)" >> .env
	@echo "VAULT_SECRET_ID=$$(make -s vault-secret-id)" >> .env

services-api-dependencies:
	$(LOG) "Starting API dependencies"
	@docker compose pull
	@docker compose up -d redis vault

services-api:
	$(LOG) "Starting API"
	@docker compose up -d api

services-vault-wait:
	@timeout 10 \
		sh -c "until [[ $$(docker compose ps --format=json vault | jq '.Status' ) =~ Up ]]; do echo \"waiting for vault\"; sleep 1; done;" || \
		{ echo "Timed out waiting for Vault to startup"; exit 1; }

clean-services:
	@docker compose down
	@docker compose rm -svf
	@basename ${PWD} | xargs -I % docker volume rm -f %_redis_data

test-e2e-docker:
	$(LOG) "Running tests "${E2E_TEST}" in ${BROWSER}"
	@docker compose run --rm \
		--user $(shell id -u):$(shell id -g) \
		-v $(shell pwd):/app \
		-w /app \
		playwright bash -c "npm ci && npx playwright install && npx playwright test --project=$(BROWSER) ${E2E_TEST}"
	
# Run WebKit tests specifically in Docker
test-webkit-docker:
	$(LOG) "Running WebKit tests in Docker"
	@make test-e2e-docker BROWSER=webkit-desktop

# Run all browser configurations in Docker
test-e2e-docker-all:
	$(LOG) "Running all browser configurations in Docker"
	@docker compose run --rm \
		--user $(shell id -u):$(shell id -g) \
		-v $(shell pwd):/app \
		-w /app \
		playwright bash -c "npm ci && npx playwright install && npx playwright test"


format:
	@npm run format
