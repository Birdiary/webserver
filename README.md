# CountYourBirds - webserver 

## Information
Environmental changes can have different causes on local level (e.g. soil sealing) as well as on global level (e.g. climate change). To detect these changes and to find patterns in the reasons for them it is necessary to collect broad environmental data, temporally and spatially. Thereto citizens can play an essential role to collect the data. In particular, we developed a system which enables citizens to monitor the occurrence and distribution of birds and provides the collected data to the public in order that both researchers and citizens can derive conclusions from them. With our automated approach we want to support other citizen science solutions like eBird where contributors manually report their sightings.

Therefore, we built a prototypical bird feeder equipped with several sensors and the infrastructure to process the data collected by the feeder.
The feeder is easy to reproduce at a reasonable price by following an open available manual. This allows anyone to build the feeder on their own, enabling a large distribution at many locations. The feeder automatically detects when a bird is visiting it, takes an image of the bird, determines the species and connects the observation with environmental data like the temperature or light intensity. All the collected data are published on a developed open access platform. Incorporating other surrounding factors like the proximity of the feeder station to the next forest or a large street allows it to pursue various questions regarding the occurrence of birds. One of them might ask, how does the immediate environment affect bird abundance? Or do sealed surfaces have a negative effect compared to a flowering garden?

This repository contains the code to run the webserver. 
All the collected data is send by a feeder which is based on this [repository](https://github.com/CountYourBirds/station). 
The repositories are currently still under development, the code for the operation of the feeder as well as for the web server are continuously updated. 
A corresponding manual for the operation of the system including open source instructions for building the feeder will follow soon. 

CountYourBirds is a project by a group of students at the Institute for Geoinformatics at the University of Münster. 
If you got any questions contact us via: [info@countyourbirds.org](mailto:info@countyourbirds.org).

## Installtion
To run the platform you first have to install docker, which then installs all further needed packages and programs. After the installation you can clone and run the platform in development or production environment.

### Docker

 * Install Docker Desktop: https://docs.docker.com/desktop/#download-and-install

Linux Users can also use the Installation of a seperate docker engine and compose installation:
 * Install docker engine: https://docs.docker.com/engine/install/
 * Install docker-compose: https://docs.docker.com/compose/install/

### Clone Project 
```bash
git clone https://github.com/Birdiary/webserver.git
```

### Development environment with docker-compose

This project contains one `docker-compose` configuration (file `docker-compose-dev.yml`) to run all microservices & databases, and mount the client application directly from the source directory `client`.
If you see an error related to the MongoDB or HTTP request timeouts during the first "up", abort the execution, then try again.

```bash
cd ui/
docker-compose --file docker-compose-dev.yml up
```

The platform is available at [http://localhost:8080](http://localhost:8080) and the API at `http://localhost:8080/api`.

### Production environment with docker-compose

This project has another docker-compose configuration for the deployment of a production build (file `docker-compose.yml`).
This configuration has no `ui` container. Instead the webserver container creates a static production build with the command [`npm run build`](https://create-react-app.dev/docs/available-scripts/) using a [multi-stage docker file](https://docs.docker.com/develop/develop-images/multistage-build/) (file `nginx/data_visualization/Dockerfile`) which is then served through nginx.

To start the platform with the production build:

```bash
cd ui/

docker-compose up 

# force rebuild of images
docker-compose up --build
```
