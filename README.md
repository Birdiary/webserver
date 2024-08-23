# Birdiary - webserver 

## Information
Nowadays, more species are threatened with extinction than ever before in the human era.
Especially breeding birds are considered endangered. 
At the same time, it is difficult to obtain sufficient data not only to raise awareness for this situation, but also to gain a better understanding and to develop potential countermeasures.
The Birdiary project demonstrates how a citizen science based biodiversity monitoring for birds, using an automated and easy-to-use multi-sensor feeder, can look like. 
A smart bird feeder including an environmental sensor, a microphone, as well as a balance and a camera in a wooden case which identifies the type of visiting birds using AI and publishes the recognized species, including all further collected data on an open access website. 
The station can be reproduced by anyone at an affordable price in a Do-It-Yourself format, making citizens a key contributor to biodiversity monitoring.

This repository contains the code to run the webserver. 
All the collected data is send by a feeder which is based on this [repository](https://github.com/Birdiary/station). 
The repositories are currently still under development, the code for the operation of the feeder as well as for the web server are continuously updated. 
A corresponding manual for the operation of the system including open source instructions for building the feeder is available online: [Birdiary Manual](https://docs.google.com/document/d/1ItowLull5JF3irzGtbR-fCmgelG3B7DSaU1prOeQXA4/). 

Birdiary is a project which was launched by a group of students at the Institute for Geoinformatics at the University of Münster. 
If you got any questions contact us via: [info@wiediversistmeingarten.org](mailto:info@wiediversistmeingarten.org).

Any further information you can find via: [birdiary.de](https://www.wiediversistmeingarten.org/). 

## Installation
To run the platform you first have to install docker, which then installs all further needed packages and programs. After the installation you can clone and run the platform in development or production environment.

### Docker

 * Install Docker Desktop: https://docs.docker.com/desktop/#download-and-install

Linux Users can also use the Installation of a seperate docker engine and compose installation:
 * Install docker engine: https://docs.docker.com/engine/install/
 * Install docker-compose: https://docs.docker.com/compose/install/

### Git

 * Install Git: https://git-scm.com/downloads

### Clone Project 
```bash
git clone https://github.com/Birdiary/webserver.git
cd webserver
```

### Development environment with docker-compose

This project contains one `docker-compose` configuration (file `docker-compose-dev.yml`) to run all microservices & databases, and mount the client application directly from the source directory `client`.
If you see an error related to the MongoDB or HTTP request timeouts during the first "up", abort the execution, then try again.

```bash
docker-compose --file docker-compose-dev.yml up
```

The platform is available at [http://localhost:8080](http://localhost:8080) and the API at `http://localhost:8080/api`.

### Production environment with docker-compose

This project has another docker-compose configuration for the deployment of a production build (file `docker-compose.yml`).
This configuration has no `ui` container. Instead the webserver container creates a static production build with the command [`npm run build`](https://create-react-app.dev/docs/available-scripts/) using a [multi-stage docker file](https://docs.docker.com/develop/develop-images/multistage-build/) (file `nginx/data_visualization/Dockerfile`) which is then served through nginx.

To start the platform with the production build:

```bash

docker-compose up 

# force rebuild of images
docker-compose up --build
```

## How to Contribute
Thank you for considering contributing to Birdiary. Birdiary is an open source project, and we love to receive contributions from our community — you!
There are many ways to contribute, from writing tutorials or blog posts, improving the documentation, submitting bug reports and feature requests or writing code which can be incorporated into Birdiary itself.
We use GitHub to host code, to track issues and feature requests, as well as accept pull requests.
This Repository comprises the code and issues for the webserver. Which means, if you want to contribute to the website wiediversistmeingarten.org or to our API, please contribute here. Whereas when you want to contribute to the station, please use the Birdiary [station](https://github.com/Birdiary/station). 

### Reporting Bugs
If you find a security vulnerability, do NOT open an issue. Email info@wiediversistmeingarten.org instead.
 
If you encounter a bug, check if the bug has already been reported as [issue](https://github.com/Birdiary/webserver/issues). If the bug has not been reported, you can open a [new issue](https://github.com/Birdiary/webserver/issues/new) to report the bug, please add the label "bug".
 
When filing an issue, make sure to answer these four questions:
> 1. Which hardware components (e.g. microcontroller, sensors) are you using?
> 2. Which software components (e.g. IDE, libraries, packages) are you using?
> 3. What did you do?
> 4. What did you expect to see?
> 5. What did you see instead?
 
### Suggest Feature
If you wish a special feature, feel free to add it as new [issue](https://github.com/Birdiary/webserver/issues/new). Here, please add the label "enhancement". We appreciate any suggestions.

### Code Contributions
Besides reporting bugs or suggesting features, we really appreciate code contributions. We suggest contributing through forking and pull-requests. A guideline how to fork a project and create a pull request can be found in the [Contribution to Projects Guidelines](https://docs.github.com/en/get-started/quickstart/contributing-to-projects). 

### Validating an Issue and Pull Requests
You can also contribute by merging a pull request into your local copy of the project and testing the changes. Add the outcome of your testing in a comment on the pull request.
Further, you can validate an issue or add additional context to an existing issue.
