# CI/CD with GitHub Actions

Three workflows live in `.github/workflows/`:

| Workflow | Runs when | Needs AWS? | What it does |
|---|---|---|---|
| **CI** (`ci.yml`) | Every PR to `main`, every push to `main` | No | Lint/test/build each Node app, test-build Docker images, `terraform fmt` + `validate`, validate K8s YAML, lint the workflow files |
| **Deploy** (`deploy.yml`) | After CI **passes** on `main`, or by hand | Yes | Build both images → push to ECR (tagged with the commit SHA) → apply manifests to EKS → wait for healthy rollout → **auto-rollback** if it isn't |
| **Infra** (`infra.yml`) | By hand only (Actions tab) | Yes | `terraform plan` / `apply` / `destroy` with shared S3 state |

```
PR ──► CI ──(merge)──► CI on main ──pass──► Deploy: build ─► push ECR ─► kubectl apply ─► rollout OK?
                                                                                          ├─ yes: done
                                                                                          └─ no: rollout undo + fail
Actions tab ──► Infra: plan | apply | destroy
```

Jobs skip themselves until the folders they need exist. You can merge this today, before the
app or manifests are written, and CI stays green.

---

## One-time setup

**1. Pick ONE lab account for the whole team.** Each student's Learner Lab is a separate AWS
account. The cluster, ECR, and Terraform state must all live in one, and the repo secrets must
come from that same account.

**2. Install the GitHub CLI** and log in: `gh auth login`.

**3. Optional repo variables** (Settings → Secrets and variables → Actions → *Variables*):
`AWS_REGION` (default `us-east-1`), `CLUSTER_NAME` (default `kubemonitor-eks`).

**4. Shared Terraform state.** From the repo root, with lab credentials in `~/.aws/credentials`:
```bash
./scripts/bootstrap-tf-state.sh
cd infra/terraform
terraform init -backend-config=backend.hcl          # fresh start
# or, if you already applied piece 1 with local state:
terraform init -backend-config=backend.hcl -migrate-state
```
The Infra workflow creates the same bucket automatically if it doesn't exist, so step 4 only
matters for running Terraform from a laptop.

**5. Before the first push**, run `terraform fmt -recursive infra/` once so CI's format check
passes.

## Every lab session (the part that's easy to forget)

Learner Lab credentials expire when the session ends (~4 hours). The secrets in GitHub expire
with them.

1. Start Lab → AWS Details → AWS CLI: Show → paste into `~/.aws/credentials`
2. `./scripts/refresh-gh-secrets.sh`

If a workflow fails with **"AWS credentials expired"**, that's the fix. CI never needs this.

This is also why there's no scheduled "destroy at midnight" job: by midnight the stored
credentials are already dead. Use the Infra workflow → `destroy` (type `DESTROY` to confirm)
at the end of each work session.

## Typical day

1. Start lab, refresh secrets
2. Actions → **Infra** → Run workflow → `apply` (~15–20 min)
3. Push/merge to `main` → CI → Deploy runs automatically
4. Done for the day: Actions → **Infra** → `destroy`, confirm `DESTROY`

---

## Contract for teammates (app + manifests)

The pipeline expects this layout. Follow it and deploys work with no workflow changes.

```
frontend/
  dashboard/           # Next.js  -> component "web"
    package.json
    package-lock.json  # commit it - CI uses `npm ci`
    Dockerfile         # needed before Deploy will ship it
backend/
  api/                 # Express  -> component "api"
    package.json
    package-lock.json
    Dockerfile
k8s/
  *.yaml               # all manifests, flat folder
```

**Moving a folder?** Edit `.github/components.json`. It maps each component name to its
folder, and every workflow reads it. Don't hard-code paths in the workflows.

**npm scripts** - `lint`, `test`, `build` are each run *if present*, so missing ones are fine.

**Dockerfiles** must build from their own folder (`docker build frontend/dashboard`) and
produce an x86 (`linux/amd64`) image. Until a component has a Dockerfile, CI skips its
Docker build and Deploy doesn't ship it.

**Manifests:**
- Namespace: `kubemonitor` (include a `Namespace` object in `k8s/`)
- Write the image as a placeholder; the pipeline fills in the exact ECR image + commit SHA:
  ```yaml
  containers:
    - name: api
      image: ${API_IMAGE}    # the dashboard uses ${WEB_IMAGE}
  ```
- Give every Deployment a **readinessProbe** and **livenessProbe**. The rollout check (and the
  self-healing demo) depend on them. Without a readiness probe, a broken release looks
  "healthy" and won't be rolled back.

## Demo idea: failed-deploy auto-rollback

1. On a branch, break the API's health endpoint (e.g. return 500), merge to `main`.
2. Deploy runs; new pods fail readiness; after 180 s the job prints events, runs
   `kubectl rollout undo`, and fails red.
3. Show the dashboard: the old version kept serving the whole time.

## Troubleshooting

| Error | Cause / fix |
|---|---|
| `AWS credentials expired` | New lab session. Run `refresh-gh-secrets.sh`. |
| `Cluster ... is MISSING` | Infra is destroyed. Run Infra → `apply`. |
| `terraform fmt` fails in CI | Run `terraform fmt -recursive infra/` and commit. |
| `npm ci` fails | `package-lock.json` missing or out of date. Run `npm install` and commit the lockfile. |
| Pods stuck `ImagePullBackOff` | That component has no Dockerfile yet, so no image was pushed. |
| Error acquiring state lock | Another Infra run is going, or one crashed. Wait, or `terraform force-unlock <id>` locally. |
| Deploy didn't run after a merge | CI failed on `main` (Deploy only follows a green CI). Check the CI run. |
