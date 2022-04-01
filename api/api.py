from flask import Flask, render_template, request, jsonify, send_from_directory

from flask_mongoengine import MongoEngine
import json
from flask_uploads import configure_uploads, IMAGES, UploadSet, AUDIO
from scripts.classify_birds import classify
from scripts.email_service import send_email
import uuid
import os

host= os.environ.get('host'),


app = Flask(__name__)

app.config['SECRET_KEY'] = 'thisisasecret'
app.config['UPLOADED_IMAGES_DEST'] = 'uploads/images'
app.config['UPLOADED_AUDIOS_DEST'] = 'uploads/audios'
app.config['MONGODB_SETTINGS'] = {
    'db': 'your_database',
    'host': 'mongodb',
    'port': 27017
}
db = MongoEngine()
db.init_app(app)

images = UploadSet('images', IMAGES)


audios = UploadSet('audios', AUDIO)
configure_uploads(app, (images, audios))




class Location(db.EmbeddedDocument):
    lat = db.FloatField()
    lon = db.FloatField()

class Environment(db.DynamicEmbeddedDocument):
    env_id = db.StringField()
    date = db.StringField()
    

class Detection(db.DynamicEmbeddedDocument):
    det_id = db.StringField()
    date = db.StringField()
    image = db.URLField()
    weight = db.FloatField()

class Movements(db.DynamicEmbeddedDocument):
    mov_id = db.StringField()
    start_date =db.StringField()
    end_date = db.StringField()
    audio= db.URLField()
    environment = db.EmbeddedDocumentField(Environment)
    detections = db.ListField(db.EmbeddedDocumentField(Detection))

class Measurement(db.EmbeddedDocument):
    environment = db.ListField(db.EmbeddedDocumentField(Environment))
    movements = db.ListField(db.EmbeddedDocumentField(Movements))

class Mail(db.DynamicEmbeddedDocument):
    adresses = db.ListField(db.StringField())
    
class Box(db.DynamicDocument):
    box_id = db.StringField()
    name = db.StringField()
    location = db.EmbeddedDocumentField(Location)
    measurements = db.EmbeddedDocumentField(Measurement)
    mail = db.EmbeddedDocumentField(Mail)
    

#@app.route('/')
#def index():
#    return render_template('./ui/index.html') 



@app.route('/api/image', methods=['Get', 'POST'])
def image():
    if request.method=="POST":
        # this line goes to the console/terminal in flask dev server
        data = request.files['image']
        print (data)
        # this line prints out the form to the browser
        #return jsonify(data)
        filename = images.save(data)
        result = classify('uploads/images/' + filename)

        return jsonify(
            result=result
    )
    return render_template('./index.html')

@app.route('/api/audio', methods=['POST'])
def audio():
    if request.method=="POST":
        # this line goes to the console/terminal in flask dev server
        data = request.files['audio']
        print (data)
        # this line prints out the form to the browser
        #return jsonify(data)
        filename = audios.save(data)
        return filename
    return render_template('./index.html')

@app.route('/api/box', methods=['GET', 'POST'])
def add_box():
    if request.method=="POST":
        body = request.get_json()
        location = Location()
        location.lat = body['location']['lat']
        location.lon = body['location']['lon']
        measurement= Measurement()
        mail = Mail()
        list= mail.adresses
        for mailToInsert in body['mail']['adresses']:
            print(mailToInsert)
            list.append(mailToInsert)
        mail.adresses = list
        id = str(uuid.uuid4())
        #senseboxid = ""
        #if(body['senseboxID']):
        #    senseboxid = body['senseboxID']
        #else: 
        #    senseboxid

        print(mail)
        # Add object to movie and save
        box = Box(box_id = id, location=location, name=body['name'], measurements = measurement, mail=mail).save()
        return {"id": id}, 201
    boxes = Box.objects.only('box_id').exclude('_id')
    return  jsonify(boxes), 200

@app.route('/api/box/<box_id>', methods=['GET'])
def get_one_box(box_id: str):
    box = Box.objects(box_id=box_id).first_or_404()
    return jsonify(box), 200

@app.route('/api/environment/<box_id>', methods=['POST'])
def add_environment(box_id: str):

    box = Box.objects(box_id=box_id).first_or_404()

    body = request.get_json()

    environmentClass = Environment()
    for name,value in body.items():
        setattr(environmentClass, name, value)
    env_id = str(uuid.uuid4())
    environmentClass.env_id = env_id

    environmentList = box.measurements.environment
    environmentList.insert(0, environmentClass)
    box.measurements.environment = environmentList
    box.update(measurements = box.measurements)

#TODO send E-Mail

    return jsonify(id = env_id), 200

@app.route('/api/movement/<box_id>', methods=['POST'])
def add_movement(box_id: str):
    content_type = request.headers.get('Content-Type')
    print(content_type)
    box = Box.objects(box_id=box_id).first_or_404()

    ##TODO: Count Birds in image and Crop images to bird onyl 
    
    

    body = request.form['json']
    print(body)
    body = json.loads(body)
    print(body.items())



    movementsClass = Movements()
    mov_id = str(uuid.uuid4())
    movementsClass.mov_id = mov_id
    movementsClass.start_date = body['start_date']
    movementsClass.end_date = body['end_date']
    audio = request.files[body['audio']]
    filename = audios.save(audio)
    movementsClass.audio = host + "/uploads/audios/" + filename

    environmentClass = Environment()
    for name,value in body['environment'].items():
        setattr(environmentClass, name, value)
    env_id = str(uuid.uuid4())
    environmentClass.env_id = env_id

    movementsClass.environment = environmentClass

    
    for detection in body['detections']:
        image = request.files[detection['image']]
        detectionClass = Detection()

    #return jsonify(data)
        filename = images.save(image)
        result = classify('uploads/images/' + filename)
        if result[0][0] > 0.5:
            bird_name = result[0][1]
            detectionClass.count = {bird_name: 1}
        else:
           detectionClass.count = {"undefined": 1} 
        det_id = str(uuid.uuid4())
        detectionClass.det_id = det_id
        detectionClass.image = host + "/uploads/images/" + filename
        detectionClass.weight = detection['weight']
        detectionClass.date = detection['date']
        movementsClass.detections.append(detectionClass)

    movementsClass.count =  movementsClass.detections[0].count

    for mail in box.mail.adresses:
        send_email(mail, filename, 'uploads/images/' + filename, movementsClass.count)
    
    movementList = box.measurements.movements
    movementList.insert(0, movementsClass)
    box.measurements.movements = movementList
    box.update(measurements = box.measurements)
    print(movementList)

    return jsonify(id = mov_id), 200

@app.route('/api/uploads/images/<filename>')
def uploadImages(filename):
    return send_from_directory(app.config['UPLOADED_IMAGES_DEST'], filename)

@app.route('/api/uploads/audios/<filename>')
def uploadAudios(filename):
    return send_from_directory(app.config['UPLOADED_AUDIOS_DEST'], filename)

#@app.route('/api')
#def api():
#    return render_template('./redoc/redoc.html')


if __name__==('__main__'):
    app.run(host="0.0.0.0", debug=False)