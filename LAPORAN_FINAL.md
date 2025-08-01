

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

Selanjutnya saya setup env di railway, dan menunggu deployment ke railway melalui github actions
