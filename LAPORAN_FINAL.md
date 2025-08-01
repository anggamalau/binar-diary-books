

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

Selanjutnya saya setup env di railway, dan menunggu deployment ke railway melalui github actions
