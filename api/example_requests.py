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
    #headers = {'Content-type': 'multipart/form-data'}
    r = requests.post("http://localhost:8080/api/movement/b7c44009-d865-4395-bb3a-ca3a5747990e", files=files)
    print(r.content)

send_birddata("./static/data/images/300px-Pied_Crow.jpg", "./static/data/images/svetozar-cenisev-pvqTCIOx9MQ-unsplash.jpg","./static/data/images/test.mp3")

def send_environment(payload):

    payload = {
            "date": "123",
            "temp": 10
        }
       

    headers = {'Content-type': 'application/json'}   
    r = requests.post("http://localhost:8080/api/environment/b7c44009-d865-4395-bb3a-ca3a5747990e", json=payload)
    print(r.content)

send_environment("./static/data/images/svetozar-cenisev-pvqTCIOx9MQ-unsplash.jpg")

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

    r = requests.post("http://localhost:8080/api/box", json=payload)
    print(r.content)

#create_box()