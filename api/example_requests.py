import json
import requests
import os
def send_birddata(file, file2 ):
    print("bal")
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
    r = requests.post("http://localhost:8080/api/movement/8ee83843-8bfa-410a-bd8b-a36e730146d6", files=files)
    print(r.content)

send_birddata("bird.mp4", "bird.wav")
#send_birddata("bird2.mp4", "./static/data/images/bird.mp3")
#send_birddata("bird1.mp4", "./static/data/images/bird.mp3")

def send_environment(payload):

    payload = {
            "date": "2022-04-27 18:16:10.210804",
            "temperature": 10,
            "humidity": 10
        }
       

    headers = {'Content-type': 'application/json'}   
    r = requests.post("http://localhost:8080/api/environment/8ee83843-8bfa-410a-bd8b-a36e730146d6", json=payload)
    print(r.content)

#send_environment("./static/data/images/svetozar-cenisev-pvqTCIOx9MQ-unsplash.jpg")

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

def updatePharmagarten():
    pharmaNew = requests.get("https://wiediversistmeingarten.org/api/station/10c46735-ee73-4428-8ad5-3297814c4db0")
    pharmaOld = requests.get("https://wiediversistmeingarten.org/api/station/4a936912-65db-475d-bcd6-9ee292079830")
    pharmaNew= json.loads(pharmaNew.text)
    pharmaOld= json.loads(pharmaOld.text)
    print(pharmaNew["measurements"])
    measurements  = {}
    measurements["environment"] = list(pharmaNew["measurements"]["environment"]) + list(pharmaOld["measurements"]["environment"])
    measurements["movements"] = list(pharmaNew["measurements"]["movements"]) + list(pharmaOld["measurements"]["movements"])
    print(measurements)
    payload= {
        "measurements": measurements
    }

    r = requests.put("https://wiediversistmeingarten.org/api/station/10c46735-ee73-4428-8ad5-3297814c4db0", json=payload)
    print(r.content)


#updatePharmagarten()

def deleteStation():
    r = requests.delete("https://wiediversistmeingarten.org/api/station/288e0e1e-7c11-4cf7-b7b4-75e6c75f9897")

#deleteStation()


def updatestation():
    payload= {
        "mail": {"adresses": ["klausf27@unity-mail.de"]}
    }

    r = requests.put("https://wiediversistmeingarten.org/api/station/37a44ee0-6377-4a2e-9481-d1029c00d83f", json=payload)
    print(r.content)

#updatestation()

def sumCount():
    counts = requests.get("https://wiediversistmeingarten.org/api/count")
    counts= json.loads(counts.text)
    count = []
    for date in counts:
 #       try:
                print(date, flush=True) 
                for detections in counts[date]: 
                    print(detections, flush=True)
                    latinName = detections["latinName"]
                    germanName = detections["germanName"]
                    existName =False
                    for i, det in enumerate(count):
                            if det["latinName"] == latinName:
                                existName = True
                                count[i]["amount"] = count[i]["amount"] + detections["amount"]
                    if existName == False:
                            count.append({"latinName": latinName, "germanName" : germanName, "amount": detections["amount"]})
#        except:
#            print("No count available")
    print(count)

#sumCount()