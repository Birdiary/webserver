import json
import requests
import os
def send_birddata(file, file2, file3 ):
    payload = {
        "start_date" : "123",
        "end_date" : "123",
        "audio" : "audioKey",
        "environment" : {
            "date": "123",
            "temp": 10
        },
        "detections" : [{
            "date": "123",
            "image": "imageKey",
            "weight" : 7.6},
            {
            "date": "123",
            "image": "imageKey2",
            "weight" : 7.6} ]

    }   
    files = {
         'json': (None, json.dumps(payload), 'application/json'),
         'imageKey': (os.path.basename(file), open(file, 'rb')),
         'imageKey2': (os.path.basename(file2), open(file2, 'rb')),
         'audioKey': (os.path.basename(file3), open(file3, 'rb'), 'audio/mpeg')
    }
    r = requests.post("http://localhost:5000/movement/9cab83d1-5617-414a-ad24-26c6d91c950b", files=files)
    print(r.content)

send_birddata("./static/data/images/svetozar-cenisev-pvqTCIOx9MQ-unsplash.jpg", "./static/data/images/svetozar-cenisev-pvqTCIOx9MQ-unsplash.jpg","test.mp3")

def send_environment(payload):

    payload = {
            "date": "123",
            "temp": 10
        },
       

    r = requests.post("http://localhost:5000/environment/fc4ae0c9-bee0-44e8-9c2f-d86c5e932294", json=payload)
    print(r.content)

#send_environment("./static/data/images/svetozar-cenisev-pvqTCIOx9MQ-unsplash.jpg", "test.mp3")

def send_audio(file):
  
    files = {
         'audio': (os.path.basename(file), open(file, 'rb'), 'audio/mpeg')
    }
    r = requests.post("http://localhost:5000/audio", files=files)

#send_audio( "test.mp3")

def create_box():

    payload= {
        "name" : "test",
        "location" : {
            "lat": 12,
            "lon": 12
        },
        "mail": {"adresses": ["nick121298@outlook.de"]}
    }

    r = requests.post("http://localhost:5000/box", json=payload)
    print(r.content)

#create_box()