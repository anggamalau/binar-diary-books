

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

Selanjutnya saya setup env di railway, dan menunggu deployment ke railway melalui github actions