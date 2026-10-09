# CI/CD with GitHub Actions

Everything for CI/CD lives in `.github/`. Three workflows:

| Workflow | Runs when | Needs AWS? | What it does |
|---|---|---|---|
| **CI** (`workflows/ci.yml`) | Every PR to `main`, every push to `main` | No | Lint/test/build each Node app, test-build its Docker image, validate K8s YAML, `terraform fmt` + `validate`, lint the workflow files |
| **Deploy** (`workflows/deploy.yml`) | After CI **passes** on `main`, or by hand | Yes | Build images → push to ECR (tagged with the commit SHA) → apply `k8s/` manifests → wait for healthy rollout → **auto-rollback** if it isn't |
| **Infra** (`workflows/infra.yml`) | By hand only (Actions tab) | Yes | `terraform plan` / `apply` / `destroy` on `infra/terraform`, with shared S3 state |

```
PR ──► CI ──(merge)──► CI on main ──pass──► Deploy: build ─► push ECR ─► kubectl apply ─► rollout OK?
                                                                                          ├─ yes: done
                                                                                          └─ no: rollout undo + fail
Actions tab ──► Infra: plan | apply | destroy
```

**Every job skips itself until the code it needs exists** (no Dockerfile → no image build,
no `k8s/` → no deploy, no `infra/terraform` → no Terraform check). Nothing goes red just
because a teammate's part isn't merged yet.

---

## Setup (once)

1. **Pick ONE Learner Lab account for the team.** Each student's lab is a separate AWS account.
   The cluster, ECR repos, Terraform state and the GitHub secrets must all come from the same one.
2. **Add three repository secrets** (Settings → Secrets and variables → Actions → *Secrets*),
   copied from Learner Lab → AWS Details → AWS CLI: Show:
   `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `AWS_SESSION_TOKEN`
3. **Optional repository variables** (same page → *Variables*), only if the infrastructure uses
   different names:

   | Variable | Default | Meaning |
   |---|---|---|
   | `AWS_REGION` | `us-east-1` | Region of the cluster |
   | `CLUSTER_NAME` | `kubemonitor-eks` | EKS cluster name |
   | `ECR_PREFIX` | `kubemonitor` | ECR repos are `<prefix>-web` and `<prefix>-api` |

## Every lab session

Learner Lab credentials expire when the session ends (~4 hours), and the GitHub secrets
expire with them. Each session: Start Lab → copy the new credentials → update the three
secrets. With the GitHub CLI installed and the credentials pasted into `~/.aws/credentials`,
one command does it:

```bash
./.github/scripts/refresh-gh-secrets.sh
```

If Deploy or Infra fails with **"AWS credentials expired"**, that's the fix. CI never needs it.

---

## What the pipeline expects from each part of the project

### App code (dashboard + API)
Folders are mapped in `.github/components.json`. Edit that file if a folder moves; don't
hard-code paths in the workflows.

| Component | Folder | Image name |
|---|---|---|
| `web` | `frontend/dashboard` | `<ECR_PREFIX>-web` |
| `api` | `backend/api` | `<ECR_PREFIX>-api` |

- Commit `package-lock.json` (CI uses `npm ci`).
- `lint`, `test`, `build` npm scripts each run *if present*.
- A `Dockerfile` in the component folder that builds an x86 (`linux/amd64`) image.
  No Dockerfile = CI skips the Docker build and Deploy doesn't ship it.

### Kubernetes manifests
- All YAML in a flat `k8s/` folder, namespace `kubemonitor` (include the `Namespace` object).
- Use placeholders for images; Deploy fills in the exact ECR image + commit SHA:
  ```yaml
  image: ${API_IMAGE}   # dashboard uses ${WEB_IMAGE}
  ```
- Every Deployment needs a **readinessProbe** and **livenessProbe**. Rollout checking and
  auto-rollback depend on them.

### Terraform (for the Infra workflow and CI checks)
- Code in `infra/terraform/`.
- Terraform ≥ 1.10, with an empty S3 backend block so the workflow can pass the settings in:
  ```hcl
  terraform {
    backend "s3" {}
  }
  ```
  The workflow creates the bucket `kubemonitor-tfstate-<account-id>` if it doesn't exist.
- Must create the EKS cluster and the two ECR repos with the names in the table above
  (or set the repo variables to match).
- Run `terraform fmt -recursive` before committing, or CI fails the format check.

---

## Demo idea: failed-deploy auto-rollback

1. On a branch, break the API's health endpoint (e.g. return 500), merge to `main`.
2. Deploy runs; new pods fail readiness; after 180 s the job prints events, runs
   `kubectl rollout undo`, and fails red.
3. Show the dashboard: the old version kept serving the whole time.

## Troubleshooting

| Error | Fix |
|---|---|
| `AWS credentials expired` | New lab session. Update the three secrets. |
| `Cluster ... is MISSING` | Infrastructure is down. Actions → Infra → `apply`. |
| `No Terraform yet` (Infra workflow) | `infra/terraform/` isn't merged yet. |
| `terraform fmt` fails in CI | Run `terraform fmt -recursive infra/` and commit. |
| `npm ci` fails | `package-lock.json` missing or stale. Run `npm install`, commit the lockfile. |
| Pods stuck `ImagePullBackOff` | That component has no Dockerfile yet, so no image was pushed. |
| Deploy didn't run after a merge | CI failed on `main`. Deploy only follows a green CI. |
| Nothing runs in a fork | Forks start with Actions off. Actions tab → enable workflows. |
