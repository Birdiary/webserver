import json
import requests
import os
def send_birddata(file, file2 ):
    payload = {
        "start_date" : "2022-04-25 16:03:10.210804",
        "end_date" : "2022-05-24 16:03:10.210804",
        "audio" : "audioKey",
        "video" : "videoKey",
        "environment" : {
            "date": "123",
            "temp": 10
        },
        "weight" : 7.6
    }   
    files = {
         'json': (None, json.dumps(payload), 'application/json'),
         'videoKey': (os.path.basename(file), open(file, 'rb')),
         'audioKey': (os.path.basename(file2), open(file2, 'rb'), 'audio/mpeg')
    }
    #headers = {'Content-type': 'multipart/form-data'}
    r = requests.post("http://localhost:8080/api/movement/1a493426-e9bd-4e8b-9363-4d2d0c586558", files=files)
    print(r.content)

send_birddata("bird1.mp4", "./static/data/images/bird.mp3")
#send_birddata("bird2.mp4", "./static/data/images/bird.mp3")
#send_birddata("bird1.mp4", "./static/data/images/bird.mp3")

def send_environment(payload):

    payload = {
            "date": "2022-04-27 18:16:10.210804",
            "temperature": 10,
            "humidity": 10
        }
       

    headers = {'Content-type': 'application/json'}   
    r = requests.post("http://localhost:8080/api/environment/983dce4e-b621-46dc-9d44-00eb189ac716", json=payload)
    print(r.content)

send_environment("./static/data/images/svetozar-cenisev-pvqTCIOx9MQ-unsplash.jpg")

def send_audio(file):
  
    files = {
         'audio': (os.path.basename(file), open(file, 'rb'), 'audio/mpeg')
    }
    r = requests.post("http://localhost:5000/audio", files=files)

#send_audio( "test.mp3")

def send_video(file):
  
    files = {
         'video': (os.path.basename(file), open(file, 'rb'))
    }
    r = requests.post("https://wiediversistmeingarten.org/api/video", files=files)
    print(r.content)

#send_video("bird1.h264")
def create_station():

    payload= {
        "name" : "test",
        "location" : {
            "lat": 12,
            "lng": 12
        },
        "mail": {"adresses": ["nick121298@outlook.de"]}
    }

    r = requests.post("http://localhost:8080/api/station", json=payload)
    print(r.content)

#create_station()