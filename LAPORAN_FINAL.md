

Pipeline sonarcloud masih error dikarenakan sonarqube gagal parsing test-report.xml
Akhirnya saya ubah manual di sonar-project.properties untuk ignore scanning file test-report.xml
```sh
sonar.testExecutionReportPaths=coverage/test-report.xml
menjadi
sonar.testExecutionReportPaths=
```