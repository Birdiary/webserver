import json
import requests
import os


def run_function():
    print("Choose which function to run:")
    print("1. send_birddata")
    print("2. send_environment")
    print("3. create_station")
    print("4. deleteStation")
    print("5. updatestation")
    print("6. deleteMovement")
    print("7. addValidation")
    
    choice = input("Enter your choice: ")
    
    if choice == "1":
        url = input("Enter URL (http://localhost:8080 or https://wiediversistmeingarten.org): ")
        stationid = input("Enter station ID: ")
        audiofile = input("Enter audio file path: ")
        videofile = input("Enter video file path: ")
        start_date = input("Enter the start date (yyyy-mm-dd hh:mm:ss): ")
        end_date = input("Enter the end date (yyyy-mm-dd hh:mm:ss): ")
        temperature = input("Enter the temperature: ")
        humidity = input("Enter the humidity: ")
        weight = input("Enter the weight: ")
        payload = {
            "start_date" : start_date,
            "end_date" : end_date,
            "environment" : {
                "date": start_date,
                "temperature": temperature,
                "humidity": humidity
            },
            "weight" : weight
        }
        send_birddata(url, stationid, payload, audiofile, videofile)
    elif choice == "2":
        url = input("Enter URL (http://localhost:8080 or https://wiediversistmeingarten.org): ")
        stationid = input("Enter station ID: ")
        date = input("Enter the date (yyyy-mm-dd hh:mm:ss): ")
        temperature = input("Enter the temperature: ")
        humidity = input("Enter the humidity: ")
        payload = {
            "date": date,
            "temperature": temperature,
            "humidity": humidity
        }
        send_environment(payload, url, stationid)
    elif choice == "3":
        url = input("Enter URL (http://localhost:8080 or https://wiediversistmeingarten.org): ")
        name = input("Enter the name of the station: ")
        lat = float(input("Enter the latitude of the station: "))
        lng = float(input("Enter the longitude of the station: "))
        mail = input("Enter Mail Adresses which should be notified. Leave empty if none: ")

        payload = {
            "name": name,
            "location": {
                "lat": lat,
                "lng": lng
            },
        }
        if len(mail)>5:
             payload["mail"] ={"adresses": [mail]}
        else:
            payload["mail"] ={"adresses": []}
        create_station(payload, url)
    elif choice == "4":
        url = input("Enter URL (http://localhost:8080 or https://wiediversistmeingarten.org/): ")
        stationid = input("Enter station ID: ")
        apiKey = input("Enter API key: ")
        deleteStation(url, stationid, apiKey)
    elif choice == "5":
        url = input("Enter URL (http://localhost:8080 or https://wiediversistmeingarten.org): ")
        stationid = input("Enter station ID: ")
        apiKey = input("Enter API key: ")
        name = input("Enter the new Name of the station: ")
        lat = input("Enter the new latitude of the station: ")
        lng = input("Enter the new longitude of the station: ")
        mail = input("Enter the new Mail Adresses which should be notified. Leave empty if none: ")

        payload = {}
        if len(name)>3:
             payload["name"] = name
        try:
            lat = float(lat)
            lng = float(lng)
            payload["location"]=  {
                "lat": lat,
                "lng": lng
            },
        except:
             print("Keep location")
        if len(mail)>0:
             payload["mail"] ={"adresses": [mail]}
        else:
            payload["mail"] ={"adresses": []}
        updatestation(payload, url, stationid, apiKey)
    elif choice == "6":
        url = input("Enter URL (http://localhost:8080 or https://wiediversistmeingarten.org): ")
        stationid = input("Enter station ID: ")
        movid = input("Enter movement ID: ")
        apiKey = input("Enter API key: ")
        deleteMovement(url, stationid, movid, apiKey)
    elif choice == "7":
        url = input("Enter URL (http://localhost:8080 or https://wiediversistmeingarten.org): ")
        station_id = input("Enter the ID of the station: ")
        mov_id = input("Enter the ID of the movement: ")
        latin_name = input("Enter the Latin name to validate: ")
        payload = {"validation": {"latinName": latin_name}}
        addValidation(payload, url, station_id, mov_id)
    else:
         print("No valid Input")
                       


def send_birddata(url, stationid, payload, audiofile, videofile):
    #payload = {
    #    "start_date" : "2022-11-16 15:20:10.210804",
    #    "end_date" : "2022-11-16 15:20:10.210804",
    #    "audio" : "audioKey",
    #    "video" : "videoKey",
    #    "environment" : {
    #        "date": "2022-04-27 16:03:10.210804",
    #        "temperature": 11,
    #        "humidity": 10
    #    },
    #    "weight" : 18
    #}   

    payload["audio"]= "audioKey"
    payload["video"]= "videoKey"
    files = {
         'json': (None, json.dumps(payload), 'application/json'),
         'videoKey': (os.path.basename(videofile), open(videofile, 'rb')),
         'audioKey': (os.path.basename(audiofile), open(audiofile, 'rb'), 'audio/mpeg')
    }
    r = requests.post(url + "/api/movement/" + stationid, files=files)
    print(r.content)


def send_environment(payload, url, stationid):

    #payload = {
    #        "date": "2022-11-16 15:20:10.210804",
    #        "temperature": 22,
    #        "humidity": 80
    #    }
       
    r = requests.post(url +"/api/environment/" + stationid, json=payload)
    print(r.content)



def create_station(payload, url ):

    #payload= {
    #    "name" : "Test",
    #    "location" : {
    #        "lat": 51.567066929153455,
    #        "lng": 8.117072582244875
    #    },
    #}

    r = requests.post(url +"/api/station/test", json=payload)
    print(r.content)


def deleteStation(url, stationid, apiKey):
    r = requests.delete(url + "api/station/" + stationid +"?deleteData=True&apikey=" + apiKey)


def updatestation(payload, url, stationid, apiKey):
    payload= {
        "mail": {"adresses": []}
    }

    r = requests.put(url + "/api/station/"+stationid +"?apikey="+apiKey , json=payload)
    print(r.content)


def deleteMovement(url, stationid, movid, apiKey):

    r = requests.delete(url +"/api/movement/"+ stationid +"/"+ movid+ "?apikey="+ apiKey +"&deleteData=True")


def addValidation(payload, url, stationid, movid):
    #payload = {"validation": {"latinName": "test2"}}
    r = requests.put(url + "/api/validate/"+ stationid, + "/" + movid, json=payload)
    print(r)

run_function()

#Old funtions which were just used for test purposes
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


def getOldData():
    res =  requests.get("https://wiediversistmeingarten.org/api/station")
    stations=res.json()
    allStations = []
    for station in stations:
        print(station["station_id"])
        res2 = requests.get("https://wiediversistmeingarten.org/api/station/" + station["station_id"])
        data = res2.json()
        allStations.append(data)
    json_object = json.dumps(allStations, indent = 4)
  
    # Writing to data.json
    with open("data_today.json", "w") as outfile:
        outfile.write(json_object)


def findNewData():
    f = open('data copy.json')
    f2 = open('data.json')
  
    # returns JSON object as 
    # a dictionary
    data = json.load(f)
    #requests.get("http://localhost:8080/api/drop")

    
    # Iterating through the json
    # list
    newData = []
    for i in data:
        data_to_add = dict()
        data_to_add["station_id"] = i["station_id"]
        data_to_add["measurements"] = dict()
        data_to_add["measurements"]["movements"] = []
        data_to_add["measurements"]["environment"] = []
        movements = i["measurements"]["movements"]
        environment =  i["measurements"]["environment"]
        for movement in movements:
                if movement["start_date"] > "2022-09-28 9:45":
                    data_to_add["measurements"]["movements"].append(movement)
        for env in environment:
                if env["date"] > "2022-09-28 9:45":
                    data_to_add["measurements"]["environment"].append(env)
        data_to_add["count"] = dict()
        try:
            data_to_add["count"]["2022-09-28"] = i["count"]["2022-09-28"]
        except:
            print("2022-09-28")
        try:
            data_to_add["count"]["2022-09-29"] = i["count"]["2022-09-29"]
        except:
            print("2022-09-29")
        try:
            data_to_add["count"]["2022-09-30"] = i["count"]["2022-09-30"]
        except:
            print("2022-09-30")
        newData.append(data_to_add)

    json_object = json.dumps(newData, indent = 4)
    with open("dataNew.json", "w") as outfile:
        outfile.write(json_object)                
    #r = requests.post("http://localhost:8080/api/station/old", json=data[0])
    #r = requests.post("http://localhost:8080/api/station/old", json=data[1])
   
    # Closing file
    f.close()

def uploadOldData():
    f = open('data copy.json')
    f2 = open('data.json')
  
    # returns JSON object as 
    # a dictionary
    data = json.load(f)

    r = requests.post("http://localhost:8080/api/station/old", json=data[1])
    r = requests.post("http://localhost:8080/api/station/old", json=data[2])
    #r = requests.put("http://localhost:8080/api/movement/" + data[1]["station_id"])
    print(r)
        
  
    # returns JSON object as 
    # a dictionary




def station_id():
    f = open('data.json')
    data = json.load(f)
    #requests.get("http://localhost:8080/api/drop")

    
    # Iterating through the json
    # list
    for i in data:
        print(i["station_id"])
        r = requests.put("https://wiediversistmeingarten.org/api/movement/"+ i["station_id"])
        print(r.content)
    
    # Closing file
    f.close()


