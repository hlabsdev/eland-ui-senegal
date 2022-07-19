## Running your UI locally

In this file are mentioned the steps to run the foncier-ui project with VSCode. 

---
## Requirements

* Install Docker Desktop (uninstall Docker Toolbox if you have it), Java 8 and Maven, NodeJS 12.16.3.
* Clone the foncier parent repository from https://bitbucket.org/ucis/foncier-ui-senegal
   (if you use this call "git clone https://<your_bitbucket_user>@bitbucket.org/ucis/foncier-ui-senegal.git)
* Pull the latest changes with the correct branch you need to use.
* Sign in to Docker Jfrog: docker login sogema-docker.jfrog.io
* You need to use docker to run foncier-wf (Camunda). Clone https://bitbucket.org/ucis/foncier/ 
   and run docker-compose -f docker-compose-dev.yml up -d foncier-wf. 

---
## Setting up pgAdmin

* Download and install pgAdmin
* Server → Create Server 
* General → Set the name as docker-container
* Connection → Set the host name as localhost
  - Username : foncier_api and password : Test123
  - Click Save
* Add databases:
  - Verify that under Login/Group Roles → foncier_api → right click Properties → Privileges, you 
   have the right to create roles and databases. If not, change the No to a Yes and click Save.
  - right click Databases and click create → Database. Create 3 databases with the names : ladm, 
   ladm_test and process-engine. 

---
## Deploy Foncier UI locally with VSCode

* Install VSCode
* Add the VSCode extensions:
  - EditorConfig for VS Code 0.15.1
  - TSLint 1.0.44
  - ESLint 2.1.8
* Click File → Open Folder → Open foncier-ui 
* Install NodeJS version 12.16.3
* In your foncier repo, write this : npm install -g @angular/cli
* In VS Code, src/app, right click Open Terminal, and make npm install. This may take a few minutes.
* To run the project npm start.
