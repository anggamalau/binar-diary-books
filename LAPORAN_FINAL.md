

Pipeline sonarcloud masih error dikarenakan sonarqube gagal parsing test-report.xml
Akhirnya saya ubah manual di sonar-project.properties untuk ignore scanning file test-report.xml
```sh
sonar.testExecutionReportPaths=coverage/test-report.xml
menjadi
sonar.testExecutionReportPaths=
```

Selanjutnya menambahkan github actions untuk deployment ke railway.app
```sh
Do not code yet.
Make a plan to create a github actions to deploy this application into railway.app
If needed rearrage the github actions so all jobs is sequentially execute before finally deploy this application
```

Berikut adalah rekomendasi plan dari claude ai:
1. Create Sequential CI/CD Pipeline
2. Railway.app Deployment Setup 
3. Workflow Structure
4. Required Secrets
5. Environment Variables

```sh
proceed the plan
```

Masih terjadi error saat deployment, saya minta claude ai untuk mengecek
```sh
why is this error happend on github actions\
  Run railway up
    railway up
    shell: /usr/bin/bash -e {0}
    env:
      RAILWAY_TOKEN: ***
  Project Token not found
  Error: Process completed with exit code 1.
```

Claude ai menyarankan untuk mengubah yml pipeline dan menambahkan konfigurasi yang kurang di railway
```sh
Proceed the solution
```

Masih terjadi error di pipeline deployment, selanjutnya saya minta claude untuk mencari tahu penyebab errornya

```sh
Error still occured on github actions pipeline, please fix it.
Here is the error:

Run railway up
  railway up
  shell: /usr/bin/bash -e {0}
  env:
    RAILWAY_TOKEN: ***
    RAILWAY_PROJECT_ID: ***
    RAILWAY_SERVICE_ID: ***
  
Multiple services found. Please specify a service via the `--service` flag.
Error: Process completed with exit code 1.
```

Deployment gagal, dikarenakan gagal build docker image 

```sh
Pipeline deployment failed, here is the errors:

npm warn config production Use `--omit=dev` instead.
npm warn EBADENGINE Unsupported engine {
npm warn EBADENGINE   package: 'eslint-plugin-jest@29.0.1',
npm warn EBADENGINE   required: { node: '^20.12.0 || ^22.0.0 || >=24.0.0' },
npm warn EBADENGINE   current: { node: 'v18.20.5', npm: '10.8.2' }
npm warn EBADENGINE }
npm error code EBUSY
npm error syscall rmdir
npm error path /app/node_modules/.cache
npm error errno -16
npm error EBUSY: resource busy or locked, rmdir '/app/node_modules/.cache'
npm error A complete log of this run can be found in: /root/.npm/_logs/2025-08-01T10_41_47_344Z-debug-0.log
```

Masih terjadi error saat deploy,
```sh
Still error, here is the error:

unpacking 'https://github.com/NixOS/nixpkgs/archive/ffeebf0acf3ae8b29f8c7049cd911b9636efd7e7.tar.gz' into the Git cache...
unpacking 'https://github.com/railwayapp/nix-npm-overlay/archive/main.tar.gz' into the Git cache...
installing 'ffeebf0acf3ae8b29f8c7049cd911b9636efd7e7-env'
error:
       … while calling the 'derivationStrict' builtin
         at <nix/derivation-internal.nix>:37:12:
           36|
           37|   strict = derivationStrict drvAttrs;
             |            ^
           38|
       … while evaluating derivation 'ffeebf0acf3ae8b29f8c7049cd911b9636efd7e7-env'
         whose name attribute is located at /nix/store/lwi59jcfwk2lnrakmm1y5vw85hj3n1bi-source/pkgs/stdenv/generic/make-derivation.nix:375:7
       … while evaluating attribute 'passAsFile' of derivation 'ffeebf0acf3ae8b29f8c7049cd911b9636efd7e7-env'
         at /nix/store/lwi59jcfwk2lnrakmm1y5vw85hj3n1bi-source/pkgs/build-support/trivial-builders/default.nix:60:9:
           59|         inherit buildCommand name;
           60|         passAsFile = [ "buildCommand" ]
             |         ^
           61|           ++ (derivationArgs.passAsFile or [ ]);
       (stack trace truncated; use '--show-trace' to show the full, detailed trace)
       error: undefined variable 'nodejs-20_x'
       at /app/.nixpacks/nixpkgs-ffeebf0acf3ae8b29f8c7049cd911b9636efd7e7.nix:19:9:
           18|         '')
           19|         nodejs-20_x npm-10_x
             |         ^
           20|       ];
```

Masih error, 
```sh
Still error, fix this error:


npm warn deprecated are-we-there-yet@3.0.1: This package is no longer supported.
npm warn deprecated babel-eslint@10.1.0: babel-eslint is now @babel/eslint-parser. This package will no longer receive updates.
npm warn deprecated @npmcli/move-file@1.1.2: This functionality has been moved to @npmcli/fs
npm warn deprecated rimraf@2.6.3: Rimraf versions prior to v4 are no longer supported
npm warn deprecated rimraf@2.6.3: Rimraf versions prior to v4 are no longer supported
npm warn deprecated eslint@6.8.0: This version is no longer supported. Please see https://eslint.org/version-support for other options.
npm warn deprecated eslint@6.8.0: This version is no longer supported. Please see https://eslint.org/version-support for other options.
added 822 packages, and audited 823 packages in 6s
162 packages are looking for funding
  run `npm fund` for details
found 0 vulnerabilities
[stage-0  6/10] RUN --mount=type=cache,id=s/***-/root/npm,target=/root/.npm npm ci
[stage-0  7/10] COPY . /app/.
[stage-0  7/10] COPY . /app/.
[stage-0  8/10] RUN --mount=type=cache,id=s/***-node_modules/cache,target=/app/node_modules/.cache npm ci --omit=dev
npm warn config production Use `--omit=dev` instead.
Deploy failed
Error: Process completed with exit code 1.
```

Proses build berhasil, tetapi aplikasi belum run
```sh
Application building is success, but the application is failed to run
Here is the log:

Path: /
Retry window: 5m0s
Attempt #1 failed with service unavailable. Continuing to retry for 4m49s
Attempt #2 failed with service unavailable. Continuing to retry for 4m38s
Attempt #3 failed with service unavailable. Continuing to retry for 4m35s
Attempt #4 failed with service unavailable. Continuing to retry for 4m31s
Attempt #5 failed with service unavailable. Continuing to retry for 4m22s
Attempt #6 failed with service unavailable. Continuing to retry for 4m6s
Attempt #7 failed with service unavailable. Continuing to retry for 3m35s
Attempt #8 failed with service unavailable. Continuing to retry for 3m5s
Attempt #9 failed with service unavailable. Continuing to retry for 2m34s
Attempt #10 failed with service unavailable. Continuing to retry for 2m4s
Attempt #11 failed with service unavailable. Continuing to retry for 1m33s
```

Selanjutnya saya setup env di railway, dan menunggu deployment ke railway melalui github actions
