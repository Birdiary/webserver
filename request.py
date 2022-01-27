import json
import requests
import os
def send_request(file, file2):
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
         'imageKey2': (os.path.basename(file), open(file, 'rb')),
         'audioKey': (os.path.basename(file2), open(file2, 'rb'), 'audio/mpeg')
    }
    r = requests.post("http://localhost:5000/movement/fc4ae0c9-bee0-44e8-9c2f-d86c5e932294", files=files)
    print(r.content)

#send_request("./static/data/images/svetozar-cenisev-pvqTCIOx9MQ-unsplash.jpg", "test.mp3")

def send_environment(file, file2):
    payload = {
            "date": "123",
            "temp": 10
        },
       

    r = requests.post("http://localhost:5000/environment/fc4ae0c9-bee0-44e8-9c2f-d86c5e932294", json=payload)
    print(r.content)

#send_environment("./static/data/images/svetozar-cenisev-pvqTCIOx9MQ-unsplash.jpg", "test.mp3")

def send_audio(file, file2):
  
    files = {
         'audio': (os.path.basename(file2), open(file2, 'rb'), 'audio/mpeg')
    }
    r = requests.post("http://localhost:5000/audio", files=files)

send_audio("./static/data/images/svetozar-cenisev-pvqTCIOx9MQ-unsplash.jpg", "test.mp3")