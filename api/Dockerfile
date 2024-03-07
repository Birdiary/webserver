# base image
FROM python:3.9.15

# install netcat
RUN apt-get update && \
		apt-get -y install netcat && \
		apt-get -y install gpac && \
		apt-get -y install ffmpeg && \
        apt-get install -y python3-opencv && \
		apt-get clean

COPY ./requirements.txt /usr/src/app/requirements.txt


# set working directory
WORKDIR /usr/src/app

# add and install requirements
RUN pip install -r requirements.txt
RUN pip install opencv-python
RUN pip install tensorflow





# add app
COPY . /usr/src/app

# run server
CMD gunicorn -b 0.0.0.0:5000 api:app